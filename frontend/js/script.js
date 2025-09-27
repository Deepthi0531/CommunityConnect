document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Separate error messages for both forms
  const loginErrorMessage = document.getElementById('login-error-message');
  const registerErrorMessage = document.getElementById('register-error-message');

  // --- LOGIN FORM HANDLER ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (loginErrorMessage) loginErrorMessage.textContent = '';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        if (loginErrorMessage) loginErrorMessage.textContent = 'Please enter email and password.';
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          if (data.latitude) localStorage.setItem('latitude', data.latitude);
          if (data.longitude) localStorage.setItem('longitude', data.longitude);

          alert('Login successful!');
          window.location.href = '/dashboard.html'; // or your actual home/dashboard page
        } else {
          if (loginErrorMessage) loginErrorMessage.textContent = data.message || 'Login failed.';
        }
      } catch (error) {
        if (loginErrorMessage) loginErrorMessage.textContent = 'An error occurred. Please try again.';
      }
    });
  }

  // --- REGISTRATION FORM HANDLER ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (registerErrorMessage) registerErrorMessage.textContent = '';

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const role = document.getElementById('role').value;
      const password = document.getElementById('password').value;
      const phone = document.getElementById('phone').value.trim(); // <-- ADDED

      // Read latitude and longitude from hidden form inputs
      const latStr = document.getElementById('latitude').value;
      const lonStr = document.getElementById('longitude').value;
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lonStr);

      if (!name || !email || !password || !phone) { // <-- UPDATED to include phone
        if (registerErrorMessage) registerErrorMessage.textContent = 'Please fill all required fields.';
        return;
      }

      if (!latStr || !lonStr || isNaN(latitude) || isNaN(longitude)) {
        if (registerErrorMessage) registerErrorMessage.textContent = 'Please select your location on the map.';
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role, password, phone, latitude, longitude }), // <-- ADDED phone
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please log in.');
          window.location.href = '/login.html';
        } else {
          if (registerErrorMessage) registerErrorMessage.textContent = data.message || 'Registration failed.';
        }
      } catch (error) {
        if (registerErrorMessage) registerErrorMessage.textContent = 'An error occurred. Please try again.';
      }
    });
  }
});


  // --- REGISTRATION FORM HANDLER ---
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (registerErrorMessage) registerErrorMessage.textContent = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim(); // get phone

    // Read latitude and longitude from hidden form inputs
    const latStr = document.getElementById('latitude').value;
    const lonStr = document.getElementById('longitude').value;
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    if (!name || !email || !password || !phone) { // phone required
      if (registerErrorMessage) registerErrorMessage.textContent = 'Please fill all required fields.';
      return;
    }

    if (!latStr || !lonStr || isNaN(latitude) || isNaN(longitude)) {
      if (registerErrorMessage) registerErrorMessage.textContent = 'Please select your location on the map.';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password, phone, latitude, longitude }), // add phone here
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please log in.');
        window.location.href = '/login.html';
      } else {
        if (registerErrorMessage) registerErrorMessage.textContent = data.message || 'Registration failed.';
      }
    } catch (error) {
      if (registerErrorMessage) registerErrorMessage.textContent = 'An error occurred. Please try again.';
    }
  });
}
