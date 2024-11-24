import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    searchTerm: '',
  });
  const { token } = useAuth();

  console.log('=== Contacts Component Debug ===');
  console.log('Initial render - token:', token ? 'exists' : 'missing');
  console.log('Current state:', { loading, error, contactsCount: contacts.length });

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching contacts...');
      try {
        setLoading(true);
        setError(null);
        
        console.log('Making API request with token:', token ? 'exists' : 'missing');
        const response = await fetch('/api/contacts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched contacts data:', data);
        setContacts(data);
        setFilteredContacts(data);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message);
      } finally {
        console.log('Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    if (token) {
      console.log('Token exists, calling fetchData');
      fetchData();
    } else {
      console.log('No token available, skipping fetch');
    }
  }, [token]);

  console.log('Rendering with state:', { 
    loading, 
    error, 
    contactsCount: contacts.length,
    filteredContactsCount: filteredContacts.length 
  });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    console.log('Rendering error state');
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Contacts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/contacts/new"
        >
          Add Contact
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="LEAD">Lead</MenuItem>
              <MenuItem value="SOI">SOI</MenuItem>
              <MenuItem value="CLIENT">Client</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={contact.status} 
                    color={
                      contact.status === 'CLIENT' ? 'success' :
                      contact.status === 'LEAD' ? 'warning' :
                      'default'
                    }
                  />
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.assignedTo?.name || 'Unassigned'}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/contacts/${contact.id}`}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Contacts;
