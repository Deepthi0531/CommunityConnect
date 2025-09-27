document.getElementById('emergency-form').addEventListener('submit', async e => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  // Get the selected emergency type or custom input if 'Other'
  let emergencyType = document.getElementById('emergencyType').value;
  if (emergencyType === 'Other') {
    emergencyType = document.getElementById('otherEmergency').value.trim();
    if (!emergencyType) {
      alert('Please specify the emergency type.');
      return;
    }
  }

  if (!emergencyType) {
    alert('Please select emergency type.');
    return;
  }

  let userLatitude = parseFloat(localStorage.getItem('latitude'));
  let userLongitude = parseFloat(localStorage.getItem('longitude'));

  // Check if latitude and longitude are valid (not null, undefined, zero)
  if (
    userLatitude == null ||
    userLongitude == null ||
    userLatitude === 0 ||
    userLongitude === 0 ||
    isNaN(userLatitude) ||
    isNaN(userLongitude)
  ) {
    // Attempt browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          userLatitude = position.coords.latitude;
          userLongitude = position.coords.longitude;

          // Save to localStorage for future use
          localStorage.setItem('latitude', userLatitude);
          localStorage.setItem('longitude', userLongitude);

          // Continue with alert sending after acquiring location
          sendEmergencyAlert(token, emergencyType, userLatitude, userLongitude);
        },
        (error) => {
          alert('Unable to access your location. Please update your profile with location.');
        }
      );
    } else {
      alert('Geolocation not supported by your browser. Please update your profile with location.');
    }
    return; // Wait for location retrieval or user update
  }

  // Location is valid, proceed with sending alert
  sendEmergencyAlert(token, emergencyType, userLatitude, userLongitude);
});

// Extract the alert sending logic to a function
async function sendEmergencyAlert(token, emergencyType, latitude, longitude) {
  try {
    const res = await fetch('http://localhost:5000/api/emergency/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        emergencyType,
        latitude,
        longitude,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Emergency alert sent to nearby users and volunteers!');
      window.location.href = 'index.html';
    } else {
      alert('Error: ' + (data.message || 'Failed to send alert.'));
    }
  } catch (err) {
    alert('Server error sending alert.');
  }
}
