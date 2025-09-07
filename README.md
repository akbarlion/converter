# ION's Space - YouTube to MP3 Converter 🚀

A space-themed web-based YouTube to MP3 converter with **real conversion functionality** built with Node.js backend and vanilla frontend.

## Features

- 🌌 Space-themed UI with starfield animation
- 🎯 YouTube URL validation
- ⚡ **Real YouTube to MP3 conversion**
- 📥 **Actual MP3 download functionality**
- 📱 Mobile-friendly responsive design
- 🎨 Neon glow effects and cosmic gradients
- 🔄 Hybrid mode (works with/without backend)

## Quick Start

### Local Development
```bash
npm install
npm start
```
Open http://localhost:3000

### Frontend Only (Demo Mode)
Just open `index.html` in browser - falls back to demo mode if backend unavailable.

## Deployment Options

### Option 1: Full Stack (Recommended)
1. Deploy backend to **Vercel**:
   - Connect GitHub repo to Vercel
   - Auto-deploys on push
   - Update `API_BASE` in script.js with your Vercel URL

2. Deploy frontend to **GitHub Pages**:
   - Enable GitHub Pages in repo settings
   - Frontend will connect to Vercel backend

### Option 2: Demo Mode Only
- Deploy only frontend to GitHub Pages
- Works in demo mode (mock downloads)

## Technologies Used

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Font Awesome icons

**Backend:**
- Node.js + Express
- ytdl-core (YouTube downloader)
- CORS enabled

## Configuration

Update `API_BASE` in `script.js`:
```javascript
const API_BASE = 'https://converter-nine-pi.vercel.app/';
```

## Note

Ensure compliance with YouTube's Terms of Service when using this tool.

**ION's Space Theme Features:**
- Dark space background with animated stars
- Neon blue (#00d4ff) and pink (#ff6b9d) color scheme
- Glowing effects and cosmic gradients
- Space-inspired typography and icons