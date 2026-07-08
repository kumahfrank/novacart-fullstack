function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function submitToApi(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function handleAuthForm(formId, successMessage) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const inputs = form.querySelectorAll('input');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
    });
    if (formId === 'register-form') {
      const password = document.getElementById('register-password')?.value || '';
      const confirm = document.getElementById('register-confirm')?.value || '';
      if (password !== confirm) {
        valid = false;
        document.getElementById('register-confirm')?.classList.add('is-invalid');
      }
    }
    if (!valid) {
      showToast('Please complete the form correctly.');
      return;
    }

    try {
      await submitToApi('/api/contact', {
        name: document.getElementById('register-name')?.value || document.getElementById('login-email')?.value || 'Customer',
        email: document.getElementById('register-email')?.value || document.getElementById('login-email')?.value || 'customer@example.com',
        message: successMessage
      });
      showToast(successMessage);
      form.reset();
    } catch (error) {
      showToast(error.message);
    }
  });
}

function handleContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    if (!name || !message || !validateEmail(email)) {
      showToast('Please fill in the form correctly.');
      return;
    }
    try {
      await submitToApi('/api/contact', { name, email, message });
      showToast('Message sent successfully!');
      form.reset();
    } catch (error) {
      showToast(error.message);
    }
  });
}

function initializeFormValidation() {
  handleAuthForm('login-form', 'Login successful');
  handleAuthForm('register-form', 'Registration successful');
  handleContactForm();
}
