/* js/reset-password.js — Logic for Reset Password Page
 *
 * Wrapped in an IIFE to avoid "Identifier 'SERVER_ORIGIN' has already been
 * declared" SyntaxError when auth-modal.js is also loaded on the same page.
 * All functions that the HTML calls inline (onsubmit, onclick, oninput) are
 * explicitly assigned to window.* so they remain globally accessible.
 */
(function () {
  'use strict';

  // Safe: scoped const inside IIFE — never conflicts with auth-modal.js
  const SERVER_ORIGIN = window.SERVER_ORIGIN || 'https://trainerforum.onrender.com';

  let resetToken = '';

  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    resetToken = urlParams.get('token');

    if (!resetToken) {
      showInvalidState('No reset token was provided in the link.');
      return;
    }

    verifyToken(resetToken);
  });

  /**
   * Verify token validity with backend
   */
  async function verifyToken(token) {
    try {
      const res = await fetch(`${SERVER_ORIGIN}/api/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        document.getElementById('state-loading').style.display = 'none';
        document.getElementById('state-form').style.display = 'block';
        const emailDisplay = document.getElementById('user-email-display');
        if (emailDisplay && data.email) {
          emailDisplay.textContent = data.email;
        }
      } else {
        showInvalidState(data.error || 'Password reset link is invalid or has expired.');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      showInvalidState('Could not verify reset link. Please check your internet connection.');
    }
  }

  function showInvalidState(reason) {
    document.getElementById('state-loading').style.display = 'none';
    document.getElementById('state-form').style.display = 'none';
    document.getElementById('state-success').style.display = 'none';
    const reasonText = document.getElementById('invalid-reason-text');
    if (reasonText && reason) reasonText.textContent = reason;
    document.getElementById('state-invalid').style.display = 'block';
  }

  /**
   * Live Password Strength & Criteria Calculation
   */
  window.onNewPasswordInput = function () {
    const pwd = document.getElementById('newPassword').value;

    const lenOk   = pwd.length >= 8;
    const upperOk = /[A-Z]/.test(pwd);
    const lowerOk = /[a-z]/.test(pwd);
    const numOk   = /[0-9]/.test(pwd);
    const specOk  = /[^A-Za-z0-9]/.test(pwd);

    updateCritItem('crit-len',   lenOk);
    updateCritItem('crit-upper', upperOk);
    updateCritItem('crit-lower', lowerOk);
    updateCritItem('crit-num',   numOk);
    updateCritItem('crit-spec',  specOk);

    let score = 0;
    if (lenOk)   score += 20;
    if (upperOk) score += 20;
    if (lowerOk) score += 20;
    if (numOk)   score += 20;
    if (specOk)  score += 20;

    const bar   = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');

    bar.style.width = `${score}%`;

    if (score === 0) {
      bar.style.backgroundColor = '#ef4444';
      label.textContent = 'Password Strength';
      label.style.color = '#94a3b8';
    } else if (score < 60) {
      bar.style.backgroundColor = '#ef4444';
      label.textContent = 'Strength: Weak';
      label.style.color = '#ef4444';
    } else if (score < 100) {
      bar.style.backgroundColor = '#eab308';
      label.textContent = 'Strength: Medium';
      label.style.color = '#eab308';
    } else {
      bar.style.backgroundColor = '#22c55e';
      label.textContent = 'Strength: Strong ✓';
      label.style.color = '#22c55e';
    }

    window.onConfirmPasswordInput();
  };

  function updateCritItem(id, isValid) {
    const el = document.getElementById(id);
    if (!el) return;
    const ico = el.querySelector('.crit-ico');
    if (isValid) {
      el.classList.add('valid');
      if (ico) ico.textContent = '✓';
    } else {
      el.classList.remove('valid');
      if (ico) ico.textContent = '✕';
    }
  }

  /**
   * Confirm Password Match Check
   */
  window.onConfirmPasswordInput = function () {
    const pwd        = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    const msgEl      = document.getElementById('confirm-match-msg');

    if (!confirmPwd) {
      msgEl.style.display = 'none';
      return;
    }

    msgEl.style.display = 'block';
    if (pwd === confirmPwd) {
      msgEl.textContent = '✓ Passwords match';
      msgEl.className   = 'match-msg matched';
    } else {
      msgEl.textContent = '✕ Passwords do not match';
      msgEl.className   = 'match-msg mismatched';
    }
  };

  /**
   * Submit Password Reset Form
   */
  window.handlePasswordResetSubmit = async function (e) {
    e.preventDefault();
    const pwd        = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    const errBox     = document.getElementById('reset-error-msg');
    const btn        = document.getElementById('reset-submit-btn');

    errBox.style.display = 'none';

    if (!pwd || !confirmPwd) {
      errBox.textContent   = 'Please fill out both password fields.';
      errBox.style.display = 'block';
      return;
    }

    if (pwd !== confirmPwd) {
      errBox.textContent   = 'Passwords do not match.';
      errBox.style.display = 'block';
      return;
    }

    if (
      pwd.length < 8 ||
      !/[A-Z]/.test(pwd) ||
      !/[a-z]/.test(pwd) ||
      !/[0-9]/.test(pwd) ||
      !/[^A-Za-z0-9]/.test(pwd)
    ) {
      errBox.textContent   = 'Please ensure your password meets all strength requirements listed above.';
      errBox.style.display = 'block';
      return;
    }

    btn.disabled     = true;
    btn.textContent  = 'Resetting Password...';

    try {
      const res  = await fetch(`${SERVER_ORIGIN}/api/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: resetToken, newPassword: pwd })
      });
      const data = await res.json();

      if (res.ok) {
        document.getElementById('state-form').style.display    = 'none';
        document.getElementById('state-success').style.display = 'block';
        if (window.showToast) window.showToast('Password reset successful! Redirecting to login...', 3500);

        setTimeout(() => { window.redirectToLogin(); }, 2500);
      } else {
        errBox.textContent   = data.error || 'Failed to reset password. Please try again.';
        errBox.style.display = 'block';
        btn.disabled         = false;
        btn.textContent      = 'Reset Password';
      }
    } catch (err) {
      console.error('Password reset submit error:', err);
      errBox.textContent   = 'An error occurred while communicating with the server.';
      errBox.style.display = 'block';
      btn.disabled         = false;
      btn.textContent      = 'Reset Password';
    }
  };

  window.openRequestNewLink = function () {
    window.location.href = 'index.html#forgot-password';
  };

  window.redirectToLogin = function () {
    window.location.href = 'index.html#login';
  };

}());
