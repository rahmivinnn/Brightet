import React from 'react';
import { Sparkles, Palette, ShoppingBag, Zap, Shield, Users } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Design',
      description: 'Advanced artificial intelligence analyzes your space and creates stunning room designs in seconds'
    },
    {
      icon: Palette,
      title: 'Multiple Styles',
      description: 'Choose from modern, scandinavian, industrial, minimalist and many more design styles'
    },
    {
      icon: ShoppingBag,
      title: 'Integrated Shopping',
      description: 'Shop directly from your designs with our curated furniture and decor catalog'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get professional-quality room designs in under 30 seconds with our lightning-fast AI'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'All furniture items come with quality guarantee and hassle-free returns'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Our interior design experts are available to help you perfect your space'
    }
  ];

  return (
    <section className="py-20 bg-cream-50 font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4 font-gilda">
            Why Choose Brightet.com?
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            We combine cutting-edge AI technology with premium furniture to transform your living spaces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colors = [
              { bg: 'bg-accent-100', icon: 'text-accent-600' },
              { bg: 'bg-warm-100', icon: 'text-warm-600' },
              { bg: 'bg-primary-100', icon: 'text-primary-600' },
              { bg: 'bg-cream-200', icon: 'text-charcoal-600' },
              { bg: 'bg-accent-100', icon: 'text-accent-600' },
              { bg: 'bg-warm-100', icon: 'text-warm-600' },
            ];
            const colorSet = colors[index % colors.length];

            return (
              <div
                key={index}
                className="bg-white p-8 rounded-card shadow-warm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`${colorSet.bg} w-16 h-16 rounded-card flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 ${colorSet.icon}`} />
                </div>
                <h3 className="text-2xl font-bold text-charcoal-900 mb-4 font-gilda">
                  {feature.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;