const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get video info
app.get('/api/info/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        const info = await ytdl.getInfo(videoUrl);
        const videoDetails = info.videoDetails;
        
        res.json({
            title: videoDetails.title,
            duration: formatDuration(videoDetails.lengthSeconds),
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
            author: videoDetails.author.name
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to get video info' });
    }
});

// Download MP3
app.get('/api/download/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        
        ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
        }).pipe(res);
        
    } catch (error) {
        res.status(400).json({ error: 'Failed to download video' });
    }
});

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 ION's Space Converter running on port ${PORT}`);
    });
}

module.exports = app;