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
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import BarChartIcon from '@mui/icons-material/BarChart';

const HomePage = () => {
  const [securities, setSecurities] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isPercentage, setIsPercentage] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]); // Filtered data for search
  const [baseData, setBaseData] = useState([]); // Base data for current search results

  useEffect(() => {
    axios.get('http://localhost:4000/api/securities')
      .then(({ data }) => {
        setSecurities(data);
        setFilteredData(data); // Initialize filtered data
      })
      .catch((err) => console.error('Error fetching securities:', err));
  }, []);

  // Handle search query change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the securities based on search query
    const filtered = securities.filter((security) =>
      Object.values(security).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );

    setBaseData(filtered); // Store filtered results as the base
    setFilteredData(filtered); // Update the displayed filtered data
    setSortConfig({ key: null, direction: null }); // Reset sorting state
    setPage(0); // Reset pagination to first page
  };

  const clearSearch = () => {
    setSearchQuery('');
    setBaseData(securities); // Restore baseData to the full dataset
    setFilteredData(securities); // Restore filteredData to the full dataset
    setSortConfig({ key: null, direction: null }); // Reset sorting state
    setPage(0); // Reset pagination
  };

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

    const dataToSort = searchQuery ? [...baseData] : [...securities]; // Use correct base

    if (!newDirection) {
      setFilteredData(dataToSort); // Reset filteredData to the correct base
    } else {
      const sorted = [...filteredData].sort((a, b) => {
        const aValue = key === 'trend' ? parseFloat(a[key]) : a[key];
        const bValue = key === 'trend' ? parseFloat(b[key]) : b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return newDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });

      setFilteredData(sorted);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '';
    }
    return '';
  };

  const getTrendColor = (trend) => {
    if (trend < -0.2) return '#ffcccc'; // soft red
    if (trend >= -0.2 && trend <= 0.2) return '#ccffcc'; // soft green
    return '#cce5ff'; // soft blue
  };

  // Pagination Logic
  const handleChangePage = (event, newPage) => setPage(newPage); // Update to the new page

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10); // Parse the selected rows per page value
    setRowsPerPage(value); // Update rowsPerPage
    setPage(0); // Reset to the first page
  };

  // Define dynamic rows per page options
  const getRowsPerPageOptions = () => {
    let options = [5]; // Always include 5 as an option
  
    if (filteredData.length <= 5) {
      // If filtered rows are less than or equal to 5, show only the filtered rows as an option
      options = [filteredData.length];
    } else if (filteredData.length <= 10) {
      // If filtered rows are between 6 and 10, show 5 and the number of filtered rows
      options = [5, filteredData.length];
    } else {
      // If filtered rows are greater than 10, show 5, 10, and the number of filtered rows
      options = [5, 10, filteredData.length];
    }
  
    return options;
  };

  // Render paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E88E5', color: '#fff', px: 3, py: 1, borderRadius: '12px', boxShadow: 3 }}>
          {/* Icon */}
          <BarChartIcon sx={{ fontSize: 40, color: '#FFD700', mr: 2 }} />

          {/* Text */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', letterSpacing: 1.5, fontSize: '2rem', display: 'flex', alignItems: 'center', color: 'white' }}>
            Security
            <span style={{ color: '#FFD700', marginLeft: '0.5rem' }}>List</span>
          </Typography>
        </Box>
      </Box>

      <hr style={{ border: '1px solid #ccc', marginBottom: '20px' }} />

      {/* Search Bar */}
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch} edge="end" aria-label="clear search">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('ticker')} sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2', color: '#6a0dad' }}>
                Symbol {getSortIndicator('ticker')}
              </TableCell>
              <TableCell onClick={() => handleSort('security_name')} sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}>
                Name {getSortIndicator('security_name')}
              </TableCell>
              <TableCell onClick={() => handleSort('sector')} sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}>
                Sector {getSortIndicator('sector')}
              </TableCell>
              <TableCell onClick={() => handleSort('country')} sx={{ fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f2f2f2' }}>
                Country {getSortIndicator('country')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span onClick={() => handleSort('trend')} style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Trend {getSortIndicator('trend')}
                </span>
                <Button size="small" variant="contained" onClick={() => setIsPercentage(!isPercentage)} sx={{ minWidth: '30px', height: '30px', marginLeft: 1, fontSize: '0.8rem', padding: 0 }}>
                  %
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((security) => (
              <TableRow key={security.ticker} hover onClick={() => navigate(`/securities/${security.ticker}`)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell sx={{ color: '#6a0dad', fontWeight: 'bold' }}>{security.ticker}</TableCell>
                <TableCell>{security.security_name}</TableCell>
                <TableCell>{security.sector}</TableCell>
                <TableCell>{security.country}</TableCell>
                <TableCell sx={{ backgroundColor: getTrendColor(security.trend), textAlign: 'center', fontWeight: 'bold' }}>
                  {isPercentage ? `${(security.trend * 100).toFixed(1)}%` : security.trend}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
  rowsPerPageOptions={getRowsPerPageOptions()} // Dynamically set rows per page options
  component="div"
  count={filteredData.length} // Total count of filtered data
  rowsPerPage={rowsPerPage} // Rows per page
  page={page} // Current page
  onPageChange={handleChangePage} // Handle page changes
  onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page changes
  sx={{ mt: 2, justifyContent: 'flex-end' }}
/>
    </Container>
  );
};

export default HomePage;
