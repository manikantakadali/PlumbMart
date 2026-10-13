const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'database.json');

const INITIAL_DB = {
  admins: [
    {
      id: 'ADM-01',
      name: 'System Administrator',
      email: 'admin@plumbmart.com',
      password: 'admin123',
      pin: '123456',
      role: 'Admin',
      accessLevel: 'SuperAdmin'
    }
  ],
  customers: [
    {
      id: 'CUST-01',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'customer@plumbmart-demo.com',
      password: '123456',
      role: 'Customer',
      rewardPoints: 240,
      addresses: [
        'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru, 560103'
      ],
      createdAt: new Date().toISOString()
    }
  ],
  dealers: [
    {
      id: 'DLR-01',
      name: 'Sri Venkateswara Distributors',
      mobile: '9000011111',
      email: 'dealer@plumbmart-demo.com',
      password: '123456',
      role: 'Dealer',
      gstin: '29ABCDE1234F1Z5',
      zohoVerified: true,
      credit30Days: true,
      credit90Days: true,
      creditLimit: '₹5,00,000',
      availableCredit: '₹3,40,000',
      createdAt: new Date().toISOString()
    },
    {
      id: 'DLR-02',
      name: 'Metro Pipe Syndicate',
      mobile: '9000022222',
      email: 'metro@plumbmart-demo.com',
      password: '123456',
      role: 'Dealer',
      gstin: '29BCDEF2345G2Z6',
      zohoVerified: true,
      credit30Days: true,
      credit90Days: false,
      creditLimit: '₹2,50,000',
      availableCredit: '₹2,50,000',
      createdAt: new Date().toISOString()
    }
  ],
  plumbers: [
    {
      id: 'PLM-01',
      name: 'Ramesh Kumar',
      mobile: '9111122222',
      email: 'plumber@plumbmart-demo.com',
      password: '123456',
      role: 'Plumber',
      license: 'PLUMB-KA-2024-884',
      completedJobs: 48,
      rating: 4.9,
      rewardPoints: 650,
      walletBalance: 4850,
      status: 'VERIFIED',
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 'PM-928410',
      clientId: 'CUST-01',
      clientName: 'Rahul Sharma',
      clientMobile: '9876543210',
      clientType: 'Customer',
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 4, price: 480 },
        { name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)', qty: 2, price: 720 }
      ],
      total: 3360,
      status: 'Out for Delivery',
      expectedDate: 'Today by 04:00 PM',
      deliveryAddress: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103',
      createdAt: new Date().toISOString()
    },
    {
      id: 'PM-881902',
      clientId: 'DLR-01',
      clientName: 'Sri Venkateswara Distributors',
      clientMobile: '9000011111',
      clientType: 'Dealer',
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 100, price: 375 },
        { name: 'Supreme UPVC Ball Valve Heavy Body (25mm)', qty: 50, price: 155 }
      ],
      total: 68400,
      status: 'Dispatched',
      expectedDate: 'Tomorrow Morning',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru',
      createdAt: new Date().toISOString()
    }
  ]
};

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
}

function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    return INITIAL_DB;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving database:', err);
    return false;
  }
}

module.exports = {
  getDb,
  saveDb
};
