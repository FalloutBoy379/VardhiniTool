// ========================================
// Vardhini's Love App - Main Application
// ========================================

// State
let currentDateId = null;

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated
    if (localStorage.getItem('authenticated') === 'true') {
        showMainApp();
    }

    // Start floating hearts
    createFloatingHearts();

    // Handle enter key on password input
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});

// ========================================
// Password Protection
// ========================================

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('errorMsg');

    if (input === CONFIG.password) {
        localStorage.setItem('authenticated', 'true');
        showMainApp();
    } else {
        errorMsg.textContent = 'That\'s not quite right... try again!';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

function showMainApp() {
    document.getElementById('passwordGate').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    // Initialize Firebase for real-time sync
    if (window.FirebaseSync) {
        const firebaseEnabled = FirebaseSync.init();
        if (firebaseEnabled) {
            // Show user selection if not set
            if (!localStorage.getItem('currentUser')) {
                FirebaseSync.showUserSelection();
            }
        }
    }

    // Initialize all components
    updateDaysTogether();
    updateReunionCountdown();
    updateTimezones();
    loadDates();
    loadLoveNotes();
    loadDailyQuote();
    loadMilestones();
    checkNotificationStatus();

    // Set intervals for live updates
    setInterval(updateReunionCountdown, 1000);
    setInterval(updateTimezones, 1000);
    setInterval(updateDaysTogether, 60000); // Update every minute

    // Check for reminders
    setInterval(checkReminders, 60000);
}

// ========================================
// Floating Hearts Animation
// ========================================

function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    const hearts = ['❤', '💕', '💖', '💗', '💓', '💝'];

    function addHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 10 + 15) + 's';
        heart.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(heart);

        // Remove heart after animation
        setTimeout(() => {
            heart.remove();
        }, 25000);
    }

    // Add initial hearts
    for (let i = 0; i < 8; i++) {
        setTimeout(addHeart, i * 1000);
    }

    // Continue adding hearts
    setInterval(addHeart, 3000);
}

// ========================================
// Days Together Counter
// ========================================

function updateDaysTogether() {
    const anniversary = new Date(CONFIG.anniversaryDate);
    const now = new Date();
    const diff = now - anniversary;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days >= 0) {
        document.getElementById('daysTogether').textContent =
            `Together for ${days} beautiful days 💕`;
    } else {
        const daysUntil = Math.abs(days);
        document.getElementById('daysTogether').textContent =
            `${daysUntil} days until our journey begins 💕`;
    }
}

// ========================================
// Reunion Countdown
// ========================================

