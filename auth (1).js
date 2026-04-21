/* ============================================
   AUTH JS — Login & Signup Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // ---- LOGIN ----
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const role = loginForm.dataset.role; // 'passenger' or 'admin'

      // Validate
      if (!phone || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
      }

      // Check credentials
      const storageKey = role === 'admin' ? 'admins' : 'passengers';
      const users = getData(storageKey);
      const user = users.find(u => u.phone === phone && u.password === password);

      if (user) {
        setCurrentUser({ ...user, role: role });
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
        }, 1000);
      } else {
        showToast('Invalid phone number or password.', 'error');
      }
    });
  }

  // ---- SIGNUP ----
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const role = signupForm.dataset.role;

      // Validate
      if (!name || !phone || !password || !confirmPassword) {
        showToast('Please fill in all fields.', 'error');
        return;
      }

      if (name.length < 2) {
        showToast('Name must be at least 2 characters.', 'error');
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      // Check if phone already exists
      const storageKey = role === 'admin' ? 'admins' : 'passengers';
      const users = getData(storageKey);

      if (users.find(u => u.phone === phone)) {
        showToast('An account with this phone number already exists.', 'error');
        return;
      }

      // Create account
      const newUser = {
        name: name,
        phone: phone,
        password: password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setData(storageKey, users);

      showToast('Account created successfully! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = role === 'admin' ? 'login-admin.html' : 'login-passenger.html';
      }, 1500);
    });
  }

  // ---- Password Toggle ----
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      }
    });
  });

});
