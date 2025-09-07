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
        
        // For now, return a redirect to a working converter
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const converterUrl = `https://ytmp3.cc/api/download/?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
        
        // Redirect to converter service
        res.redirect(302, converterUrl);
        
    } catch (error) {
        console.error('Conversion error:', error);
        if (!res.headersSent) {
            res.status(400).json({ error: 'Failed to convert video' });
        }
    }
}