// dashboard.js - Real-time statistics, Product CRUD, order editing, and support messages management

document.addEventListener('DOMContentLoaded', () => {
    const DB_KEY = 'rainbow_bags_db';

    // 1. REFRESH LOCAL STATE FROM DATABASE
    let db = JSON.parse(localStorage.getItem(DB_KEY));
    if (!db || localStorage.getItem(DB_KEY).includes('"image_url":"small_bag"')) {
        // If not loaded or legacy database version, redirect to storefront index so database initializes/updates
        window.location.href = 'index.html';
        return;
    }

    // 1.5 AUTHENTICATION CONTROL
    const loginScreen = document.getElementById('login-screen');
    const dashboardLayout = document.getElementById('dashboard-layout');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    function checkAuth() {
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            if (loginScreen) loginScreen.style.display = 'none';
            if (dashboardLayout) dashboardLayout.style.display = 'block';
            loadOverview();
        } else {
            if (loginScreen) loginScreen.style.display = 'flex';
            if (dashboardLayout) dashboardLayout.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();

            if (btoa(user) === 'YWRtaW4=' && btoa(pass) === 'MjQ4MkFsZXhhbmRlckFkbWluKg==') {
                sessionStorage.setItem('admin_logged_in', 'true');
                if (loginError) loginError.style.display = 'none';
                showToast("Welcome back, Admin!");
                checkAuth();
            } else {
                if (loginError) loginError.style.display = 'block';
                document.getElementById('login-password').value = '';
            }
        });
    }

    function saveState() {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    // Toast Notification helper
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Custom SVG helper to show tiny bag preview inside table
    function getBagThumbnail(imageUrl) {
        if (imageUrl.includes('/') || imageUrl.includes('.')) {
            return `<img src="${imageUrl}" style="width: 30px; height: 36px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); vertical-align: middle;">`;
        }
        let gradientId = 'thumb-' + imageUrl;
        let stops = '';
        
        switch (imageUrl) {
            case 'small_bag': stops = '<stop offset="0%" style="stop-color:#9933ff" /><stop offset="100%" style="stop-color:#cc33ff" />'; break;
            case 'medium_bag': stops = '<stop offset="0%" style="stop-color:#3399ff" /><stop offset="100%" style="stop-color:#33cc66" />'; break;
            case 'rainbow_bag': stops = '<stop offset="0%" style="stop-color:#ff3366" /><stop offset="50%" style="stop-color:#3399ff" /><stop offset="100%" style="stop-color:#cc33ff" />'; break;
            case 'large_bag': stops = '<stop offset="0%" style="stop-color:#475569" /><stop offset="100%" style="stop-color:#0f172a" />'; break;
            case 'xlarge_bag': stops = '<stop offset="0%" style="stop-color:#6633ff" /><stop offset="100%" style="stop-color:#ff3366" />'; break;
            default: stops = '<stop offset="0%" style="stop-color:#cbd5e1" /><stop offset="100%" style="stop-color:#94a3b8" />';
        }
        
        return `<svg viewBox="0 0 100 120" style="width: 30px; height: 36px; vertical-align: middle;">
            <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>
            </defs>
            <path d="M15,35 Q20,110 50,115 Q80,110 85,35 C85,25 75,25 50,28 C25,25 15,25 15,35 Z" fill="url(#${gradientId})" />
            <path d="M22,33 Q50,38 78,33 Q82,22 75,18 Q50,22 25,18 Q18,22 22,33 Z" fill="rgba(255,255,255,0.2)" />
        </svg>`;
    }

    // 2. TAB NAVIGATION CONTROLLER
    const navItems = document.querySelectorAll('.admin-sidebar .admin-nav-item');
    const tabViews = document.querySelectorAll('.tab-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-target');
            
            // Toggle sidebar active tab styling
            navItems.forEach(nav => nav.classList.remove('active-tab'));
            item.classList.add('active-tab');
            
            // Show target panel view
            tabViews.forEach(view => {
                if (view.id === `tab-${targetTab}`) {
                    view.style.display = 'block';
                } else {
                    view.style.display = 'none';
                }
            });

            // Trigger specific tab loading logic
            if (targetTab === 'overview') loadOverview();
            else if (targetTab === 'products') loadInventory();
            else if (targetTab === 'orders') loadOrders();
            else if (targetTab === 'messages') loadMessages();
        });
    });

    // 3. OVERVIEW TAB: SALES STATS & CSS CHARTS
    function loadOverview() {
        db = JSON.parse(localStorage.getItem(DB_KEY));

        let revenueSum = 0;
        let lowStockCount = 0;
        
        // Sum revenue of active paid/shipped/processing orders
        db.orders.forEach(order => {
            if (order.status !== 'Cancelled') {
                revenueSum += order.total_amount;
            }
        });

        // Count low stocks
        db.products.forEach(p => {
            if (p.stock < 10) lowStockCount++;
        });

        const ordersCount = db.orders.length;
        const aov = ordersCount > 0 ? (revenueSum / ordersCount) : 0;

        // Render Stats Boxes
        document.getElementById('stat-revenue').textContent = `£${revenueSum.toFixed(2)}`;
        document.getElementById('stat-orders').textContent = ordersCount;
        document.getElementById('stat-aov').textContent = `£${aov.toFixed(2)}`;
        document.getElementById('stat-lowstock').textContent = lowStockCount;

        // Render CSS Horizontal Bar Chart
        // Group and count item sales sizes
        const sizeSales = {
            'Small (Pedal)': 0,
            'Medium (Kitchen)': 0,
            'Rainbow Bags': 0,
            'Large (Sacks)': 0,
            'Extra Large (Wheelie)': 0
        };

        db.orders.forEach(order => {
            if (order.status !== 'Cancelled') {
                order.items.forEach(item => {
                    const name = item.name.toLowerCase();
                    if (name.includes('pedal') || name.includes('small')) {
                        sizeSales['Small (Pedal)'] += item.quantity;
                    } else if (name.includes('rainbow')) {
                        sizeSales['Rainbow Bags'] += item.quantity;
                    } else if (name.includes('kitchen') || name.includes('drawstring') || name.includes('swing')) {
                        sizeSales['Medium (Kitchen)'] += item.quantity;
                    } else if (name.includes('heavy') || name.includes('large refuse')) {
                        sizeSales['Large (Sacks)'] += item.quantity;
                    } else if (name.includes('wheelie') || name.includes('giant') || name.includes('xl')) {
                        sizeSales['Extra Large (Wheelie)'] += item.quantity;
                    }
                });
            }
        });

        const maxUnits = Math.max(...Object.values(sizeSales), 1); // Avoid division by zero
        const chartBarsContainer = document.getElementById('chart-bars');
        chartBarsContainer.innerHTML = '';

        const barClasses = {
            'Small (Pedal)': 'fill-small',
            'Medium (Kitchen)': 'fill-medium',
            'Rainbow Bags': 'fill-rainbow',
            'Large (Sacks)': 'fill-large',
            'Extra Large (Wheelie)': 'fill-xlarge'
        };

        for (const [size, units] of Object.entries(sizeSales)) {
            const percentage = (units / maxUnits) * 100;
            const barClass = barClasses[size];

            const barRow = document.createElement('div');
            barRow.className = 'chart-bar-row';
            barRow.innerHTML = `
                <div class="chart-label">${size}</div>
                <div class="chart-track">
                    <div class="chart-fill ${barClass}" style="width: ${percentage}%;"></div>
                </div>
                <div class="chart-value">${units} bags</div>
            `;
            chartBarsContainer.appendChild(barRow);
        }

        // Render Recent Orders Table (up to 5 recent)
        const recentOrdersContainer = document.getElementById('recent-orders-list');
        recentOrdersContainer.innerHTML = '';

        if (db.orders.length === 0) {
            recentOrdersContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No sales recorded yet.</td></tr>`;
        } else {
            db.orders.slice(0, 5).forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                const statusLower = order.status.toLowerCase();
                recentOrdersContainer.innerHTML += `
                    <tr>
                        <td><strong>#${order.id}</strong></td>
                        <td>${order.customer_name}</td>
                        <td>${date}</td>
                        <td><strong>£${order.total_amount.toFixed(2)}</strong></td>
                        <td><span class="status-badge ${statusLower}">${order.status}</span></td>
                    </tr>
                `;
            });
        }
    }

    checkAuth(); // verify session credentials on load

    // 4. INVENTORY TAB: READ & CRUD ACTIONS
    function loadInventory() {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const list = document.getElementById('inventory-list');
        list.innerHTML = '';

        db.products.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${getBagThumbnail(p.image_url)}</td>
                <td><strong>${p.name}</strong></td>
                <td><code>${p.sku}</code></td>
                <td>${p.size}</td>
                <td><strong>£${p.price.toFixed(2)}</strong></td>
                <td style="${p.stock < 10 ? 'color:var(--rainbow-red); font-weight:700;' : ''}">${p.stock} units</td>
                <td>
                    <button class="btn btn-white btn-sm" onclick="openEditProductModal(${p.id})" style="padding:0.3rem 0.6rem; margin-right:0.3rem;">Edit</button>
                    <button class="btn btn-white btn-sm" onclick="deleteProduct(${p.id})" style="padding:0.3rem 0.6rem; color:var(--rainbow-red);">Delete</button>
                </td>
            `;
            list.appendChild(row);
        });
    }

    // Modal Handlers
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');

    window.openAddProductModal = function() {
        document.getElementById('modal-title').textContent = 'Add New Product';
        productForm.reset();
        document.getElementById('prod-id').value = '';
        productModal.classList.add('active');
    };

    window.openEditProductModal = function(id) {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const p = db.products.find(prod => prod.id === id);
        if (!p) return;

        document.getElementById('modal-title').textContent = 'Edit Product Properties';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-sku').value = p.sku;
        document.getElementById('prod-size').value = p.size;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-stock').value = p.stock;
        document.getElementById('prod-capacity').value = p.capacity || '';
        document.getElementById('prod-dimensions').value = p.dimensions || '';
        document.getElementById('prod-pack-qty').value = p.pack_qty || '';
        document.getElementById('prod-image-url').value = p.image_url;
        document.getElementById('prod-desc').value = p.description;

        productModal.classList.add('active');
    };

    window.closeProductModal = function() {
        productModal.classList.remove('active');
    };

    // Save/Update CRUD Form handler
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            db = JSON.parse(localStorage.getItem(DB_KEY));
            
            const idVal = document.getElementById('prod-id').value;
            const name = document.getElementById('prod-name').value;
            const sku = document.getElementById('prod-sku').value;
            const size = document.getElementById('prod-size').value;
            const price = parseFloat(document.getElementById('prod-price').value);
            const stock = parseInt(document.getElementById('prod-stock').value);
            const capacity = document.getElementById('prod-capacity').value;
            const dimensions = document.getElementById('prod-dimensions').value;
            const packQty = document.getElementById('prod-pack-qty').value;
            const imageUrl = document.getElementById('prod-image-url').value;
            const desc = document.getElementById('prod-desc').value;

            // Check SKU uniqueness
            const skuCheck = db.products.find(prod => prod.sku === sku && prod.id != idVal);
            if (skuCheck) {
                alert(`Error: A product with SKU code "${sku}" already exists.`);
                return;
            }

            if (idVal) {
                // UPDATE EDIT RECORD
                const p = db.products.find(prod => prod.id == idVal);
                if (p) {
                    p.name = name;
                    p.sku = sku;
                    p.size = size;
                    p.price = price;
                    p.stock = stock;
                    p.capacity = capacity;
                    p.dimensions = dimensions;
                    p.pack_qty = packQty;
                    p.image_url = imageUrl;
                    p.description = desc;
                    showToast("Product updated successfully!");
                }
            } else {
                // INSERT NEW RECORD
                const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
                const newProd = {
                    id: newId,
                    name: name,
                    sku: sku,
                    size: size,
                    price: price,
                    stock: stock,
                    capacity: capacity,
                    dimensions: dimensions,
                    pack_qty: packQty,
                    image_url: imageUrl,
                    description: desc
                };
                db.products.push(newProd);
                showToast("New product added to inventory!");
            }

            saveState();
            closeProductModal();
            loadInventory();
        });
    }

    // Delete inventory item
    window.deleteProduct = function(id) {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const p = db.products.find(prod => prod.id === id);
        if (!p) return;

        if (confirm(`Are you sure you want to delete "${p.name}"? This removes it permanently.`)) {
            db.products = db.products.filter(prod => prod.id !== id);
            saveState();
            loadInventory();
            showToast("Product deleted successfully");
        }
    };

    // 5. ORDERS TAB: RENDER & STATUS UPDATES
    function loadOrders() {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const list = document.getElementById('orders-full-list');
        list.innerHTML = '';

        document.getElementById('orders-count-label').textContent = `${db.orders.length} total orders recorded`;

        if (db.orders.length === 0) {
            list.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:var(--text-secondary);">No orders recorded yet.</td></tr>`;
            return;
        }

        db.orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Format order item summaries
            let itemsSummary = '';
            order.items.forEach(item => {
                itemsSummary += `<div style="font-size:0.85rem; line-height:1.4;">${item.name} <strong>× ${item.quantity}</strong></div>`;
            });

            const statusLower = order.status.toLowerCase();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div style="font-weight:600;">${order.customer_name}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${order.customer_email}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${order.customer_address}">${order.customer_address}</div>
                </td>
                <td>${itemsSummary}</td>
                <td><strong>£${order.total_amount.toFixed(2)}</strong></td>
                <td><span style="font-size:0.85rem; color:var(--text-secondary);">${date}</span></td>
                <td>
                    <select class="select-status status-badge ${statusLower}" onchange="changeOrderStatus(${order.id}, this.value)">
                        <option value="Paid" ${order.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-white btn-sm" onclick="deleteOrder(${order.id})" style="padding:0.3rem 0.6rem; color:var(--rainbow-red);">Delete</button>
                </td>
            `;
            list.appendChild(row);
        });
    }

    // Change status from select box
    window.changeOrderStatus = function(orderId, newStatus) {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const order = db.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            saveState();
            loadOrders();
            showToast(`Order #${orderId} status updated to '${newStatus}'`);
        }
    };

    // Delete Order entry
    window.deleteOrder = function(orderId) {
        if (confirm(`Delete Order #${orderId} logs? This action is irreversible.`)) {
            db = JSON.parse(localStorage.getItem(DB_KEY));
            db.orders = db.orders.filter(o => o.id !== orderId);
            saveState();
            loadOrders();
            showToast("Order log entry deleted");
        }
    };

    // 6. SUPPORT MESSAGES TAB: RENDER & READER MODAL
    function loadMessages() {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const list = document.getElementById('messages-list');
        list.innerHTML = '';

        document.getElementById('messages-count-label').textContent = `${db.messages.length} customer support inquiries`;

        if (db.messages.length === 0) {
            list.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:3rem; color:var(--text-secondary);">No support queries found.</td></tr>`;
            return;
        }

        db.messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            const statusClass = msg.status.toLowerCase(); // unread or read
            const readStatusBadge = msg.status === 'Unread'
                ? `<span class="status-badge cancelled">UNREAD</span>`
                : `<span class="status-badge paid">READ</span>`;

            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <td onclick="openMessageReader(${msg.id})">${msg.id}</td>
                <td onclick="openMessageReader(${msg.id})">
                    <div style="font-weight:600;">${msg.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${msg.email}</div>
                </td>
                <td onclick="openMessageReader(${msg.id})"><strong>${msg.subject}</strong></td>
                <td onclick="openMessageReader(${msg.id})"><span style="font-size:0.85rem; color:var(--text-secondary);">${date}</span></td>
                <td onclick="openMessageReader(${msg.id})">${readStatusBadge}</td>
                <td>
                    <button class="btn btn-white btn-sm" onclick="deleteMessage(${msg.id})" style="padding:0.3rem 0.6rem; color:var(--rainbow-red);">Delete</button>
                </td>
            `;
            list.appendChild(row);
        });
    }

    const messageModal = document.getElementById('message-modal');

    window.openMessageReader = function(id) {
        db = JSON.parse(localStorage.getItem(DB_KEY));
        const msg = db.messages.find(m => m.id === id);
        if (!msg) return;

        // Update read status to Read in DB
        if (msg.status === 'Unread') {
            msg.status = 'Read';
            saveState();
            loadMessages();
        }

        const date = new Date(msg.created_at).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Set content
        document.getElementById('msg-modal-subject').textContent = msg.subject;
        document.getElementById('msg-modal-meta').innerHTML = `From: <strong>${msg.name}</strong> (${msg.email}) on ${date}`;
        document.getElementById('msg-modal-content').textContent = msg.message;

        messageModal.classList.add('active');
    };

    window.closeMessageModal = function() {
        messageModal.classList.remove('active');
    };

    window.deleteMessage = function(id) {
        if (confirm("Delete this customer support log?")) {
            db = JSON.parse(localStorage.getItem(DB_KEY));
            db.messages = db.messages.filter(m => m.id !== id);
            saveState();
            loadMessages();
            showToast("Message inquiry deleted");
        }
    };

    // Simulated Log Out
    window.logoutDemo = function() {
        showToast("Logging out admin session...");
        sessionStorage.removeItem('admin_logged_in');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };
});
