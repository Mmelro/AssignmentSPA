import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Container, TablePagination } from '@mui/material';
import axios from 'axios';

const SecurityDetails = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // Sorting state

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

  useEffect(() => {
    axios.get(`http://localhost:4000/api/securities/${ticker}`)
      .then(response => {
        setSecurity(response.data);
        setLoading(false);

        // Prepare Price and Volume data for the chart
        const prices = response.data.prices.map(price => ({
          x: new Date(price.date).getTime(),
          y: parseFloat(price.close_price),
        }));

        const volumes = response.data.prices.map(price => ({
          x: new Date(price.date).getTime(),
          y: parseFloat(price.volume),
        }));

        setPriceData(prices);
        setVolumeData(volumes);

        // Initialize sorted data for the table
        setSortedData(response.data.prices);
      })
      .catch(error => {
        console.error('Error fetching security details:', error);
        setLoading(false);
      });
  }, [ticker]);

  // Sorting logic
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
      setSortedData([...security.prices]); // Reset to original order
    } else {
      const sorted = [...sortedData].sort((a, b) => {
        const aValue = key === 'close_price' || key === 'volume' ? parseFloat(a[key]) : new Date(a[key]);
        const bValue = key === 'close_price' || key === 'volume' ? parseFloat(b[key]) : new Date(b[key]);

        if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
        return 0;
      });
      setSortedData(sorted);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const chartOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: `Price and Volume Over Time for ${security?.security?.security_name || 'the Selected Security'}`,
    },
    xAxis: {
      title: {
        text: 'Date',
      },
      type: 'datetime',
    },
    yAxis: [
      {
        title: {
          text: 'Price',
        },
        opposite: false,
      },
      {
        title: {
          text: 'Volume',
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      formatter: function () {
        const priceTooltip = this.points.find(p => p.series.name === 'Price');
        const volumeTooltip = this.points.find(p => p.series.name === 'Volume');
        return `
          <b>Date:</b> ${new Date(this.x).toLocaleDateString()}<br/>
          ${priceTooltip ? `<b>Price:</b> ${priceTooltip.y.toFixed(2)}<br/>` : ''}
          ${volumeTooltip ? `<b>Volume:</b> ${volumeTooltip.y.toFixed(0)}<br/>` : ''}
        `;
      }
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
    },
    series: [
      {
        name: 'Price',
        data: priceData,
        color: '#FF5733',
        yAxis: 0,
        marker: {
          enabled: false,
        },
      },
      {
        name: 'Volume',
        data: volumeData,
        color: '#33B5FF',
        yAxis: 1,
        marker: {
          enabled: false,
        },
      },
    ]
  };

  if (loading) return <div>Loading...</div>;
  if (!security) return <div>Security not found</div>;

  // Paginate the sorted data
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <header>
        <div style={{ cursor: 'pointer', marginBottom: '1rem' }} onClick={() => navigate('/')}>
          ← Back to Home
        </div>
        <h1>{security.security.security_name} ({security.security.ticker})</h1>
      </header>
      <main>
        <p><strong>Sector:</strong> {security.security.sector}</p>
        <p><strong>Country:</strong> {security.security.country}</p>

        <h2>Price and Volume Over Time Chart</h2>
        {priceData.length > 0 && volumeData.length > 0 ? (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        ) : (
          <p>No data available for chart.</p>
        )}

        <h2>Price History Table</h2>
        <table border="1" style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th onClick={() => handleSort('close_price')} style={{ cursor: 'pointer' }}>
                Close Price {sortConfig.key === 'close_price' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th onClick={() => handleSort('volume')} style={{ cursor: 'pointer' }}>
                Volume {sortConfig.key === 'volume' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Rows per page options
          component="div"
          count={sortedData.length} // Total number of rows
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </main>
    </Container>
  );
};

export default SecurityDetails;
