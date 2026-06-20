# Stitch Project Viewer

A clean, premium web-based project viewer for Stitch API, allowing developers and designers to explore UI designs, live HTML previews, screenshots, and design system color palettes.

## Features
- **Sidebar Project Explorer**: Live search and list all available projects.
- **Screens Grid**: High-fidelity UI cards with screenshot previews.
- **Inspector Modal**: View high-res screenshots side-by-side with live HTML rendering.
- **Design System Panel**: Explore typography details, principal devices, and visual color palettes.

## Getting Started

### Prerequisites
- PHP 7.4 or higher with cURL support.
- A local PHP server (e.g. Laragon, XAMPP, or built-in PHP server).

### Configuration
This application requires an API Key to interact with the Stitch API. 

1. Duplicate the `estelerrr.example` template:
   ```bash
   cp estelerrr.example estelerrr
   ```
2. Open the `estelerrr` file and replace `YOUR_STITCH_API_KEY_HERE` with your actual Stitch API key:
   ```json
   {
     "mcpServers": {
       "stitch": {
         "serverUrl": "https://stitch.googleapis.com/mcp",
         "headers": {
           "X-Goog-Api-Key": "your-actual-api-key"
         }
       }
     }
   }
   ```

### Running Locally
To launch the built-in PHP development server, run:
```bash
php -S localhost:8000
```
Then, open your browser and navigate to `http://localhost:8000`.
