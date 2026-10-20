const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const touchMode = window.matchMedia('(hover: none), (pointer: coarse)');
const lowMotion = () => reducedMotion.matches || navigator.connection?.saveData;
document.documentElement.classList.toggle('touch-device', touchMode.matches);

// One route transition for every internal page, including the first "Поехали" click.
const transition = document.createElement('div');
transition.className = 'route-transition';
transition.setAttribute('aria-hidden', 'true');
transition.innerHTML = '<div class="route-transition-grid"></div><svg class="route-flight-map" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path class="route-flight-ghost" d="M-80 460 C190 480 240 330 390 320 C520 310 575 420 490 455 C390 498 350 365 425 285 C505 200 585 250 615 320 C665 435 840 310 1080 105"/><path class="route-flight-line" d="M-80 460 C190 480 240 330 390 320 C520 310 575 420 490 455 C390 498 350 365 425 285 C505 200 585 250 615 320 C665 435 840 310 1080 105"/><g class="route-flight-plane" id="route-flight-plane"><path d="M-26 -14 32 0-26 14-11 2Z" fill="#edffd5" stroke="#c7ff4f" stroke-width="2" stroke-linejoin="round"/><path d="M-11 2 32 0-26 14Z" fill="#9ed73e"/></g></svg><div class="route-transition-copy"><small>ПЕРЕХОД / LORDPANDOCHA</small><strong id="route-transition-name">ПОЕХАЛИ</strong><small>ИДЕЯ · ДИЗАЙН · КОД</small></div>';
document.body.append(transition);
const routeNames = { 'index.html': 'ГЛАВНАЯ', 'works.html': 'МОИ РАБОТЫ', 'approach.html': 'ПОДХОД', 'contact.html': 'КОНТАКТЫ' };
const routeFlightPath = transition.querySelector('.route-flight-line');
const routeFlightPlane = transition.querySelector('#route-flight-plane');
const routeFlightLength = routeFlightPath.getTotalLength();
routeFlightPath.style.strokeDasharray = String(routeFlightLength);
routeFlightPath.style.strokeDashoffset = String(routeFlightLength);
let routeFlightFrame = 0;
function flyRoute(startTime) {
  function frame(now) {
    const t = Math.min(1, (now - startTime) / 1200);
    const eased = t * t * (3 - 2 * t);
    const at = routeFlightLength * eased;
    const point = routeFlightPath.getPointAtLength(at);
    const before = routeFlightPath.getPointAtLength(Math.max(0, at - 3));
    const after = routeFlightPath.getPointAtLength(Math.min(routeFlightLength, at + 3));
    const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    routeFlightPlane.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle}) scale(1.3)`);
    routeFlightPath.style.strokeDashoffset = String(routeFlightLength * (1 - eased));
    if (t < 1) routeFlightFrame = requestAnimationFrame(frame);
  }
  cancelAnimationFrame(routeFlightFrame);
  routeFlightFrame = requestAnimationFrame(frame);
}
let navigating = false;
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || !/\.html$/.test(destination.pathname) || destination.href === location.href) return;
  if (lowMotion()) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  const page = destination.pathname.split('/').pop();
  transition.querySelector('#route-transition-name').textContent = routeNames[page] || 'ПОЕХАЛИ';
  transition.classList.add('is-active');
  document.body.classList.add('is-leaving');
  routeFlightPath.style.strokeDashoffset = String(routeFlightLength);
  window.setTimeout(() => flyRoute(performance.now()), 200);
  try { sessionStorage.setItem('lp-arrival', '1'); } catch (_) { /* storage may be unavailable */ }
  window.setTimeout(() => location.assign(destination.href), 1500);
});
window.addEventListener('pageshow', event => {
  if (event.persisted) { navigating = false; transition.classList.remove('is-active'); document.body.classList.remove('is-leaving'); }
});
try {
  if (sessionStorage.getItem('lp-arrival') === '1' && !lowMotion()) {
    sessionStorage.removeItem('lp-arrival');
    document.body.classList.add('has-arrived');
  }
} catch (_) { /* navigation still works without storage */ }

// The chosen scene is driven by scroll: particles assemble a site, then reveal it.
const cinema = document.getElementById('process-cinema');
const processScroll = document.getElementById('process-scroll');
const particleCanvas = document.getElementById('build-particles');
if (cinema && processScroll && particleCanvas) {
  const context = particleCanvas.getContext('2d');
  const scenes = [...cinema.querySelectorAll('.cinema-scene')];
  const counter = document.getElementById('cinema-counter');
  const progressBar = cinema.querySelector('.cinema-progress i');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const random = seed => { const x = Math.sin(seed * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
  let width = 1, height = 1, pending = 0, activeScene = -1;
  function resizeParticles() {
    const bounds = particleCanvas.getBoundingClientRect();
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.round(width * ratio);
    particleCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateScene();
  }
  function drawParticles(progress) {
    context.clearRect(0, 0, width, height);
    const assembly = smooth((progress - .05) / .42);
    const fade = 1 - smooth((progress - .7) / .26);
    context.globalAlpha = Math.max(.06, fade);
    for (let index = 0; index < 290; index++) {
      const group = index % 5;
      const targetX = group === 0 ? width * (.1 + random(index + 3) * .32) : group === 1 ? width * (.1 + random(index + 3) * .39) : group === 2 ? width * (.1 + random(index + 3) * .22) : width * (.59 + random(index + 3) * .31);
      const targetY = group === 0 ? height * (.23 + random(index + 7) * .06) : group === 1 ? height * (.39 + random(index + 7) * .08) : group === 2 ? height * (.69 + random(index + 7) * .055) : height * (.2 + random(index + 7) * .54);
      const scatterX = width * (.06 + random(index + 31) * .88);
      const scatterY = height * (.08 + random(index + 67) * .84);
      const drift = (1 - assembly) * Math.sin(progress * 9 + index) * 7;
      const x = scatterX + (targetX - scatterX) * assembly + drift;
      const y = scatterY + (targetY - scatterY) * assembly;
      const size = (index % 9 === 0 ? 3.5 : 1.8) + assembly * .4;
      context.fillStyle = index % 6 === 0 ? '#f1ffe0' : '#c7ff4f';
      context.fillRect(x, y, size, size);
    }
    context.globalAlpha = 1;
  }
  function updateScene() {
    if (document.hidden) return;
    const rect = processScroll.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = lowMotion() ? 1 : clamp(-rect.top / travel);
    const stage = progress < .32 ? 0 : progress < .68 ? 1 : 2;
    cinema.style.setProperty('--build-progress', progress.toFixed(3));
    cinema.style.setProperty('--site-opacity', smooth((progress - .57) / .33).toFixed(3));
    cinema.style.setProperty('--particle-opacity', (1 - smooth((progress - .76) / .22)).toFixed(3));
    progressBar.style.transform = `scaleX(${progress})`;
    if (stage !== activeScene) {
      activeScene = stage;
      cinema.dataset.stage = String(stage);
      scenes.forEach((scene, index) => scene.classList.toggle('is-current', index === stage));
      counter.textContent = `0${stage + 1} — 03`;
    }
    drawParticles(progress);
  }
  function scheduleUpdate() {
    if (pending) return;
    pending = requestAnimationFrame(() => { pending = 0; updateScene(); });
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', resizeParticles);
  document.addEventListener('visibilitychange', scheduleUpdate);
  resizeParticles();
}

// Touch gets scroll-triggered feedback where desktop uses hover.
if (touchMode.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.work-card,.why-list article');
  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); self.unobserve(entry.target); } });
  }, { threshold: 0.22 });
  targets.forEach(target => observer.observe(target));
}

const decorative = document.querySelectorAll('.home-art,.brand-star,.about-frame,.approach-manifesto>b,.contact-orbit');
const setHidden = () => document.documentElement.classList.toggle('page-hidden', document.hidden);
document.addEventListener('visibilitychange', setHidden);
setHidden();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, { rootMargin: '100px' });
  decorative.forEach(item => observer.observe(item));
}
