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

// Light signal follows one SVG route; drawing and stage copy share the same timeline.
const cinema = document.getElementById('process-cinema');
if (cinema) {
  const scenes = [...cinema.querySelectorAll('.cinema-scene')];
  const counter = document.getElementById('cinema-counter');
  const progressBar = cinema.querySelector('.cinema-progress i');
  const controls = [...document.querySelectorAll('[data-build-step]')];
  const route = document.getElementById('signal-path');
  const strokes = [...cinema.querySelectorAll('.signal-drawn')];
  const traveller = document.getElementById('signal-traveller');
  const nodes = [...cinema.querySelectorAll('.signal-node')];
  const gate = cinema.querySelector('.signal-gate');
  const start = cinema.querySelector('.signal-start');
  const replay = document.querySelector('.signal-replay');
  const status = document.getElementById('signal-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const length = route.getTotalLength();
  cinema.querySelector('.signal-map').setAttribute('preserveAspectRatio', 'none');
  const stops = [0, .66, 1];
  const duration = 12000;
  let stage = 0, frame = 0, startedAt = 0, currentProgress = 0, playing = false;
  strokes.forEach(path => { path.style.strokeDasharray = `${length} ${length}`; });
  function render(progress) {
    currentProgress = Math.max(0, Math.min(1, progress));
    const distance = length * currentProgress;
    const point = route.getPointAtLength(distance);
    const before = route.getPointAtLength(Math.max(0, distance - 3));
    const after = route.getPointAtLength(Math.min(length, distance + 3));
    const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    traveller.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    strokes.forEach(path => { path.style.strokeDashoffset = String(length * (1 - currentProgress)); });
    progressBar.style.transform = `scaleX(${currentProgress})`;
    nodes.forEach((node, index) => node.classList.toggle('is-lit', currentProgress >= stops[index] - .015));
  }
  function setStage(next) {
    stage = Math.max(0, Math.min(2, next));
    cinema.dataset.stage = String(stage);
    scenes.forEach((scene, index) => scene.classList.toggle('is-current', index === stage));
    controls.forEach((button, index) => {
      const active = index === stage;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-pressed', String(active));
    });
    counter.textContent = `0${stage + 1} — 03`;
    status.textContent = ['НАХОДИМ ГЛАВНОЕ', 'СОБИРАЕМ ОБРАЗ', 'САЙТ ГОТОВ К ЗАПУСКУ'][stage];
  }
  function stop() { cancelAnimationFrame(frame); playing = false; }
  function finish() { stop(); setStage(2); render(1); replay.hidden = false; }
  function tick(now) {
    if (!playing) return;
    if (document.hidden) { startedAt += now - (tick.lastTime || now); tick.lastTime = now; frame = requestAnimationFrame(tick); return; }
    tick.lastTime = now;
    const progress = Math.min(1, (now - startedAt) / duration);
    render(progress);
    if (progress >= stops[2]) setStage(2);
    else if (progress >= stops[1]) setStage(1);
    else setStage(0);
    if (progress < 1) frame = requestAnimationFrame(tick);
    else finish();
  }
  function play() {
    stop(); gate.hidden = true; cinema.classList.add('has-started'); replay.hidden = true;
    setStage(0); render(0);
    if (reduced.matches) { finish(); return; }
    tick.lastTime = 0; startedAt = performance.now(); playing = true; frame = requestAnimationFrame(tick);
  }
  start.addEventListener('click', play);
  replay.addEventListener('click', play);
  controls.forEach((button, index) => {
    button.addEventListener('click', () => { stop(); gate.hidden = true; cinema.classList.add('has-started'); replay.hidden = false; setStage(index); render(stops[index]); });
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      controls[next].focus();
      controls[next].click();
    });
  });
  render(0); setStage(0);
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
