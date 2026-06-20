<?php
header("Content-Type: application/json; charset=UTF-8");

// Load API configuration from 'estelerrr' file
$configFile = __DIR__ . '/estelerrr';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(["error" => "Berkas konfigurasi 'estelerrr' tidak ditemukan."]);
    exit;
}

$configContent = file_get_contents($configFile);
$config = json_decode($configContent, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(["error" => "Format berkas konfigurasi 'estelerrr' tidak valid: " . json_last_error_msg()]);
    exit;
}

$apiKey = $config['mcpServers']['stitch']['headers']['X-Goog-Api-Key'] ?? null;
$serverUrl = $config['mcpServers']['stitch']['serverUrl'] ?? 'https://stitch.googleapis.com/mcp';

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(["error" => "API Key tidak ditemukan dalam konfigurasi."]);
    exit;
}

$action = $_GET['action'] ?? '';

// Helper to make API requests to Stitch
function call_stitch($tool, $args = []) {
    global $apiKey, $serverUrl;
    
    $headers = [
        "X-Goog-Api-Key: " . $apiKey,
        "Content-Type: application/json"
    ];
    
    $body = json_encode([
        "jsonrpc" => "2.0",
        "method" => "tools/call",
        "params" => [
            "name" => $tool,
            "arguments" => $args ?: new stdClass()
        ],
        "id" => 1
    ]);
    
    $ch = curl_init($serverUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        return ["error" => curl_error($ch)];
    }
    curl_close($ch);
    
    return json_decode($response, true);
}

switch ($action) {
    case 'list_projects':
        $res = call_stitch("list_projects");
        if (isset($res['error'])) {
            http_response_code(500);
            echo json_encode($res);
        } else {
            // Extract projects from nested content
            $text = $res['result']['content'][0]['text'] ?? '';
            $projectData = json_decode($text, true);
            if (isset($projectData['projects'])) {
                echo json_encode(["projects" => $projectData['projects']]);
            } else {
                echo json_encode(["projects" => []]);
            }
        }
        break;

    case 'list_screens':
        $projectId = $_GET['projectId'] ?? '';
        if (!$projectId) {
            http_response_code(400);
            echo json_encode(["error" => "projectId diperlukan."]);
            break;
        }
        $res = call_stitch("list_screens", ["projectId" => $projectId]);
        if (isset($res['error'])) {
            http_response_code(500);
            echo json_encode($res);
        } else {
            $text = $res['result']['content'][0]['text'] ?? '';
            $screensData = json_decode($text, true);
            if (isset($screensData['screens'])) {
                echo json_encode(["screens" => $screensData['screens']]);
            } else {
                echo json_encode(["screens" => []]);
            }
        }
        break;

    case 'get_screen':
        $projectId = $_GET['projectId'] ?? '';
        $screenId = $_GET['screenId'] ?? '';
        if (!$projectId || !$screenId) {
            http_response_code(400);
            echo json_encode(["error" => "projectId dan screenId diperlukan."]);
            break;
        }
        $res = call_stitch("get_screen", [
            "name" => "projects/{$projectId}/screens/{$screenId}",
            "projectId" => $projectId,
            "screenId" => $screenId
        ]);
        if (isset($res['error'])) {
            http_response_code(500);
            echo json_encode($res);
        } else {
            // Check structuredContent first, or parse result.content[0].text
            if (isset($res['result']['structuredContent'])) {
                echo json_encode($res['result']['structuredContent']);
            } elseif (isset($res['result']['content'][0]['text'])) {
                echo $res['result']['content'][0]['text'];
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Format detail screen tidak dikenali."]);
            }
        }
        break;

    case 'get_design_system':
        $projectId = $_GET['projectId'] ?? '';
        if (!$projectId) {
            http_response_code(400);
            echo json_encode(["error" => "projectId diperlukan."]);
            break;
        }
        $res = call_stitch("list_design_systems", ["projectId" => $projectId]);
        if (isset($res['error'])) {
            http_response_code(500);
            echo json_encode($res);
        } else {
            $text = $res['result']['content'][0]['text'] ?? '';
            $dsData = json_decode($text, true);
            echo json_encode($dsData);
        }
        break;

    case 'proxy_html':
        $url = $_GET['url'] ?? '';
        if (!$url) {
            http_response_code(400);
            echo json_encode(["error" => "url diperlukan."]);
            break;
        }
        
        // Prevent path traversal or security issues by validating URL starts with allowed Google domains
        if (strpos($url, "https://contribution.usercontent.google.com") !== 0) {
            http_response_code(403);
            echo json_encode(["error" => "Domain URL tidak dizinkan untuk diproksi."]);
            break;
        }

        // Fetch HTML content from URL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $html = curl_exec($ch);
        
        if (curl_errno($ch)) {
            http_response_code(502);
            header("Content-Type: application/json; charset=UTF-8");
            echo json_encode(["error" => "Gagal mengambil HTML: " . curl_error($ch)]);
            curl_close($ch);
            exit;
        }
        curl_close($ch);

        // Serve HTML content as text/html
        header("Content-Type: text/html; charset=UTF-8");
        echo $html;
        exit;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Action tidak dikenal."]);
        break;
}
