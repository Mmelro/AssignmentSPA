// backend/src/db.js
const { Pool } = require('pg'); //connects to databaase using  pg

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'securities_db', 
  password: '123',
  port: 5432,
});

// Test the connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = pool;
