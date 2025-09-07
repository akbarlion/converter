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
        
        // Get video info first
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        // Set headers for MP3 download
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', info.videoDetails.lengthSeconds * 1000); // Rough estimate
        
        // Stream audio directly
        const audioStream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            format: 'mp4'
        });
        
        audioStream.pipe(res);
        
        audioStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream failed' });
            }
        });
        
    } catch (error) {
        console.error('Conversion error:', error);
        if (!res.headersSent) {
            res.status(400).json({ error: 'Failed to convert video' });
        }
    }
}