const portfolioItems = [
    {
        id: 1,
        title: "E-commerce Dashboard",
        category: "web",
        image: "https://picsum.photos/400/300?random=10",
        description: "Modern dashboard with analytics and real-time data visualization",
        technologies: ["React", "Node.js", "MongoDB"]
    },
    {
        id: 2,
        title: "Mobile Banking App",
        category: "mobile",
        image: "https://picsum.photos/400/500?random=11",
        description: "Secure mobile banking application with biometric authentication",
        technologies: ["React Native", "Firebase", "Stripe"]
    },
    {
        id: 3,
        title: "Brand Identity Design",
        category: "design",
        image: "https://picsum.photos/300/400?random=12",
        description: "Complete brand identity package for tech startup",
        technologies: ["Figma", "Illustrator", "Photoshop"]
    },
    {
        id: 4,
        title: "Task Management System",
        category: "web",
        image: "https://picsum.photos/450/320?random=13",
        description: "Collaborative task management with real-time updates",
        technologies: ["Vue.js", "Socket.io", "PostgreSQL"]
    },
    {
        id: 5,
        title: "Food Delivery App",
        category: "mobile",
        image: "https://picsum.photos/350/450?random=14",
        description: "On-demand food delivery with GPS tracking",
        technologies: ["Flutter", "Google Maps", "Firebase"]
    },
    {
        id: 6,
        title: "Portfolio Website",
        category: "design",
        image: "https://picsum.photos/400/350?random=15",
        description: "Creative portfolio showcase for digital artist",
        technologies: ["HTML5", "CSS3", "GSAP"]
    },
    {
        id: 7,
        title: "CRM Dashboard",
        category: "web",
        image: "https://picsum.photos/380/420?random=16",
        description: "Customer relationship management system",
        technologies: ["Angular", "Express", "MySQL"]
    },
    {
        id: 8,
        title: "Fitness Tracker",
        category: "mobile",
        image: "https://picsum.photos/320/480?random=17",
        description: "Health and fitness tracking application",
        technologies: ["Swift", "HealthKit", "Core Data"]
    }
];

class PortfolioGrid {
    constructor(container) {
        this.container = container;
        this.items = portfolioItems;
        this.currentFilter = 'all';
        this.lightbox = null;
        this.currentLightboxIndex = 0;
        this.filteredItems = [...this.items];
        this.init();
    }
    
    init() {
        this.createHTML();
        this.setupEventListeners();
        this.setupLightbox();
        // Show items after DOM is ready
        setTimeout(() => {
            this.showAllItems();
            this.initMasonry();
        }, 100);
    }
    
