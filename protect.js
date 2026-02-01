// ========================================
// Anti-Inspection Protections
// ========================================
// Makes it harder (not impossible) for
// casual users to snoop via DevTools.
// ========================================

(function() {
    'use strict';

    // 1. Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Disable common DevTools keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // Cmd variants for Mac
        if (e.metaKey && e.altKey && e.key === 'i') {
            e.preventDefault();
            return false;
        }
        if (e.metaKey && e.altKey && e.key === 'j') {
            e.preventDefault();
            return false;
        }
        if (e.metaKey && e.altKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // 3. Detect DevTools open via window size difference
    var devToolsOpen = false;
    var threshold = 160;

    function checkDevTools() {
        var widthDiff = window.outerWidth - window.innerWidth > threshold;
        var heightDiff = window.outerHeight - window.innerHeight > threshold;

        if (widthDiff || heightDiff) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                onDevToolsOpen();
            }
        } else {
            if (devToolsOpen) {
                devToolsOpen = false;
                onDevToolsClose();
            }
        }
    }

    function onDevToolsOpen() {
        // Clear console and show warning
        console.clear();
        console.log('%c⚠️ Hey! This is a private app.', 'font-size: 24px; color: red; font-weight: bold;');
        console.log('%cIf someone told you to paste something here, it\'s a scam.', 'font-size: 16px; color: orange;');
        console.log('%cPlease close this and enjoy the app! 💕', 'font-size: 14px; color: pink;');
    }

    function onDevToolsClose() {
        // Restored
    }

    // Check periodically
    setInterval(checkDevTools, 1000);

    // 4. Override console methods to reduce info leakage
    var originalLog = console.log;
    var originalError = console.error;
    var originalWarn = console.warn;

    // Only suppress in production (not localhost)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log = function() {};
        console.error = function() {};
        console.warn = function() {};
        console.info = function() {};
        console.debug = function() {};
        console.table = function() {};
    }

    // 5. Disable text selection on sensitive elements
    var style = document.createElement('style');
    style.textContent = [
        '.password-gate, .chat-messages, .secret-text, .bucket-list {',
        '    -webkit-user-select: none;',
        '    -moz-user-select: none;',
        '    -ms-user-select: none;',
        '    user-select: none;',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    // 6. Disable drag on images and elements
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // 7. Prevent viewing page source via view-source: protocol
    if (window.location.protocol === 'view-source:') {
        window.location.href = 'about:blank';
    }

})();
