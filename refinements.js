(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = document.querySelectorAll('.featured-card,.home-why-grid article,.process-results li');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    targets.forEach(target => { target.classList.add('reveal-ready'); observer.observe(target); });
    reduced.addEventListener('change', () => targets.forEach(target => target.classList.add('is-revealed')));
  }
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let queued = false;
  function update() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0) + ')';
    queued = false;
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