    createHTML() {
        const categories = ['all', ...new Set(this.items.map(item => item.category))];
        
        this.container.innerHTML = `
            <div class="portfolio-header">
                <h2>Portfolio Gallery</h2>
                <p>Explore our diverse collection of projects showcasing modern web development, mobile applications, and creative design solutions.</p>
                <div class="portfolio-filters">
                    ${categories.map(category => `
                        <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                                data-filter="${category}">
                            ${category === 'all' ? 'All Projects' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="portfolio-grid">
                ${this.items.map(item => this.createPortfolioItem(item)).join('')}
            </div>
            <div class="lightbox-overlay" id="lightbox">
                <div class="lightbox-container">
                    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                    <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="lightbox-nav lightbox-next" aria-label="Next image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <div class="lightbox-content">
                        <div class="lightbox-image-container">
                            <img class="lightbox-image" src="" alt="">
                        </div>
                        <div class="lightbox-info">
                            <h3 class="lightbox-title"></h3>
                            <p class="lightbox-description"></p>
                            <div class="lightbox-technologies"></div>
                            <div class="lightbox-meta">
                                <div class="project-category"></div>
                                <div class="project-date"></div>
                            </div>
                        </div>
                    </div>
                    <div class="lightbox-counter">
                        <span class="current-index">1</span> / <span class="total-count">8</span>
                    </div>
                </div>
            </div>
        `;
        
        this.grid = this.container.querySelector('.portfolio-grid');
        this.filterBtns = this.container.querySelectorAll('.filter-btn');
        this.lightbox = this.container.querySelector('#lightbox');
    }
    
    createPortfolioItem(item) {
        return `
            <div class="portfolio-item" data-category="${item.category}" data-id="${item.id}">
                <div class="portfolio-image">
                    <img data-src="${item.image}" alt="${item.title}" loading="lazy" class="lazy-loading">
                    <div class="portfolio-overlay">
                        <div class="portfolio-info">
                            <h3>${item.title}</h3>
                            <p>${item.category}</p>
                        </div>
                        <button class="portfolio-zoom" data-id="${item.id}">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
                                <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFilterClick(e.target.dataset.filter);
            });
        });
        
        // Portfolio item clicks
        this.grid.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const zoomBtn = e.target.closest('.portfolio-zoom');
            const portfolioItem = e.target.closest('.portfolio-item');
            
            if (zoomBtn) {
                const itemId = zoomBtn.dataset.id;
                this.openLightbox(parseInt(itemId));
            } else if (portfolioItem) {
                const itemId = portfolioItem.dataset.id;
                this.openLightbox(parseInt(itemId));
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.lightbox && this.lightbox.classList.contains('active')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }
    
    handleFilterClick(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        this.container.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filter items
        this.filterItems();
    }
    
    filterItems() {
        const items = this.container.querySelectorAll('.portfolio-item');
        
        items.forEach(item => {
            const category = item.dataset.category;
            const shouldShow = this.currentFilter === 'all' || category === this.currentFilter;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.add('show');
                }, 50);
            } else {
                item.classList.remove('show');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // Update filtered items array for lightbox navigation
        this.filteredItems = this.currentFilter === 'all' 
            ? [...this.items]
            : this.items.filter(item => item.category === this.currentFilter);
        
        // Re-init masonry after filtering
        setTimeout(() => {
            this.initMasonry();
        }, 350);
    }
    
    // Add method to show all items initially
    showAllItems() {
        const items = this.container.querySelectorAll('.portfolio-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 150); // Increased delay for smoother stagger
        });
    }

    initMasonry() {
        const items = Array.from(this.grid.children);
        const visibleItems = items.filter(item => item.style.display !== 'none');
        
        // Enhanced masonry layout
        this.grid.style.display = 'grid';
        this.grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        this.grid.style.gridAutoRows = '15px';
        this.grid.style.gap = '25px';
        
        // Calculate and set grid row span for each item
        visibleItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete && img.naturalHeight !== 0) {
                this.setGridRowSpan(item, img);
            } else {
                img.addEventListener('load', () => {
                    this.setGridRowSpan(item, img);
                });
                img.addEventListener('error', () => {
                    item.style.gridRowEnd = 'span 35'; // Increased default span
                });
            }
        });
    }
    
    setGridRowSpan(item, img) {
        const rowHeight = 15; // Updated to match CSS
        const rowGap = 25; // Updated to match CSS
        const itemHeight = img.offsetHeight + 60; // Increased padding
        const rowSpan = Math.ceil(itemHeight / (rowHeight + rowGap));
        item.style.gridRowEnd = `span ${rowSpan}`;
    }
    
    setupLightbox() {
        const closeBtn = this.lightbox.querySelector('.lightbox-close');
        const prevBtn = this.lightbox.querySelector('.lightbox-prev');
        const nextBtn = this.lightbox.querySelector('.lightbox-next');
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeLightbox();
        });
        
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigateLightbox('prev');
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigateLightbox('next');
        });
        
        // Close on overlay click (but not on container click)
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Prevent container clicks from closing lightbox
        const container = this.lightbox.querySelector('.lightbox-container');
        container.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    openLightbox(itemId) {
        const item = this.items.find(item => item.id === itemId);
        const itemIndex = this.filteredItems.findIndex(item => item.id === itemId);
        
        if (!item || itemIndex === -1) return;
        
        this.currentLightboxIndex = itemIndex;
        this.updateLightboxContent(item);
        this.lightbox.classList.add('active');
        
        // Simple body scroll prevention without position fixed
        document.body.style.overflow = 'hidden';
        
        // Focus management
        setTimeout(() => {
            const closeBtn = this.lightbox.querySelector('.lightbox-close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }, 100);
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        
        // Restore scrolling
        document.body.style.overflow = '';
    }
    
    navigateLightbox(direction) {
        const totalItems = this.filteredItems.length;
        
        if (direction === 'next') {
            this.currentLightboxIndex = (this.currentLightboxIndex + 1) % totalItems;
        } else {
            this.currentLightboxIndex = (this.currentLightboxIndex - 1 + totalItems) % totalItems;
        }
        
        const currentItem = this.filteredItems[this.currentLightboxIndex];
        this.updateLightboxContent(currentItem);
    }
    
    updateLightboxContent(item) {
        const img = this.lightbox.querySelector('.lightbox-image');
        const title = this.lightbox.querySelector('.lightbox-title');
        const description = this.lightbox.querySelector('.lightbox-description');
        const technologies = this.lightbox.querySelector('.lightbox-technologies');
        const currentIndex = this.lightbox.querySelector('.current-index');
        const totalCount = this.lightbox.querySelector('.total-count');
        
        // Enhanced image loading with animation
        img.style.opacity = '0';
        img.src = item.image;
        img.alt = item.title;
        
        img.onload = () => {
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        };
        
        title.textContent = item.title;
        description.textContent = item.description;
        
        technologies.innerHTML = item.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        currentIndex.textContent = this.currentLightboxIndex + 1;
        totalCount.textContent = this.filteredItems.length;
    }
    
    handleKeyboardNavigation(e) {
        if (!this.lightbox || !this.lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateLightbox('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateLightbox('next');
                break;
        }
    }
}

// Auto-initialize portfolio grids
document.addEventListener('DOMContentLoaded', () => {
    const portfolioContainers = document.querySelectorAll('.portfolio-grid-container');
    portfolioContainers.forEach(container => {
        new PortfolioGrid(container);
    });
});
