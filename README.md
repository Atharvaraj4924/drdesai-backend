# Dr. Desai Server Setup

## Environment Configuration

To connect to MongoDB Atlas, create a `.env` file in the server directory with the following variables:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/dr_desai_appointments?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (comma-separated for production)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster or use an existing one
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and replace the MONGODB_URI in your .env file

## Vitals Functionality

The vitals functionality is already implemented and connected to MongoDB Atlas through the MedicalRecord model. The system includes:

- **Update Vitals**: `PUT /api/medical-records/vitals/:patientId`
- **Get Vitals History**: `GET /api/medical-records/vitals/:patientId`

### Vitals Data Structure

```javascript
{
  vitals: {
    weight: { value: Number, unit: 'kg', date: Date },
    height: { value: Number, unit: 'cm', date: Date },
    heartRate: { value: Number, unit: 'bpm', date: Date },
    bloodPressure: { systolic: Number, diastolic: Number, date: Date },
    temperature: { value: Number, unit: '°C', date: Date }
  }
}
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Vitals Endpoints
- `PUT /api/medical-records/vitals/:patientId` - Update patient vitals
- `GET /api/medical-records/vitals/:patientId` - Get patient vitals history

### Authentication Required
All vitals endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
