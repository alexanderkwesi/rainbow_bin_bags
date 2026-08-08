// app.js - Storefront logic, cart actions, and LocalStorage data sync

document.addEventListener('DOMContentLoaded', () => {
    // 1. DATABASE SETUP
    const DB_KEY = 'rainbow_bags_db';
    
    // Seed data helper
    function getInitialDB() {
        return {
            products: [
                {
                    id: 1,
                    name: 'Eco-Green Mini Pedal Bin Liners',
                    size: 'Small (10L-15L)',
                    price: 4.99,
                    description: 'Perfect for bathrooms and bedrooms. Biodegradable, leak-proof, and features a light fresh lavender scent.',
                    stock: 150,
                    image_url: 'images/pedal_bin_liners.jpg',
                    sku: 'BB-S-10L',
                    capacity: '10 Litres',
                    dimensions: '40 x 46 cm',
                    pack_qty: '30 Liners'
                },
                {
                    id: 2,
                    name: 'Classic Drawstring Swing Bin Liners',
                    size: 'Medium (30L-50L)',
                    price: 7.99,
                    description: 'Ideal for standard kitchen swing bins. Features strong drawstring handles for quick tying and clean carrying.',
                    stock: 200,
                    image_url: 'images/swing_bin_liners.jpg',
                    sku: 'BB-M-30L',
                    capacity: '35 Litres',
                    dimensions: '60 x 74 cm',
                    pack_qty: '20 Liners'
                },
                {
                    id: 3,
                    name: 'Heavy-Duty Rainbow Refuse Sacks',
                    size: 'Medium (50L)',
                    price: 9.49,
                    description: 'Brighten up your clean-up! A pack containing vibrant bags in every color of the rainbow. Extra thick material.',
                    stock: 120,
                    image_url: 'images/rainbow_refuse_sacks.jpg',
                    sku: 'BB-R-50L',
                    capacity: '50 Litres',
                    dimensions: '60 x 85 cm',
                    pack_qty: '15 Sacks'
                },
                {
                    id: 4,
                    name: 'Super-Tough Heavy Refuse Sacks',
                    size: 'Large (70L-90L)',
                    price: 11.99,
                    description: 'Extra-thick construction for heavy kitchen refuse and garden waste. Tear-resistant, anti-puncture material.',
                    stock: 180,
                    image_url: 'images/heavy_refuse_sacks.jpg',
                    sku: 'BB-L-80L',
                    capacity: '80 Litres',
                    dimensions: '73 x 95 cm',
                    pack_qty: '10 Sacks'
                },
                {
                    id: 5,
                    name: 'Premium Giant Wheelie Bin Sacks',
                    size: 'Extra Large (120L-240L)',
                    price: 15.99,
                    description: 'Industrial strength liners built for standard outdoor wheelie bins. Prevents smells and keeps bins perfectly clean.',
                    stock: 90,
                    image_url: 'images/wheelie_bin_sacks.jpg',
                    sku: 'BB-XL-240L',
                    capacity: '240 Litres',
                    dimensions: '115 x 135 cm',
                    pack_qty: '5 Sacks'
                },
                {
                    id: 6,
                    name: 'UK Compostable Food Waste Caddy Liners',
                    size: 'Small (7L-10L)',
                    price: 3.99,
                    description: 'Approved by UK local authorities for food waste recycling. 100% compostable cornstarch material, fits kitchen caddies.',
                    stock: 250,
                    image_url: 'images/caddy_liners.jpg',
                    sku: 'BB-C-7L',
                    capacity: '7 Litres',
                    dimensions: '39 x 40 cm',
                    pack_qty: '50 Liners'
                },
                {
                    id: 7,
                    name: 'Heavy-Duty Garden Waste Sacks',
                    size: 'Large (120L)',
                    price: 12.99,
                    description: 'Super-thick puncture-resistant bags designed for heavy UK garden waste, soil, brambles, and hedge clippings.',
                    stock: 110,
                    image_url: 'images/garden_sacks.jpg',
                    sku: 'BB-G-120L',
                    capacity: '120 Litres',
                    dimensions: '80 x 100 cm',
                    pack_qty: '10 Sacks'
                }
            ],
            orders: [
                {
                    id: 1001,
                    customer_name: 'David Beckham',
                    customer_email: 'david@beckham.com',
                    customer_address: '77 Golden Ave, Manchester, M16 0RA',
                    total_amount: 33.47,
                    status: 'Paid',
                    created_at: '2026-08-07T12:30:00.000Z',
                    items: [
                        { product_id: 3, name: 'Heavy-Duty Rainbow Refuse Sacks', quantity: 2, price: 9.49 },
                        { product_id: 5, name: 'Premium Giant Wheelie Bin Sacks', quantity: 1, price: 15.99 }
                    ]
                },
                {
                    id: 1002,
                    customer_name: 'Emma Watson',
                    customer_email: 'emma@watson.co.uk',
                    customer_address: '12 Oxford Crescent, Oxford, OX1 3PT',
                    total_amount: 27.97,
                    status: 'Shipped',
                    created_at: '2026-08-08T09:15:00.000Z',
                    items: [
                        { product_id: 1, name: 'Eco-Green Mini Pedal Bin Liners', quantity: 4, price: 4.99 },
                        { product_id: 2, name: 'Classic Drawstring Swing Bin Liners', quantity: 1, price: 7.99 }
                    ]
                },
                {
                    id: 1003,
                    customer_name: 'Harry Potter',
                    customer_email: 'harry@wizard.com',
                    customer_address: '4 Privet Drive, Little Whinging, Surrey',
                    total_amount: 23.98,
                    status: 'Processing',
                    created_at: '2026-08-08T14:45:00.000Z',
                    items: [
                        { product_id: 4, name: 'Super-Tough Heavy Refuse Sacks', quantity: 2, price: 11.99 }
                    ]
                }
            ],
            messages: [
                {
                    id: 1,
                    name: 'Bruce Wayne',
                    email: 'bruce@waynecorp.com',
                    subject: 'Heavy duty testing queries',
                    message: 'Do you supply black heavy refuse sacks? I need something incredibly strong to clean up cave debris. Please let me know your wholesale rates for 500+ packs.',
                    status: 'Unread',
                    created_at: '2026-08-08T10:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'Clark Kent',
                    email: 'clark@dailyplanet.com',
                    subject: 'Eco-Friendly Inquiries',
                    message: 'I am writing an article about sustainable household items. Could you share some details about what makes your materials biodegradable?',
                    status: 'Read',
                    created_at: '2026-08-08T11:30:00.000Z'
                }
            ]
        };
    }

    // Initialize database in localStorage
    function initDatabase() {
        const existing = localStorage.getItem(DB_KEY);
        if (!existing || existing.includes('"image_url":"small_bag"') || !existing.includes('"capacity"')) {
            localStorage.setItem(DB_KEY, JSON.stringify(getInitialDB()));
        }
    }
    
    // Read from DB
    window.readDB = function() {
        initDatabase();
        return JSON.parse(localStorage.getItem(DB_KEY));
    };

    // Save to DB
    window.saveDB = function(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        // If there's an active dashboard open in another tab, this triggers updates,
        // and we can also update our local storefront catalog state.
    };

    // Reset Demo DB helper
    window.resetDatabaseDemo = function() {
        if (confirm('Are you sure you want to reset the database? This will restore defaults.')) {
            localStorage.removeItem(DB_KEY);
            initDatabase();
            location.reload();
        }
    };

    initDatabase();

    // 2. STATE & UI VARIABLES
    let db = readDB();
    let cart = JSON.parse(localStorage.getItem('rainbow_cart')) || [];
    
    // Elements
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountBadge = document.getElementById('cart-count');
    const cartSubtotalVal = document.getElementById('cart-subtotal-val');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
    
    const storefrontView = document.getElementById('storefront-view');
    const checkoutView = document.getElementById('checkout-view');
    const successView = document.getElementById('success-view');

    // 3. BAG SVG GENERATOR
    function getBagSvg(imageUrl) {
        let gradientId = 'grad-' + imageUrl;
        let stops = '';
        
        switch (imageUrl) {
            case 'small_bag':
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#9933ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#cc33ff;stop-opacity:1" />
                         </linearGradient>`;
                break;
            case 'medium_bag':
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#3399ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33cc66;stop-opacity:1" />
                         </linearGradient>`;
                break;
            case 'rainbow_bag':
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ff3366" />
                            <stop offset="25%" style="stop-color:#ffcc00" />
                            <stop offset="50%" style="stop-color:#33cc66" />
                            <stop offset="75%" style="stop-color:#3399ff" />
                            <stop offset="100%" style="stop-color:#cc33ff" />
                         </linearGradient>`;
                break;
            case 'large_bag':
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#475569;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
                         </linearGradient>`;
                break;
            case 'xlarge_bag':
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6633ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3366;stop-opacity:1" />
                         </linearGradient>`;
                break;
            default:
                stops = `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#cbd5e1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" />
                         </linearGradient>`;
        }
        
        return `<svg viewBox="0 0 100 120" class="bag-illustration">
            <defs>${stops}</defs>
            <path d="M15,35 Q20,110 50,115 Q80,110 85,35 C85,25 75,25 50,28 C25,25 15,25 15,35 Z" fill="url(#${gradientId})" />
            <path d="M22,33 Q50,38 78,33 Q82,22 75,18 Q50,22 25,18 Q18,22 22,33 Z" fill="rgba(255,255,255,0.2)" />
            <path d="M43,15 Q50,5 57,15 M38,16 Q50,0 62,16" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <path d="M50,28 Q80,110 85,35 Q83,75 50,115" fill="rgba(0,0,0,0.04)" />
        </svg>`;
    }

    // Helper to render product image (handles both image files and vector SVGs)
    function renderProductImageHTML(imageUrl, name) {
        if (imageUrl.includes('/') || imageUrl.includes('.')) {
            return `<img src="${imageUrl}" class="bag-image" alt="${name}">`;
        }
        return getBagSvg(imageUrl);
    }

    // Render Hero image
    const heroBagContainer = document.getElementById('hero-bag-container');
    if (heroBagContainer) {
        heroBagContainer.innerHTML = renderProductImageHTML('images/rainbow_refuse_sacks.jpg', 'Heavy-Duty Rainbow Refuse Sacks');
    }

    // 4. ROUTING / VIEW CONTROLLER
    window.showView = function(viewName) {
        // Hide all
        storefrontView.style.display = 'none';
        checkoutView.style.display = 'none';
        successView.style.display = 'none';
        
        // Show selected
        if (viewName === 'storefront') {
            storefrontView.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (viewName === 'checkout') {
            checkoutView.style.display = 'block';
            window.scrollTo({ top: 0 });
            initCheckoutPage();
        } else if (viewName === 'success') {
            successView.style.display = 'block';
            window.scrollTo({ top: 0 });
        }
        
        // Close cart if open
        if (cartDrawer) {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
    };

    // 5. TOAST NOTIFICATION
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 6. RENDER CATALOG PRODUCTS
    function renderCatalog() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        
        db = readDB(); // refresh state
        grid.innerHTML = '';
        
        db.products.forEach(p => {
            const category = classifyCategory(p.size);
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', category);
            
            const isOutOfStock = p.stock <= 0;
            const actionButton = isOutOfStock
                ? `<button class="btn btn-white btn-sm" style="opacity: 0.6; cursor: not-allowed;" disabled>Out of Stock</button>`
                : `<button class="btn btn-rainbow btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>`;
            
            card.innerHTML = `
                <span class="product-badge">${p.size}</span>
                <div class="product-image">
                    ${renderProductImageHTML(p.image_url, p.name)}
                </div>
                <div class="product-size">${p.sku}</div>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <div class="product-meta-specs">
                    <div>Capacity <strong>${p.capacity || 'N/A'}</strong></div>
                    <div>Dimensions <strong>${p.dimensions || 'N/A'}</strong></div>
                    <div>Pack Qty <strong>${p.pack_qty || '1 Roll'}</strong></div>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Stock remaining: ${p.stock} units</div>
                <div class="product-footer">
                    <div class="product-price">£${p.price.toFixed(2)}</div>
                    ${actionButton}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function classifyCategory(size) {
        const s = size.toLowerCase();
        if (s.includes('small') || s.includes('pedal')) return 'small';
        if (s.includes('medium') || s.includes('swing') || s.includes('kitchen')) return 'medium';
        if (s.includes('large') && !s.includes('extra')) return 'large';
        if (s.includes('extra large') || s.includes('xl') || s.includes('wheelie')) return 'xlarge';
        return 'other';
    }

    // Initialize catalog
    renderCatalog();

    // 7. PRODUCT FILTERS
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            const cards = document.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 8. CART DRAWER TOGGLE
    if (cartToggle && cartDrawer && cartOverlay) {
        cartToggle.addEventListener('click', () => {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        });

        const closeCart = () => {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        };

        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
    }

    // 9. CART SYSTEM ACTIONS
    window.addToCart = function(productId) {
        db = readDB();
        const p = db.products.find(item => item.id === productId);
        if (!p) return;

        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            if (cartItem.quantity + 1 > p.stock) {
                showToast(`Sorry, only ${p.stock} units are currently in stock.`);
                return;
            }
            cartItem.quantity += 1;
        } else {
            if (p.stock <= 0) {
                showToast(`Sorry, this product is out of stock.`);
                return;
            }
            cart.push({
                id: p.id,
                name: p.name,
                sku: p.sku,
                size: p.size,
                price: p.price,
                image_url: p.image_url,
                quantity: 1
            });
        }
        
        saveCartState();
        showToast(`Added ${p.name} to cart!`);
        
        // Open drawer
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        }
    };

    window.updateQty = function(id, delta) {
        const item = cart.find(i => i.id === id);
        if (item) {
            db = readDB();
            const p = db.products.find(prod => prod.id === id);
            
            if (delta > 0 && p && item.quantity + delta > p.stock) {
                showToast(`Sorry, only ${p.stock} units are in stock.`);
                return;
            }
            
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            saveCartState();
        }
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        saveCartState();
        showToast("Item removed from cart");
    };

    function saveCartState() {
        localStorage.setItem('rainbow_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        
        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; padding:3rem 0; color:var(--text-secondary);">
                    <p style="font-size:1.1rem; margin-bottom:1rem;">Your cart is empty</p>
                    <button onclick="document.getElementById('cart-close').click()" class="btn btn-rainbow btn-sm">Start Shopping</button>
                </div>
            `;
        } else {
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
                
                const el = document.createElement('div');
                el.className = 'cart-item';
                el.innerHTML = `
                    <div class="cart-item-img">
                        ${renderProductImageHTML(item.image_url, item.name)}
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-size">${item.size}</div>
                        <div class="cart-item-price">£${(item.price * item.quantity).toFixed(2)} <span style="font-size:0.75rem; font-weight:normal; color:var(--text-muted);">(${item.quantity} × £${item.price.toFixed(2)})</span></div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                `;
                cartItemsContainer.appendChild(el);
            });
        }

        if (cartCountBadge) cartCountBadge.textContent = totalItems;
        if (cartSubtotalVal) cartSubtotalVal.textContent = subtotal.toFixed(2);
        
        if (cartCheckoutBtn) {
            if (cart.length === 0) {
                cartCheckoutBtn.style.opacity = '0.5';
                cartCheckoutBtn.style.pointerEvents = 'none';
            } else {
                cartCheckoutBtn.style.opacity = '1';
                cartCheckoutBtn.style.pointerEvents = 'auto';
            }
        }
    }

    updateCartUI();

    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            showView('checkout');
        });
    }

    // 10. CHECKOUT INITIALIZER & LOGIC (PAYPAL SMART BUTTONS)
    function initCheckoutPage() {
        const list = document.getElementById('checkout-items-list');
        const subtotalSpan = document.getElementById('checkout-subtotal-val');
        const totalSpan = document.getElementById('checkout-total-val');
        
        if (!list || cart.length === 0) return;
        
        list.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const el = document.createElement('div');
            el.className = 'checkout-summary-item';
            el.innerHTML = `
                <div>
                    <h4 style="font-weight:600;">${item.name}</h4>
                    <p style="color:var(--text-muted); font-size:0.85rem;">Size: ${item.size} | Qty: ${item.quantity}</p>
                </div>
                <div style="font-weight:700;">£${itemTotal.toFixed(2)}</div>
            `;
            list.appendChild(el);
        });
        
        if (subtotalSpan) subtotalSpan.textContent = total.toFixed(2);
        if (totalSpan) totalSpan.textContent = total.toFixed(2);

        // Clear existing buttons to prevent stacking on multiple tab switches
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';

        // Initialize PayPal SDK Buttons
        paypal.Buttons({
            createOrder: function(data, actions) {
                db = readDB();
                
                // Double check stock levels before proceeding to PayPal payment
                let stockOk = true;
                cart.forEach(item => {
                    const p = db.products.find(prod => prod.id === item.id);
                    if (!p || p.stock < item.quantity) {
                        showToast(`Error: ${item.name} does not have enough stock remaining.`);
                        stockOk = false;
                    }
                });

                if (!stockOk) {
                    return actions.reject();
                }

                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2),
                            currency_code: 'GBP'
                        },
                        description: 'Rainbow Bags - Premium Refuse Liners Order'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    db = readDB();

                    const orderId = Math.floor(1000 + Math.random() * 9000); // 4-digit ID
                    const payer = details.payer;
                    const customerName = (payer.name.given_name || '') + ' ' + (payer.name.surname || '');
                    const customerEmail = payer.email_address || 'N/A';

                    // Parse Shipping Address from PayPal Transaction Details
                    let shipping = details.purchase_units[0].shipping;
                    let deliveryAddress = 'N/A';
                    if (shipping && shipping.address) {
                        const addr = shipping.address;
                        deliveryAddress = [
                            shipping.name ? shipping.name.full_name : '',
                            addr.address_line_1,
                            addr.address_line_2,
                            addr.admin_area_2,
                            addr.admin_area_1,
                            addr.postal_code,
                            addr.country_code
                        ].filter(Boolean).join(', ');
                    }

                    let orderTotal = 0;
                    const orderItems = cart.map(item => {
                        const itemTotal = item.price * item.quantity;
                        orderTotal += itemTotal;
                        
                        // Decrement stock
                        const p = db.products.find(prod => prod.id === item.id);
                        if (p) p.stock = Math.max(0, p.stock - item.quantity);
                        
                        return {
                            product_id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        };
                    });

                    // Build Order Object
                    const newOrder = {
                        id: orderId,
                        customer_name: customerName,
                        customer_email: customerEmail,
                        customer_address: deliveryAddress,
                        total_amount: parseFloat(orderTotal.toFixed(2)),
                        status: 'Paid',
                        created_at: new Date().toISOString(),
                        items: orderItems,
                        paypal_id: details.id // Store reference PayPal Transaction ID
                    };

                    // Add to database
                    db.orders.unshift(newOrder);
                    saveDB(db);

                    // Populate success page confirmation card details
                    populateSuccessDetails(newOrder);

                    // Clear Cart State
                    cart = [];
                    saveCartState();
                    renderCatalog();

                    // Navigate View
                    showView('success');
                    showToast("Order payment captured successfully!");
                });
            },
            onError: function(err) {
                console.error("PayPal Smart Button Error: ", err);
                showToast("An error occurred with PayPal checkout. Please try again.");
            }
        }).render('#paypal-button-container');
    }

    function populateSuccessDetails(order) {
        const info = document.getElementById('success-summary-info');
        const itemsList = document.getElementById('success-summary-items');
        const totalSpan = document.getElementById('success-total-val');
        
        if (info) {
            info.innerHTML = `
                <div>
                    <span style="color:var(--text-muted); display:block;">Order ID:</span>
                    <strong>#${order.id}</strong>
                </div>
                <div>
                    <span style="color:var(--text-muted); display:block;">Payment Status:</span>
                    <strong style="color:var(--rainbow-green);">SECURE DEMO PAID</strong>
                </div>
                <div>
                    <span style="color:var(--text-muted); display:block;">Customer Name:</span>
                    <strong>${order.customer_name}</strong>
                </div>
                <div>
                    <span style="color:var(--text-muted); display:block;">Email Address:</span>
                    <strong>${order.customer_email}</strong>
                </div>
                <div style="grid-column: span 2;">
                    <span style="color:var(--text-muted); display:block;">Shipping Address:</span>
                    <strong>${order.customer_address}</strong>
                </div>
            `;
        }
        
        if (itemsList) {
            itemsList.innerHTML = '';
            order.items.forEach(item => {
                const el = document.createElement('div');
                el.style.display = 'flex';
                el.style.justifyContent = 'space-between';
                el.style.fontSize = '0.95rem';
                el.innerHTML = `
                    <span>${item.name} × ${item.quantity}</span>
                    <strong>£${(item.price * item.quantity).toFixed(2)}</strong>
                `;
                itemsList.appendChild(el);
            });
        }
        
        if (totalSpan) {
            totalSpan.textContent = order.total_amount.toFixed(2);
        }
    }

    // 11. CONTACT FORM HANDLER
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;
            
            db = readDB();
            
            const newMsgId = db.messages.length > 0 ? Math.max(...db.messages.map(m => m.id)) + 1 : 1;
            const newMessage = {
                id: newMsgId,
                name: name,
                email: email,
                subject: subject,
                message: message,
                status: 'Unread',
                created_at: new Date().toISOString()
            };
            
            db.messages.unshift(newMessage);
            saveDB(db);
            
            showToast("Your message has been sent successfully!");
            contactForm.reset();
        });
    }
});
