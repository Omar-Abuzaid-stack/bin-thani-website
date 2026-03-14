import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Chatbot from './components/Chatbot';
import Developers from './components/Developers';
import ScrollToTop from './components/ScrollToTop';
import { LoadingScreen, CookieBanner } from './components/Extras';
import './components/Layout.css';
import './components/Extras.css';
import PageTracker from './components/PageTracker';

function App() {
  const handleDeveloperClick = (developerName) => {
    window.location.href = `/properties?developer=${encodeURIComponent(developerName)}`;
  };

  return (
    <HelmetProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <PageTracker />
          <div className="app">
            <LoadingScreen />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/developers" element={<Developers onDeveloperClick={handleDeveloperClick} />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
            <CookieBanner />
          </div>
        </Router>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
