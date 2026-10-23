const db = require('../config/db');

exports.createOrder = async (req, res) => {
  const { items, total_amount, order_type, payment_method } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
  }

  const orderId = 'QB-' + Math.floor(100000 + Math.random() * 900000);

  try {
    if (process.env.DATABASE_URL) {
      const orderQuery = `
        INSERT INTO orders (restaurant_id, total_amount, status, payment_status, order_type)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `;
      const orderValues = [1, total_amount, 'preparing', 'paid', order_type || 'dine_in'];
      const { rows } = await db.query(orderQuery, orderValues);
      
      const dbOrderId = rows[0].id;
      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, selected_customizations)
           VALUES ($1, $2, $3, $4, $5)`,
          [dbOrderId, item.id, item.quantity, item.price, JSON.stringify(item.selectedCustomizations || [])]
        );
      }
    }

    // Return instant success acknowledgment for payment & order placement
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderNumber: orderId,
        total: total_amount,
        status: 'Preparing',
        paymentStatus: 'Paid',
        estimatedTime: '8-12 mins'
      }
    });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process order' });
  }
};