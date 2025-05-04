document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const platforms = document.querySelectorAll('.platform');
    const mp3Conversion = document.getElementById('mp3Conversion');
    const qualitySelect = document.getElementById('quality');

    // Handle platform selection
    platforms.forEach(platform => {
        platform.addEventListener('click', () => {
            platforms.forEach(p => p.classList.remove('active'));
            platform.classList.add('active');
            
            const platformName = platform.dataset.platform;
            videoUrlInput.placeholder = `Paste ${platformName} video URL here...`;
        });
    });

    // Handle download button click
    downloadBtn.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();
        const isMP3 = mp3Conversion.checked;
        const quality = qualitySelect.value;
        
        if (!url) {
            showError('Please enter a video URL');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL');
            return;
        }

        showLoading();
        if (isMP3) {
            convertToMP3(url);
        } else {
            downloadVideo(url, quality);
        }
    });

    // Feature section visibility handlers
    window.showMP3Converter = () => {
        hideAllSections();
        document.getElementById('mp3Converter').classList.remove('hidden');
    };

    window.showHashtagAnalyzer = () => {
        hideAllSections();
        document.getElementById('hashtagAnalyzer').classList.remove('hidden');
    };

    window.showMobileFeatures = () => {
        hideAllSections();
        document.getElementById('mobileFeatures').classList.remove('hidden');
    };

    // MP3 Conversion
    window.convertToMP3 = () => {
        const url = document.getElementById('mp3Url').value.trim();
        if (!url) {
            showError('Please enter a video URL');
            return;
        }

        const progressBar = document.querySelector('.progress-bar');
        const progress = document.querySelector('.progress');
        
        progressBar.classList.remove('hidden');
        progress.style.width = '0%';

        // Simulate conversion progress
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    alert('MP3 conversion complete!');
                    progressBar.classList.add('hidden');
                }, 500);
            } else {
                width += 10;
                progress.style.width = width + '%';
            }
        }, 500);
    };

    // Hashtag Analysis
    window.analyzeHashtags = () => {
        const input = document.getElementById('hashtagInput').value.trim();
        if (!input) {
            showError('Please enter a hashtag or URL');
            return;
        }

        const results = document.querySelector('.results');
        const hashtagList = document.querySelector('.hashtag-list');
        
        // Simulate hashtag analysis
        const trendingHashtags = [
            '#trending1',
            '#viral',
            '#trending2',
            '#popular',
            '#trending3'
        ];

        hashtagList.innerHTML = trendingHashtags
            .map(tag => `<div class="hashtag-item">${tag}</div>`)
            .join('');

        results.classList.remove('hidden');
    };

    // Helper functions
    function hideAllSections() {
        document.querySelectorAll('.feature-section').forEach(section => {
            section.classList.add('hidden');
        });
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const downloadSection = document.querySelector('.download-section');
        downloadSection.insertBefore(errorDiv, downloadSection.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function showLoading() {
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        downloadBtn.disabled = true;
    }

    function downloadVideo(url, quality) {
        // Simulate download process
        setTimeout(() => {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            downloadBtn.disabled = false;
            
            // In a real application, you would handle the download here
            alert(`Downloading video in ${quality} quality...`);
        }, 2000);
    }
}); 