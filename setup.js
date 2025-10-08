const fs = require('fs');
const path = require('path');

const setupEnvironment = () => {
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env file already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }
  
  // Create .env file with template
  const envTemplate = `# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/dr_desai_appointments?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
`;
  
  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file with template');
    console.log('📝 Please update the MONGODB_URI with your MongoDB Atlas connection string');
    console.log('🔐 Please update the JWT_SECRET with a strong, random secret');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
};

const checkDependencies = () => {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'mongoose', 'express', 'bcryptjs', 'jsonwebtoken', 
    'cors', 'helmet', 'express-rate-limit', 'express-validator'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('📦 Missing dependencies:', missingDeps.join(', '));
    console.log('💡 Run: npm install');
    return false;
  }
  
  console.log('✅ All required dependencies are installed');
  return true;
};

const main = () => {
  console.log('🚀 Dr. Desai Server Setup');
  console.log('========================\n');
  
  // Check dependencies
  if (!checkDependencies()) {
    console.log('\n❌ Please install dependencies first: npm install');
    return;
  }
  
  // Setup environment
  setupEnvironment();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Update .env file with your MongoDB Atlas connection string');
  console.log('2. Update JWT_SECRET with a strong, random secret');
  console.log('3. Run: node test-connection.js (to test MongoDB connection)');
  console.log('4. Run: npm run dev (to start the server)');
  console.log('\n📖 See MONGODB_ATLAS_SETUP.md for detailed instructions');
};

main();
