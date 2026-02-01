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
    // Secure password verification via Cloudflare Worker
    // The actual password is stored as a secret, not in code
    authWorkerUrl: "https://love-app-auth.vardhiniansh.workers.dev",

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
        apiKey: "AIzaSyCQtvXC85fo-G49_Lr32-c2t1Zro_vUBDc",
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
    // AI-Powered Date Ideas (Optional)
    // ========================================
    aiWorkerUrl: "https://love-app-date-ideas.vardhiniansh.workers.dev"

    // ========================================
    // Love notes, secret messages, daily quotes,
    // and date ideas are stored in Firebase
    // (not in public source code)
    // ========================================
};
