const express = require('express');
const cors = require('cors'); // Import cors, because i was being blocked by cors policy, as my server port is 4000 and web page is port 3000

const app = express();
const port = 4000;
const securitiesRoutes = require('./src/routes/securitiesRoutes'); // Import the routes

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api', securitiesRoutes); // Mount the routes under the `/api` path

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Routes registered under /api');
});
