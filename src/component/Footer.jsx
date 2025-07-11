import { Box, Grid, Button, Typography } from '@mui/material';
import React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Grid container sx={{height:{lg:315,md:350,sm:700,xs:650},background: 'linear-gradient(to bottom, #000066 0%, #0099ff 100%)',color:"white"}}>
        <Grid size={{lg:4,md:4,sm:12,xs:12}}>
          <Box sx={{ height: '160px', mt: '40px',width:"100%" }}>
            <Typography variant="h3" sx={{ pl: { lg: '100px', md: '80px', sm: '90px', xs: '65px' }, fontWeight: 'bold' }}>
              Useful Links
            </Typography>
            <Box
              component="ul"
              sx={{ listStyle: 'none', pl: { lg: '105px', md: '85px', sm: '95px', xs: '70px' }, mt: 1, p: 0 }}
            >
              {['Legal & Privacy', 'Contact', 'Gift Card', 'Customer Service', 'My Account'].map((item, index) => (
                <Box key={index} component="li" sx={{ mt: index === 0 ? 0 : 1 }}>
                  <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid size={{lg:4,md:4,sm:12,xs:12}}>
          <Box sx={{ height: '140px', mt: { lg: '40px', md: '40px', sm: '40px', xs: '15px' } ,width:"100%"}}>
            <Typography
              variant="h3"
              sx={{ pl: { lg: '100px', md: '80px', sm: '90px', xs: '65px' }, fontWeight: 'bold' }}
            >
              Support
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                pl: { lg: '105px', md: '85px', sm: '95px', xs: '70px' },
                mt: 1,
                p: 0,
              }}
            >
              {['Help', 'Status', 'Terms'].map((item, index) => (
                <Box key={index} component="li" sx={{ mt: index === 0 ? 0 : 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
        
         <Grid size={{lg:4,md:4,sm:12,xs:12}}>
          <Box sx={{height:"180px",mt:{lg:'40px',md:'40px',sm:'40px'},width:"100%"}}>
            <Typography variant='h3'sx={{pl:{lg:'100px',md:'80px',sm:'90px',xs:'70px'}, fontWeight: 'bold'}}>Contact</Typography>
          <Button sx={{display:'flex',gap:1,pl:{lg:"100px",md:'80px',sm:'90px',xs:'70px'},mt:{lg:'10px',md:'10px',sm:'10px',xs:'8px'},color:"white",textTransform: 'none'}}>
            < FacebookIcon  sx={{fontSize:26}}/>
            <Typography variant='h6'>Facebook</Typography>
          </Button>
          <Button sx={{display:'flex',gap:1,pl:{lg:"100px",md:'80px',sm:'90px',xs:'70px'},mt:{lg:'6px',md:'6px',sm:'8px',xs:'6px'},color:"white",textTransform:"none"}}>
            < WhatsAppIcon sx={{color:"white",fontSize:30}}/>
            <Typography variant='h6'>WhatsApp</Typography>
          </Button>
          <Button sx={{display:'flex',gap:1,pl:{lg:"100px",md:'80px',sm:'90px',xs:'70px'},mt:{lg:'6px',md:'6px',sm:'8px',xs:'6px'},color:"white",textTransform:"none"}}>
            < TwitterIcon sx={{color:"white",fontSize:30}}/>
            <Typography variant='h6'>Twitter</Typography>
          </Button>
          </Box>
         </Grid>
    </Grid>

  );
};

export default Footer;
