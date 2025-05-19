document.addEventListener('DOMContentLoaded', () => {
    // Initialize Plyr
    const player = new Plyr('#moviePlayer', {
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        quality: {
            default: 1080,
            options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        }
    });

    // Anti-screen capture protection
    function addScreenCaptureProtection() {
        const video = document.querySelector('video');
        
        // Prevent screen capture
        video.style.webkitFilter = 'contrast(100%)';
        
        // Add dynamic video protection
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create protective overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '2';
        video.parentElement.appendChild(overlay);

        // Add dynamic noise pattern
        function updateNoise() {
            const timestamp = new Date().getTime();
            overlay.style.background = `repeating-linear-gradient(
                ${Math.sin(timestamp/1000) * 360}deg,
                rgba(255,255,255,0.01) 0px,
                rgba(255,255,255,0.02) 1px
            )`;
            requestAnimationFrame(updateNoise);
        }
        updateNoise();

        // Detect screen capture attempts
        document.addEventListener('keydown', (e) => {
            // Detect common screen capture shortcuts
            if (
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.key === 'PrintScreen') ||
                (e.ctrlKey && e.key === 'P')
            ) {
                e.preventDefault();
                return false;
            }
        });

        // Prevent right-click
        video.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Add invisible watermark
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%)';
        watermark.style.color = 'rgba(255,255,255,0.01)';
        watermark.style.fontSize = '50px';
        watermark.style.pointerEvents = 'none';
        watermark.style.userSelect = 'none';
        watermark.style.zIndex = '1';
        watermark.textContent = new Date().toISOString();
        video.parentElement.appendChild(watermark);

        // Update watermark periodically
        setInterval(() => {
            watermark.textContent = new Date().toISOString();
        }, 1000);
    }

    // Get movie ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // Find movie in our movies array
    const movie = movies[movieId];

    if (movie) {
        // Update page content with movie details
        document.title = `${movie.title} - FilmFlix`;
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieRating').textContent = movie.rating;
        document.getElementById('movieYear').textContent = movie.year;
        document.getElementById('movieGenre').textContent = movie.genre;
        document.getElementById('movieDescription').textContent = movie.description;

        // Set video source if available
        if (movie.videoUrl) {
            player.source = {
                type: 'video',
                sources: [
                    {
                        src: movie.videoUrl,
                        type: 'video/mp4',
                        size: 1080
                    }
                ]
            };
            
            // Add screen capture protection after source is set
            player.on('ready', () => {
                addScreenCaptureProtection();
            });
        } else {
            const videoWrapper = document.querySelector('.video-wrapper');
            videoWrapper.innerHTML = '<div class="video-unavailable">Film niedostępny</div>';
        }

        // Create and style the test text element
        const testText = document.createElement('div');
        testText.style.position = 'absolute';
        testText.style.color = 'white';
        testText.style.padding = '5px 10px';
        testText.style.backgroundColor = 'rgba(220, 38, 38, 0.7)';
        testText.style.borderRadius = '4px';
        testText.style.fontSize = '14px';
        testText.style.fontWeight = 'bold';
        testText.style.zIndex = '1000';
        testText.style.display = 'none';
        testText.textContent = 'test';

        // Add the test text to the video container
        const videoContainer = document.querySelector('.plyr');
        videoContainer.appendChild(testText);

        // Function to show text in random position
        function showRandomText() {
            const container = document.fullscreenElement || videoContainer;
            const maxX = container.offsetWidth - testText.offsetWidth;
            const maxY = container.offsetHeight - testText.offsetHeight;
            
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            
            testText.style.left = `${randomX}px`;
            testText.style.top = `${randomY}px`;
            testText.style.display = 'block';
            
            // Hide after 2 seconds
            setTimeout(() => {
                testText.style.display = 'none';
            }, 2000);
        }

        // Show text every 10 seconds
        let textInterval = setInterval(showRandomText, 10000);

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            // Clear existing interval and start a new one to ensure proper positioning
            clearInterval(textInterval);
            textInterval = setInterval(showRandomText, 10000);
        });

        // Clean up on page unload
        window.addEventListener('unload', () => {
            clearInterval(textInterval);
        });
    } else {
        // Redirect to home page if movie not found
        window.location.href = '/';
    }

    // Initialize Lucide icons
    lucide.createIcons();
});