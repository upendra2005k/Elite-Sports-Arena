/* ===================================================
   ELITE SPORTS ARENA - UNIFIED JAVASCRIPT CONTROLLER
   Clean White Theme + Session & LocalStorage Sync
=================================================== */

const STORAGE_KEY = "elite_arena_unified_db";
const AUTH_KEY = "elite_auth_session";

// 1. ARENA CONFIGURATION (ALL 6 SPORTS)
const SPORTS_CATALOG = [
  { id: "box-cricket", name: "Cricket", court: "Cage Pitch A (Bowling Machine)", rate: 1200, badge: "Floodlit Cage" },
  { id: "turf-football", name: "Football Turf", court: "FIFA Turf 1 (7v7 Pitch)", rate: 1500, badge: "FIFA Approved" },
  { id: "bwf-badminton", name: "Badminton", court: "Court 2 (BWF Synthetic Mat)", rate: 500, badge: "BWF Standard" },
  { id: "swimming-pool", name: "Swimming", court: "Lane 1 (Speed Lap)", rate: 350, badge: "Olympic 50M" },
  { id: "chess-lounge", name: "Chess", court: "Table 1 (DGT Electronic Sensor)", rate: 200, badge: "FIDE Rated" },
  { id: "carrom-arena", name: "Carrom", court: "Synco Champion Board 1", rate: 150, badge: "Championship" }
];

const AVAILABLE_SLOTS = [
  "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
  "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM", "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM"
];

const SPORT_ADDONS = [
  { id: "addon-ball", name: "Match Pro Ball / Gear Set", price: 150 },
  { id: "addon-referee", name: "Official Referee / Marker", price: 400 },
  { id: "addon-water", name: "Hydration Crate (10 Energy Drinks)", price: 300 },
  { id: "addon-cam", name: "4K HD Match Video Recording", price: 250 }
];

// 2. ACTIVE SELECTION STATE (Auto-detected from Login Session)
let sessionData = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
let currentClient = sessionData && sessionData.name ? sessionData.name : "Upendra";
let selectedSport = SPORTS_CATALOG[0];
let selectedSlot = AVAILABLE_SLOTS[6]; // default to 04:00 PM
let selectedAddons = [];
let isAdminUnlocked = sessionData && sessionData.role === "ADMIN";