function updateReunionCountdown() {
    const reunion = new Date(CONFIG.nextReunion);
    const now = new Date();
    const diff = reunion - now;

    if (diff <= 0) {
        document.getElementById('countDays').textContent = '00';
        document.getElementById('countHours').textContent = '00';
        document.getElementById('countMins').textContent = '00';
        document.getElementById('countSecs').textContent = '00';
        document.querySelector('.countdown-label').textContent = "We're together! 🎉";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countDays').textContent = String(days).padStart(2, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('countSecs').textContent = String(secs).padStart(2, '0');

    // Format reunion date nicely
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('reunionDate').textContent = reunion.toLocaleDateString('en-US', options);
}

// ========================================
// Timezone Display
// ========================================

function updateTimezones() {
    const now = new Date();

    // Seattle time (Ansh)
    const seattleTime = now.toLocaleTimeString('en-US', {
        timeZone: CONFIG.timezones.person1,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('seattleTime').textContent = seattleTime;

    // Brooklyn time (Vardhini)
    const brooklynTime = now.toLocaleTimeString('en-US', {
        timeZone: CONFIG.timezones.person2,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('brooklynTime').textContent = brooklynTime;

    // Activity guesses
    const seattleHour = parseInt(now.toLocaleTimeString('en-US', {
        timeZone: CONFIG.timezones.person1,
        hour: 'numeric',
        hour12: false
    }));

    const brooklynHour = parseInt(now.toLocaleTimeString('en-US', {
        timeZone: CONFIG.timezones.person2,
        hour: 'numeric',
        hour12: false
    }));

    document.getElementById('anshActivity').textContent = getActivityGuess(seattleHour);
    document.getElementById('vardhiniActivity').textContent = getActivityGuess(brooklynHour);
}

function getActivityGuess(hour) {
    if (hour >= 0 && hour < 7) return 'probably sleeping 😴';
    if (hour >= 7 && hour < 9) return 'getting ready 🌅';
    if (hour >= 9 && hour < 12) return 'morning vibes ☀️';
    if (hour >= 12 && hour < 14) return 'lunch time 🍽️';
    if (hour >= 14 && hour < 18) return 'afternoon hustle 💼';
    if (hour >= 18 && hour < 20) return 'evening time 🌆';
    if (hour >= 20 && hour < 23) return 'relaxing 🛋️';
    return 'winding down 🌙';
}

// ========================================
// Dates Management
// ========================================

function loadDates() {
    // Get dates from localStorage or use preloaded
    let dates = JSON.parse(localStorage.getItem('dates')) || [];

    // Merge with preloaded dates (avoiding duplicates)
    const preloadedIds = dates.filter(d => d.preloaded).map(d => d.id);
    CONFIG.preloadedDates.forEach(preDate => {
        if (!preloadedIds.includes(preDate.id)) {
            dates.push({ ...preDate, preloaded: true });
        }
    });

    // Sort by date
    dates.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // Filter out past dates (optional - keep past dates for memories)
    const now = new Date();
    const upcomingDates = dates.filter(d => new Date(d.dateTime) > now);

    // Save back to localStorage
    localStorage.setItem('dates', JSON.stringify(dates));

    renderDates(upcomingDates.length > 0 ? upcomingDates : dates.slice(0, 5));
}

function renderDates(dates) {
    const container = document.getElementById('datesList');

    // Filter to upcoming dates
    const now = new Date();
    const upcomingDates = dates.filter(d => new Date(d.dateTime) > now);
    const displayDates = upcomingDates.length > 0 ? upcomingDates : dates.slice(0, 5);

    if (displayDates.length === 0) {
        container.innerHTML = '<div class="no-dates">No upcoming dates yet. Add one! 💕</div>';
        return;
    }

    container.innerHTML = displayDates.slice(0, 5).map(date => {
        const dateObj = new Date(date.dateTime);
        const icon = getDateIcon(date.type);
        const formattedDate = formatDateDisplay(dateObj);

        return `
            <div class="date-card" onclick="openDateDetail('${date.id}')">
                <div class="date-icon ${date.type}">${icon}</div>
                <div class="date-info">
                    <div class="date-title">${date.title}</div>
                    <div class="date-time">${formattedDate}</div>
                </div>
                <span class="date-arrow">›</span>
            </div>
        `;
    }).join('');
}

// Called by Firebase when dates change
window.renderDatesFromFirebase = function(dates) {
    renderDates(dates);
};

function getDateIcon(type) {
    switch(type) {
        case 'virtual': return '💻';
        case 'visit': return '✈️';
        case 'anniversary': return '💝';
        default: return '📅';
    }
}

function formatDateDisplay(date) {
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function openDateModal() {
    document.getElementById('dateModal').classList.add('active');
    document.getElementById('dateForm').reset();

    // Set default datetime to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    document.getElementById('dateDateTime').value = tomorrow.toISOString().slice(0, 16);
}

function closeDateModal() {
    document.getElementById('dateModal').classList.remove('active');
}

function addDate(event) {
    event.preventDefault();

    const title = document.getElementById('dateTitle').value;
    const dateTime = document.getElementById('dateDateTime').value;
    const type = document.getElementById('dateType').value;
    const reminder = document.getElementById('dateReminder').checked;

    const newDate = {
        id: 'date_' + Date.now(),
        title,
        dateTime,
        type,
        reminder,
        preloaded: false
    };

    // Save to Firebase if enabled
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.addDate(newDate);
    } else {
        // Offline mode - save locally
        let dates = JSON.parse(localStorage.getItem('dates')) || [];
        dates.push(newDate);
        localStorage.setItem('dates', JSON.stringify(dates));
        loadDates();
    }

    closeDateModal();

    // Schedule notification if enabled
    if (reminder && Notification.permission === 'granted') {
        scheduleReminder(newDate);
    }
}

function openDateDetail(dateId) {
    currentDateId = dateId;
    const dates = JSON.parse(localStorage.getItem('dates')) || [];
    const date = dates.find(d => d.id === dateId);

    if (!date) return;

    const dateObj = new Date(date.dateTime);

    document.getElementById('detailTitle').textContent = date.title;
    document.getElementById('detailTime').textContent = formatDateDisplay(dateObj);

    // Show both timezones
    const seattleTime = dateObj.toLocaleString('en-US', {
        timeZone: CONFIG.timezones.person1,
        dateStyle: 'short',
        timeStyle: 'short'
    });
    const brooklynTime = dateObj.toLocaleString('en-US', {
        timeZone: CONFIG.timezones.person2,
        dateStyle: 'short',
        timeStyle: 'short'
    });

    document.getElementById('detailTimezone').innerHTML =
        `🌲 Seattle: ${seattleTime}<br>🗽 Brooklyn: ${brooklynTime}`;

    document.getElementById('dateDetailModal').classList.add('active');
}

function closeDateDetailModal() {
    document.getElementById('dateDetailModal').classList.remove('active');
    currentDateId = null;
}

function deleteDate() {
    if (!currentDateId) return;

    let dates = JSON.parse(localStorage.getItem('dates')) || [];
    const dateToDelete = dates.find(d => d.id === currentDateId);

    // Delete from Firebase if enabled
    if (window.FirebaseSync && FirebaseSync.isEnabled() && dateToDelete) {
        FirebaseSync.deleteDate(currentDateId, dateToDelete.firebaseKey);
    } else {
        // Offline mode - delete locally
        dates = dates.filter(d => d.id !== currentDateId);
        localStorage.setItem('dates', JSON.stringify(dates));
        loadDates();
    }

    closeDateDetailModal();
}

function downloadICS() {
    if (!currentDateId) return;

    const dates = JSON.parse(localStorage.getItem('dates')) || [];
    const date = dates.find(d => d.id === currentDateId);

    if (!date) return;

    const dateObj = new Date(date.dateTime);
    const endDate = new Date(dateObj.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatICSDate = (d) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ansh & Vardhini//Love App//EN
BEGIN:VEVENT
UID:${date.id}@loveapp
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(dateObj)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${date.title} 💕
DESCRIPTION:A special date for Ansh & Vardhini
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${date.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// Love Notes
// ========================================

function loadLoveNotes() {
    const container = document.getElementById('notesCarousel');

    container.innerHTML = CONFIG.loveNotes.map(note => `
        <div class="note-card">
            <p class="note-text">${note.text}</p>
            <p class="note-from">— ${note.from}</p>
        </div>
    `).join('');
}

// ========================================
// Virtual Date Ideas
// ========================================

function spinDateIdea() {
    const ideaElement = document.getElementById('dateIdea');
    const ideas = CONFIG.dateIdeas;

    // Animation effect
    ideaElement.style.opacity = '0';

    setTimeout(() => {
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        ideaElement.textContent = randomIdea;
        ideaElement.style.opacity = '1';
    }, 300);
}

// ========================================
// Notifications
// ========================================

function checkNotificationStatus() {
    const btn = document.getElementById('notifyBtn');

    if (!('Notification' in window)) {
        btn.textContent = 'Notifications not supported';
        btn.disabled = true;
        return;
    }

    if (Notification.permission === 'granted') {
        btn.textContent = 'Reminders Enabled ✓';
        btn.classList.add('enabled');
    }
}

function requestNotifications() {
    if (!('Notification' in window)) {
        alert('Your browser doesn\'t support notifications');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            const btn = document.getElementById('notifyBtn');
            btn.textContent = 'Reminders Enabled ✓';
            btn.classList.add('enabled');

            // Test notification
            new Notification('Reminders Enabled! 💕', {
                body: 'You\'ll get reminders for your dates with Ansh!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💕</text></svg>'
            });

            // Schedule reminders for existing dates
            const dates = JSON.parse(localStorage.getItem('dates')) || [];
            dates.filter(d => d.reminder).forEach(scheduleReminder);
        }
    });
}

function scheduleReminder(date) {
    const dateTime = new Date(date.dateTime);
    const reminderTime = new Date(dateTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const now = new Date();

    if (reminderTime > now) {
        const delay = reminderTime - now;

        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification(`Coming up: ${date.title} 💕`, {
                    body: `In 1 hour! Get ready for your date with Ansh!`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💕</text></svg>'
                });
            }
        }, delay);
    }
}

function checkReminders() {
    const dates = JSON.parse(localStorage.getItem('dates')) || [];
    const now = new Date();

    dates.forEach(date => {
        if (!date.reminder) return;

        const dateTime = new Date(date.dateTime);
        const diff = dateTime - now;

        // Check if date is in the next 5 minutes
        if (diff > 0 && diff <= 5 * 60 * 1000) {
            if (Notification.permission === 'granted') {
                new Notification(`Starting soon: ${date.title} 💕`, {
                    body: `Your date is about to start!`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💕</text></svg>'
                });
            }
        }
    });
}

// ========================================
// Utility Functions
// ========================================

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Handle escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        // Also close overlays
        closeAllOverlays();
    }
});

// ========================================
// Quick Action Buttons (Hug, Kiss, etc.)
// ========================================

function sendHug() {
    // Send to Firebase so partner sees it
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.sendReaction('hug');
    }

    // Show local animation with "sent" message
    const overlay = document.getElementById('hugOverlay');
    document.querySelector('.hug-message').textContent = 'Sending a big warm hug! 🤗';
    overlay.classList.add('active');

    setTimeout(() => {
        overlay.classList.remove('active');
    }, 3000);
}

