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

const checkUserDetails = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Checking user details...\n');
    
    const doctor = await User.findOne({ email: 'santoshdesai43@gmail.com', role: 'doctor' });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }
    
    console.log('Doctor found:');
    console.log('  Name:', doctor.name);
    console.log('  Email:', doctor.email);
    console.log('  Role:', doctor.role);
    console.log('  Phone:', doctor.phone);
    console.log('  Specialization:', doctor.specialization);
    console.log('  License:', doctor.licenseNumber);
    console.log('  Experience:', doctor.experience);
    console.log('  Created:', doctor.createdAt);
    
    // Let's also check if we can create a test user with a known password
    console.log('\n🔧 Creating a test doctor with known password...');
    
    const testDoctor = new User({
      name: 'Test Doctor',
      email: 'testdoctor@example.com',
      password: 'password123',
      role: 'doctor',
      phone: '1234567890',
      specialization: 'General Medicine',
      licenseNumber: 'TEST123',
      experience: 5
    });
    
    await testDoctor.save();
    console.log('✅ Test doctor created successfully');
    console.log('  Email: testdoctor@example.com');
    console.log('  Password: password123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUserDetails();
