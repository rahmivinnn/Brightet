import React, { useState } from 'react';
import { products } from '../data/products';
import { ShoppingCart, Heart, Eye, Plus, Check, Box, Home, Smartphone, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import Product3DViewer from './Product3DViewer';
import Room3DViewer from './Room3DViewer';
import BasicRoomTest from './BasicRoomTest';

const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [selected3DProduct, setSelected3DProduct] = useState<Product | null>(null);
  const [showRoomViewer, setShowRoomViewer] = useState(false);
  const [selectedForRoom, setSelectedForRoom] = useState<Set<string>>(new Set());
  const [show3DRoomPreview, setShow3DRoomPreview] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);


  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (productId: string) => {
    const newCart = new Set(cart);
    newCart.add(productId);
    setCart(newCart);
    setAddedToCart(productId);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const open3DViewer = (product: Product) => {
    console.log('Opening 3D viewer for product:', product.name);
    setSelected3DProduct(product);
  };

  const close3DViewer = () => {
    setSelected3DProduct(null);
  };



  const toggleRoomSelection = (productId: string) => {
    const newSelection = new Set(selectedForRoom);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedForRoom(newSelection);
  };

  const openRoomViewer = () => {
    setShowRoomViewer(true);
  };

  const closeRoomViewer = () => {
    setShowRoomViewer(false);
  };

  const getSelectedProducts = (): Product[] => {
    return products.filter(product => selectedForRoom.has(product.id));
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-card shadow-warm overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-cream-200">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
              favorites.has(product.id)
                ? 'bg-warm-500 text-white scale-110'
                : 'bg-white/95 text-charcoal-600 hover:bg-warm-500 hover:text-white hover:scale-110'
            }`}
          >
            <Heart className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => open3DViewer(product)}
            className="p-2.5 rounded-full bg-white/95 text-charcoal-600 hover:bg-primary-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110"
            title="3D Preview"
          >
            <Box className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-full bg-white/95 text-charcoal-600 hover:bg-accent-500 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110">
            <Eye className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="bg-gradient-to-r from-accent-500 to-warm-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            {product.category}
          </span>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-accent-600 transition-colors font-gilda line-clamp-2 flex-1 mr-3">
            {product.name}
          </h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-accent-600">
              ${product.price.toLocaleString()}
            </span>
            {product.rating && (
              <div className="flex items-center justify-end mt-1">
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                </div>
                <span className="text-xs text-charcoal-500 ml-1">({product.reviews})</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-charcoal-600 mb-4 text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>

        <div className="space-y-2 mb-6 text-sm bg-cream-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="text-charcoal-500 font-medium">Brand:</span>
            <span className="font-semibold text-charcoal-900">{product.brand}</span>
          </div>
          {product.dimensions && (
            <div className="flex justify-between">
              <span className="text-charcoal-500 font-medium">Size:</span>
              <span className="font-semibold text-charcoal-900">{product.dimensions}</span>
            </div>
          )}
          {product.material && (
            <div className="flex justify-between">
              <span className="text-charcoal-500 font-medium">Material:</span>
              <span className="font-semibold text-charcoal-900">{product.material}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => open3DViewer(product)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium flex items-center justify-center space-x-1 text-xs shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Box className="w-4 h-4" />
              <span>3D View</span>
            </button>
            <button
              onClick={() => {
                console.log('Room 3D clicked for product:', product.name);
                setShow3DRoomPreview(product);
                setShowToast(`Opening 3D Room for: ${product.name}`);
                setTimeout(() => setShowToast(null), 3000);
              }}
              className="bg-gradient-to-r from-accent-500 to-accent-600 text-white py-2.5 rounded-lg hover:from-accent-600 hover:to-accent-700 transition-all duration-200 font-medium flex items-center justify-center space-x-1 text-xs shadow-md hover:shadow-lg transform hover:scale-105"
              title="See product in 3D room"
            >
              <Home className="w-4 h-4" />
              <span>Room 3D</span>
            </button>
            <button
              onClick={() => toggleRoomSelection(product.id)}
              className={`py-2.5 rounded-lg font-medium flex items-center justify-center space-x-1 text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                selectedForRoom.has(product.id)
                  ? 'bg-gradient-to-r from-warm-500 to-warm-600 text-white'
                  : 'bg-gradient-to-r from-warm-100 to-warm-200 text-warm-700 hover:from-warm-200 hover:to-warm-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{selectedForRoom.has(product.id) ? 'In Room' : 'Add Room'}</span>
            </button>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={cart.has(product.id) || !product.inStock}
            className={`w-full py-3.5 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform ${
              !product.inStock
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : cart.has(product.id)
                ? 'bg-green-500 text-white cursor-not-allowed'
                : addedToCart === product.id
                ? 'bg-green-600 text-white scale-105'
                : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 hover:scale-105'
            }`}
          >
            {!product.inStock ? (
              <>
                <span>Out of Stock</span>
              </>
            ) : cart.has(product.id) ? (
              <>
                <Check className="w-5 h-5" />
                <span>In Cart</span>
              </>
            ) : addedToCart === product.id ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="catalog" className="py-20 bg-cream-100 font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-900 mb-6 font-gilda">
            Premium Lighting Collection
          </h2>
          <p className="text-xl text-charcoal-600 max-w-4xl mx-auto leading-relaxed">
            Discover our curated collection of premium lighting fixtures from chandeliers to table lamps.
            Transform your space with AI-powered design recommendations and 3D visualization.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-button font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-accent-500 text-white shadow-warm'
                  : 'bg-white text-charcoal-700 hover:bg-accent-50 hover:text-accent-600 shadow-soft'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-charcoal-900 mb-2 font-gilda">No Products Found</h3>
            <p className="text-charcoal-600">Try selecting a different category or check back later for new arrivals.</p>
          </div>
        )}

        <div className="text-center mt-16 space-y-4">
          {selectedForRoom.size > 0 && (
            <div className="bg-warm-100 p-6 rounded-card mb-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2 font-gilda">
                Room Design Preview
              </h3>
              <p className="text-charcoal-600 mb-4">
                {selectedForRoom.size} lighting product{selectedForRoom.size > 1 ? 's' : ''} selected for your room
              </p>
              <button
                onClick={openRoomViewer}
                className="bg-accent-500 text-white px-8 py-4 rounded-button hover:bg-accent-600 transition-colors font-semibold text-lg shadow-warm flex items-center space-x-2 mx-auto"
              >
                <Home className="w-6 h-6" />
                <span>View 3D Room Design</span>
              </button>
            </div>
          )}
          <button className="bg-charcoal-900 text-white px-8 py-4 rounded-button hover:bg-charcoal-800 transition-colors font-semibold text-lg shadow-warm">
            View All Products
          </button>
        </div>

        {cart.size > 0 && (
          <div className="fixed bottom-6 right-6 bg-accent-500 text-white px-6 py-3 rounded-button shadow-xl">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">{cart.size} item{cart.size > 1 ? 's' : ''} in cart</span>
            </div>
          </div>
        )}
      </div>

      {/* 3D Viewer Modal */}
      {selected3DProduct && (
        <Product3DViewer
          productId={selected3DProduct.id}
          productName={selected3DProduct.name}
          isOpen={!!selected3DProduct}
          onClose={close3DViewer}
        />
      )}

      {/* 3D Room Viewer Modal */}
      <Room3DViewer
        isOpen={showRoomViewer}
        onClose={closeRoomViewer}
        selectedProducts={getSelectedProducts()}
      />

      {/* 3D Room Preview Modal */}
      {show3DRoomPreview && (
        <BasicRoomTest
          product={show3DRoomPreview}
          isOpen={!!show3DRoomPreview}
          onClose={() => setShow3DRoomPreview(null)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-accent-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span className="font-medium">{showToast}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCatalog;