import React, { useState } from 'react';
import { Home, Sparkles, ShoppingBag, User, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <header className="bg-white shadow-soft border-b border-cream-300 font-gilda sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-accent-500" />
              <span className="text-2xl font-bold text-charcoal-900 font-gilda">Brightet.com</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                AI Designer
              </a>
              <a href="#catalog" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                Catalog
              </a>
              <a href="#about" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                Contact
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-charcoal-600 hover:text-accent-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-warm-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogin}
              className="p-2 text-charcoal-600 hover:text-accent-600 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>

            <button className="hidden md:block bg-accent-500 text-white px-6 py-2 rounded-button hover:bg-accent-600 transition-colors font-medium shadow-soft">
              Get Started
            </button>

            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-charcoal-600 hover:text-accent-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cream-300 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                AI Designer
              </a>
              <a href="#catalog" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                Catalog
              </a>
              <a href="#about" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-charcoal-700 hover:text-accent-600 font-medium transition-colors">
                Contact
              </a>
              <button className="bg-accent-500 text-white px-6 py-2 rounded-button hover:bg-accent-600 transition-colors font-medium w-full">
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;