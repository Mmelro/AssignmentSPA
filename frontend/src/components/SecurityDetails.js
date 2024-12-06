import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  Container,
  TablePagination,
  Button,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';

const SecurityDetails = () => {
  // State Management
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // API Calls
  useEffect(() => {
    axios.get(`http://localhost:4000/api/securities/${ticker}`)
      .then(({ data }) => {
        setSecurity(data);
        setPriceData(data.prices.map(({ date, close_price }) => ({
          x: new Date(date).getTime(),
          y: parseFloat(close_price),
        })));
        setVolumeData(data.prices.map(({ date, volume }) => ({
          x: new Date(date).getTime(),
          y: parseFloat(volume),
        })));
        setSortedData(data.prices);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching security details:', err);
        setLoading(false);
      });
  }, [ticker]);

  // Sorting Logic
  const handleSort = (key) => {
    const { direction } = sortConfig;
    let newDirection = 'asc';

    if (sortConfig.key === key && direction === 'asc') {
      newDirection = 'desc';
    } else if (sortConfig.key === key && direction === 'desc') {
      newDirection = null; // Reset sorting
    }

    setSortConfig({ key, direction: newDirection });

    if (!newDirection) {
      setSortedData([...security.prices]); // Reset to original order
    } else {
      const sorted = [...sortedData].sort((a, b) => {
        const aValue = key === 'close_price' || key === 'volume' ? parseFloat(a[key]) : new Date(a[key]);
        const bValue = key === 'close_price' || key === 'volume' ? parseFloat(b[key]) : new Date(b[key]);
        return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
      setSortedData(sorted);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '';
    }
    return '';
  };

  // Pagination Logic
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Chart Configuration 
  const chartOptions = {
    chart: { type: 'line' },
    title: { text: `Price and Volume Over Time for ${security?.security?.security_name || ''}` },
    xAxis: { title: { text: 'Date' }, type: 'datetime' },
    yAxis: [
      { title: { text: 'Price' } },
      { title: { text: 'Volume' }, opposite: true },
    ],
    series: [
      { name: 'Price', data: priceData, color: '#FF5733', marker: { enabled: false } },
      { name: 'Volume', data: volumeData, color: '#33B5FF', yAxis: 1, marker: { enabled: false } },
    ],
    tooltip: {
      shared: true,
      formatter: function () {
        const pricePoint = this.points.find(p => p.series.name === 'Price');
        const volumePoint = this.points.find(p => p.series.name === 'Volume');
        return `
          <b>Date:</b> ${new Date(this.x).toLocaleDateString()}<br/>
          ${pricePoint ? `<b>Price:</b> ${pricePoint.y.toFixed(2)}<br/>` : ''}
          ${volumePoint ? `<b>Volume:</b> ${volumePoint.y.toFixed(0)}<br/>` : ''}
        `;
      },
    },
  };

  // Rendering
  if (loading) return <div>Loading...</div>;
  if (!security) return <div>Security not found</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Back to Home Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ fontWeight: 'bold' }}
        >
          Back to Home
        </Button>
      </Box>

      {/* Security Details */}
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
        {security.security.security_name} ({security.security.ticker})
      </Typography>
      <hr style={{ border: '1px solid #ccc', marginBottom: '20px' }} />

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        <strong>Sector: </strong>
        <span style={{ fontWeight: 'normal', color: '#555' }}>{security.security.sector}</span>
      </Typography>

      <Typography variant="h6" gutterBottom>
        <strong>Country: </strong>
        <span style={{ fontWeight: 'normal', color: '#555' }}>
          {security.security.country}
        </span>
      </Typography>

      {/* Chart */}
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      {/* Price History Table */}
      <Typography variant="h5" sx={{ mt: 4 }}>
        Price History
      </Typography>
      <table style={{ width: '100%', textAlign: 'center', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort('date')}
              style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ddd' }}
            >
              Date {getSortIndicator('date')}
            </th>
            <th
              onClick={() => handleSort('close_price')}
              style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ddd' }}
            >
              Close (price) {getSortIndicator('close_price')}
            </th>
            <th
              onClick={() => handleSort('volume')}
              style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ddd' }}
            >
              Volume {getSortIndicator('volume')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((price, index) => (
            <tr key={index}>
              <td>{price.date}</td>
              <td>{price.close_price}</td>
              <td>{price.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default SecurityDetails;
