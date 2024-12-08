const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const postgresConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Default database
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const securitiesDbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'securities_db', // New database
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json')));

const initDB = async () => {
  const pool = new Pool(postgresConfig); // Connection to `postgres` for creating database
  let dbPool; // Connection to `securities_db`

  try {
    console.log('Attempting to create `securities_db`...');
    //Create `securities_db`
    await pool.query('CREATE DATABASE securities_db');
    console.log('Database created successfully.');

    //Connect to `securities_db`
    dbPool = new Pool(securitiesDbConfig);
    console.log('Connected to `securities_db`.');

    //Create tables
    console.log('Creating tables...');
    await dbPool.query(`
      CREATE TABLE securities (
        ticker VARCHAR(10) PRIMARY KEY,
        security_name VARCHAR(255) NOT NULL,
        sector VARCHAR(100),
        country VARCHAR(100),
        trend NUMERIC(3, 2)
      );
      CREATE TABLE prices (
        id SERIAL PRIMARY KEY,
        ticker VARCHAR(10) REFERENCES securities(ticker) ON DELETE CASCADE, 
        date DATE NOT NULL,
        close_price NUMERIC(10, 2),
        volume BIGINT
      );
    `); //  "ON DELETE CASCADE"  this decision was just for scalability, even though the api doesnt handle deletes at the moment
    console.log('Tables created successfully.');

    //Seed data
    
    for (const item of data) {
      const { ticker, securityName, sector, country, trend, prices } = item;

      // Insert values into `securities` table
      await dbPool.query(
        'INSERT INTO securities (ticker, security_name, sector, country, trend) VALUES ($1, $2, $3, $4, $5)',
        [ticker, securityName, sector, country, trend] // Parameterized queries like "VALUES ($1, $2, $3, $4, $5)" are to prevent sql injection
      );

      // Insert values into `prices` table
      for (const price of prices) {
        const { date, close, volume } = price;
        await dbPool.query(
          'INSERT INTO prices (ticker, date, close_price, volume) VALUES ($1, $2, $3, $4)',
          [ticker, date, parseFloat(close), parseInt(volume)]
        );
      }
    }
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  } finally {
    // Close connections
    await pool.end(); // Close `postgres` connection
    if (dbPool) await dbPool.end(); // Close `securities_db` connection
  }
};

initDB();
