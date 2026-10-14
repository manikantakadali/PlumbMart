import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PlumberLayout from '../components/PlumberLayout';
import { 
  Wrench, 
  BookOpen, 
  Bell, 
  UserCheck, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Download, 
  FileText, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Layers, 
  Box, 
  Info, 
  X, 
  ChevronRight, 
  Award, 
  Briefcase, 
  Megaphone, 
  CalendarClock,
  Sparkles,
  ArrowRight,
  Edit3,
  Loader2,
  Mail,
  Package,
  Truck,
  Building2,
  RefreshCw,
  Eye,
  ShoppingBag,
  Printer,
  Send,
  CheckSquare,
  FileCheck
} from 'lucide-react';

const INITIAL_JOBS = [
  {
    id: 'JOB-701',
    customerName: 'Rahul Sharma',
    customerMobile: '9876543210',
    address: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru',
    landmark: 'Near EcoSpace Tech Park Gate 2',
    scheduledDate: 'Today, 02:00 PM',
    jobType: 'Installation',
    title: 'CPVC Master Bathroom Pipeline & Concealed Stop Cock Setup',
    description: 'Install 4 CPVC high-pressure pipes from overhead line and mount two 15mm Ashirvad concealed stop cocks with leak testing.',
    status: 'In Progress', // 'Assigned' | 'In Progress' | 'Completed'
    startedAt: 'Today, 01:15 PM',
    completedAt: null,
    productsInvolved: [
      {
        id: 'prod-001',
        name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)',
        qty: 4,
        sku: 'ZH-AST-CPVC-1IN-3M',
        image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'prod-002',
        name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)',
        qty: 2,
        sku: 'ZH-ASH-STP-15MM-BR',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'
      }
    ],
    checklist: [
      { id: 'c1', label: 'Main water supply isolated & line flushed', done: true },
      { id: 'c2', label: 'Pipes deburred and solvent joined per standard', done: true },
      { id: 'c3', label: 'Stopcock aligned with tile finishing shroud', done: false },
      { id: 'c4', label: 'Pressure tested at 10 bar with 0 leakage', done: false }
    ]
  },
  {
    id: 'JOB-702',
    customerName: 'Sanjay Reddy',
    customerMobile: '9845012345',
    address: 'Villa 18, Palm Meadows Phase 2, ECC Road, Whitefield, Bengaluru',
    landmark: 'Opposite Whitefield Club',
    scheduledDate: 'Tomorrow, 10:00 AM',
    jobType: 'Installation',
    title: 'Kirloskar 0.5HP Mini Booster Pump Mounting & Pressure Line Setup',
    description: 'Mount self-priming 0.5 HP booster pump on vibration dampeners, install UPVC bypass ball valve, and verify automatic pressure switch.',
    status: 'Assigned',
    startedAt: null,
    completedAt: null,
    productsInvolved: [
      {
        id: 'prod-007',
        name: 'Kirloskar Mini Water Booster Pump 0.5 HP (Self Priming)',
        qty: 1,
        sku: 'ZH-KIR-BST-05HP',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'prod-004',
        name: 'Supreme UPVC Ball Valve Heavy Body (25mm)',
        qty: 2,
        sku: 'ZH-SUP-BLL-25MM-UPVC',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80'
      }
    ],
    checklist: [
      { id: 'c1', label: 'Foundation bolted and vibration pad placed', done: false },
      { id: 'c2', label: 'Foot valve & suction priming chamber filled', done: false },
      { id: 'c3', label: 'UPVC bypass valve installed', done: false },
      { id: 'c4', label: 'Electrical polarity & earthing verified', done: false }
    ]
  },
  {
    id: 'JOB-689',
    customerName: 'Anil Desai',
    customerMobile: '9900112233',
    address: '14th Cross, 2nd Stage, Indiranagar, Bengaluru',
    landmark: 'Near Indiranagar Metro Station',
    scheduledDate: '11 Oct 2026, 11:30 AM',
    jobType: 'Repair & Replace',
    title: 'Jaquar Basin Mixer Tap Replacement & Trap Inspection',
    description: 'Replace worn out basin faucet with Jaquar Alive Single Lever Basin Mixer Tap and seal joint with M-Seal epoxy putty.',
    status: 'Completed',
    startedAt: '11 Oct, 11:30 AM',
    completedAt: '11 Oct, 01:10 PM',
    productsInvolved: [
      {
        id: 'prod-003',
        name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)',
        qty: 1,
        sku: 'ZH-JAQ-ALV-BSN-CH',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'prod-009',
        name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty',
        qty: 1,
        sku: 'ZH-PID-MSL-100G',
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
      }
    ],
    checklist: [
      { id: 'c1', label: 'Angle cock closed and old mixer dismantled', done: true },
      { id: 'c2', label: 'Base O-ring and brass horseshoe tightened', done: true },
      { id: 'c3', label: 'Flexible hot/cold hoses hooked up', done: true },
      { id: 'c4', label: 'Foam aerator flow verified with customer', done: true }
    ]
  }
];

const INITIAL_UPDATES = [
  {
    id: 'upd-01',
    type: 'assignment', // 'assignment' | 'schedule' | 'announcement'
    title: 'New Job Assigned: Whitefield Villa Installation',
    message: 'Company has assigned job #JOB-702 (Kirloskar 0.5HP Booster Pump Setup) scheduled for Tomorrow, 10:00 AM at Palm Meadows, Whitefield.',
    time: '20 mins ago',
    unread: true,
    actionTab: 'activities',
    targetJobId: 'JOB-702'
  },
  {
    id: 'upd-02',
    type: 'schedule',
    title: 'Schedule Change: Customer Visit Rescheduled',
    message: 'Customer Rahul Sharma (JOB-701) confirmed on-site availability today at 02:00 PM. Please reach location by 01:45 PM.',
    time: '2 hours ago',
    unread: true,
    actionTab: 'activities',
    targetJobId: 'JOB-701'
  },
  {
    id: 'upd-03',
    type: 'announcement',
    title: 'Company Announcement: Monsoon Pipe Jointing Protocols (IS:14735)',
    message: 'All PlumbMart certified plumbers are requested to follow the updated CPVC and UPVC curing standards during rain. Ensure dry jointing surface before applying solvent cement.',
    time: 'Yesterday',
    unread: false,
    actionTab: 'products'
  },
  {
    id: 'upd-04',
    type: 'announcement',
    title: 'Verification Status: Annual Trade License Verified',
    message: 'Your Plumber Pro certification (PLUMB-KA-2024-884) has been verified and renewed with 5-star Gold badge.',
    time: '3 days ago',
    unread: false,
    actionTab: 'profile'
  }
];