// 3. SEED INITIAL BACKEND DATA (IF EMPTY)
function getBookings() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);

  const today = new Date().toISOString().split("T")[0];
  const initialSeed = [
    {
      id: "CRK-4011",
      player: "Upendra",
      sport: "Cricket",
      court: "Cage Pitch A (Bowling Machine)",
      date: today,
      slot: "04:00 PM - 05:00 PM",
      amount: 1350,
      addons: ["Match Pro Ball / Gear Set"],
      status: "Confirmed"
    },
    {
      id: "FTB-8022",
      player: "Vikram FC",
      sport: "Football Turf",
      court: "FIFA Turf 1 (7v7 Pitch)",
      date: today,
      slot: "06:00 PM - 07:00 PM",
      amount: 1500,
      addons: [],
      status: "Confirmed"
    },
    {
      id: "BAD-3091",
      player: "Sarah Jenkins",
      sport: "Badminton",
      court: "Court 2 (BWF Synthetic Mat)",
      date: today,
      slot: "07:00 AM - 08:00 AM",
      amount: 500,
      addons: [],
      status: "Pending"
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
  return initialSeed;
}

function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 4. TAB CONTROLLER
function switchMainTab(targetView) {
  const clientTab = document.getElementById("client-view");
  const adminTab = document.getElementById("admin-view");
  const clientBtn = document.getElementById("tab-client-btn");
  const adminBtn = document.getElementById("tab-admin-btn");

  if (targetView === "client-view") {
    if (clientTab) clientTab.classList.remove("hidden");
    if (adminTab) adminTab.classList.add("hidden");
    if (clientBtn) {
      clientBtn.className = "nav-toggle-btn active-tab flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm transition-all";
    }
    if (adminBtn) {
      adminBtn.className = "nav-toggle-btn flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all";
    }
    renderPlayerPasses();
    renderSlots();
  } else {
    if (clientTab) clientTab.classList.add("hidden");
    if (adminTab) adminTab.classList.remove("hidden");
    if (adminBtn) {
      adminBtn.className = "nav-toggle-btn active-tab flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm transition-all";
    }
    if (clientBtn) {
      clientBtn.className = "nav-toggle-btn flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all";
    }
    if (isAdminUnlocked) {
      renderAdminDashboard();
    }
  }
}

// 5. CLIENT PROFILE MANAGEMENT
function setPlayerProfile() {
  const inputEl = document.getElementById("player-name-input");
  const val = inputEl ? inputEl.value.trim() : "";
  if (val) {
    currentClient = val;
    // Persist to session
    sessionData = { role: "PLAYER", name: currentClient, phone: "9876543210" };
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    
    const label = document.getElementById("active-client-label");
    if (label) label.innerText = `${currentClient} (Active Player)`;
    renderPlayerPasses();
  }
}

// 6. RENDER SPORTS CATALOG (Clean White Cards)
function renderSports() {
  const container = document.getElementById("sports-selector-container");
  if (!container) return;

  container.innerHTML = SPORTS_CATALOG.map(sport => {
    const isSelected = sport.id === selectedSport.id;
    return `
      <div onclick="selectSport('${sport.id}')" 
           class="cursor-pointer border ${isSelected ? 'border-emerald-500 bg-emerald-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} p-3.5 rounded-xl transition-all">
        <div class="flex justify-between items-start">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">${sport.badge}</span>
          <span class="text-xs font-extrabold text-slate-900">₹${sport.rate}/hr</span>
        </div>
        <div class="mt-2.5 font-bold text-sm text-slate-900">${sport.name}</div>
        <div class="text-[11px] text-slate-500">${sport.court}</div>
      </div>
    `;
  }).join("");
}

function selectSport(sportId) {
  selectedSport = SPORTS_CATALOG.find(s => s.id === sportId) || SPORTS_CATALOG[0];
  const badge = document.getElementById("selected-sport-badge");
  if (badge) badge.innerText = selectedSport.name;
  renderSports();
  renderSlots();
  updateInvoiceSummary();
}

// 7. RENDER SLOTS & CONFLICT DETECTION (White Theme Colors)
function renderSlots() {
  const dateInput = document.getElementById("booking-date-input");
  const chosenDate = dateInput ? dateInput.value : new Date().toISOString().split("T")[0];
  const bookings = getBookings();
  const container = document.getElementById("slots-container");
  if (!container) return;

  const reservedSlots = bookings
    .filter(b => b.date === chosenDate && b.sport === selectedSport.name && b.status !== "Cancelled")
    .map(b => b.slot);

  container.innerHTML = AVAILABLE_SLOTS.map(slot => {
    const isReserved = reservedSlots.includes(slot);
    const isSelected = slot === selectedSlot && !isReserved;

    if (isReserved) {
      return `
        <button disabled class="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-400 text-xs text-center cursor-not-allowed">
          <div class="font-bold line-through">${slot}</div>
          <div class="text-[10px] text-rose-500 font-semibold mt-0.5">Reserved</div>
        </button>
      `;
    }

    return `
      <button onclick="selectSlot('${slot}')" 
              class="p-2.5 rounded-xl border text-xs text-center transition-all ${isSelected ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500'}">
        <div class="font-semibold">${slot}</div>
        <div class="text-[10px] ${isSelected ? 'text-emerald-100 font-bold' : 'text-emerald-600 font-medium'} mt-0.5">Available</div>
      </button>
    `;
  }).join("");

  updateInvoiceSummary();
}

function selectSlot(slot) {
  selectedSlot = slot;
  renderSlots();
  updateInvoiceSummary();
}

// 8. RENDER ADD-ONS
function renderAddons() {
  const container = document.getElementById("addons-container");
  if (!container) return;

  container.innerHTML = SPORT_ADDONS.map(addon => {
    const checked = selectedAddons.some(a => a.id === addon.id);
    return `
      <label class="flex items-center justify-between p-3 rounded-xl border ${checked ? 'border-emerald-500 bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} cursor-pointer transition-all">
        <div class="flex items-center space-x-3">
          <input type="checkbox" onchange="toggleAddon('${addon.id}')" ${checked ? "checked" : ""} class="accent-emerald-600 w-4 h-4 rounded">
          <span class="text-xs font-semibold text-slate-800">${addon.name}</span>
        </div>
        <span class="text-xs font-bold text-emerald-700">+₹${addon.price}</span>
      </label>
    `;
  }).join("");
}

function toggleAddon(addonId) {
  const item = SPORT_ADDONS.find(a => a.id === addonId);
  if (!item) return;

  if (selectedAddons.some(a => a.id === addonId)) {
    selectedAddons = selectedAddons.filter(a => a.id !== addonId);
  } else {
    selectedAddons.push(item);
  }
  renderAddons();
  updateInvoiceSummary();
}

// 9. INVOICE CALCULATION
function updateInvoiceSummary() {
  const dateInput = document.getElementById("booking-date-input");
  const chosenDate = dateInput ? dateInput.value : "Date not picked";
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = selectedSport.rate + addonsTotal;

  const summarySport = document.getElementById("summary-sport");
  const summaryBasePrice = document.getElementById("summary-base-price");
  const summarySlot = document.getElementById("summary-slot");
  const summaryAddons = document.getElementById("summary-addons-total");
  const summaryTotal = document.getElementById("summary-grand-total");

  if (summarySport) summarySport.innerText = selectedSport.name;
  if (summaryBasePrice) summaryBasePrice.innerText = `₹${selectedSport.rate}`;
  if (summarySlot) summarySlot.innerText = `${chosenDate} | ${selectedSlot || "None"}`;
  if (summaryAddons) summaryAddons.innerText = `₹${addonsTotal}`;
  if (summaryTotal) summaryTotal.innerText = `₹${grandTotal}`;
}

// 10. SUBMIT BOOKING (CLIENT)
function confirmClientBooking() {
  const dateInput = document.getElementById("booking-date-input");
  const date = dateInput ? dateInput.value : "";
  if (!date) return alert("Please select a match date first!");
  if (!selectedSlot) return alert("Please pick an available time slot!");

  const bookings = getBookings();
  const isConflict = bookings.some(b => b.date === date && b.sport === selectedSport.name && b.slot === selectedSlot && b.status !== "Cancelled");

  if (isConflict) {
    return alert("Conflict detected: This slot was just reserved. Pick another slot.");
  }

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const newBooking = {
    id: "BK-" + Math.floor(1000 + Math.random() * 9000),
    player: currentClient,
    sport: selectedSport.name,
    court: selectedSport.court,
    date: date,
    slot: selectedSlot,
    amount: selectedSport.rate + addonsTotal,
    addons: selectedAddons.map(a => a.name),
    status: "Confirmed"
  };

  bookings.push(newBooking);
  saveBookings(bookings);

  alert(`Booking Confirmed! Reference ID: ${newBooking.id}`);
  renderSlots();
  renderPlayerPasses();
}

// 11. PLAYER DIGITAL PASSES
function renderPlayerPasses() {
  const bookings = getBookings().filter(b => b.player.toLowerCase() === currentClient.toLowerCase());
  const container = document.getElementById("player-passes-list");
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `<div class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs text-center">No active passes for ${currentClient}.</div>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold text-slate-900">${b.sport}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}">${b.status}</span>
        </div>
        <div class="text-[11px] text-slate-500 mt-1">${b.date} • ${b.slot}</div>
        <div class="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">ID: ${b.id}</div>
      </div>
      <button onclick="openPassModal('${b.id}')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all">
        View Pass
      </button>
    </div>
  `).join("");
}

