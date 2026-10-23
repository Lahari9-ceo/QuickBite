const db = require('../config/db');

// In-memory fallback if database connection is not configured
const mockMenu = [
  {
    id: 1, category: 'Burgers', name: 'Classic Cheeseburger', description: 'Juicy beef patty with cheddar, lettuce, tomato, and special sauce.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    customizations: [{ name: 'Extra Cheese', price: 1.00 }, { name: 'Bacon Strip', price: 1.50 }, { name: 'Gluten Free Bun', price: 1.25 }]
  },
  {
    id: 2, category: 'Burgers', name: 'Spicy Crisp Chicken Burger', description: 'Crispy fried chicken breast topped with jalapeños and spicy mayo.', price: 9.49, image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500',
    customizations: [{ name: 'Extra Spicy Sauce', price: 0.50 }, { name: 'Add Pickle', price: 0.50 }]
  },
  {
    id: 3, category: 'Sides', name: 'Golden French Fries', description: 'Crispy skin-on french fries seasoned with sea salt.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
    customizations: [{ name: 'Large Size', price: 1.00 }, { name: 'Truffle Dip', price: 1.50 }]
  },
  {
    id: 4, category: 'Drinks', name: 'Craft Lemonade', description: 'Freshly squeezed lemonade with mint leaves.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500',
    customizations: [{ name: 'Less Ice', price: 0.00 }, { name: 'Add Peach Flavor', price: 0.75 }]
  }
];

exports.getMenu = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ success: true, source: 'mock', data: mockMenu });
    }
    const query = `
      SELECT m.id, m.name, m.description, m.price, m.image_url, m.customizations, c.name as category 
      FROM menu_items m 
      LEFT JOIN categories c ON m.category_id = c.id 
      WHERE m.is_available = true
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, source: 'db', data: rows });
  } catch (error) {
    console.warn('Database offline, serving fallback data:', error.message);
    res.json({ success: true, source: 'mock', data: mockMenu });
  }
};