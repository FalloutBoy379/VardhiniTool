# AI Date Ideas - Cloudflare Worker Setup

This worker uses Google's Gemini API to generate creative date ideas.

## Setup Steps

### 1. Get a Gemini API Key (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key - you'll need it in step 4

### 2. Install Wrangler (Cloudflare CLI)
```bash
npm install -g wrangler
```

### 3. Login to Cloudflare
```bash
npx wrangler login
```
This opens a browser - click "Allow" to authorize.

### 4. Deploy the Worker
From the `worker` folder:
```bash
cd worker
npx wrangler deploy
```

### 5. Add Your Gemini API Key as a Secret
```bash
npx wrangler secret put GEMINI_API_KEY
```
Paste your Gemini API key when prompted.

### 6. Copy Your Worker URL
After deploying, you'll see a URL like:
```
https://love-app-date-ideas.YOUR-SUBDOMAIN.workers.dev
```

### 7. Update config.js
In your main app's `config.js`, add the URL:
```javascript
aiWorkerUrl: "https://love-app-date-ideas.YOUR-SUBDOMAIN.workers.dev",
```

### 8. Test It!
Open your app and click "Spin for an Idea" - it should now generate AI ideas!

## Costs
- Cloudflare Workers: **Free** (100,000 requests/day)
- Gemini API: **Free** (15 requests/minute, 1500/day on free tier)

## Troubleshooting

**"AI unavailable" in console:**
- Check that your worker URL is correct in config.js
- Make sure the GEMINI_API_KEY secret is set

**Worker deployment fails:**
- Make sure you're logged in: `npx wrangler login`
- Check your wrangler.toml is correct
