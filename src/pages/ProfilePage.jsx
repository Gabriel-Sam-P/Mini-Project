import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Card, CardContent, Grid, CircularProgress,
  Divider, TextField, Button, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
      const loggedInUsername = localStorage.getItem('username');

      if (!isLoggedIn || !loggedInUsername) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/User');
        const currentUser = response.data.find(user => user.username === loggedInUsername);

        if (currentUser) {
          setUser(currentUser);
          setFormData(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/User/${user.id}`, formData);
      setUser(formData);
      setEditMode(false);

      // update username in localStorage if it was changed
      if (user.username !== formData.username) {
        localStorage.setItem('username', formData.username);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/User/${user.id}`);
      localStorage.clear();
      navigate('/Signup');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Please login to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        My Profile
      </Typography>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 2 }}>
              {user.firstName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {['firstName', 'lastName', 'email', 'mobile', 'username'].map((field) => (
              <Grid item xs={6} key={field}>
                <Typography variant="subtitle2" color="text.secondary">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Typography>
                {editMode ? (
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                ) : (
                  <Typography variant="body1">{user[field]}</Typography>
                )}
              </Grid>
            ))}

            {/* Password Field */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Password</Typography>
              {editMode ? (
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <Typography variant="body1">********</Typography>
              )}
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            {editMode ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => {
                  setFormData(user);
                  setEditMode(false);
                }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}

            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete Account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
