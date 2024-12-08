import React, { useEffect, useState, useCallback } from 'react';
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
  const [filteredData, setFilteredData] = useState([]);
  const [baseData, setBaseData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/securities')
      .then(({ data }) => {
        setSecurities(data);
        setFilteredData(data);
      })
      .catch((err) => console.error('Error fetching securities:', err));
  }, []);

  const getTrendColor = useCallback((trend) => {
    if (trend < -0.2) return '#ffcccc'; // soft red
    if (trend >= -0.2 && trend <= 0.2) return '#ccffcc'; // soft green
    return '#cce5ff'; // soft blue
  }, []);

  //#region SEARCH BAR HANDLING
  // (NOTE: useCallback is used in order to prevent re-renders on functions)
  const handleSearchChange = useCallback((event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = securities.filter((security) =>
      Object.values(security).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );

    setBaseData(filtered);
    setFilteredData(filtered);
    setSortConfig({ key: null, direction: null });
    setPage(0);
  }, [securities]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setBaseData(securities);
    setFilteredData(securities);
    setSortConfig({ key: null, direction: null });
    setPage(0);
  }, [securities]);

  //#endregion

  //#region SORTING
  // Sorting
  const handleSort = useCallback((key) => {
    const { direction } = sortConfig;
    const newDirection = direction === 'asc' ? 'desc' : direction === 'desc' ? null : 'asc';

    setSortConfig({ key, direction: newDirection });

    const dataToSort = searchQuery ? [...baseData] : [...securities];

    if (!newDirection) {
      setFilteredData(dataToSort);
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
  }, [baseData, filteredData, searchQuery, securities, sortConfig]);

  const getSortIndicator = useCallback((key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '';
    }
    return '';
  }, [sortConfig]);

  //#endregion

  //#region PAGINATION
  // Pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const getRowsPerPageOptions = () => {
    let options = [5];
    if (filteredData.length <= 5) {
      options = [filteredData.length];
    } else if (filteredData.length <= 10) {
      options = [5, filteredData.length];
    } else {
      options = [5, 10, filteredData.length];
    }
    return options;
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  //#endregion

  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E88E5', color: '#fff', px: 3, py: 1, borderRadius: '12px', boxShadow: 3 }}>
          <BarChartIcon sx={{ fontSize: 40, color: '#FFD700', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', letterSpacing: 1.5, fontSize: '2rem', display: 'flex', alignItems: 'center', color: 'white' }}>
            Security
            <span style={{ color: '#FFD700', marginLeft: '0.5rem' }}>List</span>
          </Typography>
        </Box>
      </Box>

      <hr style={{ border: '1px solid #ccc', marginBottom: '20px' }} />

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
        rowsPerPageOptions={getRowsPerPageOptions()}
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
