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

function handleAuthForm(formId, successMessage) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', event => {
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
    if (valid) {
      showToast(successMessage);
      form.reset();
    }
  });
}

function handleContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    if (!name || !message || !validateEmail(email)) {
      showToast('Please fill in the form correctly.');
      return;
    }
    showToast('Message sent successfully!');
    form.reset();
  });
}

function initializeFormValidation() {
  handleAuthForm('login-form', 'Login successful');
  handleAuthForm('register-form', 'Registration successful');
  handleContactForm();
}
