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

  const userLatitude = parseFloat(localStorage.getItem('latitude'));
  const userLongitude = parseFloat(localStorage.getItem('longitude'));

  if (!userLatitude || !userLongitude) {
    alert('Cannot get your location. Please update your profile with location.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/emergency/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        emergencyType,
        latitude: userLatitude,
        longitude: userLongitude
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
});
