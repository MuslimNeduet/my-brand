import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  imageUrl: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['created', 'paid', 'cancelled'], default: 'created' },
    email: { type: String }, // snapshot of user email at order time
    name: { type: String }   // snapshot of user name at order time
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;