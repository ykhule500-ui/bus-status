/* ============================================
   GLOBAL JS — CityTransit Bus Management
   ============================================ */

// ---- Seed Bus Data ----
const SEED_BUSES = [
  {
    id: "BUS001",
    name: "City Express 1",
    route: ["Central Station", "Market Square", "Tech Park", "University", "Airport"],
    departure: "06:00 AM",
    arrival: "07:30 AM",
    fare: 45,
    seats: 42,
    status: "active"
  },
  {
    id: "BUS002",
    name: "Metro Liner 7",
    route: ["Railway Station", "Old Town", "Central Station", "Mall Road", "Lake View"],
    departure: "07:00 AM",
    arrival: "08:15 AM",
    fare: 35,
    seats: 38,
    status: "active"
  },
  {
    id: "BUS003",
    name: "Green Line 12",
    route: ["Airport", "Highway Junction", "Industrial Area", "Central Station", "Railway Station"],
    departure: "08:00 AM",
    arrival: "09:45 AM",
    fare: 55,
    seats: 50,
    status: "active"
  },
  {
    id: "BUS004",
    name: "Rapid Transit 5",
    route: ["University", "Hospital", "Market Square", "Old Town", "Bus Depot"],
    departure: "09:00 AM",
    arrival: "10:00 AM",
    fare: 30,
    seats: 36,
    status: "active"
  },
  {
    id: "BUS005",
    name: "Night Owl 21",
    route: ["Central Station", "Mall Road", "Lake View", "Highway Junction", "Airport"],
    departure: "10:00 PM",
    arrival: "11:30 PM",
    fare: 60,
    seats: 40,
    status: "active"
  },
  {
    id: "BUS006",
    name: "Sunrise Shuttle 3",
    route: ["Bus Depot", "Railway Station", "Hospital", "Tech Park", "University"],
    departure: "05:30 AM",
    arrival: "06:45 AM",
    fare: 40,
    seats: 34,
    status: "active"
  },
  {
    id: "BUS007",
    name: "Downtown Express 9",
    route: ["Lake View", "Mall Road", "Market Square", "Central Station", "Old Town"],
    departure: "11:00 AM",
    arrival: "12:15 PM",
    fare: 25,
    seats: 44,
    status: "delayed"
  },
  {
    id: "BUS008",
    name: "Airport Connect 15",
    route: ["Railway Station", "Central Station", "Highway Junction", "Airport"],
    departure: "02:00 PM",
    arrival: "03:00 PM",
    fare: 70,
    seats: 48,
    status: "active"
  },
  {
    id: "BUS009",
    name: "Campus Cruiser 6",
    route: ["Hospital", "University", "Tech Park", "Market Square", "Mall Road"],
    departure: "03:30 PM",
    arrival: "04:45 PM",
    fare: 30,
    seats: 32,
    status: "active"
  },
  {
    id: "BUS010",
    name: "Evening Star 18",
    route: ["Old Town", "Bus Depot", "Industrial Area", "Highway Junction", "Lake View"],
    departure: "06:00 PM",
    arrival: "07:30 PM",
    fare: 50,
    seats: 40,
    status: "cancelled"
  }
];

// ---- Initialize Seed Data ----
function initSeedData() {
  if (!localStorage.getItem('buses')) {
    localStorage.setItem('buses', JSON.stringify(SEED_BUSES));
  }
  if (!localStorage.getItem('passengers')) {
    localStorage.setItem('passengers', JSON.stringify([]));
  }
  if (!localStorage.getItem('admins')) {
    // Default admin account
    localStorage.setItem('admins', JSON.stringify([
      { name: "Admin", phone: "9999999999", password: "admin123", createdAt: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem('bookings')) {
    localStorage.setItem('bookings', JSON.stringify([]));
  }
}

// ---- LocalStorage Helpers ----
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Auth Helpers ----
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser'));
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}

function requireAuth(role) {
  const user = getCurrentUser();
  if (!user || user.role !== role) {
    window.location.href = role === 'admin' ? 'login-admin.html' : 'login-passenger.html';
    return null;
  }
  return user;
}

// ---- Get All Stops (for autocomplete) ----
function getAllStops() {
  const buses = getData('buses');
  const stopsSet = new Set();
  buses.forEach(bus => {
    bus.route.forEach(stop => stopsSet.add(stop));
  });
  return Array.from(stopsSet).sort();
}

// ---- Toast Notification ----
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ---- Generate Unique ID ----
function generateId() {
  return 'BUS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// ---- Init on every page ----
initSeedData();
