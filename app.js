document.documentElement.classList.add('js');
if (navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) {
  document.documentElement.classList.add('lite-motion');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const decorative = document.querySelectorAll('.hero, .ticker, .about-section, .contact-section, .story-section');
if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, { rootMargin: '100px' });
  decorative.forEach(section => motionObserver.observe(section));
}
const updateVisibility = () => document.documentElement.classList.toggle('page-hidden', document.hidden);
document.addEventListener('visibilitychange', updateVisibility);
updateVisibility();

const progress = document.querySelector('.reading-progress');
let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, window.scrollY / distance) : 0})`;
    scrollFrame = 0;
  });
}, { passive: true });

const cursor = document.querySelector('.cursor-light');
const hero = document.querySelector('.hero');
const artwork = document.querySelector('.hero-art');
let pointerX = 0, pointerY = 0, frame = 0;
function movePointer(event) {
  if (reducedMotion.matches || !finePointer.matches) return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (frame) return;
  frame = requestAnimationFrame(() => {
    cursor.style.transform = `translate3d(${pointerX - 225}px,${pointerY - 225}px,0)`;
    cursor.style.opacity = '1';
    if (hero.matches(':hover')) {
      const box = hero.getBoundingClientRect();
      const x = (pointerX - box.left - box.width / 2) / box.width;
      const y = (pointerY - box.top - box.height / 2) / box.height;
      artwork.style.transform = `translate3d(${x * 35}px,${y * 30}px,0) rotate(${x * 3}deg)`;
    }
    frame = 0;
  });
}
window.addEventListener('pointermove', movePointer, { passive: true });
hero.addEventListener('pointerleave', () => { artwork.style.transform = ''; });

document.querySelectorAll('.magnetic').forEach(element => {
  element.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const box = element.getBoundingClientRect();
    const x = (event.clientX - box.left - box.width / 2) * 0.14;
    const y = (event.clientY - box.top - box.height / 2) * 0.14;
    element.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});

document.querySelectorAll('.case-preview').forEach(card => {
  const frameElement = card.querySelector('.browser-frame');
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    frameElement.style.setProperty('--ry', `${px * 8}deg`);
    frameElement.style.setProperty('--rx', `${-py * 8}deg`);
  });
  card.addEventListener('pointerleave', () => {
    frameElement.style.setProperty('--ry', '0deg');
    frameElement.style.setProperty('--rx', '0deg');
  });
});

const launch = document.getElementById('launch');
const transition = document.querySelector('.transition-screen');
const experience = document.getElementById('experience');
const storyCanvas = document.querySelector('.story-canvas');
const storyResult = document.getElementById('story-result');
const storyContinue = storyResult.querySelector('a');
const replay = document.getElementById('story-replay');
const storyStart = document.getElementById('story-start');
const touchInput = window.matchMedia('(hover: none), (pointer: coarse)');
function setStoryReady(ready) {
  storyResult.setAttribute('aria-hidden', String(!ready));
  storyContinue.tabIndex = ready ? 0 : -1;
}
setStoryReady(false);
let storyTimer = 0;
let storyStarted = false;
function startStory() {
  storyStarted = true;
  storyStart.classList.add('has-started');
  storyStart.querySelector('.story-start-copy').textContent = 'Повторить анимацию идеи';
  window.clearTimeout(storyTimer);
  experience.classList.remove('is-complete');
  setStoryReady(false);
  storyCanvas.classList.remove('is-playing');
  void storyCanvas.offsetWidth;
  storyCanvas.classList.add('is-playing');
  const finish = () => {
    experience.classList.add('is-complete');
    setStoryReady(true);
  };
  if (reducedMotion.matches) finish();
  else storyTimer = window.setTimeout(finish, 3150);
}
replay.addEventListener('click', startStory);
storyStart.addEventListener('click', startStory);
if ('IntersectionObserver' in window) {
  const storyObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !storyStarted && !touchInput.matches) {
      storyObserver.disconnect();
      startStory();
    }
  }, { threshold: 0.35 });
  storyObserver.observe(experience);
} else if (!touchInput.matches) startStory();
let transitioning = false;
launch.addEventListener('click', () => {
  if (transitioning) return;
  if (reducedMotion.matches) {
    experience.scrollIntoView({ behavior: 'instant' });
    if (!storyStarted && !touchInput.matches) startStory();
    return;
  }
  transitioning = true;
  const box = launch.getBoundingClientRect();
  transition.style.setProperty('--burst-x', `${box.left + box.width / 2}px`);
  transition.style.setProperty('--burst-y', `${box.top + box.height / 2}px`);
  transition.classList.remove('is-playing');
  void transition.offsetWidth;
  transition.classList.add('is-playing');
  window.setTimeout(() => {
    experience.scrollIntoView({ behavior: 'instant' });
    if (!storyStarted && !touchInput.matches) startStory();
  }, 640);
  window.setTimeout(() => {
    transition.classList.remove('is-playing');
    transitioning = false;
  }, 1280);
});
