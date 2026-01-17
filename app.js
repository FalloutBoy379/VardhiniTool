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

    // Initialize all components
    updateDaysTogether();
    updateReunionCountdown();
    updateTimezones();
    loadDates();
    loadLoveNotes();
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

    if (dates.length === 0) {
        container.innerHTML = '<div class="no-dates">No upcoming dates yet. Add one! 💕</div>';
        return;
    }

    container.innerHTML = dates.slice(0, 5).map(date => {
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

    let dates = JSON.parse(localStorage.getItem('dates')) || [];
    dates.push(newDate);
    localStorage.setItem('dates', JSON.stringify(dates));

    closeDateModal();
    loadDates();

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
    dates = dates.filter(d => d.id !== currentDateId);
    localStorage.setItem('dates', JSON.stringify(dates));

    closeDateDetailModal();
    loadDates();
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
    }
});
