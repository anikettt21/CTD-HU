/**
 * data.js
 * Handles all interactions with localStorage.
 * Acts as a simulated database layer.
 */

const PRODUCTS_KEY = 'products';
const USERS_KEY = 'users';
const ORDERS_KEY = 'orders';
const REPAIRS_KEY = 'repairs'; // [ {id, customerName, device, issue, status, cost, date} ]
const WISHLIST_KEY = 'wishlist'; // Store as { userId: [productId, productId...] } or plain list if single user demo
const REVIEWS_KEY = 'reviews'; // [ {productId, userId, userName, rating, comment, date} ]
const CURRENT_USER_KEY = 'currentUser';

// --- INITIALIZATION ---

// Migrating to Version 2 to force update for the new 50 products
const DATA_VERSION = 2;
const CURRENT_VERSION_KEY = 'data_version';

function initData() {
    // Check Data Version
    const storedVersion = localStorage.getItem(CURRENT_VERSION_KEY);
    if (!storedVersion || parseInt(storedVersion) < DATA_VERSION) {
        console.log("New data version detected. meaningful update required.");
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([])); // Clear products to force re-seed
        localStorage.setItem(CURRENT_VERSION_KEY, DATA_VERSION);
    }

    // Check if we need to seed data
    const existing = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];

    // Seed Data if empty
    if (existing.length === 0) {
        console.log("Seeding initial inventory...");
        const newProducts = generateInventory(50);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
        // Update in-memory existing for this run? No need as reload usually handles it, 
        // but for immediate use on this very page load if any:
        // existing.push(...newProducts); 
    }

    // Seed Admin User if empty
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
            {
                id: 1,
                name: "Admin User",
                email: "admin@shop.com",
                password: "admin123", // Plain text as requested for demo
                role: "admin"
            },
            {
                id: 2,
                name: "John Doe",
                email: "user@shop.com",
                password: "user123",
                role: "user"
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(REPAIRS_KEY)) {
        localStorage.setItem(REPAIRS_KEY, JSON.stringify([]));
    }
}

// --- PRODUCT GENERATOR ---
// Check for currency migration (Simple heuristic: if laptops are cheap (< 5000), convert to INR)
// (Currency migration logic removed)


