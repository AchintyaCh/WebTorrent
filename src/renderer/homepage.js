// Homepage JavaScript functionality

let isMobileMenuOpen = false;
let isScrolled = false;
let showPoster = false;
let currentTheme = 'light';

// Initialize homepage
document.addEventListener('DOMContentLoaded', function () {
    console.log('Homepage loaded');

    // Set current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Initialize theme
    initializeTheme();

    // Setup video fallback
    const video = document.querySelector('.hero-video');
    if (video) {
        video.addEventListener('error', showPosterImage);
        video.addEventListener('ended', showPosterImage);

        // Try to play video with autoplay attempt
        attemptAutoplay();
    }

    // Setup scroll effects
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Setup click outside handler for mobile menu
    document.addEventListener('click', handleClickOutside);

    // Add interactive effects to buttons
    addButtonEffects();
});

// Initialize theme system
function initializeTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    applyTheme(currentTheme);
}

// Apply theme to document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icons
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    
    if (moonIcon && sunIcon) {
        if (theme === 'light') {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        } else {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    }
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

// Attempt video autoplay
async function attemptAutoplay() {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    try {
        await video.play();
    } catch (err) {
        console.log('Autoplay blocked, showing poster image');
        showPosterImage();
    }
}

// Handle scroll effects
function handleScroll() {
    try {
        const scrolled = window.scrollY > 50;
        if (scrolled !== isScrolled) {
            isScrolled = scrolled;
            const header = document.querySelector('.site-header');
            if (header) {
                if (isScrolled) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        }
    } catch (error) {
        console.warn('Scroll event error:', error);
    }
}

// Show poster image if video fails
function showPosterImage() {
    const video = document.querySelector('.hero-video');
    const heroMedia = document.querySelector('.hero-media');

    if (video && heroMedia && !showPoster) {
        showPoster = true;
        video.style.display = 'none';

        // Check if image already exists
        let img = heroMedia.querySelector('.hero-image');
        if (!img) {
            img = document.createElement('img');
            img.className = 'hero-image';
            img.src = '../../public/p2p.jpg';
            img.alt = 'P2P device hero';
            img.onclick = handleVideoClick;
            heroMedia.appendChild(img);
        }
        img.style.display = 'block';
    }
}

// Handle video/image click
function handleVideoClick() {
    const video = document.querySelector('.hero-video');
    const img = document.querySelector('.hero-image');
    
    if (showPoster && video && img) {
        // Try to show and play video
        showPoster = false;
        img.style.display = 'none';
        video.style.display = 'block';
        video.play().catch(() => {
            // If play fails, go back to poster
            showPoster = true;
            video.style.display = 'none';
            img.style.display = 'block';
        });
    } else if (video && !showPoster) {
        // Toggle video play/pause
        if (video.paused) {
            video.play().catch(() => {
                showPosterImage();
            });
        } else {
            video.pause();
        }
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (nav && toggle) {
        if (isMobileMenuOpen) {
            nav.classList.add('mobile-open');
            toggle.classList.add('active');
        } else {
            nav.classList.remove('mobile-open');
            toggle.classList.remove('active');
        }
    }
}

// Handle click outside mobile menu
function handleClickOutside(event) {
    try {
        if (isMobileMenuOpen &&
            !event.target.closest('.nav') &&
            !event.target.closest('.mobile-menu-toggle')) {
            toggleMobileMenu();
        }
    } catch (error) {
        console.warn('Click outside error:', error);
    }
}

// Handle navigation click (close mobile menu)
function handleNavClick() {
    if (isMobileMenuOpen) {
        toggleMobileMenu();
    }
}

// Show about section
function showAbout() {
    const heroSection = document.querySelector('.hero');
    const aboutSection = document.getElementById('about-section');

    if (heroSection && aboutSection) {
        heroSection.style.display = 'none';
        aboutSection.style.display = 'block';

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Close mobile menu if open
    handleNavClick();
}

// Hide about section
function hideAbout() {
    const heroSection = document.querySelector('.hero');
    const aboutSection = document.getElementById('about-section');

    if (heroSection && aboutSection) {
        heroSection.style.display = 'flex';
        aboutSection.style.display = 'none';

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Open blockchain marketplace
function openBlockchainMarketplace() {
    console.log('Opening blockchain marketplace...');

    // Close mobile menu if open
    handleNavClick();

    // Load the blockchain marketplace page
    window.location.href = './index-metamask-browser.html';
}

// Add interactive effects to buttons
function addButtonEffects() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-open');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            if (!this.style.transform.includes('translateY')) {
                this.style.transform = 'translateY(-2px)';
            }
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}