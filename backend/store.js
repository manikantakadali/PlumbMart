const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const initialData = {
  zohoMeta: {
    workbookId: 'ZOHO-WB-PLUMBMART-2026',
    workbookName: 'PlumbMart_Master_Inventory_Pricing_v4.xlsx',
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'CONNECTED',
    webhookActive: true,
    totalSyncedRows: 8
  },
  banners: [
    {
      id: 'BAN-101',
      title: 'Free Master Plumber Site Visit',
      subtitle: 'Complimentary professional installation on orders above ₹5,000',
      badge: 'Certified Support',
      tag: 'Installation Free',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500'
    },
    {
      id: 'BAN-102',
      title: 'Astral ProFlow CPVC SDR 11',
      subtitle: 'Engineered for high-pressure hot & cold water distribution up to 93°C',
      badge: 'IS 15778 Certified',
      tag: 'Best Seller',
      gradient: 'from-indigo-600 via-purple-600 to-pink-500'
    },
    {
      id: 'BAN-103',
      title: 'Direct Online Payment Gateways',
      subtitle: 'Instant checkout via UPI (PhonePe, GPay), Cards & NetBanking',
      badge: '100% Secure',
      tag: 'Instant Confirm',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600'
    }
  ],
  categories: [
    { id: 'cat-pipes', name: 'CPVC & UPVC Pipes', icon: 'Pipette', description: 'High-pressure hot & cold water distribution pipes' },
    { id: 'cat-faucets', name: 'Luxury Faucets & Mixers', icon: 'Droplets', description: 'Chrome-plated brass basin & wall mixers' },
    { id: 'cat-valves', name: 'Industrial Valves & Fittings', icon: 'Wrench', description: 'Heavy-duty brass ball valves, elbows & tees' },
    { id: 'cat-pumps', name: 'Pressure Booster Pumps', icon: 'Gauge', description: 'Automatic domestic & commercial hydro-pneumatic pumps' },
    { id: 'cat-sanitary', name: 'Sanitaryware & Cisterns', icon: 'Bath', description: 'Concealed flushing cisterns & wall-hung systems' }
  ],
  zohoWorkbookProducts: [
    {
      id: 'PRD-1001',
      sku: 'ZW-CPVC-25MM',
      zohoRowId: 'ROW-01',
      name: 'Astral ProFlow CPVC Pipe 25mm (SDR 11 - 3m)',
      categoryId: 'cat-pipes',
      categoryName: 'CPVC & UPVC Pipes',
      brand: 'Astral ProFlow',
      unit: 'Bundle (10 Pipes)',
      customerPrice: 2850,
      dealerPrice: 2190,
      mrp: 3200,
      stockQuantity: 420,
      minDealerOrderQty: 5,
      isFeatured: true,
      isPopular: true,
      orderCount: 184,
      specifications: '25mm (1 inch) | SDR 11 | Temp Rating: up to 93°C | IS 15778 Certified',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 45,
      installationNote: 'Use heavy-duty CPVC solvent cement; cure 30 mins before pressure test.'
    },
    {
      id: 'PRD-1002',
      sku: 'ZW-UPVC-50MM',
      zohoRowId: 'ROW-02',
      name: 'AquaGuard Schedule 80 UPVC Pipe 50mm (6m)',
      categoryId: 'cat-pipes',
      categoryName: 'CPVC & UPVC Pipes',
      brand: 'AquaGuard',
      unit: 'Bundle (5 Pipes)',
      customerPrice: 3490,
      dealerPrice: 2740,
      mrp: 3900,
      stockQuantity: 185,
      minDealerOrderQty: 3,
      isFeatured: false,
      isPopular: true,
      orderCount: 96,
      specifications: '50mm (2 inch) | Schedule 80 | UV Stabilized Lead-Free Compound',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 60,
      installationNote: 'Ideal for overhead tank main header lines & cold water risers.'
    },
    {
      id: 'PRD-1003',
      sku: 'ZW-FAUCET-THERM',
      zohoRowId: 'ROW-03',
      name: 'Kohler-Style Thermostatic High-Flow Diverter Mixer',
      categoryId: 'cat-faucets',
      categoryName: 'Luxury Faucets & Mixers',
      brand: 'AquaLux',
      unit: 'Piece',
      customerPrice: 6499,
      dealerPrice: 4850,
      mrp: 7999,
      stockQuantity: 64,
      minDealerOrderQty: 4,
      isFeatured: true,
      isPopular: true,
      orderCount: 142,
      specifications: 'Solid DZR Brass | 40mm Ceramic Cartridge | 3-Way Outlet Diverter',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 120,
      installationNote: 'Ensure concealed box depth is between 55mm and 75mm from finished tile.'
    },
    {
      id: 'PRD-1004',
      sku: 'ZW-FAUCET-SENSOR',
      zohoRowId: 'ROW-04',
      name: 'EcoSense Infrared Touchless Basin Faucet (AC/DC)',
      categoryId: 'cat-faucets',
      categoryName: 'Luxury Faucets & Mixers',
      brand: 'EcoSense',
      unit: 'Piece',
      customerPrice: 4250,
      dealerPrice: 3180,
      mrp: 4990,
      stockQuantity: 92,
      minDealerOrderQty: 4,
      isFeatured: true,
      isPopular: false,
      orderCount: 54,
      specifications: 'Dual Power (6V DC / 230V AC) | 1.5 LPM Aerator | IP67 Sensor',
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 85,
      installationNote: 'Install inline strainer valve before solenoid box to prevent debris.'
    },
    {
      id: 'PRD-1005',
      sku: 'ZW-VALVE-BRASS-25',
      zohoRowId: 'ROW-05',
      name: 'Forged Brass Full-Bore Ball Valve 25mm (PN25)',
      categoryId: 'cat-valves',
      categoryName: 'Industrial Valves & Fittings',
      brand: 'VortexFlow',
      unit: 'Box (10 Valves)',
      customerPrice: 4600,
      dealerPrice: 3420,
      mrp: 5200,
      stockQuantity: 310,
      minDealerOrderQty: 2,
      isFeatured: false,
      isPopular: true,
      orderCount: 110,
      specifications: 'PN25 Pressure Rated | PTFE Seats | SS304 Lever Handle | BSP Threaded',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 70,
      installationNote: 'Use PTFE thread seal tape (min 6 wraps clockwise) on male BSP threads.'
    },
    {
      id: 'PRD-1006',
      sku: 'ZW-VALVE-PRV-20',
      zohoRowId: 'ROW-06',
      name: 'Precision Brass Pressure Reducing Valve w/ Gauge (20mm)',
      categoryId: 'cat-valves',
      categoryName: 'Industrial Valves & Fittings',
      brand: 'VortexFlow',
      unit: 'Piece',
      customerPrice: 2150,
      dealerPrice: 1590,
      mrp: 2600,
      stockQuantity: 140,
      minDealerOrderQty: 5,
      isFeatured: false,
      isPopular: false,
      orderCount: 38,
      specifications: 'Adjustable 1.5 to 6 Bar | Stainless Steel Mesh Filter | Dial Gauge Included',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 50,
      installationNote: 'Mount horizontally with pressure gauge facing upward; set to 3.0 Bar for apartments.'
    },
    {
      id: 'PRD-1007',
      sku: 'ZW-PUMP-BOOST-1HP',
      zohoRowId: 'ROW-07',
      name: 'Grundfos-Grade 1.0 HP Silent Pressure Booster Pump',
      categoryId: 'cat-pumps',
      categoryName: 'Pressure Booster Pumps',
      brand: 'HydroMax',
      unit: 'Unit',
      customerPrice: 18500,
      dealerPrice: 14600,
      mrp: 21500,
      stockQuantity: 28,
      minDealerOrderQty: 1,
      isFeatured: true,
      isPopular: true,
      orderCount: 72,
      specifications: '0.75 kW (1 HP) | 24L Diaphragm Tank | Dry-Run Protection | Up to 4 Bathrooms',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 250,
      installationNote: 'Install non-return valve (NRV) on suction line and vibration pads under baseplate.'
    },
    {
      id: 'PRD-1008',
      sku: 'ZW-SAN-CISTERN-DUAL',
      zohoRowId: 'ROW-08',
      name: 'Slimline Concealed Dual-Flush Cistern Frame System',
      categoryId: 'cat-sanitary',
      categoryName: 'Sanitaryware & Cisterns',
      brand: 'AquaLux',
      unit: 'Set',
      customerPrice: 7800,
      dealerPrice: 5950,
      mrp: 9200,
      stockQuantity: 75,
      minDealerOrderQty: 2,
      isFeatured: true,
      isPopular: false,
      orderCount: 46,
      specifications: '80mm Slim HDPE Tank | 3L/6L Dual Flush | Matte Chrome Actuation Plate | 400kg Frame',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
      plumberPoints: 140,
      installationNote: 'Anchor frame bolts into solid masonry/slab; verify 180mm WC bolt pitch.'
    }
  ],
  customerCarts: {
    'CUST-01': [
      { productId: 'PRD-1001', qty: 2, addedAt: '2026-10-12T10:00:00Z' },
      { productId: 'PRD-1003', qty: 1, addedAt: '2026-10-12T10:05:00Z' }
    ],
    'CUST-02': []
  },
  dealerCarts: {
    'DLR-01': [
      { productId: 'PRD-1001', qty: 10, addedAt: '2026-10-12T10:00:00Z' }
    ],
    'DLR-02': []
  },
  users: {
    customers: [
      {
        id: 'CUST-01',
        role: 'customer',
        name: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul.sharma@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        address: 'Flat 402, Green Valley Residency, Madhapur, Hyderabad - 500081',
        addresses: [
          {
            id: 'ADDR-101',
            label: 'Home Residency',
            addressLine: 'Flat 402, Green Valley Residency, Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500081',
            isDefault: true
          },
          {
            id: 'ADDR-102',
            label: 'Construction Site / Villa',
            addressLine: 'Plot 88, Financial District Extension, Nanakramguda',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500032',
            isDefault: false
          }
        ],
        createdAt: '2026-09-15T10:00:00Z',
        notifications: [
          {
            id: 'NOTIF-CUST-1',
            type: 'ORDER_UPDATE',
            title: 'Order Shipped (ORD-2026-101)',
            message: 'Your plumbing items are on the way. Assigned Master Plumber: Ramesh Babu.',
            time: '2 hours ago',
            read: false
          },
          {
            id: 'NOTIF-CUST-2',
            type: 'PAYMENT_UPDATE',
            title: 'Payment Successful: ₹12,199',
            message: 'Direct payment via UPI (PhonePe) was settled successfully.',
            time: '1 day ago',
            read: true
          },
          {
            id: 'NOTIF-CUST-3',
            type: 'GENERAL',
            title: 'Free Installation Support Active',
            message: 'Your order qualifies for complimentary on-site plumber inspection.',
            time: '3 days ago',
            read: true
          }
        ]
      },
      {
        id: 'CUST-02',
        role: 'customer',
        name: 'Priya Nair',
        mobile: '9848011223',
        email: 'priya.nair@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
        address: 'Villa 18, Palm Meadows, Whitefield, Bengaluru - 560066',
        addresses: [
          {
            id: 'ADDR-201',
            label: 'Primary Villa',
            addressLine: 'Villa 18, Palm Meadows, Whitefield',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560066',
            isDefault: true
          }
        ],
        createdAt: '2026-09-22T14:30:00Z',
        notifications: [
          {
            id: 'NOTIF-CUST-4',
            type: 'GENERAL',
            title: 'Welcome to PlumbMart!',
            message: 'Order certified CPVC pipes and plumbing fittings with verified installer support.',
            time: '5 days ago',
            read: true
          }
        ]
      }
    ],
    dealers: [
      {
        id: 'DLR-01',
        role: 'dealer',
        name: 'Sri Venkateswara Sanitary & Hardware Distributors',
        contactPerson: 'Suresh Reddy',
        mobile: '9000011111',
        gstin: '36AABCS1429B1Z5',
        zohoContactId: 'ZCRM-DLR-8821',
        zohoVerified: true,
        creditEligible: true,
        credit30DaysAllowed: true,
        credit90DaysAllowed: true,
        creditLimit: 500000,
        creditUsed: 112400,
        city: 'Hyderabad',
        tier: 'Platinum Approved Dealer (30 & 90 Days Credit)',
        notifications: [
          {
            id: 'NOTIF-DLR-1',
            type: 'CREDIT_UPDATE',
            title: '90-Day Credit Approved by Admin',
            message: 'Your dealership has been granted 90-Day Credit Line up to ₹5,00,000 via Zoho Books.',
            time: '1 day ago',
            read: false
          }
        ]
      },
      {
        id: 'DLR-02',
        role: 'dealer',
        name: 'Metro Pipe & Fittings Syndicate',
        contactPerson: 'Imran Khan',
        mobile: '9000022222',
        gstin: '36AAECM4910C1Z1',
        zohoContactId: 'ZCRM-DLR-8845',
        zohoVerified: true,
        creditEligible: true,
        credit30DaysAllowed: true,
        credit90DaysAllowed: false,
        creditLimit: 200000,
        creditUsed: 45000,
        city: 'Vijayawada',
        tier: 'Gold Verified Dealer (Upfront & 30 Days Credit)',
        notifications: [
          {
            id: 'NOTIF-DLR-3',
            type: 'ELIGIBILITY_UPDATE',
            title: '30-Day Credit Active',
            message: '30-Day Credit is enabled for your account. 90-Day credit requires Admin review.',
            time: '3 days ago',
            read: true
          }
        ]
      },
      {
        id: 'DLR-03',
        role: 'dealer',
        name: 'Coastal Builders Mart (Unverified in Zoho)',
        contactPerson: 'Kiran Kumar',
        mobile: '9000033333',
        gstin: '37AADCC9920D1Z8',
        zohoContactId: 'ZCRM-DLR-PENDING',
        zohoVerified: false,
        creditEligible: false,
        credit30DaysAllowed: false,
        credit90DaysAllowed: false,
        creditLimit: 0,
        creditUsed: 0,
        city: 'Visakhapatnam',
        tier: 'Pending Zoho Verification',
        notifications: [
          {
            id: 'NOTIF-DLR-4',
            type: 'VERIFICATION_UPDATE',
            title: 'Zoho CRM Verification Required',
            message: 'Please ask PlumbMart Admin to verify your GST & Zoho Contact.',
            time: '1 hour ago',
            read: false
          }
        ]
      }
    ],
    plumbers: [
      {
        id: 'PLB-01',
        role: 'plumber',
        name: 'Ramesh Babu (Master Plumber)',
        mobile: '9111122222',
        email: 'ramesh.babu@plumbmart.in',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80',
        licenseNo: 'IPA-HYD-2024-0891',
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
        experienceYears: 9,
        specialization: 'High-Rise CPVC Piping, Booster Pumps & Concealed Diverters',
        skills: ['CPVC & UPVC Piping', 'Thermostatic Diverters', 'Booster Pumps', 'Hydro Pressure Testing', 'SDR 11 Jointing'],
        serviceArea: 'Madhapur, Hitec City, Kondapur, Gachibowli',
        address: 'Plot 12, Sri Ram Nagar, Kondapur, Hyderabad - 500084',
        rating: 4.9,
        completedJobs: 142,
        rewardPoints: 1840,
        walletBalance: 4250,
        city: 'Hyderabad',
        settings: {
          jobAlerts: true,
          productAlerts: true,
          rewardAlerts: true,
          isAvailableForJobs: true
        },
        notifications: [
          {
            id: 'NOTIF-PLB-1',
            type: 'ASSIGNED_ACTIVITY',
            title: 'New Installation Assigned: ACT-2026-101',
            message: 'Assigned to customer Rahul Sharma (Madhapur) for diverter & pipe installation.',
            time: '2 hours ago',
            read: false
          },
          {
            id: 'NOTIF-PLB-2',
            type: 'REQUEST_UPDATE',
            title: 'Product Requirement REQ-PLB-501 Approved',
            message: 'Your request for 4x Forged Brass Ball Valves has been approved for Madhapur site.',
            time: '1 day ago',
            read: true
          },
          {
            id: 'NOTIF-PLB-3',
            type: 'REWARD_UPDATE',
            title: '+150 Reward Points Credited',
            message: 'Job ACT-2026-098 marked completed. ₹500 credited to wallet.',
            time: '3 days ago',
            read: true
          }
        ]
      },
      {
        id: 'PLB-02',
        role: 'plumber',
        name: 'Srinivas Rao',
        mobile: '9111133333',
        email: 'srinivas.rao@plumbmart.in',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        licenseNo: 'IPA-BLR-2025-1102',
        verificationStatus: 'PENDING_VERIFICATION',
        status: 'ACTIVE',
        experienceYears: 4,
        specialization: 'Sanitaryware & Domestic Water Systems',
        skills: ['Sanitaryware Installation', 'Dual Flush Cisterns', 'Basin Mixers'],
        serviceArea: 'Whitefield, Indiranagar, Marathahalli',
        address: 'House 24, Outer Ring Road, Bengaluru - 560037',
        rating: 4.6,
        completedJobs: 38,
        rewardPoints: 420,
        walletBalance: 1100,
        city: 'Bengaluru',
        settings: {
          jobAlerts: true,
          productAlerts: true,
          rewardAlerts: true,
          isAvailableForJobs: false
        },
        notifications: []
      }
    ],
    admins: [
      {
        id: 'ADM-01',
        role: 'admin',
        name: 'Manikanta (Super Admin)',
        mobile: '9999999999',
        email: 'admin@plumbmart.in',
        notifications: [
          {
            id: 'NOTIF-ADM-1',
            type: 'ALERT',
            title: 'Zoho Sync: 8 Products Synced',
            message: 'Master inventory and pricing refreshed from Zoho Workbook.',
            time: 'Just now',
            read: false
          }
        ]
      }
    ]
  },
  orders: [
    {
      id: 'ORD-2026-101',
      orderRole: 'customer',
      userId: 'CUST-01',
      userName: 'Rahul Sharma',
      userMobile: '9876543210',
      items: [
        { productId: 'PRD-1003', name: 'Kohler-Style Thermostatic High-Flow Diverter Mixer', qty: 1, unitPrice: 6499, total: 6499 },
        { productId: 'PRD-1001', name: 'Astral ProFlow CPVC Pipe 25mm (SDR 11 - 3m)', qty: 2, unitPrice: 2850, total: 5700 }
      ],
      totalAmount: 12199,
      paymentMethod: 'DIRECT_PAYMENT',
      paymentSubType: 'UPI (PhonePe)',
      paymentStatus: 'Successful',
      orderStatus: 'Shipped',
      assignedPlumberId: 'PLB-01',
      assignedPlumberName: 'Ramesh Babu (Master Plumber)',
      plumberTaskStatus: 'IN_PROGRESS',
      plumberNotes: 'Site visit scheduled at 4:00 PM today for concealed diverter pressure test.',
      shippingAddress: 'Flat 402, Green Valley Residency, Madhapur, Hyderabad - 500081',
      orderDate: '2026-10-11T09:30:00Z',
      createdAt: '2026-10-11T09:30:00Z',
      trackingTimeline: [
        { step: 'Placed', detail: 'Order placed by customer via mobile app', time: '11 Oct, 09:30 AM', done: true },
        { step: 'Confirmed', detail: 'Direct payment of ₹12,199 verified via UPI', time: '11 Oct, 09:32 AM', done: true },
        { step: 'Processing', detail: 'Stock allocated in Zoho Workbook & packed', time: '11 Oct, 11:15 AM', done: true },
        { step: 'Shipped', detail: 'Out for delivery • Assigned Plumber: Ramesh Babu', time: '12 Oct, 08:45 AM', done: true },
        { step: 'Delivered', detail: 'On-site installation and testing complete', time: 'Pending', done: false }
      ]
    },
    {
      id: 'ORD-2026-102',
      orderRole: 'dealer',
      userId: 'DLR-01',
      userName: 'Sri Venkateswara Sanitary & Hardware Distributors',
      userMobile: '9000011111',
      items: [
        { productId: 'PRD-1001', name: 'Astral ProFlow CPVC Pipe 25mm (SDR 11 - 3m)', qty: 20, unitPrice: 2190, total: 43800 },
        { productId: 'PRD-1005', name: 'Forged Brass Full-Bore Ball Valve 25mm (PN25)', qty: 10, unitPrice: 3420, total: 34200 }
      ],
      totalAmount: 78000,
      paymentMethod: 'CREDIT_90_DAYS',
      paymentSubType: '90-Day Approved Dealer Credit Line',
      paymentStatus: 'Credit / Outstanding',
      creditDays: 90,
      dueDate: '2027-01-10',
      orderStatus: 'Processing',
      assignedPlumberId: null,
      assignedPlumberName: null,
      shippingAddress: 'Plot 44, Auto Nagar Industrial Estate, Hyderabad',
      orderDate: '2026-10-10T16:20:00Z',
      createdAt: '2026-10-10T16:20:00Z',
      trackingTimeline: [
        { step: 'Placed', detail: 'Dealer wholesale bulk order placed', time: '10 Oct, 04:20 PM', done: true },
        { step: 'Confirmed', detail: 'Approved 90-Day Credit applied (Due: 2027-01-10)', time: '10 Oct, 04:22 PM', done: true },
        { step: 'Processing', detail: 'Zoho Inventory stock reserved at Regional Warehouse', time: '11 Oct, 10:00 AM', done: true },
        { step: 'Shipped', detail: 'Dispatched via Heavy Transport', time: 'Pending', done: false },
        { step: 'Delivered', detail: 'Received at Dealer Warehouse', time: 'Pending', done: false }
      ]
    },
    {
      id: 'ORD-2026-103',
      orderRole: 'dealer',
      userId: 'DLR-02',
      userName: 'Metro Pipe & Fittings Syndicate',
      userMobile: '9000022222',
      items: [
        { productId: 'PRD-1007', name: 'Grundfos-Grade 1.0 HP Silent Pressure Booster Pump', qty: 3, unitPrice: 14600, total: 43800 }
      ],
      totalAmount: 43800,
      paymentMethod: 'CREDIT_30_DAYS',
      paymentSubType: 'Standard 30-Day Dealer Credit',
      paymentStatus: 'Credit / Outstanding',
      creditDays: 30,
      dueDate: '2026-11-11',
      orderStatus: 'Confirmed',
      assignedPlumberId: null,
      assignedPlumberName: null,
      shippingAddress: 'MG Road Commercial Complex, Vijayawada',
      orderDate: '2026-10-12T07:45:00Z',
      createdAt: '2026-10-12T07:45:00Z',
      trackingTimeline: [
        { step: 'Placed', detail: 'Dealer order placed via mobile app', time: '12 Oct, 07:45 AM', done: true },
        { step: 'Confirmed', detail: '30-Day Credit ledger verified in Zoho Books', time: '12 Oct, 07:46 AM', done: true },
        { step: 'Processing', detail: 'Order queued for warehouse packing', time: 'Pending', done: false },
        { step: 'Shipped', detail: 'Awaiting transport pickup', time: 'Pending', done: false },
        { step: 'Delivered', detail: 'Awaiting delivery', time: 'Pending', done: false }
      ]
    }
  ],
  payments: [
    {
      id: 'PAY-9001',
      orderId: 'ORD-2026-101',
      partyName: 'Rahul Sharma',
      role: 'customer',
      amount: 12199,
      mode: 'Direct Payment (UPI)',
      status: 'Successful',
      dueDate: 'Immediate',
      date: '2026-10-11'
    },
    {
      id: 'PAY-9002',
      orderId: 'ORD-2026-102',
      partyName: 'Sri Venkateswara Sanitary & Hardware Distributors',
      role: 'dealer',
      amount: 78000,
      mode: 'Credit Payment – 90 Days',
      status: 'Credit / Outstanding',
      dueDate: '2027-01-10',
      date: '2026-10-10'
    },
    {
      id: 'PAY-9003',
      orderId: 'ORD-2026-103',
      partyName: 'Metro Pipe & Fittings Syndicate',
      role: 'dealer',
      amount: 43800,
      mode: 'Credit Payment – 30 Days',
      status: 'Credit / Outstanding',
      dueDate: '2026-11-11',
      date: '2026-10-12'
    }
  ],
  activities: [
    {
      id: 'ACT-2026-101',
      orderId: 'ORD-2026-101',
      assignedPlumberId: 'PLB-01',
      assignedPlumberName: 'Ramesh Babu (Master Plumber)',
      customerName: 'Rahul Sharma',
      customerMobile: '9876543210',
      location: 'Flat 402, Green Valley Residency, Madhapur, Hyderabad - 500081',
      requiredWork: 'Concealed Diverter Fitting & CPVC Header Line Pressure Test',
      requiredProducts: [
        { productId: 'PRD-1003', name: 'Kohler-Style Thermostatic High-Flow Diverter Mixer', qty: 1 },
        { productId: 'PRD-1001', name: 'Astral ProFlow CPVC Pipe 25mm (SDR 11 - 3m)', qty: 2 }
      ],
      scheduledDate: '2026-10-12',
      scheduledTime: '04:00 PM',
      instructions: 'Verify wall cavity depth between 55mm and 75mm before tiling. Test line at 10 Bar for 15 mins.',
      status: 'IN_PROGRESS',
      remarks: 'Site visit scheduled at 4:00 PM today for concealed diverter pressure test.',
      createdAt: '2026-10-11T09:30:00Z',
      completedDate: null
    },
    {
      id: 'ACT-2026-102',
      orderId: null,
      assignedPlumberId: 'PLB-01',
      assignedPlumberName: 'Ramesh Babu (Master Plumber)',
      customerName: 'Kavita Varma',
      customerMobile: '9949123456',
      location: 'Villa 12, Rainbow Vistas, Hitec City, Hyderabad - 500018',
      requiredWork: 'Dual Flush Concealed Cistern Installation & Testing',
      requiredProducts: [
        { productId: 'PRD-1008', name: 'Slimline Concealed Dual-Flush Cistern Frame System', qty: 1 }
      ],
      scheduledDate: '2026-10-13',
      scheduledTime: '10:30 AM',
      instructions: 'Anchor frame bolts into solid masonry slab. Verify 180mm WC bolt pitch before sealing.',
      status: 'ASSIGNED',
      remarks: 'New activity assigned by dispatch.',
      createdAt: '2026-10-12T06:00:00Z',
      completedDate: null
    },
    {
      id: 'ACT-2026-098',
      orderId: null,
      assignedPlumberId: 'PLB-01',
      assignedPlumberName: 'Ramesh Babu (Master Plumber)',
      customerName: 'Ananya Deshmukh',
      customerMobile: '9849098765',
      location: 'Villa 45, Jubilee Hills, Hyderabad - 500033',
      requiredWork: '1.0 HP Pressure Booster Pump Installation & Vibration Dampening',
      requiredProducts: [
        { productId: 'PRD-1007', name: 'Grundfos-Grade 1.0 HP Silent Pressure Booster Pump', qty: 1 },
        { productId: 'PRD-1005', name: 'Forged Brass Full-Bore Ball Valve 25mm (PN25)', qty: 2 }
      ],
      scheduledDate: '2026-10-09',
      scheduledTime: '11:00 AM',
      instructions: 'Install NRV on suction side, mount on rubber vibration pads, verify 3.2 Bar cut-off pressure.',
      status: 'COMPLETED',
      remarks: 'Pump installed and commissioned. Cut-off pressure calibrated at 3.2 Bar. Customer tested and verified.',
      createdAt: '2026-10-08T14:00:00Z',
      completedDate: '2026-10-09T13:30:00Z',
      rewardPointsEarned: 150
    }
  ],
  productRequests: [
    {
      id: 'REQ-PLB-501',
      plumberId: 'PLB-01',
      plumberName: 'Ramesh Babu (Master Plumber)',
      productId: 'PRD-1005',
      productName: 'Forged Brass Full-Bore Ball Valve 25mm (PN25)',
      sku: 'ZW-VALVE-BRASS-25',
      categoryName: 'Industrial Valves & Fittings',
      quantity: 4,
      reason: 'Urgent replacement of worn-out valves on Madhapur site header line',
      activityId: 'ACT-2026-101',
      remarks: 'Need heavy PN25 brass valves for high-rise riser pressure stability.',
      status: 'APPROVED',
      createdAt: '2026-10-11T12:00:00Z',
      updatedAt: '2026-10-11T15:30:00Z',
      adminNotes: 'Approved for Madhapur site inspection job.'
    },
    {
      id: 'REQ-PLB-502',
      plumberId: 'PLB-01',
      plumberName: 'Ramesh Babu (Master Plumber)',
      productId: 'PRD-1006',
      productName: 'Precision Brass Pressure Reducing Valve w/ Gauge (20mm)',
      sku: 'ZW-VALVE-PRV-20',
      categoryName: 'Industrial Valves & Fittings',
      quantity: 2,
      reason: 'Excessive water inlet pressure damaging customer fittings',
      activityId: 'ACT-2026-101',
      remarks: 'Inlet pressure exceeds 5.5 Bar; PRV required to reduce to 3.0 Bar.',
      status: 'PENDING',
      createdAt: '2026-10-12T08:00:00Z',
      updatedAt: '2026-10-12T08:00:00Z',
      adminNotes: ''
    }
  ],
  otpSessions: {}
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function getStore() {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  const data = JSON.parse(raw);

  // Auto-heal / populate activities and productRequests if not present in saved store.json
  let modified = false;
  if (!data.activities) {
    data.activities = initialData.activities;
    modified = true;
  }
  if (!data.productRequests) {
    data.productRequests = initialData.productRequests;
    modified = true;
  }
  // Auto-heal plumbers if missing new fields
  if (data.users?.plumbers) {
    data.users.plumbers.forEach((p, idx) => {
      const initP = initialData.users.plumbers[idx];
      if (initP && p.id === initP.id) {
        if (!p.skills) { p.skills = initP.skills; modified = true; }
        if (!p.serviceArea) { p.serviceArea = initP.serviceArea; modified = true; }
        if (!p.settings) { p.settings = initP.settings; modified = true; }
        if (!p.status) { p.status = initP.status; modified = true; }
        if (!p.email) { p.email = initP.email; modified = true; }
        if (!p.avatar) { p.avatar = initP.avatar; modified = true; }
        if (!p.address) { p.address = initP.address; modified = true; }
      }
    });
  }
  if (modified) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  }
  return data;
}

function saveStore(data) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

function resetStore() {
  ensureStore();
  const fresh = JSON.parse(JSON.stringify(initialData));
  fresh.zohoMeta.lastSyncedAt = new Date().toISOString();
  fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2), 'utf8');
  return fresh;
}

module.exports = {
  getStore,
  saveStore,
  resetStore
};