// --- PRODUCT GENERATOR ---
function generateInventory(count) {
    // High-quality, realistic product data
    // We will generate exactly 'count' items (or as many as we can if our realistic unique combinations run out, though we can randomize stock/ids)

    const laptops = [
        { name: 'MacBook Air M3', category: 'Laptops', price: 114900, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=60' },
        { name: 'Dell XPS 13 Plus', category: 'Laptops', price: 159990, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=60' },
        { name: 'HP Spectre x360', category: 'Laptops', price: 139999, image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=500&q=60' },
        { name: 'Lenovo Legion 5 Pro', category: 'Laptops', price: 129000, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=60' },
        { name: 'ASUS ROG Zephyrus G14', category: 'Laptops', price: 145000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=60' },
        { name: 'Acer Predator Helios', category: 'Laptops', price: 119999, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=60' },
        { name: 'MSI Raider GE76', category: 'Laptops', price: 220000, image: 'https://images.unsplash.com/photo-1588872657578-a83a040b6dc0?w=500&q=60' },
        { name: 'Razer Blade 15', category: 'Laptops', price: 249999, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=60' },
        { name: 'Samsung Galaxy Book3 Pro', category: 'Laptops', price: 109990, image: 'https://images.unsplash.com/photo-1531297425163-4d00e12932a3?w=500&q=60' },
        { name: 'Microsoft Surface Laptop 5', category: 'Laptops', price: 99999, image: 'https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?w=500&q=60' },
        { name: 'HP Pavilion 15', category: 'Laptops', price: 65000, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=60' },
        { name: 'Dell Alienware m15', category: 'Laptops', price: 185000, image: 'https://images.unsplash.com/photo-1596796929949-c19bbce22009?w=500&q=60' }
    ];

    const monitors = [
        { name: 'LG UltraGear 27"', category: 'Monitors', price: 27000, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=60' },
        { name: 'Dell UltraSharp 32"', category: 'Monitors', price: 65000, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=60' },
        { name: 'Samsung Odyssey G9', category: 'Monitors', price: 115000, image: 'https://images.unsplash.com/photo-1632349142838-89c565d0a64b?w=500&q=60' },
        { name: 'BenQ EW3270U 4K', category: 'Monitors', price: 32000, image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500&q=60' },
        { name: 'ASUS TUF Gaming VG27', category: 'Monitors', price: 21999, image: 'https://images.unsplash.com/photo-1587302912306-cf1ed9c33146?w=500&q=60' },
        { name: 'MSI Optix MAG241C', category: 'Monitors', price: 16999, image: 'https://images.unsplash.com/photo-1627384114006-f4b9d7d2d838?w=500&q=60' },
        { name: 'Gigabyte AORUS FO48U', category: 'Monitors', price: 89000, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=60' },
        { name: 'Acer Nitro VG240Y', category: 'Monitors', price: 12500, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500&q=60' }
    ];

    const accessories = [
        { name: 'Logitech MX Master 3S', category: 'Accessories', price: 9995, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=60' },
        { name: 'Razer DeathAdder V3', category: 'Accessories', price: 6500, image: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500&q=60' },
        { name: 'Keychron K2 Mechanical', category: 'Accessories', price: 7999, image: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&q=60' },
        { name: 'HyperX Cloud II', category: 'Accessories', price: 8500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=60' },
        { name: 'Sony WH-1000XM5', category: 'Accessories', price: 29990, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=60' },
        { name: 'Corsair K70 RGB', category: 'Accessories', price: 14000, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=60' },
        { name: 'Logitech C920 Webcam', category: 'Accessories', price: 6495, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=60' },
        { name: 'Blue Yeti Microphone', category: 'Accessories', price: 10999, image: 'https://images.unsplash.com/photo-1588697920150-188981442c58?w=500&q=60' },
        { name: 'Elgato Stream Deck', category: 'Accessories', price: 13999, image: 'https://images.unsplash.com/photo-1614725350352-8706d863c0dc?w=500&q=60' },
        { name: 'SteelSeries Apex Pro', category: 'Accessories', price: 18999, image: 'https://images.unsplash.com/photo-1554158804-d57be76cb17c?w=500&q=60' }
    ];

    const components = [
        { name: 'NVIDIA RTX 4090', category: 'Components', price: 155000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=60' },
        { name: 'AMD Ryzen 9 7950X', category: 'Components', price: 54999, image: 'https://images.unsplash.com/photo-1555616635-640960031050?w=500&q=60' },
        { name: 'Intel Core i9-14900K', category: 'Components', price: 58999, image: 'https://images.unsplash.com/photo-1555616635-640960031050?w=500&q=60' },
        { name: 'Samsung 990 Pro 2TB', category: 'Components', price: 18500, image: 'https://images.unsplash.com/photo-1628557672230-ff444cca68c4?w=500&q=60' },
        { name: 'Corsair Vengeance 32GB', category: 'Components', price: 9500, image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=60' },
        { name: 'ASUS ROG Strix Z790', category: 'Components', price: 38000, image: 'https://images.unsplash.com/photo-1542393545-facac42e6793?w=500&q=60' },
        { name: 'NZXT H9 Flow Case', category: 'Components', price: 14500, image: 'https://images.unsplash.com/photo-1587202372634-943afa940bd0?w=500&q=60' },
        { name: 'Noctua NH-D15', category: 'Components', price: 8500, image: 'https://images.unsplash.com/photo-1584992663964-b873af9c8da6?w=500&q=60' },
        { name: 'Corsair RM850x PSU', category: 'Components', price: 11500, image: 'https://images.unsplash.com/photo-1618760200889-13824ed2177c?w=500&q=60' },
        { name: 'Lian Li O11 Dynamic', category: 'Components', price: 13000, image: 'https://images.unsplash.com/photo-1647427847953-29479bbaa1c4?w=500&q=60' }
    ];

    const sourceProducts = [...laptops, ...monitors, ...accessories, ...components];

    // We want 50 items. sourceProducts is 40. We will duplicate some with slight name variations or just repeat to hit 50.
    // Or we can just just accept 40 if the user is okay with "approx 50" or valid 50. 
    // Let's create variations to reach 50 perfectly.

    const extraItems = [
        { name: 'MSI Gaming Mouse', category: 'Accessories', price: 2500, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=60' },
        { name: 'Razer Kraken Kit', category: 'Accessories', price: 5500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=60' },
        { name: 'Dell 24" Monitor SE', category: 'Monitors', price: 10500, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500&q=60' },
        { name: 'Kingston Fury 16GB', category: 'Components', price: 4500, image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=60' },
        { name: 'WD Blue 1TB SSD', category: 'Components', price: 6000, image: 'https://images.unsplash.com/photo-1628557672230-ff444cca68c4?w=500&q=60' },
        { name: 'Lenovo Ideapad', category: 'Laptops', price: 45000, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=60' },
        { name: 'Asus Vivobook', category: 'Laptops', price: 52000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=60' },
        { name: 'Logitech G Pro', category: 'Accessories', price: 9000, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=60' },
        { name: 'Blue Snowball', category: 'Accessories', price: 4500, image: 'https://images.unsplash.com/photo-1588697920150-188981442c58?w=500&q=60' },
        { name: 'NZXT Kraken Cooler', category: 'Components', price: 12000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=60' }
    ];

    const allTemplates = [...sourceProducts, ...extraItems]; // 40 + 10 = 50. Perfect.

    const products = [];
    const baseId = Date.now();

    for (let i = 0; i < allTemplates.length; i++) {
        const t = allTemplates[i];
        products.push({
            id: baseId + i,
            name: t.name,
            category: t.category,
            price: t.price,
            stock: Math.floor(Math.random() * 40) + 5,
            image: t.image,
            description: `The ${t.name} is a top-tier choice for ${t.category.toLowerCase()} enthusiasts. Features excellent build quality, high performance, and reliable durability. Perfect for your setup.`
        });
    }

    return products;
}

// Call init on load
initData();

// --- PRODUCT OPERATIONS ---

function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
}

function getProductById(id) {
    const products = getProducts();
    // Use == to match string/number id differences
    return products.find(p => p.id == id);
}

function saveProduct(product) {
    let products = getProducts();
    if (product.id) {
        // Edit existing
        const index = products.findIndex(p => p.id == product.id);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Add new
        product.id = Date.now(); // Simple ID generation
        products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(p => p.id != id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getTotalStock() {
    const products = getProducts();
    return products.reduce((total, p) => total + (parseInt(p.stock) || 0), 0);
}

// --- USER OPERATIONS ---

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return { success: false, message: "Email already exists." };
    }
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: "user"
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, user: newUser };
}

function authenticateUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
}

function updateUserProfile(updatedUser) {
    let users = getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email); // Assume email matches
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser }; // Merge
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        // Also update session
        setCurrentUser(users[index]);
        return true;
    }
    return false;
}

// --- ORDER OPERATIONS ---

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function placeOrder(order) {
    const orders = getOrders();
    const products = getProducts(); // Need to update stock

    // 1. Validate Stock
    for (const item of order.items) {
        // Skip stock check for Services (Repair jobs)
        if (item.id.toString().startsWith('REPAIR-')) {
            continue;
        }

        const product = products.find(p => p.id == item.id);
        if (!product || product.stock < item.quantity) {
            // In a real app we would error here, but for now we assume validation happened in UI
            // or partial fulfillment. We'll just skip decrementing if invalid to be safe.
            continue;
        }
        product.stock -= item.quantity;
    }

    // 2. Save updated products
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    // 3. Save Order
    order.id = Date.now();
    order.date = new Date().toLocaleString();
    order.status = "Pending";
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
}

function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id == orderId);
    if (order) {
        order.status = status;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
}

function cancelOrder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id == orderId);
    if (order && order.status === 'Pending') {
        order.status = 'Cancelled';
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        return true;
    }
    return false;
}

// --- WISHLIST OPERATIONS ---

function getWishlist() {
    // In a multi-user app, this should be keyed by User ID.
    // For this demo, we'll store a simple object: { "user_email": [id1, id2] }
    const store = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || {};
    const user = getCurrentUser();
    if (!user) return []; // No wishlist for guests
    return store[user.email] || [];
}

function toggleWishlist(productId) {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please login to use Wishlist", "info");
        return false;
    }

    const store = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || {};
    let list = store[user.email] || [];

    const index = list.indexOf(productId);
    let added = false;
    if (index === -1) {
        list.push(productId);
        added = true;
    } else {
        list.splice(index, 1);
        added = false;
    }

    store[user.email] = list;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(store));
    return added; // Return status for UI update
}

function isInWishlist(productId) {
    const list = getWishlist();
    return list.includes(productId);
}

// --- REVIEWS OPERATIONS ---

function getReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    return allReviews.filter(r => r.productId == productId);
}

function addReview(review) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    review.id = Date.now();
    review.date = new Date().toLocaleDateString();
    allReviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    return review;
}

// --- REPAIR OPERATIONS ---

function getRepairs() {
    return JSON.parse(localStorage.getItem(REPAIRS_KEY)) || [];
}

function getRepairById(id) {
    const repairs = getRepairs();
    return repairs.find(r => r.id == id);
}

function addRepair(repair) {
    const repairs = getRepairs();
    repair.id = Date.now();
    repair.date = new Date().toLocaleString();
    if (!repair.status) repair.status = 'Pending';
    repairs.push(repair);
    localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
    return repair;
}

function updateRepairStatus(id, newStatus) {
    const repairs = getRepairs();
    const repair = repairs.find(r => r.id == id);
    if (repair) {
        repair.status = newStatus;
        localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
        return true;
    }
    return false;
}

function deleteRepair(id) {
    let repairs = getRepairs();
    repairs = repairs.filter(r => r.id != id);
    localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
}

function markRepairAsBilled(id) {
    const repairs = getRepairs();
    const repair = repairs.find(r => r.id == id);
    if (repair) {
        repair.isBilled = true;
        repair.status = 'Repaired'; // Auto-move to Repaired if not already, or maybe Delivered? Let's leave status alone or set to Delivered? 
        // User didn't specify status change, just read-only. But usually billing means it's done. 
        // Let's just set isBilled = true.
        localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
    }
}

// --- UI UTILITIES (TOAST) ---

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, 3000);
}
