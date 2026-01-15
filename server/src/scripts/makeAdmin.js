import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

async function run() {
  const email = process.argv[2];
  const value = (process.argv[3] ?? 'true').toLowerCase() !== 'false'; // default true

  if (!email) {
    console.error('Usage: node src/scripts/makeAdmin.js <email> [true|false]');
    process.exit(1);
  }

  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isAdmin: value } },
      { new: true }
    ).select('email isAdmin name');
    if (!user) {
      console.error('User not found for email:', email);
      process.exit(1);
    }
    console.log(`Updated user ${user.email} -> isAdmin=${user.isAdmin}`);
    process.exit(0);
  } catch (e) {
    console.error('Error updating admin flag:', e.message);
    process.exit(1);
  }
}

run();