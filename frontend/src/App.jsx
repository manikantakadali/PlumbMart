import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import DealerDashboard from './pages/DealerDashboard';
import PlumberDashboard from './pages/PlumberDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { CheckCircle2 } from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)',
    category: 'Pipes & Tubes',
    brand: 'Astral Pipes',
    price: 480,
    mrp: 580,
    rating: 4.8,
    reviews: 142,
    stock: 85,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80',
    description: 'Lead-free, heavy-duty CPVC plumbing pipe suitable for hot and cold potable water applications.'
  },
  {
    id: 'prod-002',
    name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)',
    category: 'Fittings & Valves',
    brand: 'Ashirvad',
    price: 720,
    mrp: 890,
    rating: 4.7,
    reviews: 98,
    stock: 45,
    tag: 'Heavy Duty',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'Forged brass concealed valve with quarter-turn ceramic disc cartridge for leak-free performance.'
  },
  {
    id: 'prod-003',
    name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)',
    category: 'Bath & Faucets',
    brand: 'Jaquar',
    price: 3450,
    mrp: 4200,
    rating: 4.9,
    reviews: 215,
    stock: 24,
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Ergonomic chrome finish single lever mixer with foam flow aerator for smooth water streams.'
  },
  {
    id: 'prod-004',
    name: 'Supreme UPVC Ball Valve Heavy Body (25mm)',
    category: 'Fittings & Valves',
    brand: 'Supreme',
    price: 210,
    mrp: 260,
    rating: 4.6,
    reviews: 67,
    stock: 120,
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    description: 'Industrial grade UPVC threaded ball valve for agricultural and residential plumbing systems.'
  },
  {
    id: 'prod-005',
    name: 'Cera Stainless Steel 304 Overhead Rain Shower (8 Inch)',
    category: 'Bath & Faucets',
    brand: 'Cera',
    price: 1850,
    mrp: 2300,
    rating: 4.8,
    reviews: 180,
    stock: 35,
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-thin mirror finish 304 stainless steel rain shower head with self-cleaning silicone nozzles.'
  },
  {
    id: 'prod-006',
    name: 'Finolex SWR PVC Drainage Bend 90° with Door (110mm)',
    category: 'Pipes & Tubes',
    brand: 'Finolex',
    price: 310,
    mrp: 380,
    rating: 4.5,
    reviews: 54,
    stock: 90,
    tag: 'Standard',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'High impact resistant UV-stabilized PVC soil and waste discharge bend with inspection access door.'
  },
  {
    id: 'prod-007',
    name: 'Kirloskar Mini Water Booster Pump 0.5 HP (Self Priming)',
    category: 'Pumps & Motors',
    brand: 'Kirloskar',
    price: 4950,
    mrp: 5900,
    rating: 4.7,
    reviews: 130,
    stock: 18,
    tag: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High efficiency copper winding regenerative pump for residential overhead water tank filling.'
  },
  {
    id: 'prod-008',
    name: 'Taparia Heavy Duty Pipe Wrench 14 Inch (Cast Iron)',
    category: 'Tools & Sealants',
    brand: 'Taparia',
    price: 680,
    mrp: 820,
    rating: 4.9,
    reviews: 310,
    stock: 60,
    tag: 'Essential Tool',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    description: 'Drop forged hardened jaws pipe wrench with ductile iron handle for heavy plumbing installations.'
  },
  {
    id: 'prod-009',
    name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty (100g x 6)',
    category: 'Tools & Sealants',
    brand: 'Pidilite',
    price: 180,
    mrp: 210,
    rating: 4.8,
    reviews: 450,
    stock: 250,
    tag: 'Quick Seal',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    description: 'Multi-purpose sealant putty for joining, sealing, and waterproofing pipe leaks and bathroom joints.'
  }
];

export default function App() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart / Bucket state
  const [cartItems, setCartItems] = useState([]);
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
    fetch('http://localhost:4000/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {
        // Fallback pre-loaded
      });
  }, []);

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name.slice(0, 24)}... to bucket`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
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

        {/* Customer Dashboard at URL '/customer' and '/dashboard/customer' */}
        <Route
          path="/customer"
          element={<CustomerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dashboard/customer"
          element={<CustomerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Dealer Dashboard at URL '/dealer' and '/dashboard/dealer' */}
        <Route
          path="/dealer"
          element={<DealerDashboard currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/dashboard/dealer"
          element={<DealerDashboard currentUser={currentUser} onLogout={handleLogout} />}
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
