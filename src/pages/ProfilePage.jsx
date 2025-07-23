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
  const [userKey, setUserKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const loggedIn = localStorage.getItem('loggedIn') === 'true';
      const loggedInUsername = localStorage.getItem('username');

      if (!loggedIn || !loggedInUsername) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User.json');
        const users = res.data;

        if (users) {
          const key = Object.keys(users).find(k => users[k].username === loggedInUsername);
          if (key) {
            setUser(users[key]);
            setUserKey(key);
            setFormData(users[key]);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user from Firebase:', err);
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
    if (!userKey) return;

    try {
      await axios.put(`https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User/${userKey}.json`, formData);
      setUser(formData);
      setEditMode(false);

      if (user.username !== formData.username) {
        localStorage.setItem('username', formData.username);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDelete = async () => {
    if (!userKey) return;

    try {
      await axios.delete(`https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User/${userKey}.json`);
      localStorage.clear();
      navigate('/Signup');
    } catch (err) {
      console.error('Error deleting user:', err);
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
        <Typography variant="h6">Please log in to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' , background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)" }}>
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
                          onClick={() => setShowPassword(prev => !prev)}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            {editMode ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                <Button variant="outlined" color="secondary" onClick={() => { setFormData(user); setEditMode(false); }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>Edit</Button>
            )}

            <Button variant="outlined" color="error" onClick={handleDelete}>Delete Account</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
