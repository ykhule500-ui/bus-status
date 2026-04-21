/* ============================================
   ADMIN JS — Panel Logic & Bus CRUD
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Auth guard
  const user = requireAuth('admin');
  if (!user) return;

  // Set admin info
  document.getElementById('admin-name').textContent = user.name;
  document.getElementById('admin-avatar').textContent = user.name.charAt(0).toUpperCase();

  // ---- Section Navigation ----
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.admin-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;

      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + target).classList.add('active');

      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');

      // Refresh data
      refreshAll();
    });
  });

  // Mobile toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // ---- Stats ----
  function updateStats() {
    const buses = getData('buses');
    const passengers = getData('passengers');
    const bookings = getData('bookings');

    animateCounter('stat-buses', buses.length);
    animateCounter('stat-active', buses.filter(b => b.status === 'active').length);
    animateCounter('stat-users', passengers.length);
    animateCounter('stat-bookings', bookings.length);
  }

  function animateCounter(id, target) {
    const el = document.getElementById(id);
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 600;
    const step = (target - current) / (duration / 16);
    let value = current;

    function tick() {
      value += step;
      if ((step > 0 && value >= target) || (step < 0 && value <= target)) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.round(value);
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---- Buses Table ----
  function renderBuses() {
    const buses = getData('buses');
    const tbody = document.getElementById('buses-tbody');
    tbody.innerHTML = '';

    if (buses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>No buses added yet.</p></div></td></tr>';
      return;
    }

    buses.forEach(bus => {
      const statusClass = bus.status === 'active' ? 'badge-success' :
                           bus.status === 'delayed' ? 'badge-warning' : 'badge-danger';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${bus.id}</strong></td>
        <td>${bus.name}</td>
        <td><div class="route-cell">${bus.route.join(' → ')}</div></td>
        <td>${bus.departure}</td>
        <td>${bus.arrival}</td>
        <td>₹${bus.fare}</td>
        <td>${bus.seats}</td>
        <td><span class="badge ${statusClass}">${bus.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="editBus('${bus.id}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn delete" onclick="deleteBus('${bus.id}')" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ---- Users Table ----
  function renderUsers() {
    const passengers = getData('passengers');
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    if (passengers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><p>No passengers registered yet.</p></div></td></tr>';
      return;
    }

    passengers.forEach((p, i) => {
      const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.phone}</td>
        <td>${date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ---- Bookings Table ----
  function renderBookings() {
    const bookings = getData('bookings');
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>No bookings yet.</p></div></td></tr>';
      return;
    }

    bookings.forEach((b, i) => {
      const date = b.bookedAt ? new Date(b.bookedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${b.passenger}</strong></td>
        <td>${b.phone}</td>
        <td>${b.busName} (${b.busId})</td>
        <td>${date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ---- Refresh All ----
  function refreshAll() {
    updateStats();
    renderBuses();
    renderUsers();
    renderBookings();
  }

  // ---- Modal ----
  const modal = document.getElementById('bus-modal');
  const modalTitle = document.getElementById('modal-title');
  const busForm = document.getElementById('bus-form');
  const addBusBtn = document.getElementById('add-bus-btn');
  const modalClose = document.getElementById('modal-close');

  function openModal(editId) {
    if (editId) {
      modalTitle.textContent = 'Edit Bus';
      const buses = getData('buses');
      const bus = buses.find(b => b.id === editId);
      if (bus) {
        document.getElementById('bus-name').value = bus.name;
        document.getElementById('bus-route').value = bus.route.join(', ');
        document.getElementById('bus-departure').value = bus.departure;
        document.getElementById('bus-arrival').value = bus.arrival;
        document.getElementById('bus-fare').value = bus.fare;
        document.getElementById('bus-seats').value = bus.seats;
        document.getElementById('bus-status').value = bus.status;
        document.getElementById('bus-edit-id').value = editId;
      }
    } else {
      modalTitle.textContent = 'Add New Bus';
      busForm.reset();
      document.getElementById('bus-edit-id').value = '';
    }
    modal.classList.add('show');
  }

  function closeModal() {
    modal.classList.remove('show');
    busForm.reset();
    document.getElementById('bus-edit-id').value = '';
  }

  addBusBtn.addEventListener('click', () => openModal(null));
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ---- Bus Form Submit ----
  busForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('bus-name').value.trim();
    const routeStr = document.getElementById('bus-route').value.trim();
    const departure = document.getElementById('bus-departure').value.trim();
    const arrival = document.getElementById('bus-arrival').value.trim();
    const fare = parseInt(document.getElementById('bus-fare').value);
    const seats = parseInt(document.getElementById('bus-seats').value);
    const status = document.getElementById('bus-status').value;
    const editId = document.getElementById('bus-edit-id').value;

    if (!name || !routeStr || !departure || !arrival || !fare || !seats) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    const route = routeStr.split(',').map(s => s.trim()).filter(s => s);
    if (route.length < 2) {
      showToast('Route must have at least 2 stops.', 'error');
      return;
    }

    const buses = getData('buses');

    if (editId) {
      // Update
      const index = buses.findIndex(b => b.id === editId);
      if (index !== -1) {
        buses[index] = { ...buses[index], name, route, departure, arrival, fare, seats, status };
        setData('buses', buses);
        showToast('Bus updated successfully!', 'success');
      }
    } else {
      // Add
      const newBus = {
        id: generateId(),
        name, route, departure, arrival, fare, seats, status
      };
      buses.push(newBus);
      setData('buses', buses);
      showToast('Bus added successfully!', 'success');
    }

    closeModal();
    refreshAll();
  });

  // ---- Global Edit/Delete Functions ----
  window.editBus = function(id) {
    openModal(id);
  };

  window.deleteBus = function(id) {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    const buses = getData('buses');
    const filtered = buses.filter(b => b.id !== id);
    setData('buses', filtered);
    showToast('Bus deleted.', 'warning');
    refreshAll();
  };

  // ---- Initial Load ----
  refreshAll();

});
