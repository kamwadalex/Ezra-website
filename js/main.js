// Ezra Memorial Secondary School - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelectorAll('.hamburger');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Accordion functionality for academics page
    const accordionBtns = document.querySelectorAll('.accordion-btn');
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });

    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('nav a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-menu a');
    
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage || 
            (currentPage === '/' && item.getAttribute('href') === 'index.html')) {
            item.style.backgroundColor = 'rgba(255,255,255,0.3)';
            item.style.borderRadius = '5px';
        }
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(30, 60, 114, 0.95)';
        } else {
            header.style.backgroundColor = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        }
    });

    // Add loading animation to features
    const features = document.querySelectorAll('.feature');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(feature);
    });

    // Homepage slideshow functionality
    const slides = document.querySelectorAll('.slideshow-container .slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');
    const prevBtn = document.querySelector('.slideshow-container .prev');
    const nextBtn = document.querySelector('.slideshow-container .next');
    let slideIndex = 0;
    let slideInterval;

    function showSlide(n) {
        if (!slides.length) return;
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            dots[i].classList.remove('active');
        });
        slideIndex = (n + slides.length) % slides.length;
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(slideIndex + 1);
    }
    function prevSlide() {
        showSlide(slideIndex - 1);
    }
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    if (slides.length) {
        showSlide(0);
        startSlideShow();
        nextBtn.addEventListener('click', function() {
            stopSlideShow();
            nextSlide();
            startSlideShow();
        });
        prevBtn.addEventListener('click', function() {
            stopSlideShow();
            prevSlide();
            startSlideShow();
        });
        dots.forEach((dot, i) => {
            dot.addEventListener('click', function() {
                stopSlideShow();
                showSlide(i);
                startSlideShow();
            });
        });
    }

    // Handle window resize to reset mobile menu
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Console welcome message
    console.log('Welcome to Ezra Memorial Secondary School website!');
    console.log('For any technical support, please contact the web development team.');
}); 