import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Layers,
  ArrowDown,
  ArrowRight,
  Building2,
  Home,
  CreditCard,
  CheckCircle2,
  Award,
  Box,
  Droplets,
  Lock
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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('All Products');
  const [visibleCount, setVisibleCount] = React.useState(15);

  const scrollToCompany = () => {
    const element = document.getElementById('company-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToProducts = () => {
    const element = document.getElementById('store-products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBuyNow = (product) => {
    const inCart = (cartItems || []).find((item) => item.id === product.id);
    if (!inCart) {
      onAddToCart(product);
    }
    if (currentUser) {
      navigate('/customer/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  const handlePortalNavigation = (targetPath, role = 'Customer') => {
    if (currentUser) {
      navigate(targetPath);
    } else {
      navigate(`/login?redirect=${role.toLowerCase()}`);
    }
  };

  React.useEffect(() => {
    setVisibleCount(15);
  }, [selectedCategory, searchQuery]);

  const filteredProducts = (products || []).filter((p) => {
    const matchesCategory = selectedCategory === 'All Products' || p.category === selectedCategory;
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const totalCartCount = (cartItems || []).reduce((acc, item) => acc + item.quantity, 0);

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

            {/* Explore CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToCompany}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
              >
                <span>What We Do &amp; Solutions</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>Browse Store Products</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Company & Solutions Section */}
      <main id="company-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        
        {/* Section 1: What We Do Overview Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Digital Plumbing Trade Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            What PlumbMart Does
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            PlumbMart is India&apos;s unified plumbing commerce ecosystem connecting retail homeowners, wholesale building material dealers, and certified plumbers with 100% genuine certified supplies, transparent pricing, and instant trade credit.
          </p>
        </div>

        {/* Section 2: The Three Core Pillars (Customers, Dealers, Plumbers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Retail Customers */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  For Homeowners &amp; Retail
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Direct Residential Site Delivery
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Source genuine Astral, Ashirvad, Supreme, and Jaquar plumbing materials delivered straight to your home or construction site with zero counterfeit risk.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine ISI &amp; ASTM certified materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transparent retail pricing &amp; direct delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>On-demand certified plumber technician booking</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePortalNavigation('/customer/products', 'Customer')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition active:scale-98 cursor-pointer"
              >
                <span>Enter Customer Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 2: Wholesale Dealers */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  For Hardware &amp; Trade Dealers
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Wholesale Supply &amp; Credit Terms
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowering licensed plumbing stores and distributors with wholesale bulk rates, live warehouse stock counts, and 30-day/90-day institutional credit lines.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tier 1 wholesale pricing &amp; exact stock visibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant 30-Day and 90-Day Credit checkout</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Zoho ERP master warehouse synchronization</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePortalNavigation('/dealer/products', 'Dealer')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98 cursor-pointer"
              >
                <span>Dealer B2B Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Plumber Technicians */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                  For Certified Plumbers
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Field Support &amp; Job Dispatch
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supporting field plumbers with manufacturer specifications, IS:15778 pressure jointing standards, assigned installation jobs, and license verification.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Product manuals, installation guides &amp; specs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assigned site installation activities &amp; checklists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified plumber credentials &amp; customer ratings</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePortalNavigation('/plumber', 'Plumber')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition active:scale-98 cursor-pointer"
              >
                <span>Plumber Pro App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Section: Live Store Products Catalog */}
        <section id="store-products-section" className="space-y-6 scroll-mt-20">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs mb-2">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                <span>Certified Master Inventory • Same-Day Dispatch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Browse Store Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Genuine CPVC, UPVC pipes, brass valves, single lever mixers, and tools with instant site delivery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePortalNavigation('/customer/products', 'Customer')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Guest Shopping Mode / Login Required to Buy Banner */}
          {!currentUser && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-700 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block">Login Access Required to Buy</span>
                  <span className="text-[11px] text-amber-800">
                    You can freely browse products and add items to your bucket. To checkout and place orders, mobile login with OTP verification is required.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login?redirect=checkout"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                >
                  Login Access
                </Link>
                <Link
                  to="/register?redirect=checkout"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition active:scale-95"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search feedback & product count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{displayedProducts.length}</strong> of{' '}
              <strong className="text-slate-800">{filteredProducts.length}</strong> products
              {selectedCategory !== 'All Products' && (
                <span> in <span className="text-blue-600 font-semibold">{selectedCategory}</span></span>
              )}
              {searchQuery && (
                <span> matching &ldquo;<span className="text-blue-600 font-semibold">{searchQuery}</span>&rdquo;</span>
              )}
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Product Cards Grid: Compact Small Cards */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {displayedProducts.map((product) => {
                const inCart = (cartItems || []).find((item) => item.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItem={inCart}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onBuyNow={handleBuyNow}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-2xs">
              <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting &apos;All Products&apos; or modifying your search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Products');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Reset Catalog Filter
              </button>
            </div>
          )}

          {/* Show More / Load More Button */}
          {filteredProducts.length > displayedProducts.length && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setVisibleCount((prev) => prev + 15)}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                Load More Products ({filteredProducts.length - displayedProducts.length} remaining)
              </button>
              <button
                type="button"
                onClick={() => handlePortalNavigation('/customer/products', 'Customer')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
              >
                <span>Open Dedicated Customer Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </section>

        {/* Section 3: How PlumbMart Works (4-Step Process) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
              Streamlined Supply Chain
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              How the PlumbMart Platform Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              A standardized digital procurement pipeline from warehouse stock to zero-leak site installation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Live Catalog & Spec',
                desc: 'Browse certified CPVC, UPVC, brass valves, and pumps synchronized live with Zoho Inventory.'
              },
              {
                step: '02',
                title: 'Flexible Settlement',
                desc: 'Homeowners pay instantly online; verified wholesale dealers utilize 30D/90D institutional credit.'
              },
              {
                step: '03',
                title: 'Direct-to-Site Dispatch',
                desc: 'Materials packed in sealed protective packaging and delivered directly to the construction site.'
              },
              {
                step: '04',
                title: 'Certified Installation',
                desc: 'Certified field plumbers execute hydrostatic pressure checks ensuring 100% zero-leak compliance.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-2.5 relative">
                <span className="text-2xl font-black text-blue-500 font-mono block">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Core Material Categories We Distribute */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Master Inventory Portfolio
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Product Categories We Supply
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handlePortalNavigation('/customer/products', 'Customer')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>View All Store Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                cat: 'Pipes & Tubes',
                brand: 'Astral & Supreme',
                spec: 'CPVC & UPVC High Pressure',
                img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80',
                link: '/customer/products?category=Pipes%20%26%20Tubes'
              },
              {
                cat: 'Fittings & Valves',
                brand: 'Ashirvad & ValvePro',
                spec: 'Heavy Brass Stopcocks & Valves',
                img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
                link: '/customer/products?category=Fittings%20%26%20Valves'
              },
              {
                cat: 'Bath & Faucets',
                brand: 'Jaquar & BathEase',
                spec: 'Single Lever Chrome Mixers',
                img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
                link: '/customer/products?category=Bath%20%26%20Faucets'
              },
              {
                cat: 'Pumps & Motors',
                brand: 'Kirloskar Mini Booster',
                spec: '0.5 HP Self-Priming Pumps',
                img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                link: '/customer/products?category=Pumps%20%26%20Motors'
              },
              {
                cat: 'Tools & Sealants',
                brand: 'Pidilite M-Seal & Astral',
                spec: 'Epoxy Putty & Solvent Cement',
                img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
                link: '/customer/products?category=Tools%20%26%20Sealants'
              }
            ].map((catItem, idx) => (
              <div
                key={idx}
                onClick={() => handlePortalNavigation(catItem.link, 'Customer')}
                className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={catItem.img}
                    alt={catItem.cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    {catItem.brand}
                  </span>
                </div>
                <div className="p-3.5 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {catItem.cat}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {catItem.spec}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-blue-600">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Trust Indicators & Quality Standards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 text-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">100%</div>
            <p className="text-xs font-bold text-slate-800">Genuine Brand Guarantee</p>
            <p className="text-[10px] text-slate-500">ISI certified &amp; manufacturer warranty</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 text-center">
            <CreditCard className="w-6 h-6 text-indigo-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">30D / 90D</div>
            <p className="text-xs font-bold text-slate-800">Institutional Dealer Credit</p>
            <p className="text-[10px] text-slate-500">Automated ledger governance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 text-center">
            <Layers className="w-6 h-6 text-emerald-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">Zoho ERP</div>
            <p className="text-xs font-bold text-slate-800">Live Inventory Sync</p>
            <p className="text-[10px] text-slate-500">Real-time stock &amp; GST compliance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 text-center">
            <Award className="w-6 h-6 text-amber-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">IS:15778</div>
            <p className="text-xs font-bold text-slate-800">0% Joint Leakage</p>
            <p className="text-[10px] text-slate-500">Hydrostatic test compliant</p>
          </div>
        </div>

      </main>

      {/* Floating Bucket Shortcut Button (for mobile convenience) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold text-xs active:scale-95 transition"
          >
            <BucketIcon className="w-4 h-4" />
            <span>Bucket ({totalCartCount})</span>
          </button>
        </div>
      )}

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