function sendKiss() {
    // Send to Firebase so partner sees it
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.sendReaction('kiss');
    }

    const overlay = document.getElementById('kissOverlay');
    const container = document.getElementById('flyingKisses');

    // Show "sent" message
    document.querySelector('.kiss-message').textContent = 'Blowing kisses! 😘';
    overlay.classList.add('active');
    container.innerHTML = '';

    // Create flying kisses
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const kiss = document.createElement('span');
            kiss.className = 'flying-kiss';
            kiss.textContent = '💋';
            kiss.style.left = '50%';
            kiss.style.top = '50%';
            kiss.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
            kiss.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
            kiss.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(kiss);
        }, i * 100);
    }

    setTimeout(() => {
        overlay.classList.remove('active');
    }, 3500);
}

function sendMissYou() {
    // Send to Firebase so partner sees it
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.sendReaction('miss');
    }

    const overlay = document.getElementById('missOverlay');
    // Show "sent" message
    document.querySelector('.miss-message').textContent = 'Letting them know you miss them... 🥺';
    document.querySelector('.miss-submessage').textContent = 'Your love is on the way!';
    overlay.classList.add('active');

    setTimeout(() => {
        overlay.classList.remove('active');
    }, 4000);
}

function sendGoodnight() {
    // Send to Firebase so partner sees it
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.sendReaction('goodnight');
    }

    const overlay = document.getElementById('goodnightOverlay');
    const container = document.getElementById('starsContainer');

    // Show "sent" message
    document.querySelector('.goodnight-message').textContent = 'Sending sweet dreams! 🌙';
    document.querySelector('.goodnight-submessage').textContent = 'May they dream of you tonight... 💫';
    overlay.classList.add('active');
    container.innerHTML = '';

    // Create twinkling stars
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '✦';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.fontSize = (Math.random() * 15 + 10) + 'px';
        star.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(star);
    }

    setTimeout(() => {
        overlay.classList.remove('active');
    }, 5000);
}

