/**
 * admin.js
 * Logic for the Admin Panel pages.
 */

// Check Auth on all admin pages except login
if (!window.location.pathname.includes('admin-login.html')) {
    requireAdmin();
}

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on based on body ID or existing elements
    if (document.getElementById('login-form')) {
        setupLogin();
    }
    if (document.getElementById('dashboard-stats')) {
        loadDashboard();
        loadSalesChart();
    }
    if (document.getElementById('products-table')) {
        loadProductsTable();
        const searchInput = document.getElementById('search-products');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => loadProductsTable(e.target.value));
        }
        const stockFilter = document.getElementById('show-out-of-stock');
        if (stockFilter) {
            stockFilter.addEventListener('change', () => {
                const term = document.getElementById('search-products').value;
                loadProductsTable(term);
            });
        }
        const maxStockInput = document.getElementById('filter-stock');
        if (maxStockInput) {
            maxStockInput.addEventListener('input', () => {
                const term = document.getElementById('search-products').value;
                loadProductsTable(term);
            });
        }
    }
    if (document.getElementById('add-product-form')) {
        setupProductForm();
    }
    if (document.getElementById('orders-table')) {
        loadOrdersTable();

        const refreshOrders = () => loadOrdersTable();

        const searchInput = document.getElementById('search-orders');
        if (searchInput) searchInput.addEventListener('input', refreshOrders);

        const periodInput = document.getElementById('filter-period');
        if (periodInput) periodInput.addEventListener('change', refreshOrders);

        const dateInput = document.getElementById('filter-date');
        if (dateInput) dateInput.addEventListener('change', refreshOrders);
    }
    if (document.getElementById('repairs-table')) {
        loadRepairsTable();
        const searchInput = document.getElementById('search-repairs');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => loadRepairsTable(e.target.value));
        }
    }
    if (document.getElementById('add-repair-form')) {
        setupRepairForm();
    }
    if (document.getElementById('bill-table')) {
        setupBillingSystem();
    }
    if (document.getElementById('bill-history-table')) {
        loadBillHistoryTable();
        const searchInput = document.getElementById('search-bill-history');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => loadBillHistoryTable(e.target.value));
        }
    }

    // Logout listener
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

function setupLogin() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const user = authenticateUser(email, password);

        if (user && user.role === 'admin') {
            setCurrentUser(user);
            window.location.href = 'dashboard.html';
        } else {
            showToast('Invalid credentials or not an admin.', 'error');
        }
    });
}

function loadDashboard() {
    const products = getProducts();
    const orders = getOrders();
    const users = getUsers();
    const repairs = getRepairs();



    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-users').textContent = users.length; // Optional


    // New Stats
    document.getElementById('total-stock').textContent = getTotalStock();

    // Active = Pending or Diagnosing
    const activeCount = repairs.filter(r => ['Pending', 'Diagnosing'].includes(r.status)).length;
    document.getElementById('active-repairs').textContent = activeCount;

    // Repaired = Repaired
    const repairedCount = repairs.filter(r => r.status === 'Repaired').length;
    document.getElementById('repaired-items').textContent = repairedCount;
}

function loadSalesChart() {
    const orders = getOrders();
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Group orders by Status for a Pie/Doughnut Chart
    const statusCounts = { 'Pending': 0, 'Packed': 0, 'Shipped': 0, 'Delivered': 0, 'Cancelled': 0 };
    orders.forEach(o => {
        if (statusCounts[o.status] !== undefined) {
            statusCounts[o.status]++;
        }
    });

    // Check if we have any data
    const totalOrders = orders.length;
    if (totalOrders === 0) {
        // Display a "No Data" message
        const container = document.getElementById('salesChart').parentElement;
        container.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#999;">No order data available for chart.</div>';
        return;
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: '# of Orders',
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#f1c40f', // Pending
                    '#3498db', // Packed
                    '#9b59b6', // Shipped
                    '#2ecc71', // Delivered
                    '#e74c3c'  // Cancelled
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// --- PRODUCTS MANAGEMENT ---

function loadProductsTable(searchTerm = '') {
    const products = getProducts();
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';

    const showOutOfStock = document.getElementById('show-out-of-stock') ? document.getElementById('show-out-of-stock').checked : false;
    const maxStockVal = document.getElementById('filter-stock') ? document.getElementById('filter-stock').value : '';

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStock = true;
        if (showOutOfStock) {
            matchesStock = matchesStock && parseInt(p.stock) === 0;
        }
        if (maxStockVal !== '') {
            matchesStock = matchesStock && parseInt(p.stock) <= parseInt(maxStockVal);
        }

        return matchesSearch && matchesStock;
    });

    filtered.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" style="width:50px;height:50px;object-fit:cover;"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price.toLocaleString('en-IN')}</td>
            <td>${product.stock}</td>
            <td>
                <a href="add-product.html?id=${product.id}" class="btn btn-secondary action-btn">Edit</a>
                <button onclick="deleteProductHandler(${product.id})" class="btn btn-danger action-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Make globally available for onclick
window.deleteProductHandler = function (id) {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
        loadProductsTable(); // Refresh
    }
};

