class ImageCarousel {
    constructor(container) {
        this.container = container;
        this.slides = [
            {
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center',
                title: 'Slide 1',
                description: 'Description for slide 1'
            },
            {
                image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop&crop=center',
                title: 'Slide 2',
                description: 'Description for slide 2'
            },
            {
                image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=400&fit=crop&crop=center',
                title: 'Slide 3',
                description: 'Description for slide 3'
            },
            {
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
                title: 'Slide 4',
                description: 'Description for slide 4'
            },
            {
                image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&h=400&fit=crop&crop=center',
                title: 'Slide 5',
                description: 'Description for slide 5'
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
        this.startAutoPlay();
    }
    
    generateHTML() {
        this.container.innerHTML = `
            <div class="carousel-container">
                <div class="carousel-slides">
                    ${this.slides.map((slide, index) => `
                        <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img ${index === 0 ? 'src' : 'data-src'}="${slide.image}" 
                                 alt="${slide.title}" 
                                 loading="${index === 0 ? 'eager' : 'lazy'}"
                                 ${index > 0 ? 'class="lazy-loading"' : ''}>
                            <div class="carousel-content">
                                <h3>${slide.title}</h3>
                                <p>${slide.description}</p>
                            </div>
                        </div>
                    `).join('')}
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
            </div>
        `;
        
        // Cache DOM elements
        this.slidesContainer = this.container.querySelector('.carousel-slides');
        this.slideElements = this.container.querySelectorAll('.carousel-slide');
        this.prevBtn = this.container.querySelector('.prev');
        this.nextBtn = this.container.querySelector('.next');
        this.images = this.container.querySelectorAll('.carousel-slide img');
    }
    
    setupImageLoading() {
        this.images.forEach((img, index) => {
            const slide = this.slideElements[index];
            
            // Check if image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                this.handleImageLoad(slide, index);
            } else {
                // Add event listeners for loading
                img.addEventListener('load', () => {
                    this.handleImageLoad(slide, index);
                });
                
                img.addEventListener('error', () => {
                    this.handleImageError(slide, index);
                });
            }
        });
    }
    
    handleImageLoad(slide, index) {
        slide.classList.add('loaded');
        this.loadedImages.add(index);
    }
    
    handleImageError(slide, index) {
        slide.classList.add('error');
        console.warn(`Failed to load carousel image ${index + 1}`);
    }
    
    addEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Dots navigation
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
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
                this.nextSlide(); // Swipe left - next slide
            } else {
                this.prevSlide(); // Swipe right - previous slide
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
        // Remove active class from current slide and dot
        this.slideElements[this.currentSlide].classList.remove('active');
        
        // Update current slide index
        this.currentSlide = index;
        
        // Add active class to new slide 
        this.slideElements[this.currentSlide].classList.add('active');
        
        // Update transform for smooth transition
        this.slidesContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
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
        }, 3000);
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
