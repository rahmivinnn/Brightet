import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StyleSelector from './components/StyleSelector';
import ProductCatalog from './components/ProductCatalog';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  console.log('App component loaded');

  return (
    <div className="min-h-screen bg-cream-50 font-gilda">
      <Header />
      <Hero />
      <StyleSelector />
      <ProductCatalog />
      <Features />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;