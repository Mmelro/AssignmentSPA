 const pool = require('../db'); // Import database connection pool

// Fetch all securities
exports.getAllSecurities = async (req, res, next) => {
  try {
    console.log('Fetching all securities...');
    const result = await pool.query(`
      SELECT 
        s.ticker, 
        s.security_name, 
        s.sector, 
        s.country, 
        s.trend
      FROM securities s
    `);
    console.log('Fetched securities:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching securities:', err);
    next(err); // Pass error to the global error handler
  }
};


//Fetch a specific security and its prices
exports.getSecurityDetails = async (req, res, next) => {
  const { ticker } = req.params;
  console.log(`Fetching details for ticker: ${ticker}`);

  try {
    // Fetch security 
    const securityResult = await pool.query(
      'SELECT * FROM securities WHERE ticker = $1',
      [ticker]
    );

    // Check if security exists
    if (securityResult.rows.length === 0) {
      console.log(`Security with ticker ${ticker} not found`);
      return res.status(404).send('Security not found');
    }

    // Fetch the prices with formatted date
    const pricesResult = await pool.query( // NOTE: the date format was changed. it was previously including hours, minutes, and seconds, but because the time was the same for all prices, i decided to take it off.
      `
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') AS date, 
        close_price, 
        volume 
      FROM prices 
      WHERE ticker = $1 
      ORDER BY date DESC
      `,
      [ticker]
    );

    console.log(`Fetched prices for ${ticker}: ${pricesResult.rows.length} records`);

    // Combine the data 
    const securityDetail = {
      security: securityResult.rows[0],
      prices: pricesResult.rows,
    };

    res.json(securityDetail);
  } catch (err) {
    console.error('Error fetching security details:', err);
    next(err); // Pass error to the global error handler
  }
};

