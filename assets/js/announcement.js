(() => {
  const popup = document.getElementById('announcement-popup');
  const closeButton = popup?.querySelector('.announcement-close');
  if (!popup || !closeButton) return;

  const storageKey = 'rahi-announcement-dismissed';
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(storageKey) === '1'; } catch (_) {}
  if (dismissed) {
    popup.remove();
    return;
  }

  const image = popup.querySelector('img[data-src]');
  if (image) image.src = image.dataset.src;
  const previousFocus = document.activeElement;

  const closePopup = () => {
    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('announcement-open');
    try { sessionStorage.setItem(storageKey, '1'); } catch (_) {}
    closeButton.blur();
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
  };

  popup.classList.add('is-visible');
  popup.setAttribute('aria-hidden', 'false');
  document.body.classList.add('announcement-open');
  closeButton.focus({ preventScroll: true });
  closeButton.addEventListener('click', closePopup);
  popup.addEventListener('click', event => {
    if (event.target === popup) closePopup();
  });
  document.addEventListener('keydown', event => {
    if (!popup.classList.contains('is-visible')) return;
    if (event.key === 'Escape') closePopup();
    if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); }
  });
})();
