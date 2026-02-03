const products = [];

const categories = ['Laptops', 'Monitors', 'Accessories', 'Components'];
const brands = ['Nexus', 'Hyperion', 'Vertex', 'Titan', 'Omen', 'Zenith', 'Nova', 'Flux', 'Cyber', 'Quantum', 'Aero', 'Swift'];
const adjectives = ['Pro', 'Ultra', 'Elite', 'Stealth', 'Max', 'Prime', 'Core', 'Extreme', 'Lite', 'X', 'GT', 'RS'];

// Curated Unsplash Images (Same as frontend for consistency)
const images = {
    'Laptops': [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=60',
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=60',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=60',
        'https://images.unsplash.com/photo-1588872657578-a83a040b6dc0?w=500&q=60',
        'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=500&q=60',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=60',
        'https://images.unsplash.com/photo-1531297425163-4d00e12932a3?w=500&q=60'
    ],
    'Monitors': [
        'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=500&q=60',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=60',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=60',
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=60'
    ],
    'Accessories': [
        'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&q=60',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=60',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=60',
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=60',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=60',
        'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500&q=60'
    ],
    'Components': [
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=60',
        'https://images.unsplash.com/photo-1555616635-640960031050?w=500&q=60',
        'https://images.unsplash.com/photo-1587202372634-943afa940bd0?w=500&q=60',
        'https://images.unsplash.com/photo-1628557672230-ff444cca68c4?w=500&q=60',
        'https://images.unsplash.com/photo-1542393545-facac42e6793?w=500&q=60'
    ]
};

const generateInventory = (count = 50) => {
    const generated = [];
    for (let i = 0; i < count; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

        let noun = '';
        let priceBase = 0;

        if (cat === 'Laptops') {
            noun = ['Book', 'Blade', '15', '17', 'Air', 'Note'].sort(() => Math.random() - 0.5)[0];
            priceBase = 60000 + Math.random() * 100000;
        } else if (cat === 'Monitors') {
            noun = ['View', 'Vision', 'Display', 'X', 'OLED', 'Ultrawide'].sort(() => Math.random() - 0.5)[0];
            priceBase = 12000 + Math.random() * 40000;
        } else if (cat === 'Accessories') {
            noun = ['Mouse', 'Keypad', 'Headset', 'Audio', 'Click', 'Pad'].sort(() => Math.random() - 0.5)[0];
            priceBase = 800 + Math.random() * 8000;
        } else {
            noun = ['Card', 'Core', 'Ryzen', 'GeForce', 'Case', 'Drive'].sort(() => Math.random() - 0.5)[0];
            priceBase = 3000 + Math.random() * 80000;
        }

        const name = `${brand} ${noun} ${adj}`;
        const catImages = images[cat];
        const image = catImages[Math.floor(Math.random() * catImages.length)];

        generated.push({
            name: name,
            image: image,
            description: `Experience the power of the ${name}. Features premium build quality and top-tier performance for ${cat.toLowerCase()}.`,
            brand: brand,
            category: cat,
            price: Math.floor(priceBase),
            stock: Math.floor(Math.random() * 50) + 1,
            rating: 0,
            numReviews: 0,
        });
    }
    return generated;
};

module.exports = generateInventory(50); // Generate 50 items
