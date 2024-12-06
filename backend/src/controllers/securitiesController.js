const securityModel = require('../models/security'); // Import security model
const priceModel = require('../models/price'); // Import price model

// Fetch all securities
exports.getAllSecurities = async (req, res, next) => {
  try {
    const securities = await securityModel.getAllSecurities();
    res.json(securities);
    
  } catch (err) {
    console.error(err);
    next(err); 
  }
};

// Fetch a specific security and its prices
exports.getSecurityDetails = async (req, res, next) => {
  const { ticker } = req.params;
  
  try {
    const security = await securityModel.getSecurityByTicker(ticker);
    if (!security) {
      return res.status(404).send('Security not found');
    }

    const prices = await priceModel.getPricesByTicker(ticker);

    const securityDetail = {
      security,
      prices,
    };

    res.json(securityDetail);
  } catch (err) {
    console.error(err);
    next(err); 
  }
};