export default function PlumberDashboard({ currentUser, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || 'activities';
  const [activeTab, setActiveTab] = useState(urlTab); // 'activities' | 'dealer-orders' | 'products' | 'updates' | 'profile'

  useEffect(() => {
    if (urlTab && ['activities', 'dealer-orders', 'products', 'updates', 'profile'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Live Distributor Orders (Sri Venkateswara Distributors)
  const [dealerOrders, setDealerOrders] = useState([]);
  const [loadingDealerOrders, setLoadingDealerOrders] = useState(false);
  const [dealerOrdersSearch, setDealerOrdersSearch] = useState('');
  const [dealerOrderStatusFilter, setDealerOrderStatusFilter] = useState('All');
  const [selectedDealerOrder, setSelectedDealerOrder] = useState(null);

  // Plumber Response & Field Sign-Off State
  const [submittingResponseOrderId, setSubmittingResponseOrderId] = useState(null);
  const [stageNoteModal, setStageNoteModal] = useState(null); // { order, targetStage, title, description, defaultNotes }
  const [stageNoteInput, setStageNoteInput] = useState('');

  const fetchDealerOrders = async () => {
    setLoadingDealerOrders(true);
    try {
      let res;
      try {
        res = await fetch('/api/orders?clientType=Dealer');
        if (!res.ok) throw new Error('Status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch('http://localhost:5000/api/orders?clientType=Dealer');
        } catch (e2) {
          res = await fetch('http://localhost:4000/api/orders?clientType=Dealer');
        }
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setDealerOrders(data.data);
      }
    } catch (err) {
      console.warn('Could not fetch distributor orders:', err);
    } finally {
      setLoadingDealerOrders(false);
    }
  };

  const handleSendPlumberResponse = async (orderId, targetStage, notes = '') => {
    setSubmittingResponseOrderId(orderId);
    try {
      const payload = {
        stage: targetStage,
        stageLabel: targetStage === 'TASK_DONE' ? 'Task Completed & Signed Off' : 'Materials Received & Inspected',
        plumberId: plumber.id || 'PLM-01',
        plumberName: plumber.name || 'Ramesh Kumar',
        plumberMobile: plumber.mobile || '9111122222',
        plumberLicense: plumber.license || 'PLUMB-KA-2024-884',
        notes: notes || (targetStage === 'TASK_DONE' ? 'Installation complete and pressure test passed' : 'Materials inspected on site')
      };

      let res;
      try {
        res = await fetch(`/api/orders/${orderId}/plumber-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch(`http://localhost:5000/api/orders/${orderId}/plumber-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (e2) {
          res = await fetch(`http://localhost:4000/api/orders/${orderId}/plumber-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }

      const data = await res.json();
      if (data && data.success && data.order) {
        setDealerOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedDealerOrder && selectedDealerOrder.id === orderId) {
          setSelectedDealerOrder(data.order);
        }

        // Broadcast across tabs so Admin & Dealer see it instantly
        try {
          const ch = new BroadcastChannel('plumbmart_orders');
          ch.postMessage({
            type: 'PLUMBER_RESPONSE_SUBMITTED',
            orderId,
            order: data.order,
            plumberResponse: data.order.plumberResponse
          });
          ch.close();
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('plumbmart_order_updated', { detail: data.order }));
        showToast(targetStage === 'TASK_DONE' ? '✓ Task completion response submitted to Admin!' : '✓ Materials receipt acknowledged to Admin & Dealer!');
        setStageNoteModal(null);
      } else {
        alert(data?.message || 'Failed to submit plumber response');
      }
    } catch (err) {
      alert('Error submitting plumber response: ' + err.message);
    } finally {
      setSubmittingResponseOrderId(null);
    }
  };

  useEffect(() => {
    fetchDealerOrders();

    const handleOrderCreated = (e) => {
      if (e?.detail) {
        setDealerOrders(prev => [e.detail, ...prev.filter(o => o.id !== e.detail.id)]);
      }
    };
    const handleOrderUpdated = (e) => {
      if (e?.detail?.id) {
        setDealerOrders(prev => prev.map(o => o.id === e.detail.id ? e.detail : o));
        if (selectedDealerOrder && selectedDealerOrder.id === e.detail.id) {
          setSelectedDealerOrder(e.detail);
        }
      }
    };
    window.addEventListener('plumbmart_order_created', handleOrderCreated);
    window.addEventListener('plumbmart_order_updated', handleOrderUpdated);

    let bc = null;
    try {
      bc = new BroadcastChannel('plumbmart_orders');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'NEW_ORDER' && msg.data?.order) {
          setDealerOrders(prev => [msg.data.order, ...prev.filter(o => o.id !== msg.data.order.id)]);
        }
        if (msg.data?.type === 'STATUS_UPDATED' && msg.data?.orderId) {
          setDealerOrders(prev => prev.map(o => o.id === msg.data.orderId ? { ...o, status: msg.data.status } : o));
          if (selectedDealerOrder && selectedDealerOrder.id === msg.data.orderId) {
            setSelectedDealerOrder(prev => ({ ...prev, status: msg.data.status }));
          }
        }
        if (msg.data?.type === 'PLUMBER_RESPONSE_SUBMITTED' && msg.data?.order) {
          setDealerOrders(prev => prev.map(o => o.id === msg.data.orderId ? msg.data.order : o));
          if (selectedDealerOrder && selectedDealerOrder.id === msg.data.orderId) {
            setSelectedDealerOrder(msg.data.order);
          }
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('plumbmart_order_created', handleOrderCreated);
      window.removeEventListener('plumbmart_order_updated', handleOrderUpdated);
      if (bc) bc.close();
    };
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tabId);
    setSearchParams(nextParams);
  };

  // Plumber Profile Data (Fetched dynamically from Supabase DB)
  const activeMobile = (currentUser && currentUser.mobile) || '9111122222';
  const [plumber, setPlumber] = useState(currentUser && currentUser.role === 'Plumber' ? currentUser : {
    id: 'PLM-01',
    name: 'Ramesh Kumar',
    mobile: activeMobile,
    email: 'plumber@plumbmart-demo.com',
    role: 'Plumber',
    license: 'PLUMB-KA-2024-884',
    rating: 4.9,
    status: 'VERIFIED',
    completedJobs: 48,
    activeSince: 'March 2024',
    city: 'Bengaluru (East & South Zones)',
    address: '#42, 5th Main, 7th Cross, HSR Layout Sector 2, Bengaluru, Karnataka, 560102',
    specialization: 'CPVC/UPVC Piping, Concealed Valves & Pump Automation',
    experience: 8,
    skills: [
      'CPVC High Pressure Solvent Welding',
      'UPVC Ball Valve Installation',
      'Basin & Shower Mixer Cartridges',
      'Kirloskar Pump Servicing',
      'Sanitary Hydrostatic Leak Testing'
    ]
  });

  const isSuspended = plumber && (plumber.status === 'SUSPENDED' || plumber.verificationStatus === 'SUSPENDED');
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    city: '',
    address: '',
    specialization: '',
    experience: 8,
    skillsText: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch plumber profile from Supabase DB or API
  const fetchPlumberProfile = async () => {
    try {
      setIsProfileLoading(true);
      let foundPlumber = null;
      try {
        const res = await fetch(`/api/plumber/profile?mobile=${encodeURIComponent(activeMobile)}`);
        const data = await res.json();
        if (data && data.success && data.plumber) {
          foundPlumber = data.plumber;
        }
      } catch (e1) {
        try {
          const res = await fetch(`http://localhost:5000/api/plumber/profile?mobile=${encodeURIComponent(activeMobile)}`);
          const data = await res.json();
          if (data && data.success && data.plumber) {
            foundPlumber = data.plumber;
          }
        } catch (e2) {}
      }

      // Fallback check against /api/plumbers list
      if (!foundPlumber) {
        try {
          const res = await fetch('/api/plumbers');
          const data = await res.json();
          if (data && data.success && Array.isArray(data.data)) {
            foundPlumber = data.data.find(p => p.mobile === activeMobile || p.id === plumber.id || p.id === 'PLM-01');
          }
        } catch (e3) {}
      }

      if (foundPlumber) {
        setPlumber(prev => {
          const isNowSuspended = foundPlumber.status === 'SUSPENDED' || foundPlumber.verificationStatus === 'SUSPENDED';
          const wasSuspended = prev.status === 'SUSPENDED' || prev.verificationStatus === 'SUSPENDED';
          if (isNowSuspended && !wasSuspended) {
            setIsSuspendedModalOpen(true);
          }
          return { ...prev, ...foundPlumber };
        });
      }
    } catch (err) {
      console.warn('Error loading plumber profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchPlumberProfile();
  }, [activeMobile]);

  // Real-time synchronization listeners across tabs & admin actions
  useEffect(() => {
    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_plumbers');
      ch.onmessage = (event) => {
        if (event.data) {
          const data = event.data;
          const targetStatus = data.status || data.updates?.status;
          const targetMobile = data.mobile;
          const targetId = data.plumberId;

          const isMatch = !targetId || 
            targetId === plumber.id || 
            (targetMobile && (targetMobile === plumber.mobile || targetMobile === activeMobile)) ||
            (data.plumber && (data.plumber.id === plumber.id || data.plumber.mobile === plumber.mobile));

          if (isMatch && targetStatus) {
            setPlumber(prev => ({
              ...prev,
              status: targetStatus,
              verificationStatus: targetStatus,
              ...(data.updates || {})
            }));
            if (targetStatus === 'SUSPENDED') {
              setIsSuspendedModalOpen(true);
              showToast('⚠️ Plumber Account has been SUSPENDED by Administration');
            } else {
              showToast(`Plumber Account status updated: ${targetStatus}`);
            }
          }
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'plumbmart_plumber_status_broadcast' || e.key === 'plumbmart_user') {
        try {
          const stored = JSON.parse(e.newValue);
          if (stored) {
            const newStatus = stored.status || stored.updates?.status;
            if (newStatus) {
              setPlumber(prev => ({ ...prev, status: newStatus, verificationStatus: newStatus }));
              if (newStatus === 'SUSPENDED') {
                setIsSuspendedModalOpen(true);
              }
            }
          }
        } catch {}
        fetchPlumberProfile();
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustomUpdate = (e) => {
      if (e.detail) {
        const newStatus = e.detail.status || e.detail.updates?.status;
        if (newStatus) {
          setPlumber(prev => ({ ...prev, status: newStatus, verificationStatus: newStatus }));
          if (newStatus === 'SUSPENDED') {
            setIsSuspendedModalOpen(true);
          }
        }
      }
      fetchPlumberProfile();
    };
    window.addEventListener('plumbmart_plumber_updated', handleCustomUpdate);

    const handleOpenModal = () => setIsSuspendedModalOpen(true);
    window.addEventListener('open_plumber_suspended_modal', handleOpenModal);

    // Continuous 2s polling for instant sync with database
    const poll = setInterval(() => {
      fetchPlumberProfile();
    }, 2000);

    return () => {
      if (ch) ch.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_plumber_updated', handleCustomUpdate);
      window.removeEventListener('open_plumber_suspended_modal', handleOpenModal);
      clearInterval(poll);
    };
  }, [plumber.id, plumber.mobile, activeMobile]);

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: plumber.name || '',
      email: plumber.email || '',
      city: plumber.city || '',
      address: plumber.address || '',
      specialization: plumber.specialization || '',
      experience: plumber.experience || 8,
      skillsText: Array.isArray(plumber.skills) ? plumber.skills.join(', ') : ''
    });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const skillsArray = profileForm.skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/plumber/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: plumber.mobile || activeMobile,
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
          city: profileForm.city.trim(),
          address: profileForm.address.trim(),
          specialization: profileForm.specialization.trim(),
          experience: parseInt(profileForm.experience, 10) || 8,
          skills: skillsArray.length > 0 ? skillsArray : plumber.skills
        })
      });

      const data = await res.json();
      if (data.success && data.plumber) {
        setPlumber(data.plumber);
        setIsEditProfileModalOpen(false);
        window.dispatchEvent(new CustomEvent('plumber_profile_updated', { detail: data.plumber }));
        showToast('Profile details updated & saved to Supabase DB successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Jobs State with Local Storage persistence
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('plumbmart_plumber_jobs');
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('plumbmart_plumber_jobs', JSON.stringify(jobs));
    } catch {
      // ignore
    }
  }, [jobs]);

  // Updates / Announcements State
  const [updates, setUpdates] = useState(INITIAL_UPDATES);

  // Fetch Live Broadcast Announcements targeted to Plumbers & All
  const fetchPlumberAnnouncements = async () => {
    try {
      let res;
      try {
        res = await fetch('/api/notifications?role=Plumber');
      } catch (e1) {
        res = await fetch('http://localhost:5000/api/notifications?role=Plumber');
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        let readIds = [];
        try {
          readIds = JSON.parse(localStorage.getItem('plumbmart_plumber_read_announcements') || '[]');
        } catch {}

        const mappedAnnouncements = data.data.map(notif => ({
          id: notif.id,
          type: 'announcement',
          title: `[${notif.targetGroup} Broadcast] ${notif.title}`,
          message: notif.message,
          time: notif.sentAt || 'Today',
          unread: !readIds.includes(notif.id)
        }));

        setUpdates(prev => {
          const jobUpdates = prev.filter(p => p.type !== 'announcement');
          return [...mappedAnnouncements, ...jobUpdates];
        });
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchPlumberAnnouncements();

    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_announcements');
      ch.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_ANNOUNCEMENT') {
          const target = (event.data.announcement?.targetGroup || 'All').toLowerCase();
          if (target === 'all' || target.includes('plumber')) {
            fetchPlumberAnnouncements();
          }
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'plumbmart_announcement_broadcast') {
        fetchPlumberAnnouncements();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('plumbmart_announcement_created', fetchPlumberAnnouncements);

    const poll = setInterval(fetchPlumberAnnouncements, 3000);

    return () => {
      if (ch) ch.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_announcement_created', fetchPlumberAnnouncements);
      clearInterval(poll);
    };
  }, []);

  // Products & Manuals State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductManual, setSelectedProductManual] = useState(null);

  // Activities filter & search
  const [activityStatusFilter, setActivityStatusFilter] = useState('All'); // 'All' | 'Assigned' | 'In Progress' | 'Completed'
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Fetch product catalog for manuals & specs
  useEffect(() => {
    const loadProducts = async () => {
      try {
        let res;
        try {
          res = await fetch('/api/products');
        } catch {
          res = await fetch('http://localhost:5000/api/products');
        }
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Error loading products for plumber:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Update Job Status: Assigned -> In Progress -> Completed (Locked if suspended)
  const handleUpdateJobStatus = (jobId, newStatus) => {
    if (isSuspended) {
      showToast('⚠️ Action locked: Account is SUSPENDED. Please contact admin.');
      setIsSuspendedModalOpen(true);
      return;
    }
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...job,
          status: newStatus,
          startedAt: newStatus === 'In Progress' ? (job.startedAt || `Today, ${now}`) : job.startedAt,
          completedAt: newStatus === 'Completed' ? `Today, ${now}` : null
        };
      }
      return job;
    }));
  };

  // Toggle checklist item (Locked if suspended)
  const handleToggleChecklist = (jobId, checkId) => {
    if (isSuspended) {
      showToast('⚠️ Action locked: Account is SUSPENDED. Please contact admin.');
      setIsSuspendedModalOpen(true);
      return;
    }
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          checklist: job.checklist.map(c => c.id === checkId ? { ...c, done: !c.done } : c)
        };
      }
      return job;
    }));
  };

  // Mark all updates as read
  const handleMarkAllUpdatesRead = () => {
    setUpdates(prev => {
      const readIds = prev.map(u => u.id);
      try {
        localStorage.setItem('plumbmart_plumber_read_announcements', JSON.stringify(readIds));
      } catch {}
      return prev.map(u => ({ ...u, unread: false }));
    });
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter(job => {
    const matchStatus = activityStatusFilter === 'All' || job.status === activityStatusFilter;
    const query = activitySearchQuery.toLowerCase();
    const matchSearch = 
      job.title.toLowerCase().includes(query) ||
      job.customerName.toLowerCase().includes(query) ||
      job.address.toLowerCase().includes(query) ||
      job.id.toLowerCase().includes(query) ||
      job.productsInvolved.some(p => p.name.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  // Filtered Products for Manuals Tab
  const filteredProducts = products.filter(p => {
    const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const q = productSearchQuery.toLowerCase();
    const matchSearch = 
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // Filtered Dealer Orders for Distributor Orders Tab
  const filteredDealerOrders = dealerOrders.filter(o => {
    const status = o.status || 'Order Confirmed';
    const matchStatus = dealerOrderStatusFilter === 'All' || status === dealerOrderStatusFilter;
    const q = dealerOrdersSearch.toLowerCase().trim();
    if (!q) return matchStatus;
    const matchId = (o.id || '').toLowerCase().includes(q);
    const matchPo = (o.poNumber || '').toLowerCase().includes(q);
    const matchZoho = (o.zohoSalesOrder || '').toLowerCase().includes(q);
    const matchClient = (o.clientName || '').toLowerCase().includes(q);
    const matchItems = Array.isArray(o.items) && o.items.some(it => 
      (it.name || '').toLowerCase().includes(q) || 
      (it.sku || '').toLowerCase().includes(q)
    );
    return matchStatus && (matchId || matchPo || matchZoho || matchClient || matchItems);
  });

  const unreadUpdatesCount = updates.filter(u => u.unread).length;
  const activeJobsCount = jobs.filter(j => j.status === 'Assigned' || j.status === 'In Progress').length;

  return (
    <PlumberLayout
      currentUser={plumber}
      onLogout={onLogout}
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      unreadCount={unreadUpdatesCount}
      activeJobsCount={activeJobsCount}
      dealerOrdersCount={dealerOrders.length}
    >
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative">

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-3 sm:right-4 left-3 sm:left-auto z-50 flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm sm:max-w-md">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: MY ACTIVITIES (Simple, Clean, Modern UI)         */}
        {/* ======================================================== */}
        {activeTab === 'activities' && (
          <div className="space-y-4 sm:space-y-5">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>My Activities</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Installation and repair jobs assigned by PlumbMart &bull; Update status as you perform work
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={e => setActivitySearchQuery(e.target.value)}
                  placeholder="Search activities, customer, or site..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
                {activitySearchQuery && (
                  <button 
                    onClick={() => setActivitySearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Account Suspended Alert Banner in Activities */}
            {isSuspended && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-rose-950 text-xs sm:text-base">
                        Account Suspended &bull; Job Execution Locked
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-rose-600 text-white shadow-xs">
                        SUSPENDED
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-rose-700 mt-1 max-w-2xl leading-relaxed">
                      Your plumber account has been suspended by system administration. All job status changes, task completions, and new dispatches are temporarily locked.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuspendedModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition shrink-0 active:scale-95"
                >
                  <span>View Suspension Notice</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filter Tabs Pills with Item Counts */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
              {[
                { id: 'All', label: 'All Jobs', count: jobs.length },
                { id: 'Assigned', label: 'Assigned', count: jobs.filter(j => j.status === 'Assigned').length },
                { id: 'In Progress', label: 'In Progress', count: jobs.filter(j => j.status === 'In Progress').length },
                { id: 'Completed', label: 'Completed', count: jobs.filter(j => j.status === 'Completed').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivityStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    activityStatusFilter === tab.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activityStatusFilter === tab.id
                      ? 'bg-amber-700/60 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Activities Job Cards List */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center text-slate-500 max-w-md mx-auto my-6">
                <Briefcase className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-700">No matching jobs found</p>
                <p className="text-xs text-slate-400 mt-1">Try switching filter tabs or clear your search query.</p>
              </div>
            ) : (
              <div className="space-y-3.5 sm:space-y-4">
                {filteredJobs.map(job => {
                  const isAssigned = job.status === 'Assigned';
                  const isInProgress = job.status === 'In Progress';
                  const isCompleted = job.status === 'Completed';

                  return (
                    <div 
                      key={job.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3 sm:space-y-3.5"
                    >
                      {/* Top Bar: Job Tag, Scheduled Date, and Instant Status Switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{job.id}
                          </span>
                          <span className="font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {job.jobType}
                          </span>
                          <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {job.scheduledDate}
                          </span>
                        </div>

                        {/* Instant 3-Stage Status Switcher (Assigned -> In Progress -> Completed) */}
                        <div className={`grid grid-cols-3 sm:flex items-center p-0.5 rounded-xl text-xs w-full sm:w-auto ${
                          isSuspended ? 'bg-slate-200/70 opacity-60' : 'bg-slate-100'
                        }`}>
                          <button
                            type="button"
                            disabled={isSuspended}
                            onClick={() => handleUpdateJobStatus(job.id, 'Assigned')}
                            className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-center transition ${
                              isSuspended
                                ? 'cursor-not-allowed text-slate-400'
                                : isAssigned
                                ? 'bg-amber-500 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title={isSuspended ? 'Action locked: Account Suspended' : 'Set as Assigned'}
                          >
                            Assigned
                          </button>
                          <button
                            type="button"
                            disabled={isSuspended}
                            onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                            className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-center transition ${
                              isSuspended
                                ? 'cursor-not-allowed text-slate-400'
                                : isInProgress
                                ? 'bg-blue-600 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title={isSuspended ? 'Action locked: Account Suspended' : 'Set as In Progress'}
                          >
                            In Progress
                          </button>
                          <button
                            type="button"
                            disabled={isSuspended}
                            onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
                            className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-center transition ${
                              isSuspended
                                ? 'cursor-not-allowed text-slate-400'
                                : isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title={isSuspended ? 'Action locked: Account Suspended' : 'Set as Completed'}
                          >
                            Completed
                          </button>
                        </div>
                      </div>

                      {/* Job Title & Summary */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {job.description}
                        </p>
                      </div>

                      {/* Customer Details & Work Location Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                        
                        {/* Customer Row */}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Customer</span>
                            <span className="font-bold text-slate-900 truncate block text-xs">{job.customerName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">+91 {job.customerMobile}</span>
                          </div>
                          <a
                            href={`tel:${job.customerMobile}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs shrink-0"
                            title="Call customer directly"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>

                        {/* Location Row */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Location</span>
                            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              Map Site
                            </span>
                          </div>
                          <p className="text-slate-800 text-[11px] leading-snug line-clamp-1 font-medium">
                            {job.address}
                          </p>
                          {job.landmark && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              Landmark: {job.landmark}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Products Involved (Clean inline chips with Manual modal opener) */}
                      <div className="pt-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Products Involved:
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {job.productsInvolved.map((prod, idx) => (
                            <div 
                              key={idx}
                              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 p-1.5 pr-2.5 rounded-xl border border-slate-200 transition max-w-full"
                            >
                              <img
                                src={prod.image || '/products/PLB-PIPE-051.jpg'}
                                alt={prod.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                                }}
                                className="w-7 h-7 rounded-lg object-contain p-0.5 bg-white border border-slate-200 shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <span className="font-semibold text-xs text-slate-800 truncate block max-w-[130px] sm:max-w-xs">{prod.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Qty: {prod.qty} units</span>
                              </div>
                              <button
                                onClick={() => {
                                  const fullProd = products.find(p => p.id === prod.id) || prod;
                                  setSelectedProductManual(fullProd);
                                }}
                                className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition shrink-0 cursor-pointer"
                                title="Open specs and installation guide"
                              >
                                Manual
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Checklist (Visible only when In Progress) */}
                      {isInProgress && (
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-blue-900">Installation Checklist:</span>
                            <span className="text-blue-700 font-mono text-[10px]">
                              {job.checklist.filter(c => c.done).length} of {job.checklist.length} done
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                            {job.checklist.map(item => (
                              <label
                                key={item.id}
                                className="flex items-start sm:items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition text-[11px]"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() => handleToggleChecklist(job.id, item.id)}
                                  className="w-3.5 h-3.5 mt-0.5 sm:mt-0 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                                />
                                <span className={`leading-tight ${item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                                  {item.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {job.completedAt ? (
                            <span className="text-emerald-700 font-semibold truncate">Completed: {job.completedAt}</span>
                          ) : job.startedAt ? (
                            <span className="text-blue-700 font-medium truncate">In Progress since: {job.startedAt}</span>
                          ) : (
                            <span>Assigned &bull; Ready to start</span>
                          )}
                        </div>

                        {/* Primary Workflow CTA Button */}
                        <div>
                          {isAssigned && (
                            <button
                              disabled={isSuspended}
                              onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer ${
                                isSuspended 
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                  : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                              }`}
                              title={isSuspended ? 'Action locked: Account Suspended' : 'Start work on site'}
                            >
                              <span>{isSuspended ? 'Locked (Suspended)' : 'Start Work'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              disabled={isSuspended}
                              onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
                              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer ${
                                isSuspended 
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                              }`}
                              title={isSuspended ? 'Action locked: Account Suspended' : 'Mark job completed'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isSuspended ? 'Locked (Suspended)' : 'Mark Job Completed'}</span>
                            </button>
                          )}

                          {isCompleted && (
                            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Completed</span>
                              </span>
                              <button
                                disabled={isSuspended}
                                onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                                className={`text-[10px] px-1 ${
                                  isSuspended ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-700 underline cursor-pointer'
                                }`}
                                title={isSuspended ? 'Action locked: Account Suspended' : 'Reopen job'}
                              >
                                Reopen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: DISTRIBUTOR ORDERS (Sri Venkateswara Distributors)  */}
        {/* ======================================================== */}
        {activeTab === 'dealer-orders' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Header & Distributor Details Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-100/40 via-blue-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/25 shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                        Distributor Material Orders
                      </h1>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live B2B Feed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Showing real-time supply orders placed by your regional partner <strong className="text-slate-800">Sri Venkateswara Distributors</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Plot 42, Peenya Ind. Area, Bengaluru</span>
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>+91 90000 11111</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>dealer@plumbmart-demo.com</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={fetchDealerOrders}
                    disabled={loadingDealerOrders}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Refresh orders from server"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingDealerOrders ? 'animate-spin text-amber-600' : ''}`} />
                    <span>{loadingDealerOrders ? 'Syncing...' : 'Refresh Orders'}</span>
                  </button>
                </div>
              </div>

              {/* Metric Summary Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-100">
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Total Orders Placed</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{dealerOrders.length}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Materials Sourced</p>
                  <p className="text-base sm:text-lg font-black text-amber-700 mt-0.5">
                    {dealerOrders.reduce((sum, o) => sum + (o.itemsCount || (Array.isArray(o.items) ? o.items.reduce((s, it) => s + (it.qty || it.quantity || 1), 0) : 0)), 0)} Units
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">In Transit / Ready</p>
                  <p className="text-base sm:text-lg font-black text-blue-600 mt-0.5">
                    {dealerOrders.filter(o => o.status === 'Out for Delivery' || o.status === 'Dispatched').length}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">Total Order Volume</p>
                  <p className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                    ₹{dealerOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
                {[
                  { id: 'All', label: 'All Orders', count: dealerOrders.length },
                  { id: 'Out for Delivery', label: 'Out for Delivery', count: dealerOrders.filter(o => o.status === 'Out for Delivery').length },
                  { id: 'Dispatched', label: 'Dispatched', count: dealerOrders.filter(o => o.status === 'Dispatched').length },
                  { id: 'Order Confirmed', label: 'Confirmed', count: dealerOrders.filter(o => o.status === 'Order Confirmed').length },
                  { id: 'Delivered', label: 'Delivered', count: dealerOrders.filter(o => o.status === 'Delivered').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDealerOrderStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                      dealerOrderStatusFilter === tab.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      dealerOrderStatusFilter === tab.id
                        ? 'bg-amber-700/60 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dealerOrdersSearch}
                  onChange={e => setDealerOrdersSearch(e.target.value)}
                  placeholder="Search order ID, product, SKU, PO..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
                {dealerOrdersSearch && (
                  <button 
                    onClick={() => setDealerOrdersSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed List */}
            {filteredDealerOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-500 max-w-md mx-auto my-6 shadow-sm">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-800">No distributor orders found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dealerOrdersSearch ? 'No orders match your search criteria.' : 'No orders have been recorded for this status filter yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 sm:space-y-4">
                {filteredDealerOrders.map((order) => {
                  const statusColors = {
                    'Order Confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Warehouse Allocation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    'Packed & Verified': 'bg-amber-50 text-amber-800 border-amber-200',
                    'Dispatched': 'bg-purple-50 text-purple-700 border-purple-200',
                    'Out for Delivery': 'bg-amber-500/10 text-amber-800 border-amber-300',
                    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  };
                  const badgeClass = statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200';

                  const trackingSteps = order.tracking || [
                    { step: 1, title: 'Order Confirmed', completed: true },
                    { step: 2, title: 'Warehouse Reserved', completed: true },
                    { step: 3, title: 'Packed & Verified', completed: order.status !== 'Order Confirmed' },
                    { step: 4, title: 'Dispatched / In Transit', completed: order.status === 'Dispatched' || order.status === 'Out for Delivery' || order.status === 'Delivered' },
                    { step: 5, title: 'Delivered', completed: order.status === 'Delivered' }
                  ];

                  return (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 hover:border-amber-300 hover:shadow-md transition duration-200 space-y-3.5 sm:space-y-4"
                    >
                      {/* Order Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-mono font-black text-slate-900 text-base">
                              #{order.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${badgeClass}`}>
                              {order.status || 'Order Confirmed'}
                            </span>
                            {order.zohoSalesOrder && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {order.zohoSalesOrder}
                              </span>
                            )}
                            {order.poNumber && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                PO: {order.poNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span>Placed by <strong className="text-slate-700 font-semibold">{order.clientName || 'Sri Venkateswara Distributors'}</strong></span>
                            <span>&bull;</span>
                            <span>{order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Order')}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right flex sm:block items-center justify-between pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <p className="text-base sm:text-lg font-black text-slate-900">
                            ₹{(Number(order.total) || 0).toLocaleString('en-IN')}
                          </p>
                          <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-slate-500">
                            {order.paymentMethod || 'Paid Upfront'}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Site Destination */}
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 sm:line-clamp-1">{order.deliveryAddress}</span>
                        </div>
                      )}

                      {/* Materials List Table */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Materials in this Order ({Array.isArray(order.items) ? order.items.length : 1} Line Items):
                        </p>
                        <div className="bg-slate-50/70 rounded-xl sm:rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                          {(Array.isArray(order.items) ? order.items : []).map((it, idx) => (
                            <div key={idx} className="p-2.5 sm:p-3 flex items-center justify-between text-xs gap-2 sm:gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{it.name || 'Plumbing Supply Item'}</p>
                                {it.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{it.sku}</p>}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md text-[11px]">
                                  Qty: {it.qty || it.quantity || 1}
                                </span>
                                {it.price && (
                                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                    ₹{(it.price * (it.qty || it.quantity || 1)).toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5-Stage Live Dispatch Tracking Progression Bar */}
                      <div className="pt-1 sm:pt-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Supply Dispatch Pipeline:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 text-xs">
                          {trackingSteps.map((step, sIdx) => {
                            const isDone = step.completed;
                            return (
                              <div 
                                key={sIdx} 
                                className={`p-2 sm:p-2.5 rounded-xl border text-center transition flex flex-col justify-between ${
                                  isDone 
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400'
                                }`}
                              >
                                <div className="flex items-center justify-center mb-1">
                                  {isDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                  )}
                                </div>
                                <p className="text-[10px] sm:text-[11px] font-bold leading-tight">{step.title}</p>
                                {step.time && <p className="text-[9px] text-slate-500 mt-0.5">{step.time}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Plumber Field Response & Stage Confirmation Box */}
                      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border bg-gradient-to-r from-slate-50 to-amber-50/40 border-slate-200 space-y-2 sm:space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold shrink-0">
                              <Wrench className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                Plumber Field Response &amp; Stage Sign-Off
                              </p>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                Send real-time updates directly to Operations Admin &amp; Sri Venkateswara Distributors
                              </p>
                            </div>
                          </div>

                          {/* Current stage badge */}
                          {order.plumberStage === 'TASK_DONE' || order.status === 'Delivered' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Task Signed Off &bull; 100% Done</span>
                            </span>
                          ) : order.plumberStage === 'MATERIALS_RECEIVED' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 self-start sm:self-auto shrink-0">
                              <Check className="w-3 h-3 text-amber-700" />
                              <span>Materials Acknowledged on Site</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto shrink-0">
                              Pending Plumber Acknowledgment
                            </span>
                          )}
                        </div>

                        {/* If plumber previously responded, show details */}
                        {order.plumberResponse && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 font-medium gap-0.5">
                              <span className="truncate">Verified by: <strong className="text-slate-800">{order.plumberResponse.plumberName}</strong> ({order.plumberResponse.plumberLicense})</span>
                              <span className="font-mono text-slate-400">{order.plumberResponse.timestampStr || 'Recent'}</span>
                            </div>
                            {order.plumberResponse.notes && (
                              <p className="text-slate-700 font-medium italic">
                                &ldquo;{order.plumberResponse.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        )}

                        {/* Interactive Action Buttons for Plumber */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 flex-wrap">
                          {(!order.plumberStage || order.plumberStage === 'NONE') && order.status !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => {
                                setStageNoteInput('All items received on site in good condition according to packing slip.');
                                setStageNoteModal({
                                  order,
                                  targetStage: 'MATERIALS_RECEIVED',
                                  title: 'Acknowledge Materials Received',
                                  description: `Confirm delivery of ${Array.isArray(order.items) ? order.items.length : 1} material items from Sri Venkateswara Distributors.`,
                                  defaultNotes: 'All items received on site in good condition according to packing slip.'
                                });
                              }}
                              disabled={submittingResponseOrderId === order.id}
                              className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>1. Acknowledge Materials Received</span>
                            </button>
                          )}

                          {order.plumberStage === 'MATERIALS_RECEIVED' && order.status !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => {
                                setStageNoteInput('Work completed successfully. All pipes and valves installed, zero leakage verified under pressure test.');
                                setStageNoteModal({
                                  order,
                                  targetStage: 'TASK_DONE',
                                  title: 'Submit Task Completion & Sign-Off',
                                  description: `Submit final installation sign-off for Order #${order.id} to Operations Admin.`,
                                  defaultNotes: 'Work completed successfully. All pipes and valves installed, zero leakage verified under pressure test.'
                                });
                              }}
                              disabled={submittingResponseOrderId === order.id}
                              className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>2. Mark Work Done &amp; Send Sign-Off to Admin</span>
                            </button>
                          )}

                          {order.status === 'Delivered' && (
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-full sm:w-auto">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Admin Operations Verified &amp; Closed Task</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Expected: <strong className="text-slate-700">{order.expectedDate || 'Tomorrow Morning'}</strong></span>
                        </span>

                        <button
                          onClick={() => setSelectedDealerOrder(order)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer text-center"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Material Packing Slip</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CHECK PRODUCT INFORMATION & INSTALLATION MANUALS */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Product Information &amp; Manuals</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Read technical specifications and step-by-step installation instructions for plumbing supplies
                </p>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto shrink-0">
                Official Installation Guides
              </span>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  placeholder="Search pipe, valve, tap specs or instructions..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
                {['All', 'Pipes & Tubes', 'Fittings & Valves', 'Bath & Faucets', 'Pumps & Motors', 'Tools & Sealants', 'Water Tanks & Storage', 'Drainage & Sanitary'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                    <div className="h-36 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-500 max-w-md mx-auto my-6">
                <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-700">No products found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search term or select All Categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail & SKU */}
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-white mb-3 border border-slate-100 flex items-center justify-center">
                        <img 
                          src={product.image || '/products/PLB-PIPE-051.jpg'} 
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                          }}
                          className="w-full h-full object-contain p-2"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-amber-700 shadow-xs">
                          {product.brand}
                        </span>
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-emerald-400">
                          {product.sku || 'SKU-ZH'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 mb-1.5 h-8">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Quick Specs Pill */}
                      {product.specs && (
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[10px] space-y-1 mb-3">
                          <span className="font-bold text-slate-700 block uppercase">Key Specs:</span>
                          <div className="grid grid-cols-2 gap-1 text-slate-600">
                            {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="font-semibold text-slate-400">{k}: </span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Open Manual Button */}
                    <button
                      onClick={() => setSelectedProductManual(product)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Check Installation Manual</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: RECEIVE UPDATES & ANNOUNCEMENTS                  */}
        {/* ======================================================== */}
        {activeTab === 'updates' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Updates &amp; Announcements</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  New job assignments, schedule changes, and technical company announcements
                </p>
              </div>

              {unreadUpdatesCount > 0 && (
                <button
                  onClick={handleMarkAllUpdatesRead}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition text-center cursor-pointer"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {/* Updates List */}
            <div className="space-y-3">
              {updates.map(item => (
                <div 
                  key={item.id}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${
                    item.unread 
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                      item.type === 'assignment'
                        ? 'bg-blue-100 text-blue-700'
                        : item.type === 'schedule'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type === 'assignment' ? <Briefcase className="w-4 h-4" /> : item.type === 'schedule' ? <CalendarClock className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        {item.unread && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  {item.actionTab && (
                    <button
                      onClick={() => handleSelectTab(item.actionTab)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      <span>View in {item.actionTab === 'activities' ? 'Activities' : item.actionTab === 'products' ? 'Manuals' : 'Profile'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MANAGE PROFILE & VERIFICATION STATUS             */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Plumber Profile &amp; Verification</span>
                  {isProfileLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600 ml-1" />
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registered mobile number, verified credentials, and field performance
                </p>
              </div>

              <button
                onClick={handleOpenEditProfile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shadow-amber-600/20 active:scale-95 cursor-pointer text-center"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile &amp; KYC</span>
              </button>
            </div>

            {/* Top Identity Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg shadow-amber-500/30 shrink-0">
                  <Wrench className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black tracking-tight truncate">{plumber.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-1 border shrink-0 ${
                      isSuspended
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isSuspended ? <AlertCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {isSuspended ? 'SUSPENDED' : (plumber.status || 'VERIFIED')}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-mono mt-0.5 truncate">License ID: {plumber.license}</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">{plumber.specialization}</p>
                </div>
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-2 md:flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rating</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">★ {plumber.rating} / 5.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Jobs Done</span>
                  <span className="text-base sm:text-lg font-black text-white">{plumber.completedJobs}+</span>
                </div>
              </div>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              
              {/* Registered Contact & Verification */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Registered Contact &amp; Verification</span>
                  </h3>
                  <button
                    onClick={handleOpenEditProfile}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Registered Mobile:</span>
                    </div>
                    <strong className="text-slate-900 font-mono font-bold text-xs">+91 {plumber.mobile}</strong>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Registered Email:</span>
                    </div>
                    <strong className="text-slate-900 font-mono text-xs break-all">{plumber.email}</strong>
                  </div>

                  {isSuspended ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-bold">Verification Status:</span>
                      </div>
                      <span className="font-black text-rose-700 uppercase">SUSPENDED (Action Required)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">Verification Status:</span>
                      </div>
                      <span className="font-black text-emerald-700 uppercase">{plumber.status || 'VERIFIED'} (Active)</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Operating City &amp; Zones:</span>
                    </div>
                    <strong className="text-slate-800 text-xs sm:text-right">{plumber.city}</strong>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 shrink-0">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Registered Address:</span>
                    </div>
                    <strong className="text-slate-800 text-xs text-left sm:text-right max-w-full sm:max-w-xs break-words">{plumber.address}</strong>
                  </div>
                </div>
              </div>

              {/* Working Hours & Plumber Preferences */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5 sm:space-y-4">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Work Availability &amp; Dispatch</span>
                </h3>

                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSuspended
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}>
                    <div>
                      <p className="font-bold">Accepting New Work Assignments</p>
                      <p className={`text-[10px] ${isSuspended ? 'text-rose-700' : 'text-amber-700'}`}>
                        {isSuspended 
                          ? 'Dispatch temporarily halted due to account suspension' 
                          : 'Receive instant push & SMS alerts for nearby jobs'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-xs self-start sm:self-auto ${
                      isSuspended ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold block">Certified Skills:</span>
                      <span className="text-[10px] text-slate-400">{Array.isArray(plumber.skills) ? plumber.skills.length : 0} Verified</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Array.isArray(plumber.skills) && plumber.skills.length > 0 ? plumber.skills : [
                        'CPVC High Pressure Solvent Welding',
                        'UPVC Ball Valve Installation',
                        'Basin & Shower Mixer Cartridges',
                        'Kirloskar Pump Servicing',
                        'Sanitary Hydrostatic Leak Testing'
                      ]).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-600">
                    <span>Field Equipment Safety Kit:</span>
                    <strong className="text-emerald-700 font-semibold">Verified Compliant</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* PRODUCT INSTALLATION MANUAL & SPECS MODAL               */}
        {/* ======================================================== */}
        {selectedProductManual && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 border border-slate-200 shadow-2xl relative max-h-[88vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProductManual(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100 pr-8">
                <img
                  src={selectedProductManual.image || '/products/PLB-PIPE-051.jpg'}
                  alt={selectedProductManual.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                  }}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-contain p-1 bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    {selectedProductManual.brand} &bull; {selectedProductManual.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {selectedProductManual.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    SKU: {selectedProductManual.sku || 'ZH-PROD-SKU'}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="py-3 sm:py-4 space-y-3.5 sm:space-y-4 text-xs text-slate-700">
                
                {/* Product Description */}
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 text-xs">
                  {selectedProductManual.description}
                </p>

                {/* Technical Specifications */}
                {selectedProductManual.specs && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Technical Specifications</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedProductManual.specs).map(([k, v]) => (
                        <div key={k} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                            {k.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Installation Instructions */}
                <div className="space-y-2.5 bg-amber-50/50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/80">
                  <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Plumber Installation Instructions:</span>
                  </h4>

                  <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-800 leading-relaxed">
                    <li>
                      <strong>Line Inspection &amp; Cut:</strong> Measure twice and cut with approved pipe cutter. Deburr inner bore and outer bevel edge at 15°.
                    </li>
                    <li>
                      <strong>Dry Fit Verification:</strong> Clean contact surfaces with dry lint-free cloth. Dry-fit into socket to ensure 1/3 to 2/3 engagement depth.
                    </li>
                    <li>
                      <strong>Solvent / Sealant Application:</strong> Apply thin uniform layer of approved primer and CPVC/UPVC cement (or wrap 5 turns clockwise PTFE tape on brass threads).
                    </li>
                    <li>
                      <strong>Assembly &amp; Alignment:</strong> Insert pipe into fitting with a 90° twist and hold firmly for 30 seconds to prevent push-out.
                    </li>
                    <li>
                      <strong>Curing &amp; Hydrostatic Test:</strong> Allow minimum 15 minutes initial set time and 2 hours full cure before opening main pressure supply. Test for zero seepage.
                    </li>
                  </ol>
                </div>

                {/* Required Tools Checklist for Plumber */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Required Tools for This Job:</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Ratchet Pipe Cutter', 'Deburring Tool', 'Teflon PTFE Tape', 'Adjustable Spanner', 'Solvent Cement', 'Spirit Level', 'Hydrostatic Pressure Gauge'].map((tool, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  onClick={() => alert(`Downloading technical manual PDF for ${selectedProductManual.name}...`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Manual (PDF)</span>
                </button>

                <button
                  onClick={() => setSelectedProductManual(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Close Guide
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EDIT PLUMBER PROFILE MODAL (SUPABASE DB SYNC)            */}
        {/* ======================================================== */}
        {isEditProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 shadow-2xl relative max-h-[88vh] overflow-y-auto">
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100 pr-8">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Plumber Profile &amp; KYC</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Save changes directly to Supabase database</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="py-3 sm:py-4 space-y-3.5 sm:space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registered Email *</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. plumber@plumbmart.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operating City / Region *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. Bengaluru (East & South Zones)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registered Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Workshop / Residential address..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      placeholder="e.g. CPVC/UPVC Piping, Pumps"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience (Yrs)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Certified Skills (Comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.skillsText}
                    onChange={(e) => setProfileForm({ ...profileForm, skillsText: e.target.value })}
                    placeholder="CPVC Solvent Welding, UPVC Ball Valve Installation, Mixer Cartridges..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-amber-600/25 disabled:opacity-50 cursor-pointer text-center"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Supabase...</span>
                      </>
                    ) : (
                      <span>Save to Database</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACCOUNT SUSPENDED POPUP MODAL                            */}
        {/* ======================================================== */}
        {isSuspended && isSuspendedModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto">
              
              {/* Red Warning Header */}
              <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 p-4 sm:p-6 text-white text-center relative">
                <button
                  type="button"
                  onClick={() => setIsSuspendedModalOpen(false)}
                  className="absolute right-3.5 top-3.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-inner">
                  <AlertCircle className="w-8 h-8 sm:w-9 sm:h-9 text-white animate-pulse" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 text-rose-100 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2 border border-white/20">
                  <span>Official Compliance Notice</span> &bull; <span>Status: SUSPENDED</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Plumber Account Suspended</h2>
                <p className="text-xs text-rose-100 mt-1 max-w-sm mx-auto">
                  Your PlumbMart professional license &amp; job execution rights have been temporarily suspended.
                </p>
              </div>

              {/* Body Details */}
              <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                {/* Plumber Credentials Box */}
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Plumber Name:</span>
                    <strong className="text-slate-900 font-bold">{plumber.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Registered Mobile:</span>
                    <strong className="text-slate-900 font-mono">+91 {plumber.mobile}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>License ID:</span>
                    <strong className="text-slate-900 font-mono">{plumber.license || 'PLUMB-KA-2024-884'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Audit Ref:</span>
                    <span className="text-rose-600 font-mono font-bold">SUSP-REF-{String(plumber.mobile).slice(-4)}</span>
                  </div>
                </div>

                {/* What does this mean? */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">Suspension Restrictions:</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span><strong>No New Job Assignments:</strong> You will not receive any new customer job dispatches.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span><strong>Job Stage Updates Locked:</strong> You cannot start or mark completed existing activities.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span><strong>Incentive Payouts on Hold:</strong> Wallet transfers are temporarily paused pending review.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="text-slate-500">Product manuals, pipe specifications, and technical guides remain accessible.</span>
                    </li>
                  </ul>
                </div>

                {/* Helpline Card */}
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Need Help or Want to Appeal?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Please contact PlumbMart Verification &amp; Compliance Desk to submit updated trade license, KYC documents, or resolve queries.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <a
                      href="tel:180020267586"
                      className="w-full sm:flex-1 text-center py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs"
                    >
                      📞 Call: 1800-2026-PLUM
                    </a>
                    <a
                      href="mailto:compliance@plumbmart.com"
                      className="w-full sm:flex-1 text-center py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition shadow-2xs"
                    >
                      ✉️ Email Desk
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSuspendedModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs text-center cursor-pointer"
                  >
                    I Understand &bull; Continue in Read-Only Mode
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* DISTRIBUTOR ORDER / MATERIAL PACKING SLIP MODAL         */}
        {/* ======================================================== */}
        {selectedDealerOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-7 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedDealerOrder(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100 pr-8">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20 shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                      Material Dispatch &amp; Packing Slip
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      #{selectedDealerOrder.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official B2B Material Dispatch Record • PlumbMart Hub
                  </p>
                </div>
              </div>

              {/* Order Meta Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 py-3 sm:py-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Distributor</span>
                  <span className="font-bold text-slate-900 truncate block">{selectedDealerOrder.clientName || 'Sri Venkateswara Distributors'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zoho CRM Ref</span>
                  <span className="font-mono font-semibold text-slate-700 truncate block">{selectedDealerOrder.zohoSalesOrder || 'SO-ZH-PENDING'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PO Number</span>
                  <span className="font-mono font-semibold text-amber-700 truncate block">{selectedDealerOrder.poNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedDealerOrder.status || 'Confirmed'}
                  </span>
                </div>
              </div>

              {/* Distributor & Delivery Point Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 py-3 sm:py-4 text-xs">
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Sourcing Depot &amp; Vendor</span>
                  </p>
                  <p className="font-bold text-slate-900">{selectedDealerOrder.clientName || 'Sri Venkateswara Distributors'}</p>
                  <p className="text-slate-500 text-[11px]">Peenya Industrial Area Phase 1, Central Depot 02, Bengaluru</p>
                  <p className="text-slate-600 text-[11px] font-mono">GSTIN: 29AAACS1234F1Z5 • +91 90000 11111</p>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Delivery / Installation Site</span>
                  </p>
                  <p className="font-bold text-slate-900">{selectedDealerOrder.deliveryAddress || 'Site Delivery, Bengaluru'}</p>
                  <p className="text-slate-500 text-[11px]">Expected: {selectedDealerOrder.expectedDate || 'Tomorrow Morning'}</p>
                  <p className="text-slate-600 text-[11px]">Payment Terms: {selectedDealerOrder.paymentMethod || 'Paid Upfront'}</p>
                </div>
              </div>

              {/* Itemized Materials Table - Horizontal Scroll on Small Mobile */}
              <div className="py-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Materials Checklist ({Array.isArray(selectedDealerOrder.items) ? selectedDealerOrder.items.length : 1} Items)
                  </h4>
                  <span className="text-[11px] font-normal text-slate-400 lowercase">
                    total units: {selectedDealerOrder.itemsCount || (Array.isArray(selectedDealerOrder.items) ? selectedDealerOrder.items.reduce((s, it) => s + (it.qty || it.quantity || 1), 0) : 1)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-x-auto text-xs">
                  <table className="w-full text-left divide-y divide-slate-100 min-w-[420px]">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 sm:p-3">#</th>
                        <th className="p-2.5 sm:p-3">Description &amp; SKU</th>
                        <th className="p-2.5 sm:p-3 text-center">Qty</th>
                        <th className="p-2.5 sm:p-3 text-right">Unit Price</th>
                        <th className="p-2.5 sm:p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(Array.isArray(selectedDealerOrder.items) ? selectedDealerOrder.items : []).map((item, idx) => {
                        const qty = item.qty || item.quantity || 1;
                        const price = item.price || 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 sm:p-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 sm:p-3">
                              <p className="font-bold text-slate-900">{item.name || 'Plumbing Material'}</p>
                              {item.sku && <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>}
                            </td>
                            <td className="p-2.5 sm:p-3 text-center">
                              <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                                {qty}
                              </span>
                            </td>
                            <td className="p-2.5 sm:p-3 text-right text-slate-600 font-mono">
                              ₹{price.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 sm:p-3 text-right font-bold text-slate-900 font-mono">
                              ₹{(price * qty).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slip Totals & Calculations */}
              <div className="mt-2.5 sm:mt-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{Math.round((Number(selectedDealerOrder.total) || 0) / 1.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Integrated B2B GST):</span>
                  <span className="font-mono">₹{Math.round((Number(selectedDealerOrder.total) || 0) - ((Number(selectedDealerOrder.total) || 0) / 1.18)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Order Value:</span>
                  <span className="text-emerald-700 font-mono">₹{(Number(selectedDealerOrder.total) || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Tracking Pipeline Tracker */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Real-time Dispatch Pipeline:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 text-xs">
                  {(selectedDealerOrder.tracking || [
                    { step: 1, title: 'Order Confirmed', completed: true, time: 'Done' },
                    { step: 2, title: 'Warehouse Reserved', completed: true, time: 'Done' },
                    { step: 3, title: 'Packed & Verified', completed: selectedDealerOrder.status !== 'Order Confirmed', time: 'Expected' },
                    { step: 4, title: 'Dispatched', completed: selectedDealerOrder.status === 'Dispatched' || selectedDealerOrder.status === 'Out for Delivery' || selectedDealerOrder.status === 'Delivered', time: 'Expected' },
                    { step: 5, title: 'Delivered', completed: selectedDealerOrder.status === 'Delivered', time: 'Tomorrow' }
                  ]).map((st, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 sm:p-2.5 rounded-xl border text-center flex flex-col justify-between ${
                        st.completed 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {st.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold leading-tight">{st.title}</span>
                      {st.time && <span className="text-[9px] text-slate-500 mt-0.5">{st.time}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plumber Response Block inside Packing Slip */}
              <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Plumber Field Sign-Off Status:</span>
                  </span>
                  {selectedDealerOrder.plumberStage === 'TASK_DONE' || selectedDealerOrder.status === 'Delivered' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                      ✓ Task Completed &amp; Verified
                    </span>
                  ) : selectedDealerOrder.plumberStage === 'MATERIALS_RECEIVED' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                      ✓ Materials Acknowledged on Site
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 self-start sm:self-auto">
                      Pending Plumber Receipt
                    </span>
                  )}
                </div>

                {selectedDealerOrder.plumberResponse && (
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Signed by: <strong>{selectedDealerOrder.plumberResponse.plumberName}</strong> ({selectedDealerOrder.plumberResponse.timestampStr}) &bull; Notes: <em>&ldquo;{selectedDealerOrder.plumberResponse.notes || 'Verified'}&rdquo;</em>
                  </p>
                )}

                {/* Quick actions inside modal */}
                {selectedDealerOrder.status !== 'Delivered' && (
                  <div className="pt-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {(!selectedDealerOrder.plumberStage || selectedDealerOrder.plumberStage === 'NONE') && (
                      <button
                        type="button"
                        onClick={() => {
                          setStageNoteInput('All items received on site in good condition according to packing slip.');
                          setStageNoteModal({
                            order: selectedDealerOrder,
                            targetStage: 'MATERIALS_RECEIVED',
                            title: 'Acknowledge Materials Received',
                            description: `Confirm delivery of ${Array.isArray(selectedDealerOrder.items) ? selectedDealerOrder.items.length : 1} material items from Sri Venkateswara Distributors.`,
                            defaultNotes: 'All items received on site in good condition according to packing slip.'
                          });
                        }}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge Materials Received</span>
                      </button>
                    )}

                    {selectedDealerOrder.plumberStage === 'MATERIALS_RECEIVED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setStageNoteInput('Work completed successfully. All pipes and valves installed, zero leakage verified under pressure test.');
                          setStageNoteModal({
                            order: selectedDealerOrder,
                            targetStage: 'TASK_DONE',
                            title: 'Submit Task Completion & Sign-Off',
                            description: `Submit final installation sign-off for Order #${selectedDealerOrder.id} to Operations Admin.`,
                            defaultNotes: 'Work completed successfully. All pipes and valves installed, zero leakage verified under pressure test.'
                          });
                        }}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Work Done &amp; Send Sign-Off to Admin</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-4 pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDealerOrder(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer text-center"
                >
                  Close Slip
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PLUMBER STAGE CONFIRMATION & NOTES MODAL                */}
        {/* ======================================================== */}
        {stageNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 shadow-2xl relative space-y-3.5 sm:space-y-4 max-h-[88vh] overflow-y-auto">
              <button
                onClick={() => setStageNoteModal(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 pr-8">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  stageNoteModal.targetStage === 'TASK_DONE' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {stageNoteModal.targetStage === 'TASK_DONE' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {stageNoteModal.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    Order <strong className="font-mono text-slate-700">#{stageNoteModal.order.id}</strong> &bull; Sourced from Sri Venkateswara Distributors
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {stageNoteModal.description}
                </p>

                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Signing Plumber Identity:</p>
                  <p>👤 {plumber.name} &bull; License: <span className="font-mono">{plumber.license}</span></p>
                  <p>📱 Registered Mobile: +91 {plumber.mobile}</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Field Verification Notes / Remarks (Sent directly to Operations Admin):
                  </label>
                  <textarea
                    rows={3}
                    value={stageNoteInput}
                    onChange={(e) => setStageNoteInput(e.target.value)}
                    placeholder="Enter inspection or test details..."
                    className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                {/* Quick remark pills */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1">
                  {(stageNoteModal.targetStage === 'TASK_DONE' ? [
                    'Pressure tested at 6 bar - zero leaks',
                    'All fittings welded & certified',
                    'Customer handed over inspection'
                  ] : [
                    'All items received in good condition',
                    'Package verified against PO slip',
                    'Shortage / dent reported none'
                  ]).map((remark, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStageNoteInput(remark)}
                      className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 transition cursor-pointer text-left"
                    >
                      + {remark}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setStageNoteModal(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingResponseOrderId === stageNoteModal.order.id}
                  onClick={() => handleSendPlumberResponse(stageNoteModal.order.id, stageNoteModal.targetStage, stageNoteInput)}
                  className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-center ${
                    stageNoteModal.targetStage === 'TASK_DONE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {submittingResponseOrderId === stageNoteModal.order.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Send Response</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </PlumberLayout>
  );
}
