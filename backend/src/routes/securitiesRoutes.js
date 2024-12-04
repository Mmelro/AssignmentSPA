const express = require('express');
const router = express.Router();
const securitiesController = require('../controllers/securitiesController'); // Import the controller

// Route to get all securities
router.get('/securities', securitiesController.getAllSecurities);

// Route to get details for a specific security
router.get('/securities/:ticker', securitiesController.getSecurityDetails);

module.exports = router;
