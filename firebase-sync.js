// ========================================
// Firebase Real-time Sync
// ========================================

let db = null;
let currentUser = null;
let isFirebaseEnabled = false;

// ========================================
// Initialize Firebase
// ========================================

function initFirebase() {
    // Check if Firebase config exists
    if (!CONFIG.firebase || !CONFIG.firebase.apiKey || CONFIG.firebase.apiKey === 'YOUR_API_KEY') {
        console.log('Firebase not configured - running in offline mode');
        updateOnlineStatus(false, 'Offline mode');
        return false;
    }

    try {
        // Initialize Firebase
        firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
        isFirebaseEnabled = true;

        // Determine current user based on timezone
        // If viewing from Eastern time, it's Vardhini; Pacific time, it's Ansh
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimezone.includes('New_York') || userTimezone.includes('Eastern')) {
            currentUser = 'vardhini';
        } else {
            currentUser = 'ansh';
        }

        // Store in localStorage for consistency
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = storedUser;
        } else {
            localStorage.setItem('currentUser', currentUser);
        }

        console.log('Firebase initialized! User:', currentUser);

        // Set up real-time listeners
        setupRealtimeListeners();
        updateOnlineStatus(true, 'Connected');

        // Track presence
        setupPresence();

        return true;
    } catch (error) {
        console.error('Firebase init error:', error);
        updateOnlineStatus(false, 'Connection error');
        return false;
    }
}

// ========================================
// Online Status
// ========================================

function updateOnlineStatus(online, text) {
    const statusEl = document.getElementById('onlineStatus');
    if (!statusEl) return;

    const dot = statusEl.querySelector('.status-dot');
    const textEl = statusEl.querySelector('.status-text');

    if (online) {
        dot.style.background = '#00b894';
        dot.style.boxShadow = '0 0 10px #00b894';
    } else {
        dot.style.background = '#636e72';
        dot.style.boxShadow = 'none';
    }

    textEl.textContent = text;
}

// ========================================
// Presence System
// ========================================

function setupPresence() {
    if (!db) return;

    const presenceRef = db.ref('presence/' + currentUser);
    const connectedRef = db.ref('.info/connected');

    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            // We're connected
            presenceRef.set({
                online: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });

            // When we disconnect, update status
            presenceRef.onDisconnect().set({
                online: false,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });

    // Listen for partner's presence
    const partnerUser = currentUser === 'ansh' ? 'vardhini' : 'ansh';
    db.ref('presence/' + partnerUser).on('value', (snap) => {
        const data = snap.val();
        if (data && data.online) {
            updateOnlineStatus(true, `${capitalize(partnerUser)} is online`);
        } else {
            updateOnlineStatus(true, 'Connected');
        }
    });
}

// ========================================
// Real-time Listeners
// ========================================

function setupRealtimeListeners() {
    if (!db) return;

    // Listen for chat messages
    db.ref('messages').orderByChild('timestamp').limitToLast(50).on('child_added', (snap) => {
        const message = snap.val();
        displayMessage(message);
    });

    // Listen for reactions (hugs, kisses, etc.)
    db.ref('reactions').on('child_added', (snap) => {
        const reaction = snap.val();
        // Only show if it's from the other person and recent (within 10 seconds)
        const now = Date.now();
        if (reaction.from !== currentUser && (now - reaction.timestamp) < 10000) {
            showReceivedReaction(reaction.type, reaction.from);
        }
        // Remove old reactions
        if ((now - reaction.timestamp) > 10000) {
            snap.ref.remove();
        }
    });

    // Listen for active meeting
    db.ref('meeting').on('value', (snap) => {
        const meeting = snap.val();
        updateMeetingDisplay(meeting);
    });

    // Listen for dates
    setupDatesListener();
}

// ========================================
// Chat Functions
// ========================================

