// Mock video data for demo
const mockVideos = {
    'dQw4w9WgXcQ': {
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        duration: '3:33',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    'default': {
        title: 'Sample YouTube Video',
        duration: '4:20',
        thumbnail: 'https://via.placeholder.com/480x360/ff0000/ffffff?text=YouTube'
    }
};

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function showVideoInfo(videoId) {
    try {
        // Try to get real video info from YouTube oEmbed API
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        
        if (response.ok) {
            const data = await response.json();
            const videoData = {
                title: data.title,
                duration: 'Loading...', // oEmbed doesn't provide duration
                thumbnail: data.thumbnail_url
            };
            
            document.getElementById('thumbnail').src = videoData.thumbnail;
            document.getElementById('videoTitle').textContent = videoData.title;
            document.getElementById('videoDuration').textContent = `Duration: ${videoData.duration}`;
            document.getElementById('videoInfo').classList.remove('hidden');
            return videoData;
        }
    } catch (error) {
        console.log('oEmbed failed, using fallback');
    }
    
    // Fallback to mock data with real thumbnail
    const videoData = {
        title: mockVideos[videoId]?.title || 'YouTube Video',
        duration: mockVideos[videoId]?.duration || '4:20',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
    
    document.getElementById('thumbnail').src = videoData.thumbnail;
    document.getElementById('videoTitle').textContent = videoData.title;
    document.getElementById('videoDuration').textContent = `Duration: ${videoData.duration}`;
    document.getElementById('videoInfo').classList.remove('hidden');
    return videoData;
}

function updateProgress(percentage, text) {
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = text;
}

function simulateConversion() {
    return new Promise((resolve) => {
        const steps = [
            { progress: 20, text: 'Fetching video information...' },
            { progress: 40, text: 'Extracting audio stream...' },
            { progress: 60, text: 'Converting to MP3...' },
            { progress: 80, text: 'Optimizing audio quality...' },
            { progress: 100, text: 'Conversion complete!' }
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
        }, 1000);
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
        
        // Simulate conversion process
        await simulateConversion();
        
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
    
    downloadBtn.onclick = () => {
        // Create a mock MP3 file download
        const fileName = videoData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3';
        
        // For demo purposes, we'll create a small audio file
        createMockMP3Download(fileName);
    };
}

function createMockMP3Download(fileName) {
    // Create a proper MP3 file with audio content
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = 44100;
    const duration = 5; // 5 seconds
    const numSamples = sampleRate * duration;
    
    // Create stereo buffer
    const buffer = audioContext.createBuffer(2, numSamples, sampleRate);
    
    // Generate a simple melody
    for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < numSamples; i++) {
            const time = i / sampleRate;
            // Create a simple melody with multiple frequencies
            const freq1 = 440; // A note
            const freq2 = 554.37; // C# note
            const freq3 = 659.25; // E note
            
            channelData[i] = 
                Math.sin(2 * Math.PI * freq1 * time) * 0.1 +
                Math.sin(2 * Math.PI * freq2 * time) * 0.1 +
                Math.sin(2 * Math.PI * freq3 * time) * 0.1;
        }
    }
    
    // Convert to WAV format (playable audio)
    const wavBuffer = audioBufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.mp3', '.wav'); // Use WAV extension
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    setTimeout(() => {
        alert('Demo audio file downloaded! This is a 5-second sample melody.');
    }, 500);
}

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer) {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return arrayBuffer;
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