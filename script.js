document.addEventListener('DOMContentLoaded', () => {
    // Global Elements
    const projectSearch = document.getElementById('projectSearch');
    const projectList = document.getElementById('projectList');
    const mainHeader = document.getElementById('mainHeader');
    const activeProjectTitle = document.getElementById('activeProjectTitle');
    const activeProjectId = document.getElementById('activeProjectId');
    const viewDesignSystemBtn = document.getElementById('viewDesignSystemBtn');
    const welcomeView = document.getElementById('welcomeView');
    const screensLoader = document.getElementById('screensLoader');
    const screensGrid = document.getElementById('screensGrid');
    
    // Inspector Modal Elements
    const inspectorModal = document.getElementById('inspectorModal');
    const closeInspectorBtn = document.getElementById('closeInspectorBtn');
    const modalScreenTitle = document.getElementById('modalScreenTitle');
    const modalScreenshotImg = document.getElementById('modalScreenshotImg');
    const screenshotDimensions = document.getElementById('screenshotDimensions');
    const htmlCodeIframe = document.getElementById('htmlCodeIframe');
    const metaScreenId = document.getElementById('metaScreenId');
    const metaDeviceType = document.getElementById('metaDeviceType');
    const metaOriginalName = document.getElementById('metaOriginalName');
    const metaHtmlUrl = document.getElementById('metaHtmlUrl');
    const metaScreenshotUrl = document.getElementById('metaScreenshotUrl');
    
    // Design System Modal Elements
    const designSystemModal = document.getElementById('designSystemModal');
    const closeDsBtn = document.getElementById('closeDsBtn');
    const dsColorGrid = document.getElementById('dsColorGrid');
    const dsHeadlineFont = document.getElementById('dsHeadlineFont');
    const dsBodyFont = document.getElementById('dsBodyFont');
    const dsRoundness = document.getElementById('dsRoundness');
    const dsDeviceType = document.getElementById('dsDeviceType');
    const dsMarkdownText = document.getElementById('dsMarkdownText');

    // Global State
    let currentProjectId = null;
    let projectsData = [];
    let screensCache = {}; // Stores screen details by screenId

    // Initialize: Fetch projects
    fetchProjects();

    // Event Listeners
    projectSearch.addEventListener('input', filterProjects);
    closeInspectorBtn.addEventListener('close', closeModal);
    closeInspectorBtn.addEventListener('click', closeModal);
    closeDsBtn.addEventListener('click', closeDsModal);

    // Tab buttons handler
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('d-none'));
            document.getElementById(`tab-${targetTab}`).classList.remove('d-none');
        });
    });

    // Close modals on clicking overlay
    window.addEventListener('click', (e) => {
        if (e.target === inspectorModal) closeModal();
        if (e.target === designSystemModal) closeDsModal();
    });

    // 1. Fetch all projects
    async function fetchProjects() {
        try {
            const res = await fetch('api.php?action=list_projects');
            if (!res.ok) throw new Error("Gagal mengambil data proyek.");
            const data = await res.json();
            projectsData = data.projects || [];
            renderProjectsList(projectsData);
        } catch (err) {
            projectList.innerHTML = `
                <div class="error-container" style="margin: 20px; padding: 15px;">
                    <div class="error-title">Kesalahan</div>
                    <div class="error-message">${err.message}</div>
                </div>
            `;
        }
    }

    // 2. Render Project List inside sidebar
    function renderProjectsList(projects) {
        if (projects.length === 0) {
            projectList.innerHTML = '<p style="padding: 20px; color: var(--text-muted); font-size: 14px; text-align: center;">Tidak ada proyek ditemukan.</p>';
            return;
        }

        projectList.innerHTML = '';
        projects.forEach(proj => {
            const shortId = proj.name ? proj.name.replace('projects/', '') : '';
            const isActive = shortId === currentProjectId;
            
            // Clean up titles or names
            const title = proj.title || 'Tanpa Judul';

            const item = document.createElement('div');
            item.className = `project-item ${isActive ? 'active' : ''}`;
            item.dataset.id = shortId;
            item.dataset.title = title;
            item.innerHTML = `
                <div class="project-name">${title}</div>
                <div class="project-meta">
                    <span>ID: ${shortId}</span>
                </div>
            `;

            item.addEventListener('click', () => selectProject(shortId, title));
            projectList.appendChild(item);
        });
    }

    // 3. Filter projects in sidebar
    function filterProjects() {
        const query = projectSearch.value.toLowerCase().trim();
        const filtered = projectsData.filter(proj => {
            const title = (proj.title || '').toLowerCase();
            const id = (proj.name || '').toLowerCase();
            return title.includes(query) || id.includes(query);
        });
        renderProjectsList(filtered);
    }

    // 4. Select project & load screens
    async function selectProject(projectId, projectTitle) {
        currentProjectId = projectId;
        
        // Highlight active list item
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === projectId) item.classList.add('active');
        });

        // Set Header details
        activeProjectTitle.textContent = projectTitle;
        activeProjectId.textContent = `ID: ${projectId}`;
        mainHeader.classList.remove('d-none');
        
        // Disable design system button until design systems are checked
        viewDesignSystemBtn.disabled = true;
        
        // Show loaders and hide grids
        welcomeView.classList.add('d-none');
        screensLoader.classList.remove('d-none');
        screensGrid.classList.add('d-none');
        screensGrid.innerHTML = '';

        try {
            // Fetch list of screens
            const res = await fetch(`api.php?action=list_screens&projectId=${projectId}`);
            if (!res.ok) throw new Error("Gagal mengambil daftar layar proyek.");
            const data = await res.json();
            const screens = data.screens || [];

            screensLoader.classList.add('d-none');

            if (screens.length === 0) {
                screensGrid.classList.add('d-none');
                welcomeView.innerHTML = `
                    <div class="welcome-icon" style="color: var(--error);"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <h3 class="welcome-title">Tidak Ada Layar</h3>
                    <p class="welcome-desc">Proyek ini tidak memiliki layar UI yang tersedia saat ini.</p>
                `;
                welcomeView.classList.remove('d-none');
                
                // Still try to check design systems
                checkDesignSystem(projectId);
                return;
            }

            // Render Screen Grid Container and Screen Skeletons
            screensGrid.classList.remove('d-none');
            
            screens.forEach(screen => {
                const screenId = screen.name ? screen.name.substring(screen.name.lastIndexOf('/') + 1) : '';
                const screenName = screen.displayName || screenId;

                // Render Skeleton card
                const card = document.createElement('div');
                card.className = 'screen-card screen-card-skeleton';
                card.id = `screen-card-${screenId}`;
                card.innerHTML = `
                    <div class="skeleton-preview skeleton"></div>
                    <div class="skeleton-text-container">
                        <div class="skeleton-line skeleton-title skeleton"></div>
                        <div class="skeleton-line skeleton-subtitle skeleton"></div>
                    </div>
                `;
                screensGrid.appendChild(card);

                // Fetch details asynchronously for each screen
                fetchScreenDetails(projectId, screenId);
            });

            // Check Design System for the selected project
            checkDesignSystem(projectId);

        } catch (err) {
            screensLoader.classList.add('d-none');
            screensGrid.classList.add('d-none');
            welcomeView.innerHTML = `
                <div class="error-container">
                    <div class="error-title">Gagal Memuat Layar</div>
                    <div class="error-message">${err.message}</div>
                </div>
            `;
            welcomeView.classList.remove('d-none');
        }
    }

    // 5. Fetch details for a specific screen
    async function fetchScreenDetails(projectId, screenId) {
        try {
            const res = await fetch(`api.php?action=get_screen&projectId=${projectId}&screenId=${screenId}`);
            if (!res.ok) throw new Error("Gagal");
            
            const screen = await res.json();
            screensCache[screenId] = screen; // Cache data
            
            // Build the card layout with real data
            const title = screen.title || screen.name.substring(screen.name.lastIndexOf('/') + 1);
            const screenshotUrl = screen.screenshot ? screen.screenshot.downloadUrl : '';
            const deviceType = screen.deviceType || 'DESKTOP';
            const width = screen.width || 'N/A';
            const height = screen.height || 'N/A';
            const htmlCodeUrl = screen.htmlCode ? screen.htmlCode.downloadUrl : '';

            const card = document.getElementById(`screen-card-${screenId}`);
            if (!card) return;

            card.className = 'screen-card';
            card.innerHTML = `
                <div class="card-preview-container">
                    ${screenshotUrl ? `<img src="${screenshotUrl}" class="card-image" alt="${title}" loading="lazy">` : '<div style="color: var(--text-muted);"><i class="fa-regular fa-image fa-3x"></i></div>'}
                    <div class="card-overlay">
                        <button class="btn btn-primary open-inspector-btn" data-screen-id="${screenId}">
                            <i class="fa-solid fa-magnifying-glass-plus"></i> Inspeksi
                        </button>
                    </div>
                </div>
                <div class="card-info">
                    <h4 class="card-title" title="${title}">${title}</h4>
                    <div class="card-meta">
                        <span class="device-indicator">
                            <i class="${deviceType === 'MOBILE' ? 'fa-solid fa-mobile-button' : 'fa-solid fa-laptop'}"></i>
                            ${deviceType}
                        </span>
                        <span>${width} × ${height} px</span>
                    </div>
                </div>
            `;

            // Bind Event to open Inspector modal
            card.querySelector('.open-inspector-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openInspector(screenId);
            });
            
            card.addEventListener('click', () => {
                openInspector(screenId);
            });

        } catch (err) {
            const card = document.getElementById(`screen-card-${screenId}`);
            if (card) {
                card.className = 'screen-card';
                card.innerHTML = `
                    <div class="card-preview-container" style="height: 200px;">
                        <span style="color: var(--error);"><i class="fa-solid fa-circle-exclamation fa-2x"></i></span>
                    </div>
                    <div class="card-info">
                        <h4 class="card-title" style="color: var(--error)">Gagal memuat screen detail</h4>
                        <span class="card-meta">Screen ID: ${screenId}</span>
                    </div>
                `;
            }
        }
    }

    // 6. Check Design System
    let activeDesignSystemData = null;
    async function checkDesignSystem(projectId) {
        try {
            const res = await fetch(`api.php?action=get_design_system&projectId=${projectId}`);
            if (!res.ok) throw new Error("Gagal");
            const data = await res.json();
            
            if (data && data.designSystems && data.designSystems.length > 0) {
                activeDesignSystemData = data.designSystems[0];
                viewDesignSystemBtn.disabled = false;
                
                // Bind Design System modal launch
                viewDesignSystemBtn.onclick = () => openDesignSystemModal();
            } else {
                activeDesignSystemData = null;
                viewDesignSystemBtn.disabled = true;
            }
        } catch (err) {
            activeDesignSystemData = null;
            viewDesignSystemBtn.disabled = true;
        }
    }

    // 7. Open Screen Inspector Modal
    function openInspector(screenId) {
        const screen = screensCache[screenId];
        if (!screen) return;

        const title = screen.title || 'Screen Details';
        modalScreenTitle.textContent = title;
        
        // Screenshot Preview
        const screenshotUrl = screen.screenshot ? screen.screenshot.downloadUrl : '';
        const width = screen.width || 'N/A';
        const height = screen.height || 'N/A';
        
        modalScreenshotImg.src = screenshotUrl;
        screenshotDimensions.textContent = `${width} × ${height} px`;

        // Reset Tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="live-view"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('d-none'));
        document.getElementById('tab-live-view').classList.remove('d-none');

        // Load Live HTML Code (Proxied)
        const htmlUrl = screen.htmlCode ? screen.htmlCode.downloadUrl : '';
        if (htmlUrl) {
            htmlCodeIframe.src = `api.php?action=proxy_html&url=${encodeURIComponent(htmlUrl)}`;
        } else {
            htmlCodeIframe.src = 'about:blank';
        }

        // Set Metadata fields
        metaScreenId.textContent = screenId;
        metaDeviceType.textContent = screen.deviceType || 'DESKTOP';
        metaOriginalName.textContent = screen.name;
        metaHtmlUrl.innerHTML = htmlUrl ? `<a href="${htmlUrl}" target="_blank" style="color: var(--primary)">Unduh File HTML <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : 'N/A';
        metaScreenshotUrl.innerHTML = screenshotUrl ? `<a href="${screenshotUrl}" target="_blank" style="color: var(--primary)">Buka Gambar Asli <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : 'N/A';

        inspectorModal.classList.add('open');
    }

    // 8. Close Screen Inspector Modal
    function closeModal() {
        inspectorModal.classList.remove('open');
        htmlCodeIframe.src = 'about:blank'; // Stop loading iframe content
    }

    // 9. Open Design System Modal
    function openDesignSystemModal() {
        if (!activeDesignSystemData) return;

        const ds = activeDesignSystemData;

        // Render Colors
        dsColorGrid.innerHTML = '';
        const colors = ds.namedColors || {};
        const colorKeys = Object.keys(colors);

        if (colorKeys.length === 0) {
            dsColorGrid.innerHTML = '<p style="color: var(--text-muted)">Tidak ada palet warna terdaftar.</p>';
        } else {
            colorKeys.forEach(key => {
                const hex = colors[key];
                
                // Color Card Swatch
                const colorCard = document.createElement('div');
                colorCard.className = 'color-card';
                colorCard.innerHTML = `
                    <div class="color-swatch" style="background-color: ${hex}; border-bottom: 1px solid var(--panel-border);"></div>
                    <div class="color-info">
                        <div class="color-name" title="${key}">${key}</div>
                        <div class="color-hex">${hex}</div>
                    </div>
                `;
                dsColorGrid.appendChild(colorCard);
            });
        }

        // Setup Typography and General styling details
        dsHeadlineFont.textContent = ds.headlineFontFamily || ds.font || 'N/A';
        dsBodyFont.textContent = ds.labelFontFamily || 'N/A';
        dsRoundness.textContent = ds.roundness ? ds.roundness.replace('ROUND_', '') : 'N/A';
        dsDeviceType.textContent = ds.deviceType || 'N/A';

        // Markdown text / Description
        dsMarkdownText.textContent = ds.description || 'Tidak ada panduan desain bertuliskan Markdown.';

        designSystemModal.classList.add('open');
    }

    // 10. Close Design System Modal
    function closeDsModal() {
        designSystemModal.classList.remove('open');
    }
});
