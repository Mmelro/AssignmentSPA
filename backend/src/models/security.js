const pool = require('../db'); // Import the database connection

// Fetch all securities
const getAllSecurities = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        ticker, 
        security_name, 
        sector, 
        country, 
        trend
      FROM securities
    `); // chose to not use the query 'SELECT * FROM securities' for scalability purposes, 
        // if new columns are added to the securities table, this query would not work as desired.
  
    return result.rows;
  } catch (err) {
    throw new Error('Error fetching all securities: ' + err.message);
  }
};

// Fetch a specific security by ticker
const getSecurityByTicker = async (ticker) => {
  try {
    const result = await pool.query(
      'SELECT * FROM securities WHERE ticker = $1',
      [ticker]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching security with ticker ${ticker}: ` + err.message);
  }
};

module.exports = {
  getAllSecurities,
  getSecurityByTicker,
};
