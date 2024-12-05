import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const HomePage = () => {
  const [securities, setSecurities] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // State for sorting
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4000/api/securities')
      .then(response => {
        setSecurities(response.data);
        setSortedData(response.data); // Initialize sorted data with the original data
      })
      .catch(error => console.error('Error fetching securities:', error));
  }, []);

  //sorting logic
  const handleSort = (key) => {
    const { direction } = sortConfig;
  
    let newDirection = 'asc';
    if (sortConfig.key === key && direction === 'asc') {
      newDirection = 'desc';
    } else if (sortConfig.key === key && direction === 'desc') {
      newDirection = null; // Reset to original state
    }
  
    setSortConfig({ key, direction: newDirection });
  
    if (!newDirection) {
      setSortedData([...securities]); // Reset to original state
    } else {
      const sorted = [...sortedData].sort((a, b) => {
        const aValue = key === 'trend' ? parseFloat(a[key]) : a[key]; // Convert trend to number
        const bValue = key === 'trend' ? parseFloat(b[key]) : b[key]; // Convert trend to number
  
        if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
        return 0;
      });
      setSortedData(sorted);
    }
  };
  
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
                <TableCell onClick={() => handleSort('ticker')} style={{ cursor: 'pointer' }}>
                  Symbol {sortConfig.key === 'ticker' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
                </TableCell>
                <TableCell onClick={() => handleSort('security_name')} style={{ cursor: 'pointer' }}>
                  Name {sortConfig.key === 'security_name' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
                </TableCell>
                <TableCell onClick={() => handleSort('sector')} style={{ cursor: 'pointer' }}>
                  Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
                </TableCell>
                <TableCell onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>
                  Country {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
                </TableCell>
                <TableCell onClick={() => handleSort('trend')} style={{ cursor: 'pointer' }}>
                  Trend {sortConfig.key === 'trend' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((security) => (
                <TableRow
                  key={security.ticker}
                  hover
                  onClick={() => navigate(`/securities/${security.ticker}`)}
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
