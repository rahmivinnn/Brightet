import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Interior Design Enthusiast',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      rating: 5,
      text: 'Brightet.com completely transformed my living room! The AI suggestions were spot-on and I found all the furniture I needed in their catalog. Amazing experience!'
    },
    {
      name: 'Michael Chen',
      role: 'Homeowner',
      image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
      rating: 5,
      text: 'I was skeptical about AI design, but the results blew me away. My bedroom looks like it was designed by a professional interior designer.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Real Estate Agent',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      rating: 5,
      text: 'I use Brightet.com for staging properties. The quick turnaround and beautiful designs help my listings sell faster. Highly recommended!'
    }
  ];

  return (
    <section className="py-20 bg-white font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4 font-gilda">
            What Our Customers Say
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who have transformed their homes with Brightet.com
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-cream-50 p-8 rounded-card relative hover:shadow-warm transition-shadow duration-300"
            >
              <Quote className="w-8 h-8 text-accent-500 mb-4" />

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warm-400 fill-current" />
                ))}
              </div>

              <p className="text-charcoal-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-charcoal-900 font-gilda">{testimonial.name}</h4>
                  <p className="text-charcoal-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;