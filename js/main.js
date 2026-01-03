// Shopping Cart
let cart = JSON.parse(localStorage.getItem('dulce_aroma_cart')) || [];

// DOM Elements
const cartCount = document.querySelector('.cart-count');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav') && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Toggle aria-expanded for accessibility
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle body scroll lock
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    
    // Animate hamburger to X
    const spans = navToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset hamburger icon
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
    
    navToggle.setAttribute('aria-expanded', 'false');
}

// Cart Functions
function addItem(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`¡${name} agregado al carrito!`);
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function changeQty(id, delta) {
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += delta;
        
        if (item.quantity <= 0) {
            removeItem(id);
            return;
        }
        
        updateCart();
    }
}

function updateCart() {
    // Save to localStorage
    localStorage.setItem('dulce_aroma_cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // If on cart page, re-render cart
    if (document.querySelector('.cart-page')) {
        renderCart();
    }
}

function updateCartCount() {
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function renderCart() {
    const cartContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    const emptyCart = document.querySelector('.empty-cart');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    // Clear existing items
    cartContainer.innerHTML = '';
    
    // Add each item to the cart
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="price">$${item.price.toFixed(2)} c/u</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                <span class="qty">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-total">
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
        
        cartContainer.appendChild(itemElement);
    });
    
    // Update total
    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Hide empty cart message if items exist
    if (emptyCart) {
        emptyCart.style.display = 'none';
    }
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCart();
        
        const emptyCart = document.querySelector('.empty-cart');
        if (emptyCart) {
            emptyCart.style.display = 'block';
        }
    }
}

function checkout() {
    // In a real app, this would redirect to a checkout page
    alert('¡Gracias por tu compra! Serás redirigido al pago.');
    // window.location.href = '/checkout.html';
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger reflow
    notification.offsetHeight;
    
    // Add show class
    notification.classList.add('show');
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: #4CAF50;
        color: white;
        padding: 15px 30px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Expose functions to global scope for HTML onclick handlers
window.addItem = addItem;
window.removeItem = removeItem;
window.changeQty = changeQty;
window.clearCart = clearCart;
window.checkout = checkout;
window.renderCart = renderCart;
