import React, { useState } from 'react';
import { designStyles } from '../data/products';
import { Check, Sparkles } from 'lucide-react';

const StyleSelector: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDesign = () => {
    setIsGenerating(true);
    // Simulate design generation
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would typically trigger the actual design generation
      console.log(`Generating design with ${selectedStyle} style`);
    }, 3000);
  };

  return (
    <section className="py-20 bg-cream-50 font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4 font-gilda">
            Choose Your Design Style
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            Select from our curated design styles to match your personal taste and lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {designStyles.map((style) => (
            <div
              key={style.id}
              className={`relative cursor-pointer group transition-all duration-300 ${
                selectedStyle === style.id ? 'transform scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="relative overflow-hidden rounded-card">
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent" />

                {selectedStyle === style.id && (
                  <div className="absolute top-4 right-4 bg-accent-500 text-white p-2 rounded-full shadow-warm animate-scale-in">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 font-gilda">{style.name}</h3>
                  <p className="text-cream-200 text-sm leading-relaxed">{style.description}</p>
                </div>
              </div>

              <div className={`absolute inset-0 rounded-card border-3 transition-all duration-300 ${
                selectedStyle === style.id
                  ? 'border-accent-500 shadow-warm'
                  : 'border-transparent group-hover:border-accent-300'
              }`} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="mb-6">
            <p className="text-charcoal-600 mb-2">Selected Style:</p>
            <span className="inline-block bg-accent-500 text-white px-4 py-2 rounded-button font-medium">
              {designStyles.find(s => s.id === selectedStyle)?.name}
            </span>
          </div>
          <button
            onClick={handleGenerateDesign}
            disabled={isGenerating}
            className={`px-8 py-4 rounded-button font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 mx-auto ${
              isGenerating
                ? 'bg-primary-400 text-white cursor-not-allowed'
                : 'bg-accent-500 text-white hover:bg-accent-600 shadow-warm hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Design...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Design</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default StyleSelector;