function closeAllOverlays() {
    document.querySelectorAll('.hug-overlay, .kiss-overlay, .miss-overlay, .goodnight-overlay').forEach(overlay => {
        overlay.classList.remove('active');
    });
}

// Click anywhere to close overlays
document.querySelectorAll('.hug-overlay, .kiss-overlay, .miss-overlay, .goodnight-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
    });
});

// ========================================
// Daily Love Quote
// ========================================

function loadDailyQuote() {
    const quotes = CONFIG.dailyQuotes || [
        "Distance means so little when someone means so much.",
        "I carry your heart with me (I carry it in my heart).",
        "The best thing to hold onto in life is each other.",
        "You're my favorite hello and my hardest goodbye.",
        "I love you not only for what you are, but for what I am when I am with you.",
        "Together is my favorite place to be.",
        "Every love story is beautiful, but ours is my favorite.",
        "In a sea of people, my eyes will always search for you.",
        "You are my today and all of my tomorrows.",
        "I want all of you, forever, you and me, every day."
    ];

    // Use date to pick a consistent quote for the day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;

    document.getElementById('dailyQuote').textContent = quotes[quoteIndex];
}

// ========================================
// Milestones
// ========================================

function loadMilestones() {
    const container = document.getElementById('milestonesGrid');
    const anniversary = new Date(CONFIG.anniversaryDate);
    const now = new Date();
    const daysTogether = Math.floor((now - anniversary) / (1000 * 60 * 60 * 24));

    const milestones = [
        { icon: '💕', title: 'First Day', days: 1, achieved: daysTogether >= 1 },
        { icon: '🌟', title: '1 Week', days: 7, achieved: daysTogether >= 7 },
        { icon: '🎉', title: '1 Month', days: 30, achieved: daysTogether >= 30 },
        { icon: '💯', title: '100 Days', days: 100, achieved: daysTogether >= 100 },
        { icon: '💝', title: '6 Months', days: 182, achieved: daysTogether >= 182 },
        { icon: '🏆', title: '1 Year', days: 365, achieved: daysTogether >= 365 },
    ];

    container.innerHTML = milestones.map(m => `
        <div class="milestone-card ${m.achieved ? 'achieved' : ''}">
            <div class="milestone-icon">${m.icon}</div>
            <div class="milestone-title">${m.title}</div>
            <div class="milestone-status ${m.achieved ? 'achieved' : ''}">
                ${m.achieved ? '✓ Achieved!' : `${m.days - daysTogether} days to go`}
            </div>
        </div>
    `).join('');
}

