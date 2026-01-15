import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany([
    {
      name: 'Basic Tee',
      description: 'Comfortable cotton tee',
      imageUrl: 'https://images.unsplash.com/photo-1520975922296-8a46133fd4ad?w=800&q=80',
      brand: 'Acme',
      category: 'Apparel',
      price: 19.99,
      countInStock: 50
    },
    {
      name: 'Wireless Headphones',
      description: 'Noise cancelling',
      imageUrl: 'https://images.unsplash.com/photo-1518441902110-247b6ac76f33?w=800&q=80',
      brand: 'Acme',
      category: 'Electronics',
      price: 79.99,
      countInStock: 20
    }
  ]);
  console.log('Seed complete');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});