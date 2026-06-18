/* ═══════════════════════════════════════════════════════════════════════════
   WORLD TRAINER FORM - THEME TOGGLE SCRIPT
═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Get theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const storageKey = 'wtf-theme-preference';

    // Initialize theme on page load
    function initializeTheme() {
        // Check for saved preference
        const savedPreference = localStorage.getItem(storageKey);
        
        // Check system preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        // Determine which theme to use (default to DARK)
        const theme = savedPreference || systemPreference || 'dark';
        
        // Apply theme
        applyTheme(theme);
    }

    // Apply theme to document
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.classList.add('dark-mode');
            updateThemeIcon(true);
        } else {
            htmlElement.classList.remove('dark-mode');
            updateThemeIcon(false);
        }
        localStorage.setItem(storageKey, theme);
    }

    // Update theme toggle icon
    function updateThemeIcon(isDarkMode) {
        if (!themeToggle) return;
        
        if (isDarkMode) {
            themeToggle.innerHTML = '☀️';
            themeToggle.title = 'Switch to Light Mode';
        } else {
            themeToggle.innerHTML = '🌙';
            themeToggle.title = 'Switch to Dark Mode';
        }
    }

    // Toggle theme on button click
    function toggleTheme() {
        const isDarkMode = htmlElement.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Listen for system theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(storageKey)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Set up event listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
    }

    // Expose to global scope for debugging AND so index.html inline script can call applyTheme()
    window.themeManager = {
        toggle: toggleTheme,
        apply: applyTheme,
        get: () => htmlElement.classList.contains('dark-mode') ? 'dark' : 'light'
    };

    // Make applyTheme directly accessible on window (called by inline <script> in HTML)
    window.applyTheme = applyTheme;

})();

/* ═══════════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL & INTERACTIONS
═══════════════════════════════════════════════════════════════════════════ */

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return; // ignore exact '#' links
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add interactive effects to cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.card, .trainer-card, .testimonial-card, .pricing-card, .category-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SEARCH FUNCTIONALITY
═══════════════════════════════════════════════════════════════════════════ */

const heroSearch = document.querySelector('.hero-search');
const searchInput = document.querySelector('.hero-search input');

if (heroSearch && searchInput) {
    // Focus effect
    heroSearch.addEventListener('focusin', function() {
        this.style.borderColor = 'var(--accent-teal)';
        this.style.boxShadow = 'var(--shadow-lg)';
    });

    heroSearch.addEventListener('focusout', function() {
        if (!searchInput.value) {
            this.style.borderColor = 'var(--border-light)';
            this.style.boxShadow = 'var(--shadow-sm)';
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        console.log('Searching for:', query);
        // Add your search logic here
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON INTERACTIONS
═══════════════════════════════════════════════════════════════════════════ */

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        // Add ripple animation
        if (!this.querySelector('.ripple')) {
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    });
});

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR SCROLL EFFECT
═══════════════════════════════════════════════════════════════════════════ */

// Use getElementById('nav') — the HTML nav uses id="nav", not class="navbar"
const navbar = document.getElementById('nav') || document.querySelector('.navbar') || document.querySelector('nav');
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    if (!navbar) return; // guard against null
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.boxShadow = 'var(--shadow-sm)';
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTER ANIMATION FOR STATS
═══════════════════════════════════════════════════════════════════════════ */

function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + '+';
    }, 16);
}

// Animate stats when they come into view
const statElements = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const text = entry.target.textContent;
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            if (number) {
                animateCounter(entry.target, number);
            }
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statElements.forEach(stat => statsObserver.observe(stat));

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE MENU (For future implementation)
═══════════════════════════════════════════════════════════════════════════ */

// Add mobile menu toggle functionality here when needed
console.log('World Trainer Form - Premium Marketplace');
console.log('Theme Manager:', window.themeManager);
