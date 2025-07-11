import { AccountCircle, Close, Password, Visibility, VisibilityOff } from '@mui/icons-material'
import { Alert, Box, Button, FilledInput, Grid, IconButton, InputAdornment, Snackbar, TextField } from '@mui/material'
import React, { useState } from 'react'
import 'animate.css';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const LoginPage = () => {
  const navigate = useNavigate()
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError] = useState('')
  // password visibility
  const [showPassword,setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  // snackbar
  const [open,setOpen]=useState(false)
  const openSnackbar = () => {
    setOpen(true)
  }
  const closeSnackbar = () => {
    setOpen(false)
  }
  const handleLogin = async () => {
    try {
      const response = await axios.get('http://localhost:3001/User')
      const users = Object.entries(response.data).map(([key,val])=>({
        firebaseKey: key,...val
      }))
      const userdata = users.find(user=>
        ((user.username===username || user.mobile===username || user.email===username) && 
        (user.password===password)))
      if(userdata){
        localStorage.setItem('loggedIn','true')
        localStorage.setItem('username',username)
        navigate('/')
        window.dispatchEvent(new Event('storage'));
        openSnackbar()
      } else {
        setError('Invalid credentials')
        openSnackbar()
      }
    } catch (error) {
      console.error(error.message)
      setError(error.message)
      openSnackbar()
    }
  }
  return (
    <Grid container>
      <Grid size={{lg:9,md:9,sm:9,xs:12}}>
        <Box sx={{height:{lg:'320px',md:'320px',sm:'270px',xs:'270px'},paddingTop:{lg:'80px',md:'80px',sm:'30px',xs:'30px'},marginLeft:{lg:35,md:30,sm:25}}}>
          <Box className='animate__animated animate__backInDown' sx={{display:'flex',justifyContent:'center',gap:'12px'}}>
            <AccountCircle sx={{mt:1.5,height:"50px",width:'50px'}}/>
            <TextField size="small" 
            variant='filled' 
            label='username or email or mobile'
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            sx={{
              marginTop: '10px',
              width: '60%',
              backgroundColor: 'darkblue',
              borderRadius: '8px',
              '& .MuiFilledInput-root': {
                minHeight: '54px',
                alignItems: 'center',
              },
              '& .MuiFilledInput-input': {
                color: '#00FFE7'
              },
              '& .MuiInputLabel-root': {
                color: '#A0A0A0',
              },
              '& .MuiFilledInput-underline:before': {
                borderBottomColor: '#00FFE7',
              },
              '& .MuiFilledInput-underline:after': {
                borderBottomColor: '#FF4D6D',
              },
            }}
            />
          </Box>
          <Box className='animate__animated animate__backInDown' sx={{display:'flex',justifyContent:'center',gap:'12px'}}>
            <Password sx={{mt:1.5,height:"50px",width:'50px'}}/>
            <TextField  
            variant='filled' 
            label='Password'
            type={showPassword ? 'text' : 'password'}
            slots={{
              input: FilledInput,
            }}
            slotProps={{
              input:{
                type: showPassword ? 'text' : 'password',
                endAdornment: (
                  <InputAdornment>
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge='end'
                      sx={{height:"40px",width:'40px',color:'#A0A0A0'}}
                    >
                      {showPassword ? <VisibilityOff/> : <Visibility/>}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            sx={{
              marginTop: '10px',
              width: '60%',
              backgroundColor: 'darkblue',
              borderRadius: '8px',
              '& .MuiFilledInput-root': {
                minHeight: '48px',
                alignItems: 'center',
              },
              '& .MuiFilledInput-input': {
                color: '#00FFE7',
              },
              '& .MuiInputLabel-root': {
                color: '#A0A0A0',
              },
              '& .MuiFilledInput-underline:before': {
                borderBottomColor: '#00FFE7',
              },
              '& .MuiFilledInput-underline:after': {
                borderBottomColor: '#FF4D6D',
              },
            }}
            />
          </Box>
          <Box className='animate__animated animate__fadeInTopLeft' sx={{display:'flex',justifyContent:'center'}}>
            <Button variant='contained' onClick={handleLogin}
            sx={{
              ml:6,mt:2,
              backgroundColor: '#FF4D6D',
              color: '#121B2B', 
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e04360'
              }
            }}>
              Login
            </Button>
          </Box>
          <Box className='animate__animated animate__fadeInTopLeft' sx={{ml:6,display:'flex',justifyContent:'center',padding:'10px',}}>
            <Link style={{color:'#121B2B'}} to='/Signup'>New user? Sign up</Link>
          </Box>
          <Snackbar open={open} autoHideDuration={5000} onClose={closeSnackbar}
          sx={{
            backgroundColor: error ? '#FF4D6D' : '#00FFE7',
            color: '#121B2B',
            fontWeight: 'bold'
          }}
          action={
            <IconButton size="small" aria-label="close" color='inherit' onClick={closeSnackbar}>
              <Close fontSize='small'/>
            </IconButton>
          }>
            <Alert severity={error ? 'error' : 'success'} onClose={closeSnackbar}>
              {error || "Logged in successfully"}
            </Alert>
          </Snackbar>
        </Box>
      </Grid>

    </Grid>
  )
}
export default LoginPage;

