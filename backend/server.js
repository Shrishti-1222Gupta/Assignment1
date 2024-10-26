// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize app
const app = express();
app.use(bodyParser.json());
const cors = require('cors');



// Use CORS middleware
app.use(cors());
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/rule-engine', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
const rules = require('./routes/rules');
app.use('/api/rules', rules);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

