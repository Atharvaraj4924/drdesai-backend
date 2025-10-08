const axios = require('axios');

const testLoginAndAPI = async () => {
  try {
    console.log('🔍 Testing login and API endpoints...\n');
    
    // Step 1: Login as doctor
    console.log('1. Logging in as doctor...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'santoshdesai43@gmail.com',
      password: 'password123' // You might need to change this to the actual password
    });
    
    console.log('✅ Doctor login successful');
    const token = loginResponse.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Test getAllPatients endpoint
    console.log('\n2. Testing getAllPatients endpoint...');
    const patientsResponse = await axios.get('http://localhost:5000/api/medical-records/patients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ getAllPatients endpoint successful');
    console.log('Patients found:', patientsResponse.data.patients.length);
    console.log('First patient:', patientsResponse.data.patients[0]?.name || 'None');
    
    // Step 3: Test vitals endpoint for the patient
    if (patientsResponse.data.patients.length > 0) {
      const patientId = patientsResponse.data.patients[0]._id;
      console.log('\n3. Testing vitals endpoint for patient:', patientsResponse.data.patients[0].name);
      
      const vitalsResponse = await axios.get(`http://localhost:5000/api/medical-records/vitals/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Vitals endpoint successful');
      console.log('Vitals history length:', vitalsResponse.data.length);
    }
    
    // Step 4: Test updating vitals
    console.log('\n4. Testing vitals update...');
    const updateVitalsResponse = await axios.put(`http://localhost:5000/api/medical-records/vitals/${patientsResponse.data.patients[0]._id}`, {
      weight: 70,
      height: 175,
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 36.5
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Vitals update successful');
    console.log('Response:', updateVitalsResponse.data.message);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Is the doctor password correct?');
      console.log('2. Is the user logged in as a doctor in the frontend?');
    }
  }
};

testLoginAndAPI();
