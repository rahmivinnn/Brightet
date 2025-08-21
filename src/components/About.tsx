import React from 'react';
import { Sparkles, Award, Users, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4 font-gilda">
            About Brightet.com
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
            Transforming homes with AI-powered interior design and premium lighting solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-charcoal-900 mb-6 font-gilda">
              Our Story
            </h3>
            <p className="text-charcoal-600 mb-6 leading-relaxed">
              Founded with a vision to revolutionize interior design, Brightet.com combines cutting-edge 
              artificial intelligence with premium lighting solutions to create stunning, personalized spaces 
              that reflect your unique style.
            </p>
            <p className="text-charcoal-600 mb-6 leading-relaxed">
              Our AI-powered platform analyzes your room photos and instantly generates 3D visualizations 
              with perfectly matched lighting fixtures, allowing you to see exactly how your space will 
              look before making any purchases.
            </p>
            <p className="text-charcoal-600 leading-relaxed">
              With over 10,000 satisfied customers and partnerships with leading lighting manufacturers, 
              we're committed to bringing your dream spaces to life with precision and style.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Modern interior design" 
              className="rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent-500 text-white p-6 rounded-lg shadow-xl">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-cream-50 rounded-lg">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-accent-600" />
            </div>
            <h4 className="text-xl font-bold text-charcoal-900 mb-2 font-gilda">AI-Powered Design</h4>
            <p className="text-charcoal-600">
              Advanced algorithms create perfect lighting solutions for your space
            </p>
          </div>

          <div className="text-center p-6 bg-cream-50 rounded-lg">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-accent-600" />
            </div>
            <h4 className="text-xl font-bold text-charcoal-900 mb-2 font-gilda">Premium Quality</h4>
            <p className="text-charcoal-600">
              Curated collection of high-end lighting fixtures from top brands
            </p>
          </div>

          <div className="text-center p-6 bg-cream-50 rounded-lg">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent-600" />
            </div>
            <h4 className="text-xl font-bold text-charcoal-900 mb-2 font-gilda">Expert Support</h4>
            <p className="text-charcoal-600">
              Professional interior designers available for personalized consultation
            </p>
          </div>

          <div className="text-center p-6 bg-cream-50 rounded-lg">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-accent-600" />
            </div>
            <h4 className="text-xl font-bold text-charcoal-900 mb-2 font-gilda">Global Shipping</h4>
            <p className="text-charcoal-600">
              Worldwide delivery with white-glove installation services
            </p>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-accent-500 to-warm-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4 font-gilda">Ready to Transform Your Space?</h3>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of satisfied customers who've revolutionized their homes with AI-powered design
          </p>
          <button className="bg-white text-accent-600 px-8 py-3 rounded-button font-bold hover:bg-cream-50 transition-colors shadow-lg">
            Start Your Design Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
