const express = require('express');
const app = express();
const port = 3000;
const securitiesRoutes = require('./src/routes/securitiesRoutes'); // Import the routes

// Middleware to parse JSON
app.use(express.json());

// Register routes
app.use('/api', securitiesRoutes); // Mount the routes under the `/api` path

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Routes registered under /api');
});