function sendMessage(event) {
    event.preventDefault();

    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    if (!isFirebaseEnabled) {
        // Offline mode - just show locally
        displayMessage({
            text: text,
            from: currentUser || 'you',
            timestamp: Date.now()
        });
        input.value = '';
        return;
    }

    // Send to Firebase
    db.ref('messages').push({
        text: text,
        from: currentUser,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    input.value = '';
}

function displayMessage(message) {
    const container = document.getElementById('chatMessages');

    // Remove empty state
    const emptyMsg = container.querySelector('.chat-empty');
    if (emptyMsg) emptyMsg.remove();

    // Check if message already exists (by timestamp + text combination)
    const existingMsgs = container.querySelectorAll('.chat-message');
    for (const msg of existingMsgs) {
        if (msg.dataset.timestamp === String(message.timestamp)) {
            return; // Already displayed
        }
    }

    const isMe = message.from === currentUser;
    const isReaction = message.isReaction === true;
    const div = document.createElement('div');
    div.className = `chat-message ${isMe ? 'sent' : 'received'} ${isReaction ? 'reaction-message' : ''}`;
    div.dataset.timestamp = message.timestamp;

    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="message-bubble ${isReaction ? 'reaction-bubble' : ''}">
            <p class="message-text">${escapeHtml(message.text)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;

    container.appendChild(div);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// ========================================
// Reaction Sync (Hugs, Kisses, etc.)
// ========================================

function sendReactionToFirebase(type) {
    if (!isFirebaseEnabled || !db) return;

    // Send the reaction for the animation
    db.ref('reactions').push({
        type: type,
        from: currentUser,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // Also send a chat message so it shows in the chat history
    const reactionMessages = {
        hug: `sent a big warm hug! 🤗`,
        kiss: `sent kisses! 😘`,
        miss: `is missing you! 🥺`,
        goodnight: `says goodnight! 🌙`
    };

    const messageText = `${capitalize(currentUser)} ${reactionMessages[type]}`;

    db.ref('messages').push({
        text: messageText,
        from: currentUser,
        isReaction: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

function showReceivedReaction(type, from) {
    const fromName = capitalize(from);

    switch (type) {
        case 'hug':
            document.querySelector('.hug-message').textContent = `${fromName} sent you a big warm hug!`;
            document.getElementById('hugOverlay').classList.add('active');
            setTimeout(() => {
                document.getElementById('hugOverlay').classList.remove('active');
            }, 3000);
            break;

        case 'kiss':
            document.querySelector('.kiss-message').textContent = `${fromName} blows you kisses! 😘`;
            const overlay = document.getElementById('kissOverlay');
            const container = document.getElementById('flyingKisses');
            overlay.classList.add('active');
            container.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const kiss = document.createElement('span');
                    kiss.className = 'flying-kiss';
                    kiss.textContent = '💋';
                    kiss.style.left = '50%';
                    kiss.style.top = '50%';
                    kiss.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
                    kiss.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
                    container.appendChild(kiss);
                }, i * 100);
            }
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 3500);
            break;

        case 'miss':
            document.querySelector('.miss-message').textContent = `${fromName} is missing you so much right now...`;
            document.getElementById('missOverlay').classList.add('active');
            setTimeout(() => {
                document.getElementById('missOverlay').classList.remove('active');
            }, 4000);
            break;

        case 'goodnight':
            document.querySelector('.goodnight-message').textContent = `Goodnight from ${fromName}!`;
            const gnOverlay = document.getElementById('goodnightOverlay');
            const starsContainer = document.getElementById('starsContainer');
            gnOverlay.classList.add('active');
            starsContainer.innerHTML = '';
            for (let i = 0; i < 30; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = '✦';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.fontSize = (Math.random() * 15 + 10) + 'px';
                star.style.animationDelay = Math.random() * 2 + 's';
                starsContainer.appendChild(star);
            }
            setTimeout(() => {
                gnOverlay.classList.remove('active');
            }, 5000);
            break;
    }

    // Also show notification if supported
    if (Notification.permission === 'granted') {
        new Notification(`${fromName} sent you a ${type}!`, {
            body: type === 'hug' ? '🤗' : type === 'kiss' ? '😘' : type === 'miss' ? '🥺' : '🌙',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💕</text></svg>'
        });
    }
}

// ========================================
// Meeting Link Sync
// ========================================

function shareMeetingLink(link) {
    if (!isFirebaseEnabled || !db) return;

    db.ref('meeting').set({
        link: link,
        startedBy: currentUser,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

function clearMeeting() {
    if (!isFirebaseEnabled || !db) return;
    db.ref('meeting').remove();
}

function updateMeetingDisplay(meeting) {
    const container = document.getElementById('activeMeeting');
    const linkEl = document.getElementById('meetingLink');
    const labelEl = container.querySelector('.meeting-label');

    if (meeting && meeting.link) {
        container.style.display = 'block';
        linkEl.href = meeting.link;
        linkEl.textContent = 'Click to join';

        // Store for join button
        container.dataset.link = meeting.link;

        // Show who started the meeting
        if (meeting.startedBy && meeting.startedBy !== currentUser) {
            const starterName = capitalize(meeting.startedBy);
            labelEl.textContent = `${starterName} started a video call!`;

            // Show notification if supported
            if (Notification.permission === 'granted') {
                new Notification(`${starterName} started a video call!`, {
                    body: 'Click to join the call',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📹</text></svg>'
                });
            }
        } else {
            labelEl.textContent = 'Active meeting:';
        }
    } else {
        container.style.display = 'none';
    }
}

function joinMeeting() {
    const container = document.getElementById('activeMeeting');
    const link = container.dataset.link;
    if (link) {
        window.open(link, '_blank');
    }
}

function endMeeting() {
    clearMeeting();
}

// ========================================
// Dates Sync
// ========================================

function setupDatesListener() {
    if (!db) return;

    // Listen for dates changes
    db.ref('dates').on('value', (snap) => {
        const firebaseDates = snap.val() || {};

        // Convert to array and merge with preloaded dates
        let dates = Object.keys(firebaseDates).map(key => ({
            ...firebaseDates[key],
            firebaseKey: key
        }));

        // Add preloaded dates if not already in Firebase
        CONFIG.preloadedDates.forEach(preDate => {
            if (!dates.find(d => d.id === preDate.id)) {
                dates.push({ ...preDate, preloaded: true });
            }
        });

        // Sort by date
        dates.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        // Update local storage for offline access
        localStorage.setItem('dates', JSON.stringify(dates));

        // Refresh the dates display if the function exists
        if (typeof window.renderDatesFromFirebase === 'function') {
            window.renderDatesFromFirebase(dates);
        }
    });
}

function addDateToFirebase(dateData) {
    if (!isFirebaseEnabled || !db) {
        // Offline mode - save locally
        return null;
    }

    // Push to Firebase
    const newRef = db.ref('dates').push(dateData);
    return newRef.key;
}

function deleteDateFromFirebase(dateId, firebaseKey) {
    if (!isFirebaseEnabled || !db) return;

    if (firebaseKey) {
        db.ref('dates/' + firebaseKey).remove();
    } else {
        // Find by id
        db.ref('dates').orderByChild('id').equalTo(dateId).once('value', (snap) => {
            snap.forEach((child) => {
                child.ref.remove();
            });
        });
    }
}

// ========================================
// User Selection Modal
// ========================================

function showUserSelection(force = false) {
    // If user is already set and not forcing, don't show
    if (localStorage.getItem('currentUser') && !force) {
        return;
    }

    // Remove existing modal if any
    const existingModal = document.getElementById('userSelectModal');
    if (existingModal) existingModal.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'userSelectModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">Who are you?</h2>
            <p style="text-align: center; color: #636e72; margin-bottom: 20px;">
                This helps us know who's sending messages!
            </p>
            <div style="display: flex; gap: 15px;">
                <button class="submit-btn" onclick="selectUser('ansh')" style="flex: 1;">
                    I'm Ansh
                </button>
                <button class="submit-btn" onclick="selectUser('vardhini')" style="flex: 1;">
                    I'm Vardhini
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Switch user function (called from footer button)
function switchUser() {
    showUserSelection(true);
}

function selectUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', user);

    // Remove modal
    const modal = document.getElementById('userSelectModal');
    if (modal) modal.remove();

    // Reinitialize presence
    if (isFirebaseEnabled) {
        setupPresence();
    }
}

// ========================================
// Utility Functions
// ========================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Initialize on page load
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Firebase will be initialized after password check in app.js
});

// Export for use in app.js
window.FirebaseSync = {
    init: initFirebase,
    sendReaction: sendReactionToFirebase,
    shareMeeting: shareMeetingLink,
    clearMeeting: clearMeeting,
    showUserSelection: showUserSelection,
    isEnabled: () => isFirebaseEnabled,
    addDate: addDateToFirebase,
    deleteDate: deleteDateFromFirebase
};