// 12. DIGITAL PASS MODAL (Voucher Popup)
function openPassModal(id) {
  const booking = getBookings().find(b => b.id === id);
  if (!booking) return;

  const modal = document.getElementById("pass-modal");
  const modalSport = document.getElementById("modal-sport-title");
  const modalRef = document.getElementById("modal-ref");
  const modalPlayer = document.getElementById("modal-player");
  const modalTime = document.getElementById("modal-time");
  const modalStatus = document.getElementById("modal-status");

  if (modalSport) modalSport.innerText = `${booking.sport} - ${booking.court}`;
  if (modalRef) modalRef.innerText = booking.id;
  if (modalPlayer) modalPlayer.innerText = booking.player;
  if (modalTime) modalTime.innerText = `${booking.date} (${booking.slot})`;
  if (modalStatus) modalStatus.innerText = booking.status;

  if (modal) modal.classList.remove("hidden");
}

function closePassModal() {
  const modal = document.getElementById("pass-modal");
  if (modal) modal.classList.add("hidden");
}

// 13. ADMIN PANEL FUNCTIONS
function unlockAdmin() {
  const passInput = document.getElementById("admin-passcode-input");
  const passcode = passInput ? passInput.value : "";
  if (passcode === "admin123") {
    isAdminUnlocked = true;
    const lockScreen = document.getElementById("admin-lock-screen");
    const panel = document.getElementById("admin-dashboard-panel");
    if (lockScreen) lockScreen.classList.add("hidden");
    if (panel) panel.classList.remove("hidden");
    renderAdminDashboard();
  } else {
    alert("Incorrect passcode! For demo use: admin123");
  }
}

