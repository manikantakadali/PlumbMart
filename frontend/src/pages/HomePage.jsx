import React from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BucketDrawer from '../components/BucketDrawer';
import { ProfileModal } from '../components/AuthModals';
import Footer from '../components/Footer';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Filter, 
  Layers,
  ArrowDown
} from 'lucide-react';
import { BucketIcon } from '../components/Header';

const CATEGORIES = [
  'All Products',
  'Pipes & Tubes',
  'Fittings & Valves',
  'Bath & Faucets',
  'Pumps & Motors',
  'Tools & Sealants',
  'Water Tanks & Storage',
  'Drainage & Sanitary'
];

export default function HomePage({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  isProfileOpen,
  setIsProfileOpen,
  isCartOpen,
  setIsCartOpen
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('All Products');

  const scrollToCatalog = () => {
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All Products' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Header with Navigation and Links */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentUser={currentUser}
      />

      {/* Hero Banner Section with Background Image across Entire Card */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg min-h-[380px] sm:min-h-[420px] flex items-center">
          
          {/* Background Image across the entire card */}
          <img
            src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1800&q=85"
            alt="Plumbing Supplies Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Smooth light gradient overlay to keep text crystal clear while displaying background image */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/20 sm:to-transparent" />

          {/* Hero Content on top of background image */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-xs font-semibold mb-3.5 shadow-xs backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Certified Plumbing Procurement Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3.5">
              Reliable Plumbing Supplies,{' '}
              <span className="text-blue-600">
                Direct to Site &amp; Workshop.
              </span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-slate-700 leading-relaxed mb-6 font-medium max-w-xl">
              Equip your residential and commercial projects with heavy-duty CPVC &amp; UPVC pipes, brass stopcocks, booster pumps, designer basin taps, and contractor-grade plumbing tools.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-800 mb-6">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-[11px] sm:text-xs">100% Genuine Brands</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs px-3 py-1.5 rounded-xl">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-[11px] sm:text-xs">Express Site Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs px-3 py-1.5 rounded-xl">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-[11px] sm:text-xs">Contractor Discounts</span>
              </div>
            </div>

            {/* Explore Catalog CTA */}
            <button
              onClick={scrollToCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              <span>Browse Products</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Main Catalog & Products Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Section Header & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Product Catalog</h2>
            </div>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} {selectedCategory !== 'All Products' ? `in "${selectedCategory}"` : 'in store'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: Compact Small Cards */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find((item) => item.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={inCart}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 max-w-sm mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No matching products found</h3>
            <p className="text-xs text-slate-500 mb-4">
              No results found for &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Products');
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Floating Bucket Shortcut Button (for mobile convenience) */}
        {totalCartCount > 0 && (
          <div className="fixed bottom-6 right-6 z-30 sm:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold text-xs active:scale-95 transition"
            >
              <BucketIcon className="w-4 h-4" />
              <span>Bucket ({totalCartCount})</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onCategoryClick={(cat) => setSelectedCategory(cat)} />

      {/* Bucket Drawer */}
      <BucketDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
        onCheckoutSuccess={onCheckoutSuccess}
        currentUser={currentUser}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
      />
    </div>
  );
}
