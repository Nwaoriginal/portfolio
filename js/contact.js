document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');
  const formAlert = document.getElementById('form-alert');
  const submitButton = form.querySelector('button[type="submit"]');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]+$/;

  const setFieldStatus = (input, feedbackId, isValid, errorMessage = '') => {
    const feedback = document.getElementById(feedbackId);

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'form-feedback success';
      }
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      if (feedback) {
        feedback.textContent = errorMessage;
        feedback.className = 'form-feedback';
      }
    }
  };

  const validateName = () => {
    const val = nameInput.value.trim();
    if (val === '') {
      setFieldStatus(nameInput, 'name-feedback', false, 'Full name is required and cannot be empty.');
      return false;
    }
    if (val.length < 2) {
      setFieldStatus(nameInput, 'name-feedback', false, 'Name must be at least 2 characters.');
      return false;
    }
    setFieldStatus(nameInput, 'name-feedback', true);
    return true;
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    if (val === '') {
      setFieldStatus(emailInput, 'email-feedback', false, 'Email address cannot be empty.');
      return false;
    }
    if (!emailRegex.test(val)) {
      setFieldStatus(emailInput, 'email-feedback', false, 'Please enter a valid email format (e.g. name@example.com).');
      return false;
    }
    setFieldStatus(emailInput, 'email-feedback', true);
    return true;
  };

  const validatePhone = () => {
    const val = phoneInput.value.trim();
    if (val === '') {
      setFieldStatus(phoneInput, 'phone-feedback', false, 'Phone number cannot be empty.');
      return false;
    }
    if (!phoneRegex.test(val)) {
      setFieldStatus(phoneInput, 'phone-feedback', false, 'Phone number must contain only digits (0-9).');
      return false;
    }
    if (val.length < 8 || val.length > 15) {
      setFieldStatus(phoneInput, 'phone-feedback', false, 'Phone number must be between 8 and 15 digits.');
      return false;
    }
    setFieldStatus(phoneInput, 'phone-feedback', true);
    return true;
  };

  const validateMessage = () => {
    const val = messageInput.value.trim();
    if (val === '') {
      setFieldStatus(messageInput, 'message-feedback', false, 'Message content cannot be empty.');
      return false;
    }
    if (val.length < 10) {
      setFieldStatus(messageInput, 'message-feedback', false, 'Message must be at least 10 characters long.');
      return false;
    }
    setFieldStatus(messageInput, 'message-feedback', true);
    return true;
  };

  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('is-invalid')) validateName();
  });
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('is-invalid')) validateEmail();
  });
  phoneInput.addEventListener('input', () => {
    if (phoneInput.classList.contains('is-invalid')) validatePhone();
  });
  messageInput.addEventListener('input', () => {
    if (messageInput.classList.contains('is-invalid')) validateMessage();
  });

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  phoneInput.addEventListener('blur', validatePhone);
  messageInput.addEventListener('blur', validateMessage);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isMessageValid = validateMessage();

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && isMessageValid;

    if (!isFormValid) {
      if (formAlert) {
        formAlert.className = 'alert alert-danger';
        formAlert.innerHTML = '<strong>Validation Error:</strong> Please correct the errors highlighted above.';
        formAlert.style.display = 'flex';
      }
      return;
    }

    if (formAlert) {
      formAlert.style.display = 'none';
    }

    const originalButtonContent = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Sending Message...</span>';

    setTimeout(() => {
      form.reset();
      [nameInput, emailInput, phoneInput, messageInput].forEach((input) => {
        input.classList.remove('is-valid', 'is-invalid');
      });

      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonContent;

      if (formAlert) {
        formAlert.className = 'alert alert-success';
        formAlert.innerHTML = '<strong>Success!</strong> Thank you for your message. Emmanuel will get back to you shortly.';
        formAlert.style.display = 'flex';
      }

      if (typeof showToast === 'function') {
        showToast('Message sent successfully!', 'success');
      }
    }, 900);
  });
});
