/* filepath: c:\Users\kasim\OneDrive\Desktop\Frontend Hackathon\frontend-battle-round1\src\js\micro-interactions.js */
class MicroInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupButtonAnimations();
        this.setupInputAnimations();
        this.setupFormValidation();
        this.setupIconAnimations();
        this.setupToastSystem();
        this.setupProgressBars();
        this.setupLoadingStates();
    }
    
    // Button press animations with scale and shadow
    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.btn, .theme-toggle, .ripple');
        
        buttons.forEach(button => {
            // Enhanced ripple effect
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
            
            // Button press feedback
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = '';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }
    
    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;
        const rect = element.getBoundingClientRect();
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-effect');
        
        const ripple = element.getElementsByClassName('ripple-effect')[0];
        if (ripple) {
            ripple.remove();
        }
        
        element.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    // Input field focus with border glow
    setupInputAnimations() {
        // Create sample form for demonstration
        this.createSampleForm();
        
        const inputs = document.querySelectorAll('.input-field input, .input-field textarea');
        
        inputs.forEach(input => {
            // Enhanced focus effects
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
                this.animateLabel(input, true);
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                if (!input.value) {
                    this.animateLabel(input, false);
                }
            });
            
            // Real-time validation
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }
    
    animateLabel(input, isFocused) {
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            if (isFocused || input.value) {
                label.style.transform = 'translateY(-1.5rem) scale(0.85)';
                label.style.color = 'var(--accent-color)';
            } else {
                label.style.transform = '';
                label.style.color = '';
            }
        }
    }
    
    // Form validation with shake animation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(form);
            });
        });
    }
    
    validateInput(input) {
        const formGroup = input.closest('.input-field, .form-group');
        const value = input.value.trim();
        const type = input.type;
        
        let isValid = true;
        let message = '';
        
        // Basic validation rules
        if (input.required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
        
        this.updateValidationState(formGroup, isValid, message);
        return isValid;
    }
    
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            this.showToast('Form submitted successfully!', 'success');
        } else {
            this.showToast('Please fix the errors in the form', 'error');
        }
    }
    
    updateValidationState(formGroup, isValid, message) {
        if (!formGroup) return;
        
        formGroup.classList.remove('success', 'error');
        
        // Remove existing message
        const existingMessage = formGroup.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (isValid) {
            formGroup.classList.add('success');
        } else {
            formGroup.classList.add('error');
            
            // Add error message
            const messageEl = document.createElement('div');
            messageEl.className = 'validation-message';
            messageEl.textContent = message;
            messageEl.style.color = 'var(--error-color)';
            messageEl.style.fontSize = '0.8rem';
            messageEl.style.marginTop = '0.25rem';
            formGroup.appendChild(messageEl);
        }
    }
    
    // Icon spin on hover
    setupIconAnimations() {
        // Add classes to existing icons
        const icons = document.querySelectorAll('.brand-icon, .logo');
        icons.forEach(icon => {
            icon.classList.add('icon-bounce');
        });
        
        // Settings/gear icons
        const gearIcons = document.querySelectorAll('[data-icon="gear"], .gear-icon');
        gearIcons.forEach(icon => {
            icon.classList.add('icon-spin');
        });
    }
    
    // Toast notification system
    setupToastSystem() {
        // Create toast container
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getToastIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // Progress bar animations
    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const fill = progressBar.querySelector('.progress-fill');
                    const targetWidth = progressBar.dataset.progress || '75';
                    
                    setTimeout(() => {
                        fill.style.width = `${targetWidth}%`;
                    }, 200);
                }
            });
        });
        
        progressBars.forEach(bar => observer.observe(bar));
    }
    
    // Loading states
    setupLoadingStates() {
        // Add loading state to buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn[data-loading]')) {
                this.toggleLoadingState(e.target);
            }
        });
    }
    
    toggleLoadingState(button) {
        const isLoading = button.classList.contains('loading');
        
        if (!isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.innerHTML = '<span class="loading-dots"></span> Loading...';
            
            // Simulate loading
            setTimeout(() => {
                button.classList.remove('loading');
                button.disabled = false;
                button.innerHTML = button.dataset.originalText || 'Submit';
                this.showToast('Action completed!', 'success');
            }, 2000);
        }
    }
    
    // Create sample form for demonstration
    createSampleForm() {
        const existingForm = document.getElementById('sample-form');
        if (existingForm) return;
        
        const formHTML = `
            <form id="sample-form" style="max-width: 400px; margin: 2rem auto; padding: 2rem; background: var(--card-bg); border-radius: 12px; display: none;">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">Contact Form</h3>
                
                <div class="input-field">
                    <input type="text" id="name" required placeholder=" ">
                    <label for="name">Full Name</label>
                </div>
                
                <div class="input-field">
                    <input type="email" id="email" required placeholder=" ">
                    <label for="email">Email Address</label>
                </div>
                
                <div class="input-field">
                    <input type="tel" id="phone" placeholder=" ">
                    <label for="phone">Phone Number</label>
                </div>
                
                <div class="input-field">
                    <textarea id="message" rows="4" required placeholder=" "></textarea>
                    <label for="message">Message</label>
                </div>
                
                <button type="submit" class="btn" data-loading data-original-text="Send Message" style="width: 100%; margin-top: 1rem;">
                    Send Message
                </button>
            </form>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
    }
    
    // Utility functions
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidPhone(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
    }
}

// Additional CSS for ripple effect
const rippleStyles = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

// Inject styles
const style = document.createElement('style');
style.textContent = rippleStyles;
document.head.appendChild(style);

// Initialize micro-interactions
document.addEventListener('DOMContentLoaded', () => {
    new MicroInteractions();
});