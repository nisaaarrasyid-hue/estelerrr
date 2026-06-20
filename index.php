<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stitch Project Viewer</title>
    <link rel="stylesheet" href="style.css">
    <!-- FontAwesome for Premium Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

    <!-- SIDEBAR PANEL -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="brand">
                <div class="brand-icon">S</div>
                <h1 class="brand-title">Stitch Viewer</h1>
            </div>
            <div class="search-wrapper">
                <span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
                <input type="text" id="projectSearch" class="search-input" placeholder="Cari proyek...">
            </div>
        </div>
        
        <div class="project-list-container">
            <h2 class="project-list-title">Proyek Tersedia</h2>
            <div id="projectList">
                <!-- Project Items will be loaded here dynamically -->
                <div class="loader-wrapper">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    </aside>

    <!-- MAIN VIEW AREA -->
    <main class="main-content">
        <!-- HEADER -->
        <header class="main-header d-none" id="mainHeader">
            <div class="header-title-area">
                <h2 id="activeProjectTitle" class="header-title">Judul Proyek</h2>
                <span id="activeProjectId" class="header-subtitle">ID: --</span>
            </div>
            <div class="header-actions">
                <button id="viewDesignSystemBtn" class="btn btn-primary" disabled>
                    <i class="fa-solid fa-palette"></i> Desain Sistem
                </button>
            </div>
        </header>

        <!-- CONTENT AREA -->
        <div class="content-area" id="contentArea">
            <!-- Welcome View (Initial state) -->
            <div class="welcome-container" id="welcomeView">
                <div class="welcome-icon">
                    <i class="fa-solid fa-folder-open"></i>
                </div>
                <h3 class="welcome-title">Selamat Datang di Stitch Project Viewer</h3>
                <p class="welcome-desc">Pilih salah satu proyek di sidebar kiri untuk menampilkan seluruh layar UI design, kode HTML, dan detail desain sistem dari Stitch API.</p>
            </div>

            <!-- Loader for Screens -->
            <div class="loader-wrapper d-none" id="screensLoader">
                <div class="spinner"></div>
                <p style="color: var(--text-muted); font-size: 14px;">Memuat layar proyek...</p>
            </div>

            <!-- Grid of Screen Cards -->
            <div class="screens-grid d-none" id="screensGrid">
                <!-- Screen cards loaded here -->
            </div>
        </div>
    </main>

    <!-- INSPECTOR MODAL (SCREEN DETAILS) -->
    <div class="modal-overlay" id="inspectorModal">
        <div class="modal-window">
            <div class="modal-header">
                <div class="modal-title-area">
                    <span class="brand-icon"><i class="fa-solid fa-mobile-screen-button"></i></span>
                    <h3 class="modal-title" id="modalScreenTitle">Reservations - Nanairo Cafe</h3>
                </div>
                <button class="modal-close-btn" id="closeInspectorBtn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <!-- Left Pane: Screenshot View -->
                <div class="modal-left-pane">
                    <div class="pane-header">
                        <span><i class="fa-regular fa-image"></i> Screenshot Preview</span>
                        <span id="screenshotDimensions">2560 x 4058</span>
                    </div>
                    <div class="pane-content screenshot-container">
                        <img src="" alt="Screenshot View" class="screenshot-view" id="modalScreenshotImg">
                    </div>
                </div>
                <!-- Right Pane: Tabs & Code/Detail Preview -->
                <div class="modal-right-pane">
                    <div class="pane-header">
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="live-view"><i class="fa-solid fa-code"></i> Live View</button>
                            <button class="tab-btn" data-tab="metadata"><i class="fa-solid fa-circle-info"></i> Metadata</button>
                        </div>
                    </div>
                    <div class="pane-content" style="background-color: #ffffff; height: 100%;">
                        <!-- Tab Content: Live View (Iframe) -->
                        <div class="tab-content" id="tab-live-view" style="height: 100%;">
                            <iframe src="" class="iframe-wrapper" id="htmlCodeIframe" title="Live Preview"></iframe>
                        </div>
                        <!-- Tab Content: Metadata -->
                        <div class="tab-content d-none" id="tab-metadata" style="height: 100%; overflow-y: auto; background-color: var(--bg-main);">
                            <div class="metadata-container">
                                <div class="meta-group">
                                    <div class="meta-label">Screen ID</div>
                                    <div class="meta-val" id="metaScreenId">--</div>
                                </div>
                                <div class="meta-group">
                                    <div class="meta-label">Device Type</div>
                                    <div class="meta-val" id="metaDeviceType">--</div>
                                </div>
                                <div class="meta-group">
                                    <div class="meta-label">Original Name</div>
                                    <div class="meta-val" id="metaOriginalName">--</div>
                                </div>
                                <div class="meta-group">
                                    <div class="meta-label">HTML Code Download URL</div>
                                    <div class="meta-val" id="metaHtmlUrl">--</div>
                                </div>
                                <div class="meta-group">
                                    <div class="meta-label">Screenshot Download URL</div>
                                    <div class="meta-val" id="metaScreenshotUrl">--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- DESIGN SYSTEM MODAL -->
    <div class="modal-overlay" id="designSystemModal">
        <div class="modal-window" style="width: 75vw; height: 80vh;">
            <div class="modal-header">
                <div class="modal-title-area">
                    <span class="brand-icon"><i class="fa-solid fa-palette"></i></span>
                    <h3 class="modal-title">Desain Sistem Proyek</h3>
                </div>
                <button class="modal-close-btn" id="closeDsBtn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="overflow-y: auto; display: block; padding: 0;">
                <div class="ds-container">
                    
                    <div class="ds-section">
                        <h4 class="ds-section-title">Palet Warna</h4>
                        <div class="color-grid" id="dsColorGrid">
                            <!-- Dynamic colors loaded here -->
                        </div>
                    </div>

                    <div class="ds-section">
                        <h4 class="ds-section-title">Tipografi & Elemen</h4>
                        <div class="metadata-container" style="padding: 0; margin-bottom: 20px;">
                            <div class="meta-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <div class="meta-label">Font Judul (Headline Font)</div>
                                    <div class="meta-val" id="dsHeadlineFont">--</div>
                                </div>
                                <div>
                                    <div class="meta-label">Font Konten (Body Font)</div>
                                    <div class="meta-val" id="dsBodyFont">--</div>
                                </div>
                            </div>
                            <div class="meta-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                <div>
                                    <div class="meta-label">Corner Roundness (Bentuk Sudut)</div>
                                    <div class="meta-val" id="dsRoundness">--</div>
                                </div>
                                <div>
                                    <div class="meta-label">Device Type Utama</div>
                                    <div class="meta-val" id="dsDeviceType">--</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="ds-section">
                        <h4 class="ds-section-title">Panduan Desain (Markdown)</h4>
                        <div class="ds-markdown" id="dsMarkdownText">--</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JS Logic -->
    <script src="script.js"></script>
</body>
</html>
