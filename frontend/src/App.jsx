import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import PlumberDashboard from './pages/PlumberDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DealerDashboard from './pages/DealerDashboard';
import DealerProductsPage from './pages/DealerProductsPage';
import DealerCartPage from './pages/DealerCartPage';
import DealerCheckoutPage from './pages/DealerCheckoutPage';
import DealerOrdersPage from './pages/DealerOrdersPage';
import CustomerProductsPage from './pages/CustomerProductsPage';
import CustomerCartPage from './pages/CustomerCartPage';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import { CheckCircle2 } from 'lucide-react';
import { 
  getCustomerCart, 
  addToCustomerCart, 
  updateCustomerCartQuantity, 
  removeFromCustomerCart, 
  clearCustomerCart 
} from './utils/customerCart';

const DEFAULT_PRODUCTS = [
  {
    id: 'plb-pipe-001',
    sku: 'PLB-PIPE-001',
    name: 'PVC Plumbing Pipe 1 Inch',
    category: 'Pipes & Tubes',
    brand: 'AquaFlow',
    price: 180,
    mrp: 225,
    rating: 4.8,
    reviews: 142,
    stock: 120,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80',
    description: 'PVC pipe for general plumbing and water distribution.'
  },
  {
    id: 'plb-pipe-002',
    sku: 'PLB-PIPE-002',
    name: 'CPVC Pipe 3/4 Inch',
    category: 'Pipes & Tubes',
    brand: 'FlowLine',
    price: 240,
    mrp: 300,
    rating: 4.7,
    reviews: 88,
    stock: 85,
    tag: 'Top Grade',
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
    description: 'CPVC pipe suitable for hot and cold water plumbing systems.'
  },
  {
    id: 'plb-fit-001',
    sku: 'PLB-FIT-001',
    name: 'PVC Elbow Connector 1 Inch',
    category: 'Fittings & Valves',
    brand: 'AquaFlow',
    price: 25,
    mrp: 35,
    rating: 4.6,
    reviews: 210,
    stock: 250,
    tag: 'Essential',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'Elbow connector for changing the direction of PVC pipe runs.'
  },
  {
    id: 'plb-fit-002',
    sku: 'PLB-FIT-002',
    name: 'Brass Ball Valve 1 Inch',
    category: 'Fittings & Valves',
    brand: 'ValvePro',
    price: 320,
    mrp: 400,
    rating: 4.9,
    reviews: 165,
    stock: 45,
    tag: 'Heavy Duty',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    description: 'Manual shut-off valve for compatible plumbing installations.'
  },
  {
    id: 'plb-bath-001',
    sku: 'PLB-BATH-001',
    name: 'Chrome Basin Tap',
    category: 'Bath & Faucets',
    brand: 'BathEase',
    price: 650,
    mrp: 820,
    rating: 4.8,
    reviews: 195,
    stock: 35,
    tag: 'Premium Chrome',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Chrome-finish tap for bathroom wash basins.'
  },
  {
    id: 'plb-bath-002',
    sku: 'PLB-BATH-002',
    name: 'Handheld Shower Set',
    category: 'Bath & Faucets',
    brand: 'BathEase',
    price: 890,
    mrp: 1100,
    rating: 4.7,
    reviews: 130,
    stock: 22,
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
    description: 'Handheld shower set for standard compatible bathroom fittings.'
  },
  {
    id: 'plb-pump-001',
    sku: 'PLB-PUMP-001',
    name: 'Domestic Water Pump 0.5 HP',
    category: 'Pumps & Motors',
    brand: 'AquaDrive',
    price: 3200,
    mrp: 4000,
    rating: 4.9,
    reviews: 84,
    stock: 12,
    tag: 'High Flow',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Sample domestic water pump listing; verify specifications before purchase.'
  },
  {
    id: 'plb-tool-001',
    sku: 'PLB-TOOL-001',
    name: 'Heavy-Duty Pipe Wrench 14 Inch',
    category: 'Tools & Sealants',
    brand: 'FixMate',
    price: 480,
    mrp: 600,
    rating: 4.8,
    reviews: 312,
    stock: 28,
    tag: 'Forged Steel',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    description: 'Adjustable wrench for plumbing pipe installation and maintenance.'
  },
  {
    id: 'plb-tool-002',
    sku: 'PLB-TOOL-002',
    name: 'PTFE Thread Seal Tape',
    category: 'Tools & Sealants',
    brand: 'SealPro',
    price: 35,
    mrp: 45,
    rating: 4.6,
    reviews: 450,
    stock: 300,
    tag: 'Leak-Proof',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    description: 'Thread sealing tape for compatible threaded plumbing joints.'
  },
  {
    id: 'plb-tool-003',
    sku: 'PLB-TOOL-003',
    name: 'PVC Solvent Cement 100 ml',
    category: 'Tools & Sealants',
    brand: 'SealPro',
    price: 95,
    mrp: 120,
    rating: 4.7,
    reviews: 270,
    stock: 60,
    tag: 'Fast Bonding',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'Solvent cement for compatible PVC pipe and fitting joints; follow product instructions.'
  },
  {
    id: 'plb-wt-001',
    sku: 'PLB-WT-001',
    name: 'Sintex 500L Triple Layer Overhead Water Tank',
    category: 'Water Tanks & Storage',
    brand: 'Sintex',
    price: 3850,
    mrp: 4800,
    rating: 4.8,
    reviews: 64,
    stock: 25,
    tag: 'UV-Stabilized',
    image: '/products/PLB-WS-010.svg',
    description: 'Sintex 500 Litre 3-Layer White Water Storage Tank with 100% UV stabilization, food-grade virgin plastic.'
  },
  {
    id: 'plb-ds-001',
    sku: 'PLB-DS-001',
    name: 'SS-304 Cockroach Trap Floor Drain 5x5 Inch',
    category: 'Drainage & Sanitary',
    brand: 'Chilly',
    price: 380,
    mrp: 520,
    rating: 4.8,
    reviews: 95,
    stock: 50,
    tag: 'Anti-Odor',
    image: '/products/PLB-DS-036.svg',
    description: 'Premium AISI-304 grade stainless steel floor drain with integrated deep water-seal cockroach trap.'
  }
];

