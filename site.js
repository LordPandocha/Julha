const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const touchMode = window.matchMedia('(hover: none), (pointer: coarse)');
const lowMotion = () => reducedMotion.matches || navigator.connection?.saveData;
document.documentElement.classList.toggle('touch-device', touchMode.matches);

// One route transition for every internal page, including the first "Поехали" click.
const transition = document.createElement('div');
transition.className = 'route-transition';
transition.setAttribute('aria-hidden', 'true');
transition.innerHTML = '<div class="route-transition-grid"></div><div class="route-transition-trail"></div><svg class="route-transition-plane" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M17 82 145 17 104 145 79 96 17 82Z" fill="#c7ff4f" stroke="#f3ffe1" stroke-width="4" stroke-linejoin="round"/><path d="m79 96 66-79-41 128-25-49Z" fill="#90cb2a"/><path d="m17 82 128-65-66 79-62-14Z" fill="#e3ffab"/></svg><div class="route-transition-copy"><small>ПЕРЕХОД / LORDPANDOCHA</small><strong id="route-transition-name">ПОЕХАЛИ<span>.</span></strong><small>ИДЕЯ · ДИЗАЙН · КОД</small></div>';
document.body.append(transition);
const routeNames = { 'index.html': 'ГЛАВНАЯ', 'works.html': 'МОИ РАБОТЫ', 'approach.html': 'ПОДХОД', 'about.html': 'ОБО МНЕ', 'contact.html': 'КОНТАКТЫ' };
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
  transition.querySelector('#route-transition-name').innerHTML = `${routeNames[page] || 'ПОЕХАЛИ'}<span>.</span>`;
  transition.classList.add('is-active');
  document.body.classList.add('is-leaving');
  try { sessionStorage.setItem('lp-arrival', '1'); } catch (_) { /* storage may be unavailable */ }
  window.setTimeout(() => location.assign(destination.href), 980);
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

// The cinematic route starts once when visible and can be replayed.
const cinema = document.getElementById('process-cinema');
const replay = document.getElementById('process-play');
if (cinema && replay) {
  const path = document.getElementById('cinema-line');
  const plane = document.getElementById('cinema-plane');
  const scenes = [...cinema.querySelectorAll('.cinema-scene')];
  const counter = document.getElementById('cinema-counter');
  const progressBar = cinema.querySelector('.cinema-progress i');
  const length = path.getTotalLength();
  let started = false, playing = false, visible = false, frame = 0, elapsed = 0, last = 0, activeScene = -1;
  path.style.strokeDasharray = String(length);
  function render(progress) {
    const at = Math.max(0, Math.min(1, progress));
    path.style.strokeDashoffset = String(length * (1 - at));
    const point = path.getPointAtLength(length * at);
    const near = path.getPointAtLength(Math.min(length, length * at + 2));
    const angle = Math.atan2(near.y - point.y, near.x - point.x) * 180 / Math.PI;
    plane.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle}) scale(${touchMode.matches ? 2.4 : 1.4})`);
    progressBar.style.transform = `scaleX(${at})`;
    const stage = at >= 1 ? 2 : Math.min(2, Math.floor(at * 3));
    if (stage !== activeScene) {
      activeScene = stage;
      scenes.forEach((scene, index) => scene.classList.toggle('is-current', index === stage));
      counter.textContent = `0${stage + 1} — 03`;
    }
    cinema.classList.toggle('is-finished', at >= 1);
  }
  function tick(now) {
    if (!playing || !visible || document.hidden) { frame = 0; last = 0; return; }
    if (last) elapsed += Math.min(now - last, 50);
    last = now;
    const duration = touchMode.matches ? 4200 : 3600;
    const t = Math.min(1, elapsed / duration);
    render(t * t * (3 - 2 * t));
    if (t < 1) frame = requestAnimationFrame(tick);
    else { playing = false; frame = 0; }
  }
  function play() {
    started = true;
    cancelAnimationFrame(frame);
    elapsed = 0; last = 0; activeScene = -1;
    cinema.classList.add('has-started');
    if (lowMotion()) { playing = false; render(1); return; }
    playing = true;
    render(0);
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  replay.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !started) play();
      else if (visible && playing && !frame && !document.hidden) frame = requestAnimationFrame(tick);
      else if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; last = 0; }
    }, { threshold: touchMode.matches ? 0.35 : 0.5 });
    observer.observe(cinema);
  } else { visible = true; play(); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; last = 0; }
    else if (!document.hidden && visible && playing && !frame) frame = requestAnimationFrame(tick);
  });
}

// Touch gets scroll-triggered feedback where desktop uses hover.
if (touchMode.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.work-card,.home-preview a,.why-list article');
  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); self.unobserve(entry.target); } });
  }, { threshold: 0.22 });
  targets.forEach(target => observer.observe(target));
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
