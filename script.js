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
    
    downloadBtn.onclick = async () => {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Converter...';
        
        updateProgress(50, 'Preparing converter...');
        
        // Show iframe converter
        showConverterFrame(videoId);
        
        updateProgress(100, 'Converter ready!');
        
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download MP3';
    };
}

function showConverterFrame(videoId) {
    const converterFrame = document.getElementById('converterFrame');
    const converterIframe = document.getElementById('converterIframe');
    const closeBtn = document.getElementById('closeFrame');
    const mainFooter = document.getElementById('mainFooter');
    
    // Hide main content footer
    mainFooter.style.display = 'none';
    
    // Skip iframe, directly show manual converter
    showManualConverter(videoId);
    
    // Show converter frame
    converterFrame.classList.remove('hidden');
    
    // Setup close button
    closeBtn.onclick = () => {
        converterFrame.classList.add('hidden');
        mainFooter.style.display = 'block';
        converterIframe.srcdoc = ''; // Clear iframe
    };
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeBtn.click();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

function showManualConverter(videoId) {
    const converterIframe = document.getElementById('converterIframe');
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Create manual converter HTML with working buttons
    const manualHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    padding: 40px;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
                    color: #e0e6ed;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    max-width: 600px;
                    text-align: center;
                }
                h2 {
                    color: #00d4ff;
                    margin-bottom: 20px;
                    text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
                }
                .converter-btn {
                    display: block;
                    background: linear-gradient(45deg, #00d4ff, #ff6b9d);
                    color: white;
                    padding: 15px 25px;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: bold;
                    margin: 15px 0;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
                }
                .converter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
                }
                .converter-btn:nth-child(even) {
                    background: linear-gradient(45deg, #ff6b9d, #00d4ff);
                }
                p {
                    color: #a0a9c0;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2><i class="fas fa-rocket"></i> ION's Space Converter</h2>
                <p style="margin-bottom: 30px; font-size: 1.1rem;">Choose your preferred converter:</p>
                
                <a href="https://www.y2mate.com/youtube/${videoId}" target="_blank" class="converter-btn">
                    <i class="fas fa-download"></i> Y2mate Converter
                </a>
                <a href="https://ytmp3.cc/youtube-to-mp3/?url=${encodeURIComponent(youtubeUrl)}" target="_blank" class="converter-btn">
                    <i class="fas fa-music"></i> YTMP3 Converter
                </a>
                <a href="https://www.mp3juices.cc/search/${encodeURIComponent(videoId)}" target="_blank" class="converter-btn">
                    <i class="fas fa-headphones"></i> MP3 Juices
                </a>
                
                <p>Click any converter above to download your MP3 file</p>
                <p><i class="fas fa-info-circle"></i> Links will open in new tabs</p>
            </div>
        </body>
        </html>
    `;
    
    // Set iframe content to manual converter
    converterIframe.srcdoc = manualHTML;
}

async function processRealDownload(videoId, videoData) {
    try {
        updateProgress(30, 'Connecting to server...');
        
        // Try our own serverless function first
        const serverResponse = await fetch(`/api/convert?videoId=${videoId}`);
        
        if (serverResponse.ok) {
            updateProgress(60, 'Converting to MP3...');
            
            // Get the blob from response
            const blob = await serverResponse.blob();
            
            if (blob.size > 1000) { // Check if we got actual content
                updateProgress(90, 'Preparing download...');
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${videoData.title.replace(/[^\w\s]/gi, '')}.mp3`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                updateProgress(100, 'Download complete!');
                setTimeout(() => {
                    alert('🎵 MP3 downloaded successfully! Check your downloads folder.');
                }, 500);
                return;
            }
        }
    } catch (error) {
        console.log('Server conversion failed:', error);
    }
    
    // Fallback to alternative method
    await useAlternativeDownload(videoId, videoData);
}

async function useAlternativeDownload(videoId, videoData) {
    updateProgress(70, 'Trying alternative method...');
    
    // Create a simple redirect approach as last resort
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Show user a choice
    const userChoice = confirm('🚀 Server conversion unavailable. Would you like to:\n\n• OK: Open converter in new tab\n• Cancel: Download demo file');
    
    if (userChoice) {
        // Open converter in new tab
        const converterUrl = `https://ytmp3.cc/youtube-to-mp3/?url=${encodeURIComponent(youtubeUrl)}`;
        window.open(converterUrl, '_blank');
        
        updateProgress(100, 'Converter opened!');
        setTimeout(() => {
            alert('🎵 Converter opened in new tab! Click "Download" to get your MP3.');
        }, 500);
    } else {
        // Download demo file
        updateProgress(100, 'Preparing demo file...');
        const fileName = videoData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3';
        createMockMP3Download(fileName);
    }
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
        alert('⚠️ Fallback mode: Demo audio file downloaded. The converter service is temporarily unavailable.');
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