function setupProductForm() {
    const form = document.getElementById('add-product-form');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        // Edit Mode
        document.getElementById('form-title').textContent = 'Edit Product';
        document.getElementById('submit-btn').textContent = 'Update Product';
        const product = getProductById(productId);
        if (product) {
            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('category').value = product.category;
            document.getElementById('stock').value = product.stock;
            document.getElementById('image').value = product.image;
            document.getElementById('description').value = product.description;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newProduct = {
            id: productId ? productId : null, // handle existing ID
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            category: document.getElementById('category').value,
            stock: parseInt(document.getElementById('stock').value),
            image: document.getElementById('image').value,
            description: document.getElementById('description').value
        };

        saveProduct(newProduct);
        showToast('Product saved successfully!', 'success');
        setTimeout(() => window.location.href = 'manage-products.html', 1500);
    });
}

// --- ORDERS MANAGEMENT ---

function loadOrdersTable() {
    // Read filter values from DOM
    const searchTerm = document.getElementById('search-orders') ? document.getElementById('search-orders').value.toLowerCase() : '';
    const period = document.getElementById('filter-period') ? document.getElementById('filter-period').value : 'all';
    const specificDate = document.getElementById('filter-date') ? document.getElementById('filter-date').value : ''; // YYYY-MM-DD

    const orders = getOrders();
    // Sort by date new to old
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';

    const filtered = orders.filter(o => {
        // 1. Text Search
        const matchesSearch = o.id.toString().includes(searchTerm) ||
            (o.userId && o.userId.toString().toLowerCase().includes(searchTerm)) ||
            (o.customerName && o.customerName.toLowerCase().includes(searchTerm));
        if (!matchesSearch) return false;

        // Date Parsing
        const orderDate = new Date(o.date);
        const now = new Date();

        // 2. Specific Date Filter
        if (specificDate) {
            // specificDate is YYYY-MM-DD
            // orderDateStr needs to be comparable. 
            // order.date is "M/D/YYYY, H:MM:SS PM" or similar locale string from new Date().toLocaleString()
            // Let's rely on date objects matching on Day/Month/Year
            const checkDate = new Date(specificDate);
            if (orderDate.getDate() !== checkDate.getDate() ||
                orderDate.getMonth() !== checkDate.getMonth() ||
                orderDate.getFullYear() !== checkDate.getFullYear()) {
                return false;
            }
        }

        // 3. Period Filter
        if (period !== 'all' && !specificDate) { // Period specific logic only if no specific date
            if (period === '24h') {
                const oneDay = 24 * 60 * 60 * 1000;
                if (now - orderDate > oneDay) return false;
            } else if (period === 'this-month') {
                if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
            } else if (period === 'last-month') {
                const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                if (orderDate.getMonth() !== lastMonthDate.getMonth() || orderDate.getFullYear() !== lastMonthDate.getFullYear()) return false;
            }
        }

        return true;
    });

    filtered.forEach(order => {
        const tr = document.createElement('tr');

        // Resolve User Details
        let userDataStr = `User #${order.userId}`;
        const users = getUsers(); // from data.js
        if (order.customerName) {
            // POS Order or Checkout with Name
            userDataStr = `${order.customerName}`;
            if (order.userId && order.userId.startsWith('POS-')) {
                userDataStr += ` <span class="badge badge-success" style="font-size:0.8em;">POS</span>`;
            }
        } else {
            // Try to find by ID or Email
            const user = users.find(u => u.id == order.userId || u.email == order.userId);
            if (user) {
                userDataStr = `<strong>${user.name}</strong><br><small>${user.email}</small>`;
            } else {
                userDataStr = `<small>${order.userId}</small>`; // Fallback to showing ID/Email
            }
        }

        // Status and Actions Logic
        let statusHtml = '';
        let actionHtml = '';

        if (order.status === 'Cancelled' || order.status === 'Refunded') {
            // Cancelled State
            statusHtml = `<span class="badge badge-danger">${order.status}</span>`;
        } else if (order.status === 'Delivered') {
            // Delivered State (Read Only)
            statusHtml = `<span class="badge badge-success">Delivered</span>`;
        } else {
            // Active State
            // Dropdown (exclude Cancelled/Delivered from manual selection mostly, or keep partial)
            // User requested "one delivered button", implying quick action.
            const statusOptions = ['Pending', 'Packed', 'Shipped']
                .map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`)
                .join('');

            statusHtml = `
                <select onchange="updateStatusHandler(${order.id}, this.value)" style="padding:5px; border:1px solid #ddd; border-radius:4px;">
                    ${statusOptions}
                </select>
             `;

            actionHtml = `<button onclick="updateStatusHandler(${order.id}, 'Delivered')" class="btn btn-success action-btn" style="font-size:0.8rem;">Mark Delivered</button>`;
        }

        // Always include View Details
        actionHtml += ` <button onclick="viewOrderDetails(${order.id})" class="btn btn-secondary action-btn" style="font-size:0.8rem;">Details</button>`;

        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${userDataStr}</td> 
            <td>${order.date}</td>
            <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
            <td>
                ${statusHtml}
            </td>
            <td>
                ${actionHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateStatusHandler = function (id, newStatus) {
    updateOrderStatus(id, newStatus);
    showToast(`Order #${id} status updated to ${newStatus}`, 'info');
    loadOrdersTable(); // Refresh UI to update buttons
}



window.viewOrderDetails = function (id) {
    const orders = getOrders();
    const order = orders.find(o => o.id == id);
    if (order) {
        const modal = document.getElementById('order-modal');
        const listContainer = document.getElementById('modal-items-list');

        if (modal && listContainer) {
            // Get User Details for Modal
            let userDetailsHtml = '';

            // 1. Check for specific Shipping Address (Checkout Order)
            if (order.shippingAddress) {
                // Format: "Address | Contact | Notes" (approx)
                const parts = order.shippingAddress.split('|');
                const addressPart = parts[0] ? parts[0].trim() : 'N/A';
                const contactPart = parts[1] ? parts[1].trim() : '';
                const notesPart = parts[2] ? parts[2].trim() : '';

                // Try to find user for name if not in order
                let nameDisplay = order.customerName || 'Guest';
                if (!order.customerName) {
                    const users = getUsers();
                    const user = users.find(u => u.id == order.userId || u.email == order.userId);
                    if (user) nameDisplay = user.name;
                    else if (order.userId) nameDisplay = order.userId;
                }

                userDetailsHtml = `
                    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #eee;">
                        <h4 style="margin-top:0; border-bottom:1px solid #ddd; padding-bottom:5px;">Order Details</h4>
                        <p style="margin: 5px 0;"><strong>Customer:</strong> ${nameDisplay}</p>
                        <p style="margin: 5px 0;"><strong>Shipping Address:</strong><br>${addressPart}</p>
                        <p style="margin: 5px 0;"><strong>Contact:</strong> ${contactPart}</p>
                        ${notesPart ? `<p style="margin: 10px 0 0 0; color: #d35400; font-size: 0.9em;"><strong>${notesPart}</strong></p>` : ''}
                    </div>
                `;

            } else if (order.customerName) {
                // POS Order
                userDetailsHtml = `<p><strong>Customer:</strong> ${order.customerName} (POS/Walk-in)</p>`;
            } else {
                // Fallback to User Profile
                const users = getUsers();
                const user = users.find(u => u.id == order.userId || u.email == order.userId);
                if (user) {
                    userDetailsHtml = `
                        <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #eee;">
                            <h4 style="margin-top:0;">Customer Details (Profile)</h4>
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                            ${user.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phone}</p>` : ''}
                            ${user.address ? `<p style="margin: 5px 0;"><strong>Address:</strong><br>${user.address}</p>` : ''}
                        </div>
                    `;
                } else {
                    userDetailsHtml = `<p><strong>User ID:</strong> ${order.userId} (Details not found)</p>`;
                }
            }

            const itemsHtml = order.items.map(i => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <a href="../product.html?id=${i.id}&from_admin=true" target="_blank" style="font-weight: 600; color: var(--primary-color); text-decoration: underline;">
                            ${i.name} <i class="fa-solid fa-external-link-alt" style="font-size: 0.8em;"></i>
                        </a>
                        <span style="color: #666; font-size: 0.9em; margin-left: 10px;">(Category: ${i.category || 'N/A'})</span>
                    </div>
                    <span>x${i.quantity}</span>
                </div>
            `).join('');

            listContainer.innerHTML = userDetailsHtml + '<h4 style="margin-bottom:10px;">Items</h4>' + itemsHtml;

            modal.style.display = 'block';

            // Close when clicking outside
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        } else {
            // Fallback
            const itemsList = order.items.map(i => `${i.name} (x${i.quantity})`).join('\n');
            alert(`Order Items:\n${itemsList}`);
        }
    }
}

// --- REPAIRS MANAGEMENT ---

function loadRepairsTable(searchTerm = '') {
    const repairs = getRepairs();
    // Sort by date new to old
    repairs.sort((a, b) => b.id - a.id);

    const tbody = document.querySelector('#repairs-table tbody');
    tbody.innerHTML = '';

    const filtered = repairs.filter(r =>
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    filtered.forEach(repair => {
        const tr = document.createElement('tr');

        let statusHtml = '';
        let actionsHtml = '';

        if (repair.isBilled) {
            // Read-only view
            statusHtml = `<span class="badge badge-success" style="padding: 5px 10px; background: #e8f5e9; color: #2e7d32; border-radius: 4px;">${repair.status} (Billed)</span>`;

            actionsHtml = `
                <button class="btn btn-secondary action-btn" disabled style="opacity: 0.5; cursor: not-allowed;">Edit</button>
                <button class="btn btn-success action-btn" disabled style="opacity: 0.5; cursor: not-allowed;">Billed</button>
                <button class="btn btn-danger action-btn" disabled style="opacity: 0.5; cursor: not-allowed;">Delete</button>
            `;
        } else {
            // Editable view
            const statusOptions = ['Pending', 'Diagnosing', 'Repaired', 'Delivered', 'Cancelled']
                .map(s => `<option value="${s}" ${repair.status === s ? 'selected' : ''}>${s}</option>`)
                .join('');

            statusHtml = `
                <select onchange="updateRepairStatusHandler(${repair.id}, this.value)" style="padding:5px;">
                    ${statusOptions}
                </select>
            `;

            actionsHtml = `
                <a href="add-repair.html?id=${repair.id}" class="btn btn-secondary action-btn">Edit</a>
                <a href="billing.html?repairId=${repair.id}" class="btn btn-success action-btn">Bill</a>
                <button onclick="deleteRepairHandler(${repair.id})" class="btn btn-danger action-btn">Delete</button>
            `;
        }

        tr.innerHTML = `
            <td>${repair.id}</td>
            <td>${repair.customerName}</td>
            <td>${repair.device}</td>
            <td>${repair.issue}</td>
            <td>${statusHtml}</td>
            <td>₹${parseInt(repair.cost).toLocaleString('en-IN')}</td>
            <td>${actionsHtml}</td>
        `;

        tbody.appendChild(tr);
    });
}

function setupRepairForm() {
    const form = document.getElementById('add-repair-form');
    const urlParams = new URLSearchParams(window.location.search);
    const repairId = urlParams.get('id');

    if (repairId) {
        // Edit Mode
        document.getElementById('repair-form-title').textContent = 'Edit Repair Job';
        document.getElementById('repair-submit-btn').textContent = 'Update Job';

        const repairs = getRepairs();
        const repair = repairs.find(r => r.id == repairId);

        if (repair) {
            document.getElementById('customerName').value = repair.customerName;
            document.getElementById('device').value = repair.device;
            document.getElementById('issue').value = repair.issue;
            document.getElementById('cost').value = repair.cost;
            document.getElementById('status').value = repair.status;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const repairData = {
            id: repairId ? repairId : null,
            customerName: document.getElementById('customerName').value,
            device: document.getElementById('device').value,
            issue: document.getElementById('issue').value,
            cost: parseFloat(document.getElementById('cost').value),
            status: document.getElementById('status').value
        };

        if (repairId) {
            let repairs = getRepairs();
            const index = repairs.findIndex(r => r.id == repairId);
            if (index !== -1) {
                repairs[index] = { ...repairs[index], ...repairData, id: parseInt(repairId) };
                localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
            }
        } else {
            addRepair(repairData);
        }

        showToast('Repair job saved!', 'success');
        setTimeout(() => window.location.href = 'manage-repairs.html', 1500);
    });
}

window.deleteRepairHandler = function (id) {
    if (confirm('Delete this repair job?')) {
        deleteRepair(id);
        loadRepairsTable();
    }
}






// --- BILLING SYSTEM (POS) ---

let currentBill = [];
let selectedBillProductId = null; // Track selected product

function setupBillingSystem() {
    const products = getProducts();
    const searchInput = document.getElementById('bill-product-search');
    const resultsContainer = document.getElementById('product-search-results');
    const selectedContainer = document.getElementById('selected-product-container');
    const selectedNameEl = document.getElementById('selected-product-name');
    const stockDisplay = document.getElementById('product-stock-display');
    const addBtn = document.getElementById('add-to-bill-btn');

    // Check for Repair ID from URL (Bill a Repair Job)
    const urlParams = new URLSearchParams(window.location.search);
    const repairId = urlParams.get('repairId');

    if (repairId) {
        const repair = getRepairs().find(r => r.id == repairId);
        if (repair) {
            // Pre-fill Customer Name
            const customerInput = document.getElementById('bill-customer-name');
            if (customerInput) customerInput.value = repair.customerName;

            // Create a Service Item for the Repair
            const serviceItem = {
                id: `REPAIR-${repair.id}`,
                name: `Repair Service: ${repair.device} (${repair.issue})`,
                price: repair.cost,
                quantity: 1,
                category: 'Service'
            };

            // Add to current bill immediately
            currentBill.push(serviceItem);
            renderBill();
            showToast('Repair job added to bill!', 'success');

            // Clean URL
            window.history.replaceState({}, document.title, "billing.html");
        }
    }

    // Remove the old select element logic since we removed it from HTML
    // But we need to handle the search input now as the primary driver

    function renderResults(items) {
        resultsContainer.innerHTML = '';
        if (items.length === 0) {
            resultsContainer.innerHTML = '<div style="padding:10px; color:#666;">No products found.</div>';
            resultsContainer.style.display = 'block';
            return;
        }

        items.forEach(p => {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid #eee';
            div.style.cursor = 'pointer';
            div.style.transition = 'background 0.2s';

            // Hover effect
            div.onmouseover = () => div.style.background = '#f9f9f9';
            div.onmouseout = () => div.style.background = 'white';

            const stockInfo = p.stock < 5 ? `<span style="color:red; font-weight:bold; font-size:0.8em; margin-left:5px;">[LOW: ${p.stock}]</span>` : '';
            div.innerHTML = `<strong>${p.name}</strong> - ₹${p.price.toLocaleString('en-IN')}${stockInfo}`;

            div.onclick = () => selectProduct(p);
            resultsContainer.appendChild(div);
        });
        resultsContainer.style.display = 'block';
    }

    function selectProduct(product) {
        selectedBillProductId = product.id;
        selectedNameEl.textContent = product.name;
        stockDisplay.textContent = `Price: ₹${product.price} | Available Stock: ${product.stock}`;

        selectedContainer.style.display = 'block';
        resultsContainer.style.display = 'none'; // Hide results
        searchInput.value = ''; // Clear search

        // Enable Add Button
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
        addBtn.style.cursor = 'pointer';

        // Focus Quantity
        document.getElementById('bill-quantity').focus();
    }

    // Search Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (term.length === 0) {
                resultsContainer.style.display = 'none';
                return;
            }
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
            renderResults(filtered);
        });

        // Hide results if clicking outside (simple implementation)
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    // Add Button
    addBtn.addEventListener('click', () => {
        if (!selectedBillProductId) {
            showToast('Please select a product.', 'error');
            return;
        }
        const customerInput = document.getElementById('bill-customer-name');
        if (!customerInput.value.trim()) {
            showToast('Please enter Customer Name first.', 'error');
            customerInput.focus();
            return;
        }

        const qty = parseInt(document.getElementById('bill-quantity').value);
        const product = getProductById(selectedBillProductId);

        if (qty < 1) {
            showToast('Invalid quantity.', 'error');
            return;
        }

        // Stock Check
        if (product.stock < qty) {
            showToast(`Not enough stock! Available: ${product.stock}`, 'error');
            return;
        }

        // Check if already in bill
        const existing = currentBill.find(item => item.id == product.id);
        if (existing) {
            if (product.stock < existing.quantity + qty) {
                showToast(`Not enough stock to add more!`, 'error');
                return;
            }
            existing.quantity += qty;
        } else {
            currentBill.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: qty,
                category: product.category
            });
        }

        renderBill();

        // Reset Selection
        selectedBillProductId = null;
        selectedContainer.style.display = 'none';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
        addBtn.style.cursor = 'not-allowed';
        document.getElementById('bill-quantity').value = 1;
        searchInput.focus();
    });

    // Generate Bill Button
    document.getElementById('generate-bill-btn').addEventListener('click', () => {
        if (currentBill.length === 0) {
            showToast('Bill is empty!', 'error');
            return;
        }

        // Check if bill implies stock deduction (exclude Services/Repairs)
        const hasPhysicalItems = currentBill.some(item => !item.id.toString().startsWith('REPAIR-') && item.category !== 'Service');

        const confirmMsg = hasPhysicalItems
            ? "Are you sure you want to generate this bill? This will deduct stock."
            : "Are you sure you want to generate this bill?";

        if (!confirm(confirmMsg)) {
            return;
        }

        const customerInput = document.getElementById('bill-customer-name');
        const customerName = customerInput.value.trim();

        if (!customerName) {
            showToast('Customer Name is required!', 'error');
            customerInput.focus();
            return;
        }
        const total = currentBill.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = {
            userId: 'POS-' + Date.now().toString().slice(-4), // Fake User ID for POS
            items: currentBill,
            totalAmount: total,
            status: 'Delivered', // Immediate delivery
            payment: 'Cash/Offline',
            customerName: customerName // New field for POS orders
        };

        // Place Order (Deducts Stock)
        placeOrder(order);

        // Mark any repairs in the bill as billed
        currentBill.forEach(item => {
            if (item.id.toString().startsWith('REPAIR-')) {
                const repairId = item.id.split('-')[1];
                markRepairAsBilled(repairId);
            }
        });

        // Show Modal / Print
        showBillModal(order);
    });

    // Clear Button
    document.getElementById('clear-bill-btn').addEventListener('click', () => {
        currentBill = [];
        renderBill();
        // Reset selection too
        selectedBillProductId = null;
        selectedContainer.style.display = 'none';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
    });
}

