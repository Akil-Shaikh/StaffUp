const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// Distinct Route Mounting
app.use('/api/auth', require('./api_endpoints/authentication')); // Auth
app.use('/api/recruit', require('./api_endpoints/recruter'));     // Jobs
app.use('/api/candidate', require('./api_endpoints/candidate'));   // Apps

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('StaffUp System: DB ONLINE'))
  .catch(err => console.error('DB Connection Failed:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend live on port ${PORT}`));