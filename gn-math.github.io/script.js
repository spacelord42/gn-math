// ===== DIAGNOSTIC LOGGING =====
let diagnosticLog = ['🔍 Diagnostic logging started'];

function logDiagnostic(msg) {
    console.log('🔍', msg);
    diagnosticLog.push(msg);
    errorLog.push(msg); // Also add to main error log so it shows in debug button
}

// ===== ERROR LOGGING SETUP =====
let gameIsOpen = false;
let errorLog = ['🔧 Error logging initialized'];

window.addEventListener('error', function(event) {
    // Only log if there's actually an error message
    if (!event.message && !event.error) return;
    
    const details = {
        message: event.message || event.error || '?',
        filename: event.filename || '?',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        type: event.error?.constructor?.name || 'Error'
    };
    
    // Skip logging if message is just "?" (no real error)
    if (details.message === '?') return;
    
    // Skip generic cross-origin "Script error." messages - browsers strip all
    // useful info from errors thrown by scripts loaded from other domains,
    // so these are never actionable. Match regardless of trailing period or
    // filename/line since browsers are inconsistent about those.
    if (/^Script error\.?$/.test(details.message)) return;
    
    const errorMsg = `ERROR: ${details.message} @ ${details.filename}:${details.lineno}`;
    errorLog.push(errorMsg);
    console.error('📍 Caught error:', details);
}, true);

window.addEventListener('unhandledrejection', function(event) {
    const msg = event.reason?.message || String(event.reason) || '?';
    
    // Skip if no meaningful message
    if (!msg || msg === '?' || msg === 'undefined' || msg === 'null') return;
    
    const errorMsg = `PROMISE ERROR: ${msg}`;
    errorLog.push(errorMsg);
    console.error('📍 Unhandled rejection:', event.reason);
});

document.addEventListener('DOMContentLoaded', function() {
    errorLog.push('🔧 DOM Content Loaded');
    console.log('DOM loaded, error count:', errorLog.length);
});

window.addEventListener('load', function() {
    console.log('PAGE LOADED - Creating error button...');
    try {
        const btn = document.createElement('button');
        btn.textContent = '📋 Debug';
        btn.style.cssText = 'position:fixed;bottom:10px;right:10px;padding:8px 12px;background:#fc2651;color:white;border:none;border-radius:4px;cursor:pointer;z-index:9999;font-size:12px';
        btn.onclick = () => {
            const allErrors = errorLog.join('\n\n');
            console.log('Debug info:', allErrors);
            alert(allErrors || 'No errors');
        };
        document.body.appendChild(btn);
        errorLog.push('🔧 Debug button created');
        console.log('✓ Button added');
    } catch(e) {
        errorLog.push('✗ Button failed: ' + e.message);
        console.error('Button creation failed:', e);
    }
});

// ===== GLOBAL VARIABLES =====
let container, zoneViewer, zoneFrame, searchBar, sortOptions;
let zones = [];
let popularityData = {};
const zonesURL = "https://fastly.jsdelivr.net/gh/spacelord42/gn-math/assets/zones.json";
const coverURL = "https://fastly.jsdelivr.net/gh/spacelord42/gn-math/covers";
const htmlURL = "https://fastly.jsdelivr.net/gh/spacelord42/gn-math/html";

// Global functions that can be called from HTML event handlers
function sortZones() {
    const sortBy = sortOptions.value;
    if (sortBy === 'name') {
        zones.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'id') {
        zones.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'popular') {
        zones.sort((a, b) => (popularityData[b.id] || 0) - (popularityData[a.id] || 0));
    }
    zones.sort((a, b) => (a.id === -1 ? -1 : b.id === -1 ? 1 : 0));
    displayZones(zones);
}

function displayZones(zonesToDisplay) {
    container.innerHTML = "";
    zonesToDisplay.forEach((file, index) => {
        const zoneItem = document.createElement("div");
        zoneItem.className = "zone-item";
        zoneItem.onclick = () => openZone(file);
        const img = document.createElement("img");
        img.src = file.cover.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
        zoneItem.appendChild(img);
        const button = document.createElement("button");
        button.textContent = file.name;
        button.onclick = (event) => {
            event.stopPropagation();
            openZone(file);
        };
        zoneItem.appendChild(button);
        container.appendChild(zoneItem);
    });
    if (container.innerHTML === "") {
        container.innerHTML = "No zones found.";
    } else {
        document.getElementById("zoneCount").textContent = `Zones Loaded: ${zonesToDisplay.length}`;
    }
}