// ========================================
// Secret Message
// ========================================

function revealSecret() {
    const envelope = document.getElementById('secretEnvelope');
    const message = document.getElementById('secretMessage');
    const textEl = document.getElementById('secretText');

    if (envelope.style.display !== 'none') {
        const secrets = CONFIG.secretMessages || [
            "I think about you every single day. You make my world brighter just by being in it. 💖",
            "If I could give you one thing, it would be the ability to see yourself through my eyes. Then you'd know how special you are to me.",
            "You're not just my girlfriend, you're my best friend, my comfort, and my home. I love you more than words can say.",
            "Every moment with you, even the virtual ones, is a moment I treasure. You're worth every mile between us.",
            "I can't wait to hold you in my arms. Until then, know that my heart is always with you."
        ];

        const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];
        textEl.textContent = randomSecret;

        envelope.style.display = 'none';
        message.style.display = 'block';
    }
}

function closeSecret() {
    const envelope = document.getElementById('secretEnvelope');
    const message = document.getElementById('secretMessage');

    message.style.display = 'none';
    envelope.style.display = 'block';
}

// ========================================
// Video Call
// ========================================

function startVideoCall() {
    // Generate a unique room name using your names + timestamp
    const roomName = `AnshVardhini-${Date.now().toString(36)}`;
    const meetLink = `https://meet.jit.si/${roomName}`;

    // Share the meeting link via Firebase automatically
    if (window.FirebaseSync && FirebaseSync.isEnabled()) {
        FirebaseSync.shareMeeting(meetLink);
    }

    // Show it locally
    const container = document.getElementById('activeMeeting');
    const linkEl = document.getElementById('meetingLink');
    container.style.display = 'block';
    linkEl.href = meetLink;
    linkEl.textContent = 'Click to join';
    container.dataset.link = meetLink;

    // Open the meeting in a new tab
    window.open(meetLink, '_blank');
}

// Optional: Keep Google Meet option available
function startGoogleMeet() {
    window.open('https://meet.google.com/new', '_blank');
    document.getElementById('videoLinkModal').classList.add('active');
}

function closeVideoLinkModal() {
    document.getElementById('videoLinkModal').classList.remove('active');
}

function submitVideoLink(event) {
    event.preventDefault();

    const link = document.getElementById('meetingLinkInput').value.trim();

    if (link && (link.includes('meet.google.com') || link.includes('zoom.us') || link.includes('teams.microsoft'))) {
        // Share the meeting link via Firebase
        if (window.FirebaseSync && FirebaseSync.isEnabled()) {
            FirebaseSync.shareMeeting(link);
        }

        // Show it locally
        const container = document.getElementById('activeMeeting');
        const linkEl = document.getElementById('meetingLink');
        container.style.display = 'block';
        linkEl.href = link;
        linkEl.textContent = 'Click to join';
        container.dataset.link = link;

        closeVideoLinkModal();
        document.getElementById('meetingLinkInput').value = '';
    }
}