function renderBill() {
    const tbody = document.querySelector('#bill-table tbody');
    tbody.innerHTML = '';
    let total = 0;

    currentBill.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>${item.quantity}</td>
            <td>₹${itemTotal}</td>
            <td><button onclick="removeFromBill(${index})" class="btn btn-danger action-btn" style="padding: 2px 5px;">x</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('bill-grand-total').textContent = total.toLocaleString('en-IN');
}

window.removeFromBill = function (index) {
    currentBill.splice(index, 1);
    renderBill();
}

function showBillModal(order) {
    const modal = document.getElementById('bill-modal');
    modal.style.display = 'block';

    document.getElementById('print-date').textContent = new Date().toLocaleString();
    document.getElementById('print-order-id').textContent = order.id;
    document.getElementById('print-customer-name').textContent = order.customerName || 'Walk-in';
    document.getElementById('print-total').textContent = order.totalAmount.toLocaleString('en-IN');

    const itemsContainer = document.getElementById('print-items');
    itemsContainer.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left;">Item</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Price</th>
            </tr>
            ${order.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

// --- BILL HISTORY ---

function loadBillHistoryTable(searchTerm = '') {
    const orders = getOrders();
    // Filter for POS orders only (userId starts with POS-)
    let posOrders = orders.filter(o => o.userId && o.userId.toString().startsWith('POS-'));

    // Sort by date new to old
    posOrders.sort((a, b) => b.id - a.id);

    const tbody = document.querySelector('#bill-history-table tbody');
    tbody.innerHTML = '';

    // Search Filter
    if (searchTerm) {
        posOrders = posOrders.filter(o =>
            o.id.toString().includes(searchTerm) ||
            (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    posOrders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.date || new Date().toLocaleDateString()}</td>
            <td>${order.customerName || 'Walk-in'}</td>
            <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
            <td>${order.items.length}</td>
            <td>
                <button onclick="viewOrderDetails(${order.id})" class="btn btn-secondary action-btn">View Details</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
