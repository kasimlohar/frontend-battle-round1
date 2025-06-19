const testimonials = [
    {
        text: "Outstanding work on our portfolio website. The animations are smooth and the design is modern.",
        author: "John Doe",
        position: "CEO, TechCorp",
        avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff"
    },
    {
        text: "Exceptional attention to detail and responsive design. Highly recommended for any web development project!",
        author: "Jane Smith",
        position: "Designer, CreativeStudio",
        avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff"
    },
    {
        text: "The team delivered beyond our expectations. Professional, creative, and technically excellent work.",
        author: "Mike Johnson",
        position: "CTO, InnovateLab",
        avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=f59e0b&color=fff"
    },
    {
        text: "Amazing user experience and performance optimization. Our conversion rates improved significantly!",
        author: "Sarah Wilson",
        position: "Marketing Director, GrowthCo",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=8b5cf6&color=fff"
    }
];

class TestimonialSlider {
    constructor(container) {
        this.container = container;
        this.testimonials = testimonials;
        this.currentIndex = 0;
        this.isPlaying = true;
        this.interval = null;
        this.rotationDuration = 4000; // 4 seconds
        this.fadeDuration = 500; // 0.5 seconds
        this.init();
    }
    
    init() {
        this.generateHTML();
        this.setupEventListeners();
        this.startAutoRotation();
        this.setupIntersectionObserver();
    }
    
    generateHTML() {
        this.container.innerHTML = `
            <div class="testimonials-slider">
                <div class="testimonials-container">
                    ${this.testimonials.map((testimonial, index) => `
                        <div class="testimonial-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <div class="testimonial-content">
                                <div class="quote-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <path d="M9.135 9h2.865v6H9.135V9zM1.865 9H4.73v6H1.865V9z" fill="currentColor" opacity="0.3"/>
                                        <path d="M11.432 2.331A9.88 9.88 0 0 1 21.9 12.2c0 5.445-4.455 9.9-9.9 9.9s-9.9-4.455-9.9-9.9c0-3.981 2.343-7.434 5.732-8.969l.6 1.1z" stroke="currentColor" stroke-width="1.5"/>
                                    </svg>
                                </div>
                                <blockquote class="testimonial-text">"${testimonial.text}"</blockquote>
                                <div class="testimonial-author">
                                    <img src="${testimonial.avatar}" alt="${testimonial.author}" class="author-avatar" loading="lazy">
                                    <div class="author-info">
                                        <div class="author-name">${testimonial.author}</div>
                                        <div class="author-position">${testimonial.position}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="testimonials-controls">
                    <div class="testimonials-dots">
                        ${this.testimonials.map((_, index) => `
                            <button class="testimonial-dot ${index === 0 ? 'active' : ''}" 
                                    data-index="${index}" 
                                    aria-label="Go to testimonial ${index + 1}">
                                <div class="dot-progress"></div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <button class="testimonials-play-pause" aria-label="Pause auto-rotation">
                        <svg class="play-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                        <svg class="pause-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.slides = this.container.querySelectorAll('.testimonial-slide');
        this.dots = this.container.querySelectorAll('.testimonial-dot');
        this.playPauseBtn = this.container.querySelector('.testimonials-play-pause');
        this.progressElements = this.container.querySelectorAll('.dot-progress');
    }
    
    setupEventListeners() {
        // Dot navigation
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.goToSlide(index);
            });
        });
        
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // Hover pause/resume
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoRotation();
        });
        
        this.container.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                this.startAutoRotation();
            }
        });
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.pauseAutoRotation();
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchStartX - touchEndX;
            const swipeThreshold = 50;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            if (this.isPlaying) {
                this.startAutoRotation();
            }
        }, { passive: true });
        
        // Focus management
        this.container.setAttribute('tabindex', '0');
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
                this.togglePlayPause();
                break;
        }
    }
    
    goToSlide(index, direction = 'next') {
        if (index === this.currentIndex) return;
        
        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];
        const currentDot = this.dots[this.currentIndex];
        const nextDot = this.dots[index];
        
        // Start fade out animation
        currentSlide.classList.add('fade-out');
        currentDot.classList.remove('active');
        
        // Reset progress animations
        this.resetProgressAnimations();
        
        setTimeout(() => {
            // Remove active class and fade-out class from current slide
            currentSlide.classList.remove('active', 'fade-out');
            
            // Add active class to next slide and start fade in
            nextSlide.classList.add('active', 'fade-in');
            nextDot.classList.add('active');
            
            // Update current index
            this.currentIndex = index;
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                nextSlide.classList.remove('fade-in');
            }, this.fadeDuration);
            
        }, this.fadeDuration / 2);
        
        // Start progress animation for active dot
        setTimeout(() => {
            if (this.isPlaying && this.interval) {
                this.startProgressAnimation();
            }
        }, this.fadeDuration);
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.goToSlide(nextIndex, 'next');
    }
    
    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.goToSlide(prevIndex, 'prev');
    }
    
    startAutoRotation() {
        this.stopAutoRotation();
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.rotationDuration);
        this.startProgressAnimation();
    }
    
    stopAutoRotation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.resetProgressAnimations();
    }
    
    pauseAutoRotation() {
        this.stopAutoRotation();
    }
    
    togglePlayPause() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            this.isPlaying = false;
            this.stopAutoRotation();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            this.playPauseBtn.setAttribute('aria-label', 'Resume auto-rotation');
        } else {
            this.isPlaying = true;
            this.startAutoRotation();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            this.playPauseBtn.setAttribute('aria-label', 'Pause auto-rotation');
        }
    }
    
    startProgressAnimation() {
        const activeProgress = this.progressElements[this.currentIndex];
        if (activeProgress) {
            activeProgress.style.animation = `testimonialProgress ${this.rotationDuration}ms linear`;
        }
    }
    
    resetProgressAnimations() {
        this.progressElements.forEach(progress => {
            progress.style.animation = 'none';
        });
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (this.isPlaying && !this.interval) {
                        this.startAutoRotation();
                    }
                } else {
                    this.stopAutoRotation();
                }
            });
        }, observerOptions);
        
        observer.observe(this.container);
    }
    
    destroy() {
        this.stopAutoRotation();
        this.container.innerHTML = '';
    }
}

// Auto-initialize testimonials sliders
document.addEventListener('DOMContentLoaded', () => {
    const testimonialContainers = document.querySelectorAll('.testimonials-slider-container');
    testimonialContainers.forEach(container => {
        new TestimonialSlider(container);
    });
});
