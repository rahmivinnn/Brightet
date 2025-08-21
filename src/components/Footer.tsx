import React from 'react';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-white font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-accent-400" />
              <span className="text-2xl font-bold font-gilda">Brightet.com</span>
            </div>
            <p className="text-charcoal-400 leading-relaxed">
              Transform your living spaces with AI-powered interior design and premium furniture catalog.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-charcoal-400 hover:text-accent-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-charcoal-400 hover:text-accent-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-charcoal-400 hover:text-accent-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-charcoal-400 hover:text-accent-400 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 font-gilda">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">AI Room Design</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Furniture Catalog</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Interior Consultation</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">3D Visualization</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Custom Design</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 font-gilda">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-charcoal-400 hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 font-gilda">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-accent-400" />
                <span className="text-charcoal-400">123 Design Street, Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent-400" />
                <span className="text-charcoal-400">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent-400" />
                <span className="text-charcoal-400">hello@brightet.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-charcoal-400 text-sm">
              © 2024 Brightet.com. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-charcoal-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-charcoal-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-charcoal-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;