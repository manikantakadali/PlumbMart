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
  Mail
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
  const [activeTab, setActiveTab] = useState(urlTab); // 'activities' | 'products' | 'updates' | 'profile'

  useEffect(() => {
    if (urlTab && ['activities', 'products', 'updates', 'profile'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

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

  // Fetch plumber profile from Supabase DB
  const fetchPlumberProfile = async () => {
    try {
      setIsProfileLoading(true);
      const res = await fetch(`/api/plumber/profile?mobile=${encodeURIComponent(activeMobile)}`);
      const data = await res.json();
      if (data && data.success && data.plumber) {
        setPlumber(prev => ({ ...prev, ...data.plumber }));
      }
    } catch (err) {
      console.warn('Error loading plumber profile from Supabase:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchPlumberProfile();
  }, [activeMobile]);

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
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(err => console.error('Error loading products for plumber:', err))
      .finally(() => setProductsLoading(false));
  }, []);

  // Update Job Status: Assigned -> In Progress -> Completed
  const handleUpdateJobStatus = (jobId, newStatus) => {
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

  // Toggle checklist item
  const handleToggleChecklist = (jobId, checkId) => {
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
    setUpdates(prev => prev.map(u => ({ ...u, unread: false })));
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
    >
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative">

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: MY ACTIVITIES (Simple, Clean, Modern UI)         */}
        {/* ======================================================== */}
        {activeTab === 'activities' && (
          <div className="space-y-5">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  <span>My Activities</span>
                </h1>
                <p className="text-xs text-slate-500">
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
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

            {/* Filter Tabs Pills with Item Counts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'All', label: 'All Jobs', count: jobs.length },
                { id: 'Assigned', label: 'Assigned', count: jobs.filter(j => j.status === 'Assigned').length },
                { id: 'In Progress', label: 'In Progress', count: jobs.filter(j => j.status === 'In Progress').length },
                { id: 'Completed', label: 'Completed', count: jobs.filter(j => j.status === 'Completed').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivityStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
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
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 max-w-md mx-auto my-6">
                <Briefcase className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-700">No matching jobs found</p>
                <p className="text-xs text-slate-400 mt-1">Try switching filter tabs or clear your search query.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => {
                  const isAssigned = job.status === 'Assigned';
                  const isInProgress = job.status === 'In Progress';
                  const isCompleted = job.status === 'Completed';

                  return (
                    <div 
                      key={job.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
                    >
                      {/* Top Bar: Job Tag, Scheduled Date, and Instant Status Switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{job.id}
                          </span>
                          <span className="font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {job.jobType}
                          </span>
                          <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            {job.scheduledDate}
                          </span>
                        </div>

                        {/* Instant 3-Stage Status Switcher (Assigned -> In Progress -> Completed) */}
                        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'Assigned')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              isAssigned
                                ? 'bg-amber-500 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Set as Assigned"
                          >
                            Assigned
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              isInProgress
                                ? 'bg-blue-600 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Set as In Progress"
                          >
                            In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Set as Completed"
                          >
                            Completed
                          </button>
                        </div>
                      </div>

                      {/* Job Title & Summary */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {job.description}
                        </p>
                      </div>

                      {/* Customer Details & Work Location Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        
                        {/* Customer Row */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
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
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
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
                        <div className="flex flex-wrap gap-2">
                          {job.productsInvolved.map((prod, idx) => (
                            <div 
                              key={idx}
                              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 p-1.5 pr-2.5 rounded-xl border border-slate-200 transition"
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
                              <div className="text-left">
                                <span className="font-semibold text-xs text-slate-800 truncate block max-w-[200px] sm:max-w-xs">{prod.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Qty: {prod.qty} units</span>
                              </div>
                              <button
                                onClick={() => {
                                  const fullProd = products.find(p => p.id === prod.id) || prod;
                                  setSelectedProductManual(fullProd);
                                }}
                                className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition"
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
                                className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition text-[11px]"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() => handleToggleChecklist(job.id, item.id)}
                                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className={item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
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
                          <Clock className="w-3.5 h-3.5" />
                          {job.completedAt ? (
                            <span className="text-emerald-700 font-semibold">Completed: {job.completedAt}</span>
                          ) : job.startedAt ? (
                            <span className="text-blue-700 font-medium">In Progress since: {job.startedAt}</span>
                          ) : (
                            <span>Assigned &bull; Ready to start</span>
                          )}
                        </div>

                        {/* Primary Workflow CTA Button */}
                        <div>
                          {isAssigned && (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                            >
                              <span>Start Work</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark Job Completed</span>
                            </button>
                          )}

                          {isCompleted && (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Completed</span>
                              </span>
                              <button
                                onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                                className="text-[10px] text-slate-400 hover:text-slate-700 underline px-1"
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
        {/* TAB 2: CHECK PRODUCT INFORMATION & INSTALLATION MANUALS */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Product Information &amp; Manuals</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Read technical specifications and step-by-step installation instructions for plumbing supplies
                </p>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto">
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

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {['All', 'Pipes & Tubes', 'Fittings & Valves', 'Bath & Faucets', 'Pumps & Motors', 'Tools & Sealants'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                    <div className="h-36 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-6">
                <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-700">No products found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search term or select All Categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between"
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
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs"
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
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <span>Updates &amp; Announcements</span>
                </h1>
                <p className="text-xs text-slate-500">
                  New job assignments, schedule changes, and technical company announcements
                </p>
              </div>

              {unreadUpdatesCount > 0 && (
                <button
                  onClick={handleMarkAllUpdatesRead}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs self-start sm:self-auto transition"
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
                  className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    item.unread 
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                      item.type === 'assignment'
                        ? 'bg-blue-100 text-blue-700'
                        : item.type === 'schedule'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type === 'assignment' ? <Briefcase className="w-4 h-4" /> : item.type === 'schedule' ? <CalendarClock className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition self-start sm:self-center shrink-0"
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
        {/* ======================================================== */}
        {/* TAB 4: MANAGE PROFILE & VERIFICATION STATUS             */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <span>Plumber Profile &amp; Verification</span>
                  {isProfileLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600 ml-1" />
                  )}
                </h1>
                <p className="text-xs text-slate-500">
                  Registered mobile number, verified credentials, and field performance
                </p>
              </div>

              <button
                onClick={handleOpenEditProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shadow-amber-600/20 active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile &amp; KYC</span>
              </button>
            </div>

            {/* Top Identity Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/30">
                  <Wrench className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight">{plumber.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {plumber.status || 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">License ID: {plumber.license}</p>
                  <p className="text-xs text-slate-400 mt-1">{plumber.specialization}</p>
                </div>
              </div>

              {/* Status Metric Pills */}
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rating</span>
                  <span className="text-lg font-black text-amber-400">★ {plumber.rating} / 5.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Jobs Done</span>
                  <span className="text-lg font-black text-white">{plumber.completedJobs}+</span>
                </div>
              </div>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Registered Contact & Verification */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Registered Contact &amp; Verification</span>
                  </h3>
                  <button
                    onClick={handleOpenEditProfile}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>Registered Mobile Number:</span>
                    </div>
                    <strong className="text-slate-900 font-mono font-bold text-xs">+91 {plumber.mobile}</strong>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Registered Email:</span>
                    </div>
                    <strong className="text-slate-900 font-mono text-xs">{plumber.email}</strong>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Verification Status:</span>
                    </div>
                    <span className="font-black text-emerald-700 uppercase">{plumber.status || 'VERIFIED'} (Active)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Operating City &amp; Zones:</span>
                    </div>
                    <strong className="text-slate-800 text-xs">{plumber.city}</strong>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 shrink-0">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Registered Address:</span>
                    </div>
                    <strong className="text-slate-800 text-xs text-right max-w-xs truncate">{plumber.address}</strong>
                  </div>
                </div>
              </div>

              {/* Working Hours & Plumber Preferences */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Work Availability &amp; Dispatch</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Accepting New Work Assignments</p>
                      <p className="text-[10px] text-amber-700">Receive instant push &amp; SMS alerts for nearby jobs</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
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

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-600">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProductManual(null)}
                className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100 pr-8">
                <img
                  src={selectedProductManual.image || '/products/PLB-PIPE-051.jpg'}
                  alt={selectedProductManual.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                  }}
                  className="w-16 h-16 rounded-2xl object-contain p-1 bg-white border border-slate-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    {selectedProductManual.brand} &bull; {selectedProductManual.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {selectedProductManual.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    SKU: {selectedProductManual.sku || 'ZH-PROD-SKU'}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="py-4 space-y-4 text-xs text-slate-700">
                
                {/* Product Description */}
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProductManual.description}
                </p>

                {/* Technical Specifications */}
                {selectedProductManual.specs && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Technical Specifications</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedProductManual.specs).map(([k, v]) => (
                        <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
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
                <div className="space-y-2.5 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                  <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
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
                    <Box className="w-3.5 h-3.5 text-amber-600" />
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
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => alert(`Downloading technical manual PDF for ${selectedProductManual.name}...`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Manual (PDF)</span>
                </button>

                <button
                  onClick={() => setSelectedProductManual(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 pr-8">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Plumber Profile &amp; KYC</h3>
                  <p className="text-xs text-slate-500">Save changes directly to Supabase database</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="py-4 space-y-4 text-xs">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-2 shadow-sm shadow-amber-600/25 disabled:opacity-50"
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

      </main>
    </PlumberLayout>
  );
}
