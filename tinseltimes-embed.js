
/**
 * TinselTimes Caroler Portal - JavaScript Embed Script
 * ---------------------------------------------------
 * Use: <script src="tinseltimes-embed.js"></script>
 * Target: <div id="tinseltimes-portal"></div>
 */

(function() {
    const CONFIG = {
        targetId: 'tinseltimes-portal',
        // Update this URL to the actual location where your portal index.html is hosted
        portalUrl: 'index.html', 
        height: '850px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
    };

    function initPortal() {
        const container = document.getElementById(CONFIG.targetId);
        if (!container) {
            console.warn(`TinselTimes Embed: Target #${CONFIG.targetId} not found.`);
            return;
        }

        // Apply container styles
        container.style.width = '100%';
        container.style.maxWidth = '1200px';
        container.style.margin = '2rem auto';
        container.style.borderRadius = CONFIG.borderRadius;
        container.style.overflow = 'hidden';
        container.style.boxShadow = CONFIG.boxShadow;
        container.style.background = '#ffffff';
        container.style.height = CONFIG.height;
        container.style.position = 'relative';

        // Create the Iframe
        const iframe = document.createElement('iframe');
        iframe.src = CONFIG.portalUrl;
        iframe.title = 'TinselTimes Caroler Portal';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        iframe.setAttribute('allow', 'geolocation; camera; microphone');
        
        // Handle Mobile Responsiveness
        if (window.innerWidth < 768) {
            container.style.height = '90vh';
            container.style.margin = '0';
            container.style.borderRadius = '0';
        }

        container.appendChild(iframe);
    }

    // Run on load
    if (document.readyState === 'complete') {
        initPortal();
    } else {
        window.addEventListener('load', initPortal);
    }
})();
