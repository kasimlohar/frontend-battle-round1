class PerformanceOptimizer {
    constructor() {
        this.lazyImages = [];
        this.criticalImages = [];
        this.scrollListeners = new Set();
        this.performanceMetrics = {};
        this.imageCache = new Map();
        this.observerOptions = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        this.init();
    }

    init() {
        this.measurePerformance();
        this.setupImageTransitions();
        // Delay lazy loading setup to ensure DOM is ready
        setTimeout(() => {
            this.lazyLoadImages();
            this.preloadCriticalAssets();
        }, 100);
        this.optimizeScrolling();
        this.setupResourceHints();
        this.deferNonCriticalScripts();
    }

    // Lazy load images with Intersection Observer
    lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img).catch(error => {
                        console.warn('Failed to load image:', error.message);
                    });
                    observer.unobserve(img);
                }
            });
        }, this.observerOptions);

        // Handle images with data-src attribute (true lazy loading)
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('lazy-loading');
            imageObserver.observe(img);
            this.lazyImages.push(img);
        });

        // Handle existing portfolio images that may need optimization
        const existingImages = document.querySelectorAll('.portfolio-item img, .carousel-slide img');
        existingImages.forEach(img => {
            // If image has src but isn't loaded yet, add loading state
            if (img.src && !img.complete) {
                img.classList.add('lazy-loading');
                this.setupImageLoadListener(img);
            } else if (img.src && img.complete) {
                // Image is already loaded, just add the loaded class
                img.classList.add('lazy-loaded');
            } else if (!img.src && !img.dataset.src) {
                // Handle images that might be broken
                img.classList.add('lazy-error');
            }
        });

        // Handle images with loading="lazy" attribute
        const nativeLazyImages = document.querySelectorAll('img[loading="lazy"]:not([data-src])');
        nativeLazyImages.forEach(img => {
            if (!img.complete) {
                img.classList.add('lazy-loading');
                this.setupImageLoadListener(img);
            }
        });

        // Setup observer for dynamic content (portfolio grid)
        this.setupDynamicImageObserver();
    }

    setupDynamicImageObserver() {
        // Watch for new images added to the DOM
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        images.forEach(img => {
                            if (img.dataset.src || (img.loading === 'lazy' && !img.complete)) {
                                img.classList.add('lazy-loading');
                                this.setupImageLoadListener(img);
                            }
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    loadImage(img) {
        return new Promise((resolve, reject) => {
            const imageUrl = img.dataset.src || img.src;
            
            if (!imageUrl) {
                reject(new Error('No image URL found'));
                return;
            }
            
            // Check cache first
            if (this.imageCache.has(imageUrl)) {
                this.applyImageWithTransition(img, imageUrl);
                resolve(img);
                return;
            }

            // Create new image for preloading
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                this.imageCache.set(imageUrl, true);
                this.applyImageWithTransition(img, imageUrl);
                resolve(img);
            };

            imageLoader.onerror = () => {
                img.classList.add('lazy-error');
                img.classList.remove('lazy-loading');
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };

            // Add loading timeout
            const timeout = setTimeout(() => {
                imageLoader.onload = null;
                imageLoader.onerror = null;
                img.classList.add('lazy-error');
                img.classList.remove('lazy-loading');
                reject(new Error(`Image load timeout: ${imageUrl}`));
            }, 10000);

            imageLoader.onload = () => {
                clearTimeout(timeout);
                this.imageCache.set(imageUrl, true);
                this.applyImageWithTransition(img, imageUrl);
                resolve(img);
            };

            imageLoader.src = imageUrl;
        });
    }

    applyImageWithTransition(img, src) {
        // Apply the actual image source
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }

        // Remove loading attribute to prevent conflicts
        img.removeAttribute('loading');

        // Add smooth transition effect
        setTimeout(() => {
            img.classList.add('lazy-loaded');
            img.classList.remove('lazy-loading');
        }, 50);

        // Dispatch custom event
        img.dispatchEvent(new CustomEvent('imageLoaded', { 
            detail: { src, loadTime: performance.now() }
        }));
    }

    setupImageLoadListener(img) {
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('lazy-loaded');
            img.classList.remove('lazy-loading');
            return;
        }

        const handleLoad = () => {
            img.classList.add('lazy-loaded');
            img.classList.remove('lazy-loading');
            this.imageCache.set(img.src, true);
        };

        const handleError = () => {
            img.classList.add('lazy-error');
            img.classList.remove('lazy-loading');
            console.warn('Failed to load image:', img.src);
        };

        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });

        // Check if image is already cached by browser
        if (img.complete) {
            handleLoad();
        }
    }

    // Preload critical assets
    preloadCriticalAssets() {
        const criticalAssets = [
            // Hero background images
            'https://picsum.photos/1920/1080?random=1',
            // First portfolio images
            'https://picsum.photos/400/300?random=10',
            'https://picsum.photos/400/500?random=11'
        ];

        criticalAssets.forEach(url => {
            this.preloadImage(url);
        });

        // Preload next section images when current section is viewed
        this.setupProgressivePreloading();
    }

    preloadImage(url) {
        if (this.imageCache.has(url)) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);

        // Also cache the image
        const img = new Image();
        img.onload = () => this.imageCache.set(url, true);
        img.src = url;
    }

    setupProgressivePreloading() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    this.preloadSectionAssets(section);
                }
            });
        }, { rootMargin: '200px 0px' });

        document.querySelectorAll('.section').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    preloadSectionAssets(section) {
        const images = section.querySelectorAll('img[data-src], img[src*="picsum"]');
        images.forEach(img => {
            const src = img.dataset.src || img.src;
            if (src) this.preloadImage(src);
        });
    }

    // Optimize scroll performance
    optimizeScrolling() {
        let scrollTimeout;
        let isScrolling = false;

        const optimizedScroll = (callback) => {
            if (!isScrolling) {
                requestAnimationFrame(() => {
                    callback();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        };

        // Replace existing scroll listeners with optimized version
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'scroll' && this === window) {
                const optimizedListener = () => optimizedScroll(listener);
                this.scrollListeners?.add(optimizedListener);
                return originalAddEventListener.call(this, type, optimizedListener, { passive: true, ...options });
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        // Debounce scroll end events
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.dispatchEvent(new CustomEvent('scrollEnd'));
            }, 150);
        }, { passive: true });
    }

    // Setup resource hints
    setupResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//picsum.photos' },
            { rel: 'dns-prefetch', href: '//ui-avatars.com' },
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://picsum.photos' },
            { rel: 'preconnect', href: 'https://ui-avatars.com' }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
        });
    }

    // Defer non-critical JavaScript
    deferNonCriticalScripts() {
        const nonCriticalScripts = [
            'src/js/striking-animations.js',
            'src/js/testimonials.js',
            'src/js/chart.js'
        ];

        nonCriticalScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.async = true;
            document.head.appendChild(script);
        });
    }

    // Setup smooth image transitions
    setupImageTransitions() {
        // Check if styles are already injected
        if (document.getElementById('lazy-loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'lazy-loading-styles';
        style.textContent = `
            .lazy-loading {
                filter: blur(2px);
                opacity: 0.8;
                transition: filter 0.4s ease, opacity 0.4s ease;
                background: linear-gradient(90deg, 
                    var(--bg-secondary, #1a1a2e) 25%, 
                    rgba(99, 102, 241, 0.1) 50%, 
                    var(--bg-secondary, #1a1a2e) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s ease-in-out infinite;
                min-height: 200px;
                background-color: var(--bg-secondary, #1a1a2e);
            }
            
            .lazy-loaded {
                filter: blur(0);
                opacity: 1;
                animation: none;
                background: none;
            }
            
            .lazy-error {
                filter: grayscale(1);
                opacity: 0.5;
                background: var(--bg-secondary, #1a1a2e);
                position: relative;
            }
            
            .lazy-error::after {
                content: '🖼️';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2rem;
                color: var(--text-secondary, #666);
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Ensure portfolio images maintain aspect ratio during loading */
            .portfolio-item img {
                width: 100%;
                height: auto;
                display: block;
            }

            .portfolio-item .lazy-loading {
                aspect-ratio: 4/3;
                object-fit: cover;
            }
        `;
        document.head.appendChild(style);
    }

    // Performance monitoring
    measurePerformance() {
        if (!('performance' in window)) return;

        // Measure initial page load
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.performanceMetrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: this.getFirstPaint(),
                largestContentfulPaint: this.getLCP()
            };

            this.reportPerformanceMetrics();
        });

        // Monitor Core Web Vitals
        this.observeWebVitals();
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    getLCP() {
        return new Promise(resolve => {
            const observer = new PerformanceObserver(list => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                resolve(lastEntry.startTime);
                observer.disconnect();
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        });
    }

    observeWebVitals() {
        // Cumulative Layout Shift
        let cumulativeLayoutShift = 0;
        const clsObserver = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    cumulativeLayoutShift += entry.value;
                }
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
            }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Store CLS value before page unload
        window.addEventListener('beforeunload', () => {
            this.performanceMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
        });
    }

    reportPerformanceMetrics() {
        console.group('🚀 Performance Metrics');
        console.log('DOM Content Loaded:', `${this.performanceMetrics.domContentLoaded}ms`);
        console.log('Load Complete:', `${this.performanceMetrics.loadComplete}ms`);
        console.log('First Paint:', `${this.performanceMetrics.firstPaint}ms`);
        console.log('Images Cached:', this.imageCache.size);
        console.groupEnd();

        // Optional: Send to analytics
        // this.sendToAnalytics(this.performanceMetrics);
    }

    // Public API methods
    preloadImages(urls) {
        urls.forEach(url => this.preloadImage(url));
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    clearImageCache() {
        this.imageCache.clear();
    }

    // Method to manually trigger image loading for visible images
    loadVisibleImages() {
        const visibleImages = document.querySelectorAll('img.lazy-loading');
        visibleImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                this.loadImage(img).catch(console.warn);
            }
        });
    }

    // Cleanup method
    destroy() {
        this.scrollListeners.forEach(listener => {
            window.removeEventListener('scroll', listener);
        });
        this.scrollListeners.clear();
        this.imageCache.clear();
    }
}

// Auto-initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Fallback: Load visible images after a delay
    setTimeout(() => {
        if (window.performanceOptimizer) {
            window.performanceOptimizer.loadVisibleImages();
        }
    }, 2000);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
