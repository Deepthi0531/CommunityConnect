document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // Use a separate error message element for each form if they are different
  const errorMessage = document.getElementById('error-message');

  // --- LOGIN FORM HANDLER ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorMessage.textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Assuming the backend sends a token
          localStorage.setItem('token', data.token);
          alert('Login successful!');
          // Redirect to a dashboard or homepage
          window.location.href = '/frontend/dashboard.html';

        } else {
          errorMessage.textContent = data.message || 'Login failed.';
        }
      } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
      }
    });
  }

  // --- REGISTRATION FORM HANDLER ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorMessage.textContent = '';

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const role = document.getElementById('role').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role, password })
        })
        .then(res => res.json())
.then(data => {
  if (data.token) {
    localStorage.setItem('token', data.token);  // Save token in browser
    window.location.href = 'createhelp.html';   // Redirect to create post page
  } else {
    alert('Invalid login');
  }
});

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please log in.');
          window.location.href = '/login.html'; // Redirect to login page
        } else {
          errorMessage.textContent = data.message || 'Registration failed.';
        }
      } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
      }
    });
  }
});