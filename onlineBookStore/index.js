// ===== GLOBAL VARIABLES =====
let scrollTimeout;
let isPageTurning = false;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== MOCK BOOK DATA =====
const books = [
    { id: 1, title: 'Data Structure Using C and C++', price: 10, author: 'Technical Author', rating: 4.8 },
    { id: 2, title: 'Digital Electronics', price: 15, author: 'Electronics Expert', rating: 4.6 },
    { id: 3, title: 'Discrete Mathematics', price: 20, author: 'Math Professor', rating: 4.9 },
    { id: 4, title: 'Adventure Awaits', price: 24.99, author: 'John Adventure', rating: 4.9 },
    { id: 5, title: 'Mystery of Time', price: 19.99, author: 'Sarah Mystery', rating: 4.7 },
    { id: 6, title: 'Love & Poetry', price: 16.99, author: 'Emma Poet', rating: 5.0 }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        openDoors();
    }, 2000);

    // Initialize all functionality
    initializeScrollAnimations();
    setupIntersectionObserver();
    setupNavigation();
    setupForms();
    updateCart();
    setupLibraryBooks();
    
    // Initial state
    updateAnimations();
}

// ===== LOADING AND DOORS =====
function openDoors() {
    setTimeout(() => {
        document.querySelector('.wooden-doors').classList.add('doors-open');
    }, 500);
}

// ===== SCROLL ANIMATIONS =====
function initializeScrollAnimations() {
    window.addEventListener('scroll', throttle(handleScroll, 16)); // ~60fps
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function handleScroll() {
    updateScrollProgress();
    updateAnimations();
    updateNavigation();
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Add page turning effect during scroll
    if (!isPageTurning) {
        triggerPageTurningEffect();
    }
    
    // Reset page turning effect after scroll stops
    scrollTimeout = setTimeout(() => {
        resetPageTurningEffect();
        isPageTurning = false;
    }, 150);
}

function updateScrollProgress() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollProgress = (scrollY / (documentHeight - windowHeight)) * 100;
    
    document.getElementById('progressBar').style.width = scrollProgress + '%';
}

function updateAnimations() {
    const scrollY = window.scrollY;
    
    // Hide scroll indicator when scrolling starts
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollY > 100) {
        scrollIndicator.classList.add('hidden');
    } else {
        scrollIndicator.classList.remove('hidden');
    }
    
    // Show library books when scrolling
    const libraryBooks = document.querySelectorAll('.library-books-left, .library-books-right');
    if (scrollY > 200) {
        libraryBooks.forEach(books => books.classList.add('library-books-visible'));
    } else {
        libraryBooks.forEach(books => books.classList.remove('library-books-visible'));
    }
}

function triggerPageTurningEffect() {
    isPageTurning = true;
    
    // Add page turn effect to sections
    const sections = document.querySelectorAll('.page-section, .featured-section, .features-section');
    sections.forEach(section => {
        section.style.transform = 'rotateY(1deg)';
        section.style.transition = 'transform 0.3s ease';
    });
}

function resetPageTurningEffect() {
    const sections = document.querySelectorAll('.page-section, .featured-section, .features-section');
    sections.forEach(section => {
        section.style.transform = 'rotateY(0deg)';
    });
}

// ===== INTERSECTION OBSERVER =====
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== NAVIGATION =====
function setupNavigation() {
    const nav = document.getElementById('mainNav');
    
    // Show navigation after doors open
    setTimeout(() => {
        nav.classList.add('visible');
    }, 3000);
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function updateNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70; // Account for fixed nav
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// ===== CART FUNCTIONALITY =====
function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const existingItem = cart.find(item => item.id === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...book,
            quantity: 1,
            issueDate: new Date(),
            returnDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    
    // Show success message
    showNotification(`${book.title} added to cart!`, 'success');
}

function removeFromCart(bookId) {
    const cartItem = cart.find(item => item.id === bookId);
    if (cartItem) {
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== bookId);
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const cartCountElement = document.getElementById('cartCount');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; opacity: 0.3; margin-bottom: 20px;"></i>
                <p style="font-size: 1.2rem; opacity: 0.7;">Your cart is empty</p>
                <button class="btn btn-primary" onclick="scrollToSection('catalogue')" style="margin-top: 20px;">
                    <i class="fas fa-book-open"></i> Browse Books
                </button>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'book-card';
            cartItem.style.margin = '20px auto';
            cartItem.innerHTML = `
                <div style="padding: 20px;">
                    <h3>${item.title}</h3>
                    <p class="author">By ${item.author}</p>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Issue Date: ${new Date(item.issueDate).toLocaleDateString()}</p>
                    <p>Return Date: ${new Date(item.returnDate).toLocaleDateString()}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-small" onclick="removeFromCart(${item.id})" style="margin-right: 10px;">
                            <i class="fas fa-minus"></i> Remove
                        </button>
                        <button class="btn btn-primary btn-small" onclick="addToCart(${item.id})">
                            <i class="fas fa-plus"></i> Add More
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            totalPrice += item.price * item.quantity;
        });
    }
    
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
    
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Proceeding to checkout! Total: $${totalPrice.toFixed(2)}`, 'success');
    
    // Clear cart after checkout
    setTimeout(() => {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }, 2000);
}

// ===== FORMS =====
function setupForms() {
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Contact form submitted:', data);
            showNotification('Your message has been sent successfully!', 'success');
            this.reset();
        });
    }
    
    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            if (data.password !== data['confirm-password']) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            console.log('Registration:', data);
            showNotification('Registration successful! Welcome to Literary Haven!', 'success');
            this.reset();
        });
    }
    
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Login attempt:', data);
            showNotification('Login successful! Welcome back!', 'success');
            this.reset();
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const button = newsletterForm.querySelector('button');
        const input = newsletterForm.querySelector('input');
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (input.value) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                input.value = '';
            }
        });
    }
}

// ===== LIBRARY BOOKS ANIMATION =====
function setupLibraryBooks() {
    const libraryBooks = document.querySelectorAll('.library-book');
    
    libraryBooks.forEach((book, index) => {
        book.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) rotate(5deg) scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        book.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0px) rotate(0deg) scale(1)';
        });
    });
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
           style="margin-right: 10px;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== UTILITY FUNCTIONS =====
function browseBooks() {
    scrollToSection('catalogue');
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // ESC key to close notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
    
    // Ctrl/Cmd + K to focus search (if we had a search feature)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Could implement search functionality here
    }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateAnimations();
    }, 250);
});

// Preload critical images
function preloadImages() {
    const imageUrls = ['book1.jpg', 'Ds.jpg', 'De.jpg', 'Dstl.jpg'];
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize image preloading
preloadImages();

// ===== ACCESSIBILITY IMPROVEMENTS =====
// Add focus management for keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    document.documentElement.style.setProperty('--animation-iteration-count', '1');
}