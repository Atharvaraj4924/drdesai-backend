const mongoose = require('mongoose');
const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
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

const testGetAllPatients = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Testing getAllPatients logic...\n');
    
    // Simulate the getAllPatients function logic
    const searchQuery = {
      role: 'patient'
    };

    // Get all patients with their latest medical record
    const patients = await User.find(searchQuery)
      .select('name email phone age gender address emergencyContact createdAt')
      .sort({ createdAt: -1 });

    console.log(`Found ${patients.length} patients:`);
    
    // Get latest medical record for each patient
    const patientsWithRecords = await Promise.all(
      patients.map(async (patient) => {
        const latestRecord = await MedicalRecord.findOne({ patient: patient._id })
          .populate('doctor', 'name specialization')
          .sort({ createdAt: -1 });

        console.log(`\nPatient: ${patient.name}`);
        console.log(`  Email: ${patient.email}`);
        console.log(`  Phone: ${patient.phone}`);
        console.log(`  Age: ${patient.age}`);
        console.log(`  Gender: ${patient.gender}`);
        console.log(`  Address: ${patient.address}`);
        console.log(`  Latest Medical Record: ${latestRecord ? 'Yes' : 'No'}`);
        if (latestRecord) {
          console.log(`    Record ID: ${latestRecord._id}`);
          console.log(`    Created: ${latestRecord.createdAt}`);
        }

        return {
          ...patient.toObject(),
          latestMedicalRecord: latestRecord
        };
      })
    );

    console.log('\n✅ getAllPatients logic test completed');
    console.log(`Returned ${patientsWithRecords.length} patients with records`);
    
  } catch (error) {
    console.error('Error testing getAllPatients:', error);
  } finally {
    mongoose.connection.close();
  }
};

testGetAllPatients();
