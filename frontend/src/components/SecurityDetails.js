import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

import Flag from 'react-world-flags';
import PowerIcon from '@mui/icons-material/Power';
import ComputerIcon from '@mui/icons-material/Computer';
import FactoryIcon from '@mui/icons-material/Factory';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import WeekendIcon from '@mui/icons-material/Weekend';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';

//#region HELPER FUNCTIONS
const sectorIcons = {
  utilities: <PowerIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  technology: <ComputerIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  industrials: <FactoryIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  healthcare: <HealthAndSafetyIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  financials: <ShowChartIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  energy: <OfflineBoltIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  'consumer cyclicals': <WeekendIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  'consumer non-cyclicals': <ShoppingCartIcon sx={{ ml: 1, color: '#1E88E5' }} />,
  'basic materials': <BuildIcon sx={{ ml: 1, color: '#1E88E5' }} />,
};

// Country Code Map
const countryMap = {
  'united states': 'US',
  usa: 'US',
  china: 'CN',
  'united kingdom': 'GB',
  uk: 'GB',
};

const getCountryCode = (country) => countryMap[country.toLowerCase()] || 'UN';

//#endregion


const SecurityDetails = () => {
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

  // Fetch data on mount
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

  //#region SORTING LOGIC
  
  const handleSort = useCallback((key) => {
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
  }, [sortConfig, sortedData, security?.prices]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '';
    }
    return '';
  };

  //#endregion

  //#region PAGINATION LOGIC
 
  const handleChangePage = useCallback((event, newPage) => setPage(newPage), []);
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  }, []);

    //NOTE: useMemo is now used to ensure data is not recalculated unnecessarily
  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  //#endregion

  //#region CHART CONFIGURATION
  
  const chartOptions = useMemo(() => ({
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
  }), [priceData, volumeData, security?.security?.security_name]);

  //#endregion
  
  
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
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f4f3ee', color: '#333', px: 4, py: 2,
        borderRadius: 2, boxShadow: 3, mb: 4,
      }}>
        {/* Country Flag */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 55, height: 50, overflow: 'hidden', mr: 2, boxShadow: 'none', border: 'none',
        }}>
          <Flag
            code={getCountryCode(security.security.country)}
            alt={security.security.country}
            style={{ width: '100%', height: '100%' }}
          />
        </Box>

        {/* Title */}
        <Typography variant="h4" sx={{
          fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', letterSpacing: 1.2, textAlign: 'center',
        }}>
          {security.security.security_name} ({security.security.ticker})
        </Typography>
      </Box>

      <hr style={{ border: '1px solid #ccc', marginBottom: '20px' }} />

      {/* Sector */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        <strong>Sector: </strong>
        <span style={{ fontWeight: 'normal', color: '#555' }}>
          {security.security.sector} {sectorIcons[security.security.sector.toLowerCase()]}
        </span>
      </Typography>

      {/* Country */}
      <Typography variant="h6" gutterBottom>
        <strong>Country: </strong>
        <span style={{ fontWeight: 'normal' }}>{security.security.country}</span>
      </Typography>

      {/* Chart */}
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      {/* Security Data table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        <strong>Historical Data: </strong>
      </Typography>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
              Date {getSortIndicator('date')}
            </th>
            <th onClick={() => handleSort('close_price')} style={{ cursor: 'pointer' }}>
              Close Price {getSortIndicator('close_price')}
            </th>
            <th onClick={() => handleSort('volume')} style={{ cursor: 'pointer' }}>
              Volume {getSortIndicator('volume')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>{parseFloat(row.close_price).toFixed(2)}</td>
              <td>{parseInt(row.volume, 10).toLocaleString()}</td>
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
