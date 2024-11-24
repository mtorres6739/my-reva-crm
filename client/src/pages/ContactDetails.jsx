import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchContactDetails();
  }, [id]);

  const fetchContactDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  if (!contact) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contacts')}
        >
          Back to Contacts
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/contacts/${id}/edit`)}
        >
          Edit Contact
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Contact Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {contact.name}
              </Typography>
              <Chip
                label={contact.status}
                color={
                  contact.status === 'CLIENT' ? 'success' :
                  contact.status === 'LEAD' ? 'primary' :
                  contact.status === 'SOI' ? 'secondary' : 'default'
                }
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{contact.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography>{contact.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography>{contact.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Birthdate</Typography>
                <Typography>{formatDate(contact.birthdate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Workplace</Typography>
                <Typography>{contact.workplace}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Tags Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tags</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Interests</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {contact.tags.interests.map((interest, index) => (
                    <Chip key={index} label={interest} variant="outlined" />
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Source</Typography>
                <Chip label={contact.tags.source} variant="outlined" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip
                  label={contact.tags.priority}
                  color={
                    contact.tags.priority === 'High' ? 'error' :
                    contact.tags.priority === 'Medium' ? 'warning' : 'success'
                  }
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Notes Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Notes</Typography>
            <Typography>{contact.notes}</Typography>
          </Paper>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} md={4}>
          {/* Assigned To */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Assignment</Typography>
            <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
            <Typography>{contact.assignedTo.name}</Typography>
            <Typography color="text.secondary">{contact.assignedTo.email}</Typography>
          </Paper>

          {/* Policies */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Policies</Typography>
            {contact.policies.length > 0 ? (
              <List>
                {contact.policies.map((policy) => (
                  <React.Fragment key={policy.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{policy.type}</Typography>
                            <Chip
                              label={policy.status}
                              size="small"
                              color={policy.status === 'ACTIVE' ? 'success' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">Policy #: {policy.policyNumber}</Typography>
                            <Typography variant="body2">Carrier: {policy.carrier}</Typography>
                            <Typography variant="body2">
                              Monthly Premium: ${policy.monthlyPremium}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No policies found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactDetails;
