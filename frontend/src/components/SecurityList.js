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
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';



const HomePage = () => {
  const [securities, setSecurities] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Filtered data for search
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isPercentage, setIsPercentage] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
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
  
    const filtered = securities.filter((security) =>
      Object.values(security).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );
  
    setBaseData(filtered); // Store filtered results as the base
    setFilteredData(filtered); // Display filtered results
    setSortConfig({ key: null, direction: null }); // Reset sorting state
    setPage(0); // Reset pagination
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
    if (trend < -0.2) return '#ffcccc';
    if (trend >= -0.2 && trend <= 0.2) return '#ccffcc';
    return '#cce5ff';
  };

  // Pagination Logic
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    setRowsPerPage(value === 'All Securities' ? filteredData.length : parseInt(value, 10));
    setPage(0); // Reset to first page
  };

  const paginatedData =
    rowsPerPage === filteredData.length
      ? filteredData
      : filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Trend Display Toggle
  const toggleTrendDisplay = () => setIsPercentage(!isPercentage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}
      >
        Security List
      </Typography>
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
              <TableCell
                onClick={() => handleSort('ticker')}
                sx={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#f2f2f2',
                  color: '#6a0dad',
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
                    color: '#6a0dad',
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
                    fontWeight: 'bold',
                  }}
                >
                  {isPercentage
                    ? `${(security.trend * 100).toFixed(1)}%`
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
        count={filteredData.length}
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
