/* ============================================
   DASHBOARD JS — Passenger Route Search
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Auth Guard ----
  const user = requireAuth('passenger');
  if (!user) return;

  // Set user info in header
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('welcome-name').textContent = user.name.split(' ')[0];

  // ---- Populate all stops ----
  const allStops = getAllStops();
  const stopsList = document.getElementById('stops-list');

  allStops.forEach(stop => {
    const chip = document.createElement('span');
    chip.className = 'stop-chip';
    chip.textContent = stop;
    chip.addEventListener('click', () => {
      const fromInput = document.getElementById('from-stop');
      const toInput = document.getElementById('to-stop');
      if (!fromInput.value) {
        fromInput.value = stop;
        fromInput.focus();
      } else if (!toInput.value) {
        toInput.value = stop;
        toInput.focus();
      }
    });
    stopsList.appendChild(chip);
  });

  // ---- Autocomplete ----
  function setupAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase().trim();
      suggestions.innerHTML = '';

      if (val.length < 1) {
        suggestions.classList.remove('show');
        return;
      }

      const matches = allStops.filter(s => s.toLowerCase().includes(val));

      if (matches.length === 0) {
        suggestions.classList.remove('show');
        return;
      }

      matches.forEach(stop => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${stop}
        `;
        item.addEventListener('click', () => {
          input.value = stop;
          suggestions.classList.remove('show');
        });
        suggestions.appendChild(item);
      });

      suggestions.classList.add('show');
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 1) {
        input.dispatchEvent(new Event('input'));
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-wrapper')) {
        suggestions.classList.remove('show');
      }
    });
  }

  setupAutocomplete('from-stop', 'from-suggestions');
  setupAutocomplete('to-stop', 'to-suggestions');

  // ---- Swap Button ----
  document.getElementById('swap-btn').addEventListener('click', () => {
    const fromInput = document.getElementById('from-stop');
    const toInput = document.getElementById('to-stop');
    const temp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = temp;
  });

  // ---- Search ----
  const searchForm = document.getElementById('search-form');
  const resultsSection = document.getElementById('results-section');
  const resultsGrid = document.getElementById('results-grid');
  const resultsTitle = document.getElementById('results-title');
  const resultsCount = document.getElementById('results-count');
  const noResults = document.getElementById('no-results');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const from = document.getElementById('from-stop').value.trim();
    const to = document.getElementById('to-stop').value.trim();

    if (!from || !to) {
      showToast('Please enter both origin and destination.', 'error');
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      showToast('Origin and destination cannot be the same.', 'error');
      return;
    }

    // Search buses
    const buses = getData('buses');
    const matchingBuses = buses.filter(bus => {
      const fromIndex = bus.route.findIndex(s => s.toLowerCase() === from.toLowerCase());
      const toIndex = bus.route.findIndex(s => s.toLowerCase() === to.toLowerCase());
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex && bus.status !== 'cancelled';
    });

    resultsGrid.innerHTML = '';

    if (matchingBuses.length > 0) {
      resultsSection.style.display = 'block';
      noResults.style.display = 'none';
      resultsTitle.textContent = `Buses from ${from} to ${to}`;
      resultsCount.textContent = `${matchingBuses.length} bus${matchingBuses.length > 1 ? 'es' : ''} found`;

      matchingBuses.forEach((bus, index) => {
        const card = createBusCard(bus, from, to);
        card.style.animationDelay = `${index * 0.1}s`;
        resultsGrid.appendChild(card);
      });
    } else {
      resultsSection.style.display = 'none';
      noResults.style.display = 'block';
    }

    // Scroll to results
    const target = matchingBuses.length > 0 ? resultsSection : noResults;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Create Bus Card ----
  function createBusCard(bus, from, to) {
    const card = document.createElement('div');
    card.className = 'bus-card animate-fade-in-up';

    // Build route display
    const routeHTML = bus.route.map((stop, i) => {
      const isHighlight = stop.toLowerCase() === from.toLowerCase() || stop.toLowerCase() === to.toLowerCase();
      const arrow = i < bus.route.length - 1 ? '<span class="route-arrow">→</span>' : '';
      return `<span class="route-stop ${isHighlight ? 'highlight' : ''}">${stop}</span>${arrow}`;
    }).join('');

    // Status badge
    const statusClass = bus.status === 'active' ? 'badge-success' :
                         bus.status === 'delayed' ? 'badge-warning' : 'badge-danger';

    card.innerHTML = `
      <div class="bus-card-header">
        <div>
          <div class="bus-card-name">${bus.name}</div>
          <div class="bus-card-id">${bus.id}</div>
        </div>
        <span class="badge ${statusClass}">${bus.status}</span>
      </div>
      <div class="bus-card-route">${routeHTML}</div>
      <div class="bus-card-details">
        <div class="bus-detail">
          <span class="bus-detail-label">Departure</span>
          <span class="bus-detail-value">${bus.departure}</span>
        </div>
        <div class="bus-detail">
          <span class="bus-detail-label">Arrival</span>
          <span class="bus-detail-value">${bus.arrival}</span>
        </div>
        <div class="bus-detail">
          <span class="bus-detail-label">Fare</span>
          <span class="bus-detail-value" style="color:var(--success)">₹${bus.fare}</span>
        </div>
        <div class="bus-detail">
          <span class="bus-detail-label">Seats</span>
          <span class="bus-detail-value">${bus.seats}</span>
        </div>
      </div>
      <div class="bus-card-footer">
        <span style="font-size:0.85rem;color:var(--text-muted)">${bus.route.length} stops</span>
        <button class="btn btn-primary btn-sm" onclick="bookBus('${bus.id}')">Book Seat</button>
      </div>
    `;

    return card;
  }

});

// ---- Book Bus (global) ----
function bookBus(busId) {
  const user = getCurrentUser();
  if (!user) return;

  const buses = getData('buses');
  const bus = buses.find(b => b.id === busId);

  if (!bus) {
    showToast('Bus not found.', 'error');
    return;
  }

  if (bus.seats <= 0) {
    showToast('No seats available on this bus.', 'error');
    return;
  }

  // Reduce seats
  bus.seats -= 1;
  setData('buses', buses);

  // Save booking
  const bookings = getData('bookings');
  bookings.push({
    busId: bus.id,
    busName: bus.name,
    passenger: user.name,
    phone: user.phone,
    bookedAt: new Date().toISOString()
  });
  setData('bookings', bookings);

  showToast(`Seat booked on ${bus.name}! ${bus.seats} seats remaining.`, 'success');
}
