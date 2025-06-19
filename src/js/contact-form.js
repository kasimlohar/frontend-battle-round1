class ContactForm {
    constructor(formElement) {
        this.form = formElement;
        this.fields = {
            name: { required: true, minLength: 2 },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            message: { required: true, minLength: 10 }
        };
        this.isSubmitting = false;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createValidationElements();
        this.setupLoadingButton();
    }
    
    setupEventListeners() {
        // Real-time validation on input
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('focus', () => this.clearFieldError(input));
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    createValidationElements() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            // Create validation icons if they don't exist
            if (!group.querySelector('.validation-icon')) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'validation-icon';
                iconContainer.innerHTML = `
                    <span class="success-icon">✓</span>
                    <span class="error-icon">✗</span>
                `;
                group.appendChild(iconContainer);
            }
        });
    }
    
    setupLoadingButton() {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn && !submitBtn.dataset.originalText) {
            submitBtn.dataset.originalText = submitBtn.textContent;
        }
    }
    
    validateField(input) {
        const fieldName = input.name;
        const fieldConfig = this.fields[fieldName];
        const formGroup = input.closest('.form-group');
        const value = input.value.trim();
        
        if (!fieldConfig || !formGroup) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (fieldConfig.required && !value) {
            isValid = false;
            errorMessage = `${this.capitalizeFirst(fieldName)} is required`;
        }
        // Min length validation
        else if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
            isValid = false;
            errorMessage = `${this.capitalizeFirst(fieldName)} must be at least ${fieldConfig.minLength} characters`;
        }
        // Pattern validation (email)
        else if (fieldConfig.pattern && value && !fieldConfig.pattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        this.updateFieldState(formGroup, isValid, errorMessage);
        return isValid;
    }
    
    updateFieldState(formGroup, isValid, errorMessage = '') {
        const input = formGroup.querySelector('input, textarea');
        const validationIcon = formGroup.querySelector('.validation-icon');
        const validationMessage = formGroup.querySelector('.validation-message');
        
        // Remove existing states
        formGroup.classList.remove('success', 'error', 'shake');
        
        if (isValid && input.value.trim()) {
            formGroup.classList.add('success');
            this.showValidationIcon(validationIcon, 'success');
        } else if (!isValid) {
            formGroup.classList.add('error');
            this.showValidationIcon(validationIcon, 'error');
            
            // Add shake animation
            formGroup.classList.add('shake');
            setTimeout(() => formGroup.classList.remove('shake'), 500);
        } else {
            this.hideValidationIcon(validationIcon);
        }
        
        // Update validation message
        this.updateValidationMessage(formGroup, errorMessage);
    }
    
    showValidationIcon(iconContainer, type) {
        if (!iconContainer) return;
        
        const successIcon = iconContainer.querySelector('.success-icon');
        const errorIcon = iconContainer.querySelector('.error-icon');
        
        if (type === 'success') {
            successIcon.style.display = 'inline';
            errorIcon.style.display = 'none';
            iconContainer.style.opacity = '1';
            
            // Add bounce animation
            successIcon.style.animation = 'bounceIn 0.5s ease';
        } else {
            successIcon.style.display = 'none';
            errorIcon.style.display = 'inline';
            iconContainer.style.opacity = '1';
            
            // Add shake animation
            errorIcon.style.animation = 'shake 0.5s ease';
        }
    }
    
    hideValidationIcon(iconContainer) {
        if (iconContainer) {
            iconContainer.style.opacity = '0';
        }
    }
    
    updateValidationMessage(formGroup, message) {
        let messageEl = formGroup.querySelector('.validation-message');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'validation-message';
            formGroup.appendChild(messageEl);
        }
        
        if (message) {
            messageEl.textContent = message;
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        } else {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-10px)';
        }
    }
    
    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup && formGroup.classList.contains('error')) {
            formGroup.classList.remove('error', 'shake');
            this.updateValidationMessage(formGroup, '');
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Start submission process
        this.isSubmitting = true;
        this.setLoadingState(true);
        
        try {
            // Simulate API call
            await this.simulateSubmission();
            
            // Success handling
            this.handleSubmissionSuccess();
        } catch (error) {
            // Error handling
            this.handleSubmissionError(error);
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(isLoading) {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (!submitBtn) return;
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="loading-spinner"></span>
                Sending...
            `;
            submitBtn.classList.add('loading');
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Send Message';
            submitBtn.classList.remove('loading');
        }
    }
    
    async simulateSubmission() {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (90% chance)
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error occurred'));
                }
            }, 2000);
        });
    }
    
    handleSubmissionSuccess() {
        // Clear form
        this.form.reset();
        
        // Clear validation states
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('success', 'error');
            this.hideValidationIcon(group.querySelector('.validation-icon'));
            this.updateValidationMessage(group, '');
        });
        
        // Show success message
        this.showSuccessMessage();
        
        // Trigger confetti animation
        this.triggerConfetti();
        
        // Show success toast
        this.showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    }
    
    handleSubmissionError(error) {
        console.error('Form submission error:', error);
        this.showToast('Failed to send message. Please try again.', 'error');
    }
    
    showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <div class="success-icon-large">✓</div>
            <h3>Message Sent Successfully!</h3>
            <p>Thank you for your message. We'll get back to you within 24 hours.</p>
        `;
        
        // Insert after form
        this.form.parentNode.insertBefore(successMessage, this.form.nextSibling);
        
        // Animate in
        setTimeout(() => successMessage.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
            setTimeout(() => successMessage.remove(), 500);
        }, 5000);
    }
    
    triggerConfetti() {
        // Create confetti particles
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 6000);
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Auto-initialize contact forms
document.addEventListener('DOMContentLoaded', () => {
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(form => {
        new ContactForm(form);
    });
});
