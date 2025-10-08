const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dr_desai_appointments', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Checking all users in database...\n');
    
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}\n`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Phone: ${user.phone}`);
      if (user.role === 'patient') {
        console.log(`  Age: ${user.age}`);
        console.log(`  Gender: ${user.gender}`);
        console.log(`  Address: ${user.address}`);
      }
      if (user.role === 'doctor') {
        console.log(`  Specialization: ${user.specialization}`);
        console.log(`  License: ${user.licenseNumber}`);
        console.log(`  Experience: ${user.experience} years`);
      }
      console.log(`  Created: ${user.createdAt}`);
      console.log('  ---');
    });
    
    const patients = await User.find({ role: 'patient' });
    console.log(`\n👥 Patients found: ${patients.length}`);
    
    const doctors = await User.find({ role: 'doctor' });
    console.log(`👨‍⚕️ Doctors found: ${doctors.length}\n`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers();
