import { AccountCircle, Close, Password, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert, Box, Button, FilledInput, Grid, IconButton,
  InputAdornment, Snackbar, TextField
} from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);
  const openSnackbar = () => setOpen(true);
  const closeSnackbar = () => {
    setOpen(false);
    setError('');
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/User.json');
      const users = response.data ? Object.entries(response.data).map(([key, val]) => ({ firebaseKey: key, ...val })) : [];

      const userData = users.find(user =>
        (user.username === username || user.mobile === username || user.email === username) &&
        (user.password === password)
      );

      if (userData) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', userData.username);
        navigate('/');
        window.dispatchEvent(new Event('storage'));
        openSnackbar();
      } else {
        setError('Invalid credentials');
        openSnackbar();
      }
    } catch (err) {
      console.error(err.message);
      setError('Login failed');
      openSnackbar();
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh',background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)"}}>
      <Grid item xs={12} sm={9} md={6} lg={5}>
        <Box sx={{ padding: { xs: 3, sm: 5 }, bgcolor: '#121B2B', borderRadius: 2 }}>
          <Box className="animate__animated animate__backInDown" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountCircle sx={{ color: '#00FFE7', fontSize: 50 }} />
              <TextField
                variant="filled"
                fullWidth
                label="Username, Email or Mobile"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  backgroundColor: 'darkblue',
                  borderRadius: 1,
                  '& .MuiFilledInput-input': { color: '#00FFE7' },
                  '& .MuiInputLabel-root': { color: '#A0A0A0' }
                }}
              />
            </Box>
          </Box>

          <Box className="animate__animated animate__backInDown" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Password sx={{ color: '#00FFE7', fontSize: 50 }} />
              <TextField
                variant="filled"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} sx={{ color: '#A0A0A0' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'darkblue',
                  borderRadius: 1,
                  '& .MuiFilledInput-input': { color: '#00FFE7' },
                  '& .MuiInputLabel-root': { color: '#A0A0A0' }
                }}
              />
            </Box>
          </Box>

          <Box className="animate__animated animate__fadeInTopLeft" sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button variant="contained" fullWidth onClick={handleLogin} sx={{
              backgroundColor: '#FF4D6D',
              color: '#121B2B',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#e04360' }
            }}>
              Login
            </Button>
          </Box>

          <Box className="animate__animated animate__fadeInTopLeft" sx={{ textAlign: 'center' }}>
            <Link to="/Signup" style={{ color: '#00FFE7' }}>New user? Sign up</Link>
          </Box>
        </Box>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={error ? 'error' : 'success'} variant="filled" onClose={closeSnackbar}>
            {error || 'Logged in successfully'}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
