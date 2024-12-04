const pool = require('../db'); // Import database connection pool

// Controller: Fetch all securities
exports.getAllSecurities = async (req, res, next) => {
  try {
    console.log('Fetching all securities...');
    const result = await pool.query(
      'SELECT ticker, security_name, sector, country, trend FROM securities'
    );
    console.log('Fetched securities:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching securities:', err);
    next(err); // Pass error to the global error handler
  }
};

// Controller: Fetch a specific security and its prices
exports.getSecurityDetails = async (req, res, next) => {
  const { ticker } = req.params;
  console.log(`Fetching details for ticker: ${ticker}`);

  try {
    // Fetch the security overview
    const securityResult = await pool.query(
      'SELECT * FROM securities WHERE ticker = $1',
      [ticker]
    );

    // Check if the security exists
    if (securityResult.rows.length === 0) {
      console.log(`Security with ticker ${ticker} not found`);
      return res.status(404).send('Security not found');
    }

    // Fetch the prices for the security
    const pricesResult = await pool.query(
      'SELECT date, close_price, volume FROM prices WHERE ticker = $1 ORDER BY date DESC',
      [ticker]
    );

    console.log(`Fetched prices for ${ticker}: ${pricesResult.rows.length} records`);

    // Combine the data into a single object
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
