import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './component/Navbar';
import SearchPage from './pages/SearchPage';
import { CartWishlistProvider } from './pages/WishlistContext';
import Footer from './component/Footer';
import ImageSlider from './pages/ImageSlider';
import CartPage from './pages/CartPage'; // ✅ Cart page added
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';


function App() {
  return (
    <Router>
      <CartWishlistProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <ImageSlider />
              <HomePage />
            </>
            } />
          <Route path="/products/:category" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} /> {/* ✅ Cart route */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage/>}/>
        </Routes>
        <Footer />
      </CartWishlistProvider>
    </Router>
  );
}

export default App;
