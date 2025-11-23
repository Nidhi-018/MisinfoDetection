require('dotenv').config();
const { connectDB, disconnectDB } = require('../db/connection');
const userService = require('../db/services/userService');

async function seedAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@misinformation-detection.com';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // In production, hash this

    console.log('Creating admin user...');
    console.log(`Email: ${adminEmail}`);
    console.log(`Name: ${adminName}`);

    // Check if admin already exists
    const existingAdmin = await userService.getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        await userService.updateUser(existingAdmin._id, { role: 'admin' });
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('✅ Admin user already exists');
      }
    } else {
      // Create new admin user
      const admin = await userService.createUser({
        name: adminName,
        email: adminEmail,
        role: 'admin',
        xp: 0,
        badges: ['admin'],
        authProvider: 'local',
      });

      console.log('✅ Admin user created successfully!');
      console.log(`User ID: ${admin._id}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    await disconnectDB();
    process.exit(1);
  }
}

seedAdminUser();

