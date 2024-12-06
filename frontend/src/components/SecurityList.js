import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  TablePagination,
  Button,
} from '@mui/material';

const HomePage = () => {
  // --- State Management ---
  const [securities, setSecurities] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isPercentage, setIsPercentage] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  // --- API Calls ---
  useEffect(() => {
    axios.get('http://localhost:4000/api/securities')
      .then(({ data }) => {
        setSecurities(data);
        setSortedData(data);
      })
      .catch((err) => console.error('Error fetching securities:', err));
  }, []);

  // --- Sorting Logic ---
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
      setSortedData([...securities]); // Reset to original order
    } else {
      const sorted = [...sortedData].sort((a, b) => {
        const aValue = key === 'trend' ? parseFloat(a[key]) : a[key];
        const bValue = key === 'trend' ? parseFloat(b[key]) : b[key];

        // Handle string comparison for non-numeric columns
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return newDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Numeric and date comparison
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

  const getTrendColor = (trend) => {
    if (trend < -0.2) return '#ffcccc'; // Light red
    if (trend >= -0.2 && trend <= 0.2) return '#ccffcc'; // Light green
    return '#cce5ff'; // Light blue
  };

  // --- Pagination Logic ---
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    setRowsPerPage(value === 'All Securities' ? securities.length : parseInt(value, 10));
    setPage(0); // Reset to first page
  };
  const paginatedData = rowsPerPage === securities.length
    ? sortedData
    : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- Trend Display Toggle ---
  const toggleTrendDisplay = () => setIsPercentage(!isPercentage);

  // --- Rendering ---
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Security List
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort('ticker')}
                sx={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#f2f2f2',
                  color: '#6a0dad', // Soft purple for header
                }}
              >
                Symbol {getSortIndicator('ticker')}
              </TableCell>
              <TableCell
                onClick={() => handleSort('security_name')}
                sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}
              >
                Name {getSortIndicator('security_name')}
              </TableCell>
              <TableCell
                onClick={() => handleSort('sector')}
                sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}
              >
                Sector {getSortIndicator('sector')}
              </TableCell>
              <TableCell
                onClick={() => handleSort('country')}
                sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}
              >
                Country {getSortIndicator('country')}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#f2f2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  onClick={() => handleSort('trend')}
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                  Trend {getSortIndicator('trend')}
                </span>
                <Button
                  size="small"
                  variant="contained"
                  onClick={toggleTrendDisplay}
                  sx={{
                    minWidth: '30px',
                    height: '30px',
                    marginLeft: 1,
                    fontSize: '0.8rem',
                    padding: 0,
                  }}
                >
                  %
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((security) => (
              <TableRow
                key={security.ticker}
                hover
                onClick={() => navigate(`/securities/${security.ticker}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f9f9f9' },
                }}
              >
                <TableCell
                  sx={{
                    color: '#6a0dad', // Soft purple for ticker column elements
                    fontWeight: 'bold',
                  }}
                >
                  {security.ticker}
                </TableCell>
                <TableCell>{security.security_name}</TableCell>
                <TableCell>{security.sector}</TableCell>
                <TableCell>{security.country}</TableCell>
                <TableCell
                  sx={{
                    backgroundColor: getTrendColor(security.trend),
                    textAlign: 'center',
                    fontWeight: 'bold', // Bold trend values
                  }}
                >
                  {isPercentage
                    ? `${(security.trend * 100).toFixed(1)}%` // Show trend as percentage
                    : security.trend}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, { value: 'All Securities', label: 'All Securities' }]}
        component="div"
        count={securities.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, justifyContent: 'flex-end' }}
      />
    </Container>
  );
};

export default HomePage;
