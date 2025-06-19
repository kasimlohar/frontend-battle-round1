class ImageCarousel {
    constructor(container) {
        this.container = container;
        this.slides = [
            {
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
                title: 'Analytics Dashboard',
                description: 'Real-time data visualization and analytics'
            },
            {
                image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop&crop=center',
                title: 'Business Intelligence',
                description: 'Advanced reporting and insights'
            },
            {
                image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=400&fit=crop&crop=center',
                title: 'Data Visualization',
                description: 'Interactive charts and graphs'
            },
            {
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
                title: 'Performance Metrics',
                description: 'Key performance indicators tracking'
            },
            {
                image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&h=400&fit=crop&crop=center',
                title: 'Workflow Automation',
                description: 'Streamlined business processes'
            }
        ];
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.isPlaying = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.loadedImages = new Set();
        this.init();
    }
    
    init() {
        this.generateHTML();
        this.setupImageLoading();
        this.addEventListeners();
        this.updateSlidePosition();
        this.startAutoPlay();
    }
    
    generateHTML() {
        this.container.innerHTML = `
            <div class="carousel-wrapper">
                <div class="carousel-container">
                    <div class="carousel-slides">
                        ${this.slides.map((slide, index) => `
                            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <img src="${slide.image}" 
                                     alt="${slide.title}" 
                                     loading="${index === 0 ? 'eager' : 'lazy'}"
                                     style="opacity: 0; transition: opacity 0.3s ease;">
                                <div class="carousel-content">
                                    <h3>${slide.title}</h3>
                                    <p>${slide.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="carousel-nav prev" aria-label="Previous slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="carousel-nav next" aria-label="Next slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="carousel-dots">
                    ${this.slides.map((_, index) => `
                        <button class="carousel-dot ${index === 0 ? 'active' : ''}" 
                                data-slide="${index}" 
                                aria-label="Go to slide ${index + 1}"></button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.slidesContainer = this.container.querySelector('.carousel-slides');
        this.slideElements = this.container.querySelectorAll('.carousel-slide');
        this.prevBtn = this.container.querySelector('.prev');
        this.nextBtn = this.container.querySelector('.next');
        this.dots = this.container.querySelectorAll('.carousel-dot');
        this.images = this.container.querySelectorAll('.carousel-slide img');
    }
    
    setupImageLoading() {
        this.images.forEach((img, index) => {
            const slide = this.slideElements[index];
            
            // Add loading state
            slide.classList.add('loading');
            
            const handleLoad = () => {
                slide.classList.remove('loading');
                slide.classList.add('loaded');
                img.style.opacity = '1';
                this.loadedImages.add(index);
            };

            const handleError = () => {
                slide.classList.remove('loading');
                slide.classList.add('error');
                img.style.opacity = '0.5';
                console.warn(`Failed to load carousel image ${index + 1}`);
            };

            if (img.complete && img.naturalHeight !== 0) {
                handleLoad();
            } else {
                img.addEventListener('load', handleLoad, { once: true });
                img.addEventListener('error', handleError, { once: true });
            }
        });
    }
    
    addEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => {
            this.pauseAutoPlay();
            this.prevSlide();
            this.resumeAutoPlay();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.pauseAutoPlay();
            this.nextSlide();
            this.resumeAutoPlay();
        });
        
        // Dots navigation
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.pauseAutoPlay();
                this.goToSlide(slideIndex);
                this.resumeAutoPlay();
            });
        });
        
        // Hover pause/resume
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        
        // Touch/swipe support
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Focus management
        this.container.setAttribute('tabindex', '0');
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.pauseAutoPlay();
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        this.resumeAutoPlay();
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    handleKeydown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.isPlaying ? this.pauseAutoPlay() : this.resumeAutoPlay();
                break;
        }
    }
    
    goToSlide(index) {
        // Remove active classes
        this.slideElements[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active classes
        this.slideElements[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
        
        // Update position
        this.updateSlidePosition();
    }
    
    updateSlidePosition() {
        const translateX = -this.currentSlide * 100;
        this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.isPlaying = true;
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000);
    }
    
    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resumeAutoPlay() {
        if (!this.isPlaying) {
            this.startAutoPlay();
        }
    }
    
    destroy() {
        this.pauseAutoPlay();
        this.container.innerHTML = '';
    }
}

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainers = document.querySelectorAll('.image-carousel');
    carouselContainers.forEach(container => {
        new ImageCarousel(container);
    });
});
