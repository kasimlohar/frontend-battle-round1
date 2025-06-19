class ParallaxController {
    constructor() {
        this.layers = document.querySelectorAll('.parallax-layer');
        this.speeds = [0.2, 0.5, 0.8]; // Different speeds for each layer
        this.ticking = false;
        this.lastScrollY = 0;
        this.isSupported = true;
        this.isMobile = window.innerWidth <= 768;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        // Check if parallax is supported and should be enabled
        this.checkSupport();
        
        if (!this.isSupported || this.reducedMotion) {
            this.disableParallax();
            return;
        }
        
        // Initialize layers
        this.setupLayers();
        
        // Bind events
        this.bindEvents();
        
        // Initial update
        this.updateParallax();
    }
    
    checkSupport() {
        // Disable on very low-end devices or unsupported browsers
        this.isSupported = 'transform' in document.documentElement.style &&
                          'requestAnimationFrame' in window &&
                          !this.isMobile; // Disable on mobile for better performance
    }
    
    setupLayers() {
        this.layers.forEach((layer, index) => {
            // Set initial properties
            layer.style.willChange = 'transform';
            layer.style.transform = 'translate3d(0, 0, 0)'; // Enable hardware acceleration
            layer.dataset.speed = this.speeds[index] || 0.5;
        });
    }
    
    bindEvents() {
        // Optimized scroll event with passive listener
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Handle resize
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        
        // Handle visibility change to pause when tab is not active
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseParallax();
            } else {
                this.resumeParallax();
            }
        });
    }
    
    handleScroll() {
        this.lastScrollY = window.pageYOffset;
        this.requestTick();
    }
    
    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        if (this.isMobile) {
            this.disableParallax();
        } else {
            this.enableParallax();
        }
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateParallax.bind(this));
            this.ticking = true;
        }
    }
    
    updateParallax() {
        if (!this.isSupported) return;
        
        const scrollY = this.lastScrollY;
        const heroHeight = document.querySelector('.hero').offsetHeight;
        
        // Only update if hero is visible
        if (scrollY < heroHeight) {
            this.layers.forEach((layer, index) => {
                const speed = parseFloat(layer.dataset.speed);
                const yPos = -(scrollY * speed);
                
                // Use transform3d for hardware acceleration
                layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }
        
        this.ticking = false;
    }
    
    disableParallax() {
        this.layers.forEach(layer => {
            layer.style.transform = 'none';
            layer.style.willChange = 'auto';
        });
    }
    
    enableParallax() {
        if (this.isSupported && !this.reducedMotion && !this.isMobile) {
            this.setupLayers();
            this.updateParallax();
        }
    }
    
    pauseParallax() {
        this.layers.forEach(layer => {
            layer.style.willChange = 'auto';
        });
    }
    
    resumeParallax() {
        if (this.isSupported && !this.reducedMotion && !this.isMobile) {
            this.layers.forEach(layer => {
                layer.style.willChange = 'transform';
            });
        }
    }
    
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        this.disableParallax();
    }
}

// Initialize parallax controller
document.addEventListener('DOMContentLoaded', () => {
    const parallaxController = new ParallaxController();
    
    // Make it globally accessible for debugging
    window.parallaxController = parallaxController;
});
