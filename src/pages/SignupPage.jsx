import React, { useState } from 'react';
import {
  TextField, Button, Grid, Paper, Typography, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    username: '',
    password: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { firstName, lastName, mobile, email, username, password } = formData;
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !mobile || !email || !username || !password) {
      return { valid: false, message: 'Please fill in all fields' };
    }
    if (!mobileRegex.test(mobile)) {
      return { valid: false, message: 'Enter a valid 10-digit mobile number' };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Enter a valid email address' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, message } = validate();
    if (!valid) {
      setSnackbar({ open: true, message, severity: 'error' });
      return;
    }

    try {
      const res = await axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User.json');
      const users = res.data || {};

      const exists = Object.values(users).some(user =>
        user.email === formData.email ||
        user.username === formData.username ||
        user.mobile === formData.mobile
      );

      if (exists) {
        setSnackbar({ open: true, message: 'User already exists with same email, mobile or username', severity: 'error' });
        return;
      }

      await axios.post('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User.json', formData);

      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', formData.username);
      window.dispatchEvent(new Event('storage'));

      setSnackbar({ open: true, message: 'Signup & Login successful!', severity: 'success' });

      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Signup failed. Try again.', severity: 'error' });
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh', background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)" }}>
      <Paper elevation={4} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {[
              { label: 'First Name', name: 'firstName' },
              { label: 'Last Name', name: 'lastName' },
              { label: 'Mobile Number', name: 'mobile' },
              { label: 'Email', name: 'email' },
              { label: 'Username', name: 'username' },
              { label: 'Password', name: 'password', type: 'password' }
            ].map((field) => (
              <Grid item xs={12} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type || 'text'}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button fullWidth variant="contained" color="primary" type="submit">
                Sign Up
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default SignupPage;
