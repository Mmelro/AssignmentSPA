const fs = require('fs');
const pool = require('../backend/src/db');  // Update the path to the db.js file

// Read data from the data.json file located in the database/ folder
const data = JSON.parse(fs.readFileSync('database/data.json', 'utf-8'));

// Insert data into the securities and prices tables
const insertData = async () => {
  for (const item of data) {
    const { ticker, securityName, sector, country, trend, prices } = item;

    try {
      // Insert into the `securities` table
      const securityQuery = `
        INSERT INTO securities(ticker, security_name, sector, country, trend)
        VALUES($1, $2, $3, $4, $5)
        RETURNING ticker`;
      const securityRes = await pool.query(securityQuery, [ticker, securityName, sector, country, trend]);

      const securityTicker = securityRes.rows[0].ticker;  // Get the inserted ticker for reference

      // Now insert all the prices for this security into the `prices` table
      for (const price of prices) {
        const { date, close, volume } = price;
        const priceQuery = `
          INSERT INTO prices(ticker, date, close_price, volume)
          VALUES($1, $2, $3, $4)`;
        
        await pool.query(priceQuery, [securityTicker, date, close, volume]);
      }

      console.log(`Inserted data for ${securityName} (${ticker})`);

    } catch (err) {
      console.error('Error inserting data:', err);
    }
  }
};

insertData()
  .then(() => {
    console.log('Data seeding completed');
    pool.end();  // Close the connection pool after seeding
  })
  .catch((err) => {
    console.error('Error seeding data:', err);
    pool.end();
  });