function filterZones() {
    const query = searchBar.value.toLowerCase();
    const filteredZones = zones.filter(zone => zone.name.toLowerCase().includes(query));
    displayZones(filteredZones);
}

async function getZoneHtml(url) {
    logDiagnostic(`Fetching game HTML from: ${url}`);
    try {
        const response = await fetch(url + "?t=" + Date.now());
        logDiagnostic(`Fetch response status: ${response.status}`);
        
        if (!response.ok) {
            const errorMsg = `Fetch failed with status ${response.status}`;
            logDiagnostic(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }

        let html = await response.text();
        logDiagnostic(`Received HTML: ${html.length} characters`);
        html = stripYtGameSdk(html);
        if (!/<base\b/i.test(html)) {
            const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
            const baseTag = `<base href="${baseUrl}">`;
            html = /<head(?:\s[^>]*)?>/i.test(html)
                ? html.replace(/<head(?:\s[^>]*)?>/i, match => match + baseTag)
                : baseTag + html;
        }
        logDiagnostic(`HTML processed and ready to load`);
        return html;
    } catch (error) {
        logDiagnostic(`❌ Error fetching HTML: ${error.message}`);
        throw error;
    }
}

async function openZone(file) {
    logDiagnostic(`Opening zone: ${file.name} (ID: ${file.id})`);
    if (file.url.startsWith("http")) {
        logDiagnostic(`Opening external URL: ${file.url}`);
        window.open(file.url, "_blank");
    } else {
        const url = file.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
        logDiagnostic(`Game URL: ${url}`);
        try {
            const response = await fetch(url + "?t=" + Date.now());
            logDiagnostic(`Fetch response status: ${response.status}`);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            let html = await response.text();
            logDiagnostic(`Received HTML: ${html.length} characters`);

            // Warn if jsDelivr returned an error page instead of a real game file
            if (html.includes('Package or version not found') ||
                html.includes('Path not found') ||
                html.includes('Failed to fetch') ||
                (html.length < 500 && html.includes('404'))) {
                logDiagnostic(`⚠️ CDN may have returned an error page for: ${url} — zones.json may have wrong filename`);
            }

            // Inject a <base> tag so relative asset URLs (./game.data, ./sounds/, etc.)
            // resolve against the CDN, not the local file:// path
            const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
            const baseTag = `<base href="${baseUrl}">`;
            if (/<head(?:\s[^>]*)?>/i.test(html)) {
                html = html.replace(/<head(?:\s[^>]*)?>/i, m => m + baseTag);
            } else if (/<html(?:\s[^>]*)?>/i.test(html)) {
                html = html.replace(/<html(?:\s[^>]*)?>/i, m => m + baseTag);
            } else {
                // No html/head tag (partial HTML) — prepend base tag directly
                html = baseTag + html;
            }
            logDiagnostic(`Base URL injected: ${baseUrl}`);

            // Recreate iframe if closeZone removed it from the DOM
            if (zoneFrame.contentDocument === null) {
                logDiagnostic(`iframe contentDocument is null - recreating iframe`);
                zoneFrame = document.createElement("iframe");
                zoneFrame.id = "zoneFrame";
                zoneViewer.appendChild(zoneFrame);
            }

            zoneFrame.contentDocument.open();
            zoneFrame.contentDocument.write(html);
            zoneFrame.contentDocument.close();
            logDiagnostic(`✅ HTML written to iframe`);
            logDiagnostic(`HTML preview: ${html.substring(0, 300).replace(/\n/g, ' ')}`);

            // Log any errors that occur inside the iframe
            zoneFrame.contentWindow.addEventListener('error', function(e) {
                logDiagnostic(`❌ IFRAME ERROR: ${e.message} @ ${e.filename}:${e.lineno}`);
            }, true);
            zoneFrame.contentWindow.addEventListener('unhandledrejection', function(e) {
                const msg = e.reason?.message || String(e.reason);
                if (msg && msg !== 'undefined') logDiagnostic(`❌ IFRAME PROMISE ERROR: ${msg}`);
            });

            // After 3 seconds check if the iframe actually has content rendering
            setTimeout(() => {
                try {
                    const body = zoneFrame.contentDocument?.body;
                    logDiagnostic(`Iframe body after 3s: ${body ? body.innerHTML.substring(0, 200).replace(/\n/g, ' ') : 'null'}`);
                } catch(e) {
                    logDiagnostic(`Could not read iframe body: ${e.message}`);
                }
            }, 3000);

            document.getElementById('zoneName').textContent = file.name;
            document.getElementById('zoneId').textContent = file.id;
            document.getElementById('zoneAuthor').textContent = "by " + (file.author || "Unknown");
            document.getElementById('zoneAuthor').href = file.authorLink || "#";
            zoneViewer.style.display = "flex";
            const pageUrl = new URL(window.location);
            pageUrl.searchParams.set('id', file.id);
            history.pushState(null, '', pageUrl.toString());
            gameIsOpen = true;
            logDiagnostic(`Game loaded and displayed`);
        } catch (error) {
            logDiagnostic(`❌ Failed to load zone: ${error.message}`);
            alert("Failed to load zone: " + error.message + "\n\nCopy this error message and email it with your name to clientsidez.net@gmail.com for a fix.");
        }
    }
}

async function aboutBlank() {
    const zone = zones.find(zone => zone.id + '' === document.getElementById('zoneId').textContent);
    if (zone) {
        const newWindow = window.open("about:blank", "_blank");
        if (!newWindow) return;
        const url = zone.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
        fetch(url + "?t=" + Date.now())
            .then(r => r.text())
            .then(html => {
                // Inject base tag and full-screen CSS so the game fills the tab
                const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
                const inject = `<base href="${baseUrl}"><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;}canvas{width:100%!important;height:100%!important;}</style>`;
                if (/<head(?:\s[^>]*)?>/i.test(html)) {
                    html = html.replace(/<head(?:\s[^>]*)?>/i, m => m + inject);
                } else if (/<html(?:\s[^>]*)?>/i.test(html)) {
                    html = html.replace(/<html(?:\s[^>]*)?>/i, m => m + inject);
                } else {
                    html = inject + html;
                }
                newWindow.document.open();
                newWindow.document.write(html);
                newWindow.document.close();
            })
            .catch(error => {
                newWindow.close();
                alert("Failed to open zone: " + error.message);
            });
    }
}

function fullscreenZone() {
    if (zoneFrame.requestFullscreen) {
        zoneFrame.requestFullscreen();
    } else if (zoneFrame.webkitRequestFullscreen) {
        zoneFrame.webkitRequestFullscreen();
    } else if (zoneFrame.msRequestFullscreen) {
        zoneFrame.msRequestFullscreen();
    }
}

async function downloadZone() {
    const zone = zones.find(zone => zone.id + '' === document.getElementById('zoneId').textContent);
    if (zone) {
        try {
            const url = zone.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
            const response = await fetch(url + "?t=" + Date.now());
            const html = await response.text();
            const blob = new Blob([html], { type: "text/html" });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = (zone.name || "game") + ".html";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert("Failed to download zone: " + error.message);
        }
    }
}

function closeZone() {
    // Remove iframe entirely - avoids broken contentDocument on reopen
    zoneViewer.removeChild(zoneFrame);
    zoneViewer.style.display = "none";
    const pageUrl = new URL(window.location);
    pageUrl.searchParams.delete('id');
    history.pushState(null, '', pageUrl.toString());
    gameIsOpen = false;
}

function saveData() {
    const dataToExport = {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const cookieData = document.cookie;
        try {
            const content = e.target.result;
            const parsedData = JSON.parse(content);
            for (let key in parsedData.localStorage) {
                localStorage.setItem(key, parsedData.localStorage[key]);
            }
            for (let key in parsedData.sessionStorage) {
                sessionStorage.setItem(key, parsedData.sessionStorage[key]);
            }
        } catch (error) {
        }
        if (cookieData) {
            const cookies = cookieData.split("; ");
            cookies.forEach(cookie => {
                document.cookie = cookie;
            });
        }
        alert("Data loaded");
    };
    reader.readAsText(file);
}

function darkMode() {
    document.body.classList.toggle("dark-mode");
}

function cloakIcon(url) {
    const link = document.querySelector("link[rel~='icon']");
    link.rel = "icon";
    if ((url+"").trim().length === 0) {
        link.href = "favicon.png";
    } else {
        link.href = url;
    }
    document.head.appendChild(link);
}

function cloakName(string) {
    if ((string+"").trim().length === 0) {
        document.title = "gn-math";
        return;
    }
    document.title = string;
}

function tabCloak() {
    closePopup();
    document.getElementById('popupTitle').textContent = "Tab Cloak";
    const popupBody = document.getElementById('popupBody');
    popupBody.innerHTML = `
        <label for="tab-cloak-textbox" style="font-weight: bold;">Set Tab Title:</label><br>
        <input type="text" id="tab-cloak-textbox" placeholder="Enter new tab name..." oninput="cloakName(this.value)">
        <br><br><br><br>
        <label for="tab-cloak-textbox" style="font-weight: bold;">Set Tab Icon:</label><br>
        <input type="text" id="tab-cloak-textbox" placeholder="Enter new tab icon..." oninput='cloakIcon(this.value)'>
        <br><br><br>
    `;
    popupBody.contentEditable = false;
    document.getElementById('popupOverlay').style.display = "flex";
}

function showContact() {
    document.getElementById('popupTitle').textContent = "Contact";
    const popupBody = document.getElementById('popupBody');
    popupBody.innerHTML = `<p>Discord: https://discord.gg/NAFw4ykZ7n</p>`;
    popupBody.contentEditable = false;
    document.getElementById('popupOverlay').style.display = "flex";
}

function loadPrivacy() {
    document.getElementById('popupTitle').textContent = "Privacy Policy";
    const popupBody = document.getElementById('popupBody');
    popupBody.innerHTML = `
        <div style="max-height: 60vh; overflow-y: auto;">
            <h2>PRIVACY POLICY</h2>
            <p>Last updated April 17, 2025</p>
            <p>This Privacy Notice for gn-math ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:</p>
            <ul>
                <li>Visit our website at <a href="https://gn-math.github.io">https://gn-math.github.io</a>, or any website of ours that links to this Privacy Notice</li>
                <li>Engage with us in other related ways, including any sales, marketing, or events</li>
            </ul>
            <p>Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="https://discord.gg/NAFw4ykZ7n">https://discord.gg/NAFw4ykZ7n</a>.</p>
            
            <h3>SUMMARY OF KEY POINTS</h3>
            <p>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.</p>
            
            <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about personal information you disclose to us.</p>
            
            <p><strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.</p>
            
            <p><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
            
            <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about how we process your information.</p>
            
            <p><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about when and with whom we share your personal information.</p>
            
            <p><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about how we keep your information safe.</p>
            
            <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about your privacy rights.</p>
            
            <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</p>
        </div>
    `;
    popupBody.contentEditable = false;
    document.getElementById('popupOverlay').style.display = "flex";
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = "none";
}

// Shim for the YouTube Playables SDK (ytgame.js)
const YTGAME_SHIM = `
<script>
(function () {
    function storageKey(k) { return "ytgame_save_" + k; }
    const listeners = { pause: [], resume: [], audio: [] };
    window.ytgame = {
        game: {
            gameReady: function () { return Promise.resolve(); },
            firstFrameReady: function () { return Promise.resolve(); },
            loadData: function () {
                try {
                    return Promise.resolve(localStorage.getItem(storageKey("default")));
                } catch (e) { return Promise.resolve(null); }
            },
            saveData: function (data) {
                try {
                    localStorage.setItem(storageKey("default"), data);
                } catch (e) {}
                return Promise.resolve();
            },
        },
        system: {
            getLanguage: function () {
                return (navigator.language || "en").split("-")[0];
            },
            isAudioEnabled: function () { return true; },
            onAudioEnabledChange: function (cb) { listeners.audio.push(cb); },
            onPause: function (cb) { listeners.pause.push(cb); },
            onResume: function (cb) { listeners.resume.push(cb); },
        },
        engagement: {
            sendScore: function () { return Promise.resolve(); },
        },
        health: {
            logError: function (err) { console.warn("ytgame.health.logError:", err); },
        },
    };
    document.addEventListener("visibilitychange", function () {
        const fns = document.hidden ? listeners.pause : listeners.resume;
        fns.forEach(function (fn) { try { fn(); } catch (e) {} });
    });
})();
<\/script>`;

function stripYtGameSdk(html) {
    const ytgameScriptRegex = /<script\b[^>]*\bsrc=["'][^"']*ytgame\.js[^"']*["'][^>]*>\s*<\/script>/i;
    if (ytgameScriptRegex.test(html)) {
        html = html.replace(ytgameScriptRegex, YTGAME_SHIM);
    }
    return html;
}

// Wrap entire script in DOMContentLoaded to ensure DOM is ready
function initializeScript() {
    container = document.getElementById('container');
    zoneViewer = document.getElementById('zoneViewer');
    zoneFrame = document.getElementById('zoneFrame');
    searchBar = document.getElementById('searchBar');
    sortOptions = document.getElementById('sortOptions');

    async function listZones() {
        try {
            console.log("Fetching from:", zonesURL);
            const response = await fetch(zonesURL+"?t="+Date.now());
            
            console.log("Response status:", response.status);
            console.log("Response OK:", response.ok);
            
            const json = await response.json();
            console.log("Parsed JSON:", json);
            console.log("JSON type:", typeof json);
            console.log("Is array:", Array.isArray(json));
            
            zones = json;
            await fetchPopularity();
            sortZones();
            const search = new URLSearchParams(window.location.search);
            const id = search.get('id');
            if (id) {
                const zone = zones.find(zone => zone.id + '' == id + '');
                if (zone) {
                    openZone(zone);
                }
            }
        } catch (error) {
            console.error("FULL ERROR:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            container.innerHTML = `Error loading zones: ${error}<br><br>Copy this error message and email it with your name to clientsidez.net@gmail.com for a fix.`;
        }
    }

    async function fetchPopularity() {
        try {
            const response = await fetch("https://data.jsdelivr.com/v1/stats/packages/gh/gn-math/html/files?period=year");
            const data = await response.json();
            data.forEach(file => {
                const idMatch = file.name.match(/\/(\d+)\.html$/);
                if (idMatch) {
                    const id = parseInt(idMatch[1]);
                    popularityData[id] = file.hits.total;
                }
            });
        } catch (error) {
            popularityData[0] = 0;
        }
    }

    const schoolList = ["deledao", "goguardian", "lightspeed", "linewize", "securly", ".edu/"];

    function isBlockedDomain(url) {
        const domain = new URL(url, location.origin).hostname + "/";
        return schoolList.some(school => domain.includes(school));
    }

    const originalFetch = window.fetch;
    window.fetch = function (url, options) {
        if (isBlockedDomain(url)) {
            console.warn(`lam`);
            return Promise.reject(new Error("lam"));
        }
        return originalFetch.apply(this, arguments);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (isBlockedDomain(url)) {
            console.warn(`lam`);
            return;
        }
        return originalOpen.apply(this, arguments);
    };

    HTMLCanvasElement.prototype.toDataURL = function (...args) {
        return "";
    };

    const settings = document.getElementById('settings');
    settings.addEventListener('click', () => {
        document.getElementById('popupTitle').textContent = "Settings";
        const popupBody = document.getElementById('popupBody');
        popupBody.innerHTML = `
        <button id="settings-button" onclick="darkMode()">Toggle Dark Mode</button>
        <br><br>
        <button id="settings-button" onclick="tabCloak()">Tab Cloak</button>
        <br>
        `;
        popupBody.contentEditable = false;
        document.getElementById('popupOverlay').style.display = "flex";
    });

    listZones();
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
} else {
    initializeScript();
}
