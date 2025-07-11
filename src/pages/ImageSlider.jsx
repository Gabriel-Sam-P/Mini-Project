import React from 'react';
import Slider from 'react-slick';
import Box from '@mui/material/Box';
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

import first from '../Assets/E2.jpg';
import second from '../Assets/E3.jpg';
import three from '../Assets/E4.jpg';
import four from '../Assets/E5.jpg';
import five from '../Assets/E6.jpg';
import six from '../Assets/E7.jpg';

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 1300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  const images = [
    { src: first, alt: 'Banner 1' },
    { src: second, alt: 'Banner 2' },
    { src: three, alt: 'Banner 3' },
    { src: four, alt: 'Banner 4' },
    { src: five, alt: 'Banner 5' },
    { src: six, alt: 'Banner 6' }
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '500px',
        background: 'linear-gradient(to top, #00ff99 0%, #3366cc 100%)',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Box sx={{ width: '95%', margin: '0 auto' ,backgroundColor:'white'}}>
        <Slider {...settings}>
          {images.map((image, index) => (
            <Box key={index}>
              <img
                src={image.src}
                alt={image.alt || `Slide ${index + 1}`}
                style={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
};

export default ImageSlider;
