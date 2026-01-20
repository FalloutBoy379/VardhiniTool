// ========================================
// Configuration - Ansh & Vardhini's Love App
// ========================================
//
// Edit this file to:
// - Update the reunion date
// - Add new pre-loaded dates
// - Add new love notes
// - Change the password
//
// After editing, push to GitHub and Vardhini
// will see the changes on her next visit!
// ========================================

const CONFIG = {
    // Password to enter the app
    password: "visacutie",

    // Your relationship anniversary (YYYY-MM-DD)
    anniversaryDate: "2025-08-28",

    // Next time you'll be together (YYYY-MM-DDTHH:MM in Seattle time)
    nextReunion: "2026-02-07T11:07",

    // Your names
    coupleNames: {
        person1: "Ansh",
        person2: "Vardhini"
    },

    // Timezones (don't change unless you move!)
    timezones: {
        person1: "America/Los_Angeles",  // Seattle
        person2: "America/New_York"       // Brooklyn
    },

    // ========================================
    // Firebase Configuration (Optional)
    // ========================================
    // To enable real-time chat and sync features:
    // 1. Go to https://console.firebase.google.com/
    // 2. Create a new project (or use existing)
    // 3. Add a Web App to get your config
    // 4. Enable Realtime Database (in test mode)
    // 5. Replace the values below with your config
    //
    // Without Firebase, the app works in offline mode
    // (chat and sync features will be disabled)
    // ========================================
    firebase: {
        authDomain: "ihaveacrushonyou.firebaseapp.com",
        databaseURL: "https://ihaveacrushonyou-default-rtdb.firebaseio.com",
        projectId: "ihaveacrushonyou",
        storageBucket: "ihaveacrushonyou.firebasestorage.app",
        messagingSenderId: "221197074901",
        appId: "1:221197074901:web:42894844f18958e9f3fd5c"
    },

    // ========================================
    // Pre-loaded Dates
    // ========================================
    // These show up automatically for Vardhini
    // Add more as you plan them!
    //
    // Format:
    // {
    //     id: "unique_id",
    //     title: "Date name",
    //     dateTime: "YYYY-MM-DDTHH:MM",  (24-hour format, her timezone)
    //     type: "virtual" | "visit" | "anniversary",
    //     reminder: true/false
    // }
    // ========================================
    preloadedDates: [
        {
            id: "reunion_feb_2026",
            title: "Vardhini lands in Seattle! ✈️",
            dateTime: "2026-02-07T11:07",
            type: "visit",
            reminder: true
        },
        {
            id: "anniversary_2026",
            title: "Our 1 Year Anniversary! 🎉",
            dateTime: "2026-08-28T00:00",
            type: "anniversary",
            reminder: true
        }
    ],

    // ========================================
    // Love Notes
    // ========================================
    // Add sweet messages here! Vardhini will
    // see them in the Love Notes section.
    // ========================================
    loveNotes: [
        {
            text: "Every mile between us is just another reason to love you harder. Seattle to Brooklyn isn't that far when you're in my heart. 💕",
            from: "Ansh"
        },
        {
            text: "I fall in love with you a little more every time I hear your voice on our calls. You make the distance feel like nothing.",
            from: "Ansh"
        },
        {
            text: "They say absence makes the heart grow fonder. I didn't know my heart could hold this much love until I met you.",
            from: "Ansh"
        },
        {
            text: "Counting down the days until I can hold you again. Every second apart is worth it because I get to spend them loving you.",
            from: "Ansh"
        },
        {
            text: "You're my favorite notification, my best good morning text, and the last person I think about before I sleep. I love you, Vardhini. 💝",
            from: "Ansh"
        }
    ],

    // ========================================
    // AI-Powered Date Ideas (Optional)
    // ========================================
    // After deploying your Cloudflare Worker, paste the URL here
    // to enable AI-generated date ideas using Gemini.
    // Leave as null to use the static list below.
    // ========================================
    aiWorkerUrl: "https://love-app-date-ideas.vardhiniansh.workers.dev",

    // ========================================
    // Virtual Date Ideas (Fallback)
    // ========================================
    // Used when AI is unavailable or not configured.
    // Add more ideas as you think of them.
    // ========================================
    dateIdeas: [
        "🎬 Watch a movie together on Netflix Party",
        "🍳 Cook the same recipe while video calling",
        "🎮 Play an online game together (Jackbox, Among Us)",
        "🎨 Do a virtual paint night together",
        "📚 Start a book club - read the same book and discuss",
        "🌟 Stargaze together via video call",
        "🎵 Create a shared Spotify playlist",
        "🏠 Give each other a virtual tour of your day",
        "🎤 Have a karaoke night on video call",
        "🧩 Do an online escape room together",
        "☕ Have a coffee/tea date while video calling",
        "📝 Write each other letters and read them together",
        "🎲 Play 20 questions or truth or dare",
        "🖼️ Visit a virtual museum together",
        "🌅 Watch the sunrise/sunset together (at your own times)",
        "🎁 Plan a surprise care package for each other",
        "💭 Share your dreams and goals for the future",
        "📸 Look through old photos and share memories",
        "🍕 Order food delivery and eat 'together'",
        "💆 Do a self-care spa night together on video"
    ]
};
