-- Initial Seed Data
INSERT INTO restaurants (name, location) VALUES ('QuickBite Express Kiosk', 'Main Concourse - Terminal 1');

INSERT INTO categories (restaurant_id, name) VALUES 
(1, 'Burgers'),
(1, 'Sides'),
(1, 'Drinks');

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, customizations) VALUES 
(1, 1, 'Classic Cheeseburger', 'Juicy beef patty with cheddar, lettuce, tomato, and special sauce.', 8.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 
  '[{"name": "Extra Cheese", "price": 1.00}, {"name": "Bacon Strip", "price": 1.50}, {"name": "Gluten Free Bun", "price": 1.25}]'),
(1, 1, 'Spicy Crisp Chicken Burger', 'Crispy fried chicken breast topped with jalapeños and spicy mayo.', 9.49, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', 
  '[{"name": "Extra Spicy Sauce", "price": 0.50}, {"name": "Add Pickle", "price": 0.50}]'),
(1, 2, 'Golden French Fries', 'Crispy skin-on french fries seasoned with sea salt.', 3.99, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', 
  '[{"name": "Large Size", "price": 1.00}, {"name": "Truffle Dip", "price": 1.50}]'),
(1, 3, 'Craft Lemonade', 'Freshly squeezed lemonade with mint leaves.', 2.99, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500', 
  '[{"name": "Less Ice", "price": 0.00}, {"name": "Add Peach Flavor", "price": 0.75}]');