const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const goButton = document.getElementById('go-button');
const flight = document.getElementById('flight');

if (goButton && flight) {
  let flying = false;
  goButton.addEventListener('click', event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (reducedMotion.matches || navigator.connection?.saveData) return;
    event.preventDefault();
    if (flying) return;
    flying = true;
    flight.classList.add('is-active');
    goButton.setAttribute('aria-disabled', 'true');
    window.setTimeout(() => { window.location.assign(goButton.href); }, 1170);
  });
}

const processButton = document.getElementById('process-play');
const processFrame = document.querySelector('.process-frame');
if (processButton && processFrame) {
  processButton.addEventListener('click', () => {
    processFrame.classList.remove('is-playing');
    void processFrame.offsetWidth;
    processFrame.classList.add('is-playing');
    processButton.firstChild.textContent = 'Повторить анимацию ';
  });
}

const decorative = document.querySelectorAll('.home-art,.brand-star,.about-visual>span,.approach-manifesto>b,.contact-orbit');
const setHidden = () => document.documentElement.classList.toggle('page-hidden', document.hidden);
document.addEventListener('visibilitychange', setHidden);
setHidden();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, { rootMargin: '100px' });
  decorative.forEach(item => observer.observe(item));
}
