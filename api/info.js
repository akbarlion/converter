const ytdl = require('ytdl-core');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { videoId } = req.query;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID required' });
        }
        
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
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}