// ANIMATED CHART FUNCTIONALITY
class AnimatedChart {
    constructor(container) {
        this.container = container;
        this.bars = [];
        this.data = [
            { value: 875, label: 'Q1 2024', unit: 'tCO₂e' },
            { value: 617, label: 'Q2 2024', unit: 'tCO₂e' },
            { value: 506, label: 'Q3 2024', unit: 'tCO₂e' },
            { value: 450, label: 'Q4 2024', unit: 'tCO₂e' },
            { value: 380, label: 'Q1 2025', unit: 'tCO₂e' }
        ];
        this.init();
    }
    
    init() {
        this.generateHTML();
        this.setupObserver();
    }
    
    generateHTML() {
        const maxValue = Math.max(...this.data.map(item => item.value));
        
        this.container.innerHTML = `
            <div class="chart-title">Carbon Emissions Tracking</div>
            <div class="chart-subtitle">Quarterly emissions data (tCO₂e)</div>
            <div class="chart-container">
                ${this.data.map((item, index) => {
                    const heightPercent = (item.value / maxValue) * 100;
                    const widthPercent = (item.value / maxValue) * 100;
                    return `
                        <div class="chart-bar" 
                             data-value="${item.value} ${item.unit}" 
                             data-label="${item.label}"
                             data-index="${index}"
                             data-height="${heightPercent}"
                             data-width="${widthPercent}"
                             style="--chart-width: ${widthPercent}%;">
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        this.bars = this.container.querySelectorAll('.chart-bar');
        this.setResponsiveWidths();
    }
    
    setResponsiveWidths() {
        // Set dynamic widths for mobile horizontal layout
        this.bars.forEach((bar, index) => {
            const widthPercent = bar.dataset.width;
            
            // Apply width based on screen size
            if (window.innerWidth <= 480) {
                bar.style.width = `${widthPercent}%`;
                bar.style.maxWidth = `${widthPercent}%`;
            } else {
                bar.style.width = '';
                bar.style.maxWidth = '';
            }
        });
    }
    
    setupObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateChart();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(this.container);
        
        // Add resize listener for responsive behavior
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setResponsiveWidths();
            }, 100);
        });
    }
    
    animateChart() {
        this.bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('animate');
            }, index * 200);
        });
    }
}

// Auto-initialize charts
document.addEventListener('DOMContentLoaded', () => {
    const chartContainers = document.querySelectorAll('.animated-chart');
    chartContainers.forEach(container => {
        new AnimatedChart(container);
    });
});
