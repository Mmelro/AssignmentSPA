import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const SecurityDetails = () => {
  const { ticker } = useParams();
  const navigate = useNavigate(); // Initialize navigate hook
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/securities/${ticker}`)
      .then(response => {
        setSecurity(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching security details:', error);
        setLoading(false);
      });
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (!security) return <div>Security not found</div>;

  return (
    <div>
      <header>
        {/* Back arrow */}
        <div style={{ cursor: 'pointer', marginBottom: '1rem' }} onClick={() => navigate('/')}>
          ← Back to Home
        </div>
        <h1>{security.security.security_name} ({security.security.ticker})</h1>
      </header>
      <main>
        <p><strong>Sector:</strong> {security.security.sector}</p>
        <p><strong>Country:</strong> {security.security.country}</p>

        <h2>Price History</h2>
        <table border="1" style={{ width: '100%', textAlign: 'center' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Close (Price)</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {security.prices.map((price, index) => (
              <tr key={index}>
                <td>{price.date}</td>
                <td>{price.close_price}</td>
                <td>{price.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default SecurityDetails;
