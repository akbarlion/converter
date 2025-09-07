// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : '/api'; // Use relative path for Vercel

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function showVideoInfo(videoId) {
    try {
        const response = await fetch(`${API_BASE}/info?videoId=${videoId}`);
        const videoData = await response.json();
        
        if (response.ok) {
            document.getElementById('thumbnail').src = videoData.thumbnail;
            document.getElementById('videoTitle').textContent = videoData.title;
            document.getElementById('videoDuration').textContent = `Duration: ${videoData.duration}`;
            document.getElementById('videoInfo').classList.remove('hidden');
            return videoData;
        } else {
            throw new Error(videoData.error);
        }
    } catch (error) {
        // Fallback to demo mode
        const mockData = {
            title: 'Sample YouTube Video',
            duration: '4:20',
            thumbnail: 'https://via.placeholder.com/480x360/ff0000/ffffff?text=YouTube'
        };
        
        document.getElementById('thumbnail').src = mockData.thumbnail;
        document.getElementById('videoTitle').textContent = mockData.title;
        document.getElementById('videoDuration').textContent = `Duration: ${mockData.duration}`;
        document.getElementById('videoInfo').classList.remove('hidden');
        return mockData;
    }
}

function updateProgress(percentage, text) {
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = text;
}

function simulateProgress() {
    return new Promise((resolve) => {
        const steps = [
            { progress: 20, text: 'Connecting to server...' },
            { progress: 40, text: 'Fetching video data...' },
            { progress: 60, text: 'Extracting audio stream...' },
            { progress: 80, text: 'Preparing download...' },
            { progress: 100, text: 'Ready to download!' }
        ];
        
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                updateProgress(steps[currentStep].progress, steps[currentStep].text);
                currentStep++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 800);
    });
}

async function startConversion() {
    const url = document.getElementById('youtubeUrl').value.trim();
    
    if (!url) {
        alert('Please enter a YouTube URL!');
        return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        alert('Please enter a valid YouTube URL!');
        return;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('Invalid YouTube URL format!');
        return;
    }
    
    const convertBtn = document.getElementById('convertBtn');
    
    // Disable button and show loading
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Show video info
        const videoData = await showVideoInfo(videoId);
        
        // Show progress section
        document.getElementById('progressSection').classList.remove('hidden');
        
        // Simulate progress
        await simulateProgress();
        
        // Hide progress and show download
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('downloadSection').classList.remove('hidden');
        
        // Setup download button
        setupDownloadButton(videoId, videoData);
        
    } catch (error) {
        alert('Conversion failed. Please try again.');
        console.error('Error:', error);
    } finally {
        // Re-enable convert button
        convertBtn.disabled = false;
        convertBtn.innerHTML = '<i class="fas fa-download"></i> Convert';
    }
}

function setupDownloadButton(videoId, videoData) {
    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.onclick = async () => {
        try {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            
            // Try real download first
            const downloadUrl = `${API_BASE}/download?videoId=${videoId}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${videoData.title.replace(/[^\w\s]/gi, '')}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            // Fallback to demo download
            createMockMP3Download(videoData.title);
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download MP3';
        }
    };
}

function createMockMP3Download(title) {
    // Fallback demo download
    const blob = new Blob(['Demo MP3 content - Server not available'], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w\s]/gi, '')}_demo.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
        alert('Demo mode: Server not available. Deploy backend for real downloads!');
    }, 500);
}

// Reset form when URL input changes
document.getElementById('youtubeUrl').addEventListener('input', () => {
    document.getElementById('videoInfo').classList.add('hidden');
    document.getElementById('progressSection').classList.add('hidden');
    document.getElementById('downloadSection').classList.add('hidden');
});

// Handle Enter key in URL input
document.getElementById('youtubeUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startConversion();
    }
});