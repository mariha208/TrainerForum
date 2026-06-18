// Global mobile menu toggle function
window.toggleMobileMenu = function () {
  const mn = document.getElementById('mobile-nav');
  const ham = document.getElementById('ham-btn');
  if (!mn) return;
  const isOpen = mn.classList.contains('open');
  if (isOpen) {
    mn.classList.remove('open');
    if (ham) ham.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    mn.classList.add('open');
    if (ham) ham.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};
