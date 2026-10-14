import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
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
  Droplets
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

  const scrollToCompany = () => {
    const element = document.getElementById('company-section');
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

            {/* Explore CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToCompany}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
              >
                <span>What We Do &amp; Solutions</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <Link
                to="/customer/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
              >
                <span>Browse Store Products</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
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
              <Link
                to="/customer/products"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition active:scale-98"
              >
                <span>Enter Customer Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
              <Link
                to="/dealer/products"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98"
              >
                <span>Dealer B2B Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
              <Link
                to="/plumber"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition active:scale-98"
              >
                <span>Plumber Pro App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

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
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All Store Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
              <Link
                key={idx}
                to={catItem.link}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col"
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
              </Link>
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
