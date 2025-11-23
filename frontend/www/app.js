// Simple example: calling login mock API (replace with real API)
document.getElementById('btn-login').addEventListener('click', async () => {
  try {
    // change baseURL when you deploy (staging/production)
    const baseURL = 'http://10.0.2.2:8000'; // or http://10.0.2.2:8000 for Android emulator + local Django
    const resp = await fetch(`${baseURL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'juan@example.com', password: 'pass' })
    });
    const data = await resp.json();
    console.log('login', data);
    alert('Mock login response: ' + JSON.stringify(data));
  } catch (err) {
    console.error(err);
    alert('Fetch error: ' + err.message);
  }
});
