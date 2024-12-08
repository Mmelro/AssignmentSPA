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




import Flag from 'react-world-flags'; // Import React World Flags
import PowerIcon from '@mui/icons-material/Power'; // Utilities
import ComputerIcon from '@mui/icons-material/Computer'; // Technology
import FactoryIcon from '@mui/icons-material/Factory'; // Industrials
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'; // Healthcare
import ShowChartIcon from '@mui/icons-material/ShowChart';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import WeekendIcon from '@mui/icons-material/Weekend'; // Consumer Cyclicals
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Consumer Noncyclicals
import BuildIcon from '@mui/icons-material/Build'; // Basic Materials






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





  //#region  ICONS AND FLAGS
  const getCountryCode = (country) => {
    switch (country.toLowerCase()) {
      case 'united states':
      case 'usa':
        return 'US';
      case 'china':
        return 'CN';
      case 'united kingdom':
      case 'uk':
        return 'GB';
      default:
        return 'UN'; // Unknown or default flag
    }
  };

  const getSectorIcon = (sector) => {
    switch (sector.toLowerCase()) {
      case 'utilities':
        return <PowerIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'technology':
        return <ComputerIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'industrials':
        return <FactoryIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'healthcare':
        return <HealthAndSafetyIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'financials':
        return <ShowChartIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'energy':
        return <OfflineBoltIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'consumer cyclicals':
        return <WeekendIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'consumer non-cyclicals':
        return <ShoppingCartIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      case 'basic materials':
        return <BuildIcon sx={{ ml: 1, color: '#1E88E5', verticalAlign: 'middle' }} />;
      default:
        return null; // No icon for unknown sectors
    }
  };
  

  //#endregion

  //#region SORTING AND PAGINATION LOGIC 
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

  //#endregion

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4f3ee', // Lighter background
          color: '#333', // Dark text
          px: 4,
          py: 2,
          borderRadius: 2,
          boxShadow: 3,
          mb: 4,
        }}
      >
        {/* Country Flag */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 55, // Adjust width to better fit the rectangular flag
            height: 50, // Adjust height to match flag aspect ratio
            overflow: 'hidden',
            mr: 2,
            boxShadow: 'none', // Remove any shadow
            border: 'none', // Ensure no border is visible
          }}
        >
          <Flag
            code={getCountryCode(security.security.country)}
            alt={security.security.country}
            style={{ width: '100%', height: '100%' }}
          />
        </Box>


        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: 1.2,
            textAlign: 'center',
          }}
        >
          {security.security.security_name} ({security.security.ticker})
        </Typography>
      </Box>
      <hr style={{ border: '1px solid #ccc', marginBottom: '20px' }} />

      {/* Sector */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        <strong>Sector: </strong>
        <span style={{ fontWeight: 'normal', color: '#555' }}>
          {security.security.sector} {getSectorIcon(security.security.sector)}
        </span>
      </Typography>

      {/* Country */}
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
