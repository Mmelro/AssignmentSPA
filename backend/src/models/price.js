const pool = require('../db'); // Import the database connection

// Fetch prices for a specific security
const getPricesByTicker = async (ticker) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') AS date, 
        close_price, 
        volume 
      FROM prices 
      WHERE ticker = $1 
      ORDER BY date DESC
    `, [ticker]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching prices for ticker ${ticker}: ` + err.message);
  }
};

module.exports = {
  getPricesByTicker,
};