export default function App() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart / Bucket state synced with localStorage
  const [cartItems, setCartItems] = useState(() => getCustomerCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('plumbmart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to customer_cart_updated event to keep cartItems synchronized
  useEffect(() => {
    const handleCartSync = () => {
      setCartItems(getCustomerCart());
    };
    window.addEventListener('customer_cart_updated', handleCartSync);
    return () => window.removeEventListener('customer_cart_updated', handleCartSync);
  }, []);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Attempt to fetch from backend API
  useEffect(() => {
    const loadProducts = async () => {
      let res;
      try {
        res = await fetch('/api/products');
        if (!res.ok) throw new Error('Proxy status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch('http://localhost:5000/api/products');
          if (!res.ok) throw new Error('Port 5000 status: ' + res.status);
        } catch (e2) {
          res = await fetch('http://localhost:4000/api/products');
        }
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProducts(data.data);
      }
    };
    loadProducts().catch(() => {});
  }, []);

  // Cart operations synchronized with customerCart utils
  const handleAddToCart = (product) => {
    const updated = addToCustomerCart(product, 1);
    setCartItems(updated);
    showToast(`Added ${product.name.slice(0, 24)}... to bucket`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const updated = updateCustomerCartQuantity(productId, newQuantity);
    setCartItems(updated);
  };

  const handleRemoveItem = (productId) => {
    const updated = removeFromCustomerCart(productId);
    setCartItems(updated);
  };

  const handleClearCart = () => {
    const updated = clearCustomerCart();
    setCartItems(updated);
  };

  const handleCheckoutSuccess = (orderId, total) => {
    showToast(`Order #${orderId} confirmed for ₹${total.toLocaleString('en-IN')}`);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('plumbmart_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('plumbmart_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(`Account registered for ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('plumbmart_user');
    } catch {
      // ignore
    }
    showToast('Signed out of account');
  };

  const handleAdminLoginSuccess = (adminUser) => {
    setCurrentUser(adminUser);
    try {
      localStorage.setItem('plumbmart_user', JSON.stringify(adminUser));
    } catch {
      // ignore
    }
    showToast('Authenticated as Administrator!');
  };

  return (
    <BrowserRouter>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-500 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Routes>
        {/* Home Page at URL '/' */}
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckoutSuccess={handleCheckoutSuccess}
              currentUser={currentUser}
              onLogout={handleLogout}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
            />
          }
        />

        {/* Dedicated Login Page at URL '/login' */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Dedicated Register Page at URL '/register' */}
        <Route
          path="/register"
          element={<RegisterPage onRegisterSuccess={handleRegisterSuccess} />}
        />

        {/* Customer routes redirect directly to dedicated products page */}
        <Route
          path="/customer"
          element={<Navigate to="/customer/products" replace />}
        />
        <Route
          path="/dashboard/customer"
          element={<Navigate to="/customer/products" replace />}
        />
        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />


        {/* 1. View products and prices (stock quantity hidden) at '/customer/products' */}
        <Route
          path="/customer/products"
          element={<CustomerProductsPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 2. Add products to cart at '/customer/cart' */}
        <Route
          path="/customer/cart"
          element={<CustomerCartPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 3. Online checkout & direct payment at '/customer/checkout' */}
        <Route
          path="/customer/checkout"
          element={<CustomerCheckoutPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/customer/payment"
          element={<CustomerCheckoutPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 4. Order history & live tracking at '/customer/orders' */}
        <Route
          path="/customer/orders"
          element={<CustomerOrdersPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/customer/orders/:orderId"
          element={<CustomerOrdersPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Dedicated Dealer Dashboard for Live Stock & Order Tracking */}
        <Route
          path="/dealer"
          element={<DealerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dashboard/dealer"
          element={<DealerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dealer/dashboard"
          element={<DealerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 1. View products, prices and stock at '/dealer/products' */}
        <Route
          path="/dealer/products"
          element={<DealerProductsPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 2. Add products to cart & stock check at '/dealer/cart' */}
        <Route
          path="/dealer/cart"
          element={<DealerCartPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 3. Choose a payment method (Upfront / Approved Credit) at '/dealer/checkout' */}
        <Route
          path="/dealer/checkout"
          element={<DealerCheckoutPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dealer/payment"
          element={<DealerCheckoutPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* 4. Place and track orders & check due dates at '/dealer/orders' */}
        <Route
          path="/dealer/orders"
          element={<DealerOrdersPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dealer/orders/:orderId"
          element={<DealerOrdersPage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Plumber Dashboard at URL '/plumber' and '/dashboard/plumber' */}
        <Route
          path="/plumber"
          element={<PlumberDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dashboard/plumber"
          element={<PlumberDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Dedicated Admin Login at URL '/admin/login' */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage onAdminLoginSuccess={handleAdminLoginSuccess} />}
        />

        {/* Dedicated Admin Dashboard at URL '/admin' and '/admin/dashboard' */}
        <Route
          path="/admin"
          element={<AdminDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
