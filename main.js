// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// Modal Functionality
const modal = document.getElementById('toolModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close-modal');

// Close modal when clicking the close button
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Tool Cards Click Handler
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
        const toolType = card.getAttribute('data-tool');
        openToolModal(toolType);
    });
});

// Function to open tool modal
function openToolModal(toolType) {
    modal.style.display = 'block';
    
    // Clear previous content
    modalContent.innerHTML = '';
    
    // Add loading state
    modalContent.innerHTML = '<div class="loading">Loading...</div>';
    
    // Load tool content based on type
    switch(toolType) {
        case 'instagram-bio':
            loadInstagramBioGenerator();
            break;
        case 'youtube-tags':
            loadYouTubeTagsGenerator();
            break;
        case 'freefire-nickname':
            loadFreeFireNicknameGenerator();
            break;
        case 'pubg-nickname':
            loadPUBGNicknameGenerator();
            break;
        case 'youtube-downloader':
            loadYouTubeDownloader();
            break;
        case 'tiktok-downloader':
            loadTikTokDownloader();
            break;
        case 'currency-converter':
            loadCurrencyConverter();
            break;
        case 'fancy-text':
            loadFancyTextGenerator();
            break;
        case 'password-generator':
            loadPasswordGenerator();
            break;
        case 'qr-generator':
            loadQRGenerator();
            break;
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking
            navMenu.classList.remove('active');
        }
    });
}); 