function renderAdminDashboard() {
  const bookings = getBookings();
  
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const revenue = bookings.filter(b => b.status === "Confirmed").reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const kpiTotal = document.getElementById("kpi-total-bookings");
  const kpiPending = document.getElementById("kpi-pending-bookings");
  const kpiConfirmed = document.getElementById("kpi-confirmed-bookings");
  const kpiRev = document.getElementById("kpi-total-revenue");

  if (kpiTotal) kpiTotal.innerText = total;
  if (kpiPending) kpiPending.innerText = pending;
  if (kpiConfirmed) kpiConfirmed.innerText = confirmed;
  if (kpiRev) kpiRev.innerText = `₹${revenue.toLocaleString("en-IN")}`;

  renderAdminBookingsTable();
}

function renderAdminBookingsTable() {
  const searchInput = document.getElementById("admin-search-input");
  const filterInput = document.getElementById("admin-filter-status");
  const query = (searchInput?.value || "").toLowerCase();
  const filter = filterInput?.value || "ALL";
  let bookings = getBookings();

  if (filter !== "ALL") {
    bookings = bookings.filter(b => b.status === filter);
  }

  if (query) {
    bookings = bookings.filter(b => 
      b.player.toLowerCase().includes(query) || 
      b.sport.toLowerCase().includes(query) || 
      b.id.toLowerCase().includes(query)
    );
  }

  const tbody = document.getElementById("admin-table-body");
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No booking entries match your filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-5 py-4 font-mono font-bold text-emerald-700">${b.id}</td>
      <td class="px-5 py-4 font-bold text-slate-900">${b.player}</td>
      <td class="px-5 py-4">
        <div class="font-semibold text-slate-800">${b.sport}</div>
        <div class="text-[10px] text-slate-500">${b.court}</div>
      </td>
      <td class="px-5 py-4">
        <div class="font-medium text-slate-800">${b.date}</div>
        <div class="text-[10px] text-slate-500">${b.slot}</div>
      </td>
      <td class="px-5 py-4 font-bold text-slate-900">₹${b.amount}</td>
      <td class="px-5 py-4">
        <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}">${b.status}</span>
      </td>
      <td class="px-5 py-4 text-center">
        <div class="inline-flex space-x-1.5">
          <button onclick="setBookingStatus('${b.id}', 'Confirmed')" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-bold transition-colors">Approve</button>
          <button onclick="setBookingStatus('${b.id}', 'Cancelled')" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[11px] font-bold transition-colors">Cancel</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function setBookingStatus(id, newStatus) {
  const bookings = getBookings();
  const target = bookings.find(b => b.id === id);
  if (target) {
    target.status = newStatus;
    saveBookings(bookings);
    renderAdminDashboard();
    renderPlayerPasses();
    renderSlots();
  }
}

function lockCurrentCourtForRain() {
  const dateInput = document.getElementById("booking-date-input");
  const date = dateInput ? dateInput.value : new Date().toISOString().split("T")[0];
  if (!confirm(`Trigger Rain Lockdown for ${selectedSport.name} on ${date}? This will record a weather halt.`)) return;

  const bookings = getBookings();
  bookings.push({
    id: "LOCK-" + Math.floor(100 + Math.random() * 900),
    player: "SYSTEM (Groundsman)",
    sport: selectedSport.name,
    court: selectedSport.court,
    date: date,
    slot: "All Day Rain Halt",
    amount: 0,
    addons: [],
    status: "Cancelled"
  });
  saveBookings(bookings);
  alert("Rain lockdown recorded in operations ledger!");
  renderAdminDashboard();
}

function resetDemoData() {
  if (confirm("Reset bookings back to factory demo state?")) {
    localStorage.removeItem(STORAGE_KEY);
    getBookings();
    renderAdminDashboard();
    renderPlayerPasses();
    renderSlots();
  }
}

// 14. INITIALIZE APP ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  // Read authenticated session
  sessionData = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  if (sessionData && sessionData.name) {
    currentClient = sessionData.name;
    const label = document.getElementById("active-client-label");
    if (label) label.innerText = `${currentClient} (Active Player)`;
    const input = document.getElementById("player-name-input");
    if (input) input.value = currentClient;