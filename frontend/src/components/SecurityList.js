import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const HomePage = () => {
  const [securities, setSecurities] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    axios.get('http://localhost:4000/api/securities') // Update port to 4000
  .then(response => setSecurities(response.data))
  .catch(error => console.error('Error fetching securities:', error));

  }, []);

  // Trend color helper function
  const getTrendColor = (trend) => {
    if (trend < -0.2) return 'red';
    if (trend >= -0.2 && trend <= 0.2) return 'green';
    return 'blue';
  };

  return (
    <div>
      <header>
        <h1>Security List</h1>
      </header>
      <main>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {securities.map((security) => (
                <TableRow
                  key={security.ticker}
                  hover
                  onClick={() => window.location.href = `/securities/${security.ticker}`}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{security.ticker}</TableCell>
                  <TableCell>{security.security_name}</TableCell>
                  <TableCell>{security.sector}</TableCell>
                  <TableCell>{security.country}</TableCell>
                  <TableCell style={{ backgroundColor: getTrendColor(security.trend) }}>
                    {security.trend}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
};

export default HomePage;