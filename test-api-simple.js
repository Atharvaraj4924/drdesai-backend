const http = require('http');

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const testAPI = async () => {
  try {
    console.log('🔍 Testing API endpoints...\n');
    
    // Step 1: Login as doctor
    console.log('1. Logging in as doctor...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const loginData = {
      email: 'testdoctor@example.com',
      password: 'password123',
      role: 'doctor'
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      console.log('💡 Please check the doctor password or try a different approach');
      return;
    }
    
    console.log('✅ Doctor login successful');
    const token = loginResponse.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Test getAllPatients endpoint
    console.log('\n2. Testing getAllPatients endpoint...');
    const patientsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/medical-records/patients',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const patientsResponse = await makeRequest(patientsOptions);
    
    if (patientsResponse.status !== 200) {
      console.log('❌ getAllPatients failed:', patientsResponse.data);
      return;
    }
    
    console.log('✅ getAllPatients endpoint successful');
    console.log('Patients found:', patientsResponse.data.patients.length);
    if (patientsResponse.data.patients.length > 0) {
      console.log('First patient:', patientsResponse.data.patients[0].name);
      console.log('Patient details:', {
        name: patientsResponse.data.patients[0].name,
        email: patientsResponse.data.patients[0].email,
        phone: patientsResponse.data.patients[0].phone,
        age: patientsResponse.data.patients[0].age,
        address: patientsResponse.data.patients[0].address
      });
    }
    
    // Step 3: Test vitals endpoint
    if (patientsResponse.data.patients.length > 0) {
      const patientId = patientsResponse.data.patients[0]._id;
      console.log('\n3. Testing vitals endpoint for patient:', patientsResponse.data.patients[0].name);
      
      const vitalsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/medical-records/vitals/${patientId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const vitalsResponse = await makeRequest(vitalsOptions);
      
      if (vitalsResponse.status === 200) {
        console.log('✅ Vitals endpoint successful');
        console.log('Vitals history length:', vitalsResponse.data.length);
      } else {
        console.log('❌ Vitals endpoint failed:', vitalsResponse.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testAPI();
