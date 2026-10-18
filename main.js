const app = document.querySelector('#app');
const screens = { start: document.querySelector('#start'), choice: document.querySelector('#scent-choice'), environment: document.querySelector('#environment') };
const canvas = document.querySelector('#particles');
const context = canvas.getContext('2d');
const sceneTitle = document.querySelector('#environment-title');
const sceneDescription = document.querySelector('#scene-description');
const sceneLabel = document.querySelector('#scene-label');
const flavorTitle = document.querySelector('#flavor-title');
let locked = false;
let particles = [];
let animationFrame;

const scents = {
  strawberry: { title: 'Strawberry', description: 'Sweet, soft, and a little nostalgic.', flavor: 'Berry & Cream', label: 'SCENT NO. 01', theme: 'theme-strawberry', colors: ['#f56f91', '#ffc8cf', '#fff4df'], shape: 'petal' },
  chocolate: { title: 'Chocolate', description: 'Rich, warm, and deeply comforting.', flavor: 'Cocoa & Caramel', label: 'SCENT NO. 02', theme: 'theme-chocolate', colors: ['#573021', '#a86743', '#f0c576'], shape: 'crumb' },
  apple: { title: 'Apple', description: 'Fresh, crisp, and naturally sweet.', flavor: 'Apple & Cinnamon', label: 'SCENT NO. 03', theme: 'theme-apple', colors: ['#80a866', '#d8e980', '#ee9582'], shape: 'leaf' }
};

function showScreen(next) {
  Object.entries(screens).forEach(([name, screen]) => {
    const active = name === next;
    screen.hidden = !active;
    screen.classList.toggle('active', active);
  });
}

function resizeCanvas() { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
function createParticles(scent) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = reduced ? 24 : window.innerWidth < 720 ? 58 : 125;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  particles = Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 9;
    return { x: centerX, y: centerY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.2, size: 2 + Math.random() * 6, life: 1, decay: .011 + Math.random() * .014, color: scent.colors[index % scent.colors.length], shape: scent.shape, spin: Math.random() * Math.PI };
  });
}
function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle) => {
    particle.x += particle.vx; particle.y += particle.vy; particle.vy += .025; particle.vx *= .992; particle.life -= particle.decay; particle.spin += .08;
    context.save(); context.globalAlpha = Math.max(particle.life, 0); context.fillStyle = particle.color; context.translate(particle.x, particle.y); context.rotate(particle.spin);
    if (particle.shape === 'leaf') { context.beginPath(); context.ellipse(0, 0, particle.size * .45, particle.size, 0, 0, Math.PI * 2); context.fill(); }
    else if (particle.shape === 'petal') { context.beginPath(); context.ellipse(0, 0, particle.size * .55, particle.size, .7, 0, Math.PI * 2); context.fill(); }
    else { context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size); }
    context.restore();
  });
  particles = particles.filter((particle) => particle.life > 0);
  if (particles.length) animationFrame = requestAnimationFrame(drawParticles); else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
function setScene(name) {
  const scent = scents[name];
  app.classList.remove(...Object.values(scents).map((item) => item.theme));
  app.classList.add(scent.theme);
  sceneTitle.textContent = scent.title; sceneDescription.textContent = scent.description; sceneLabel.textContent = scent.label; flavorTitle.textContent = scent.flavor;
  document.querySelectorAll('[data-switch]').forEach((button) => button.classList.toggle('selected', button.dataset.switch === name));
}
function chooseScent(card) {
  if (locked) return;
  locked = true;
  const name = card.dataset.scent;
  document.querySelectorAll('.scent-card').forEach((item) => item.classList.toggle('is-muted', item !== card));
  card.classList.add('is-selected');
  app.classList.add('is-transitioning');
  createParticles(scents[name]);
  cancelAnimationFrame(animationFrame); drawParticles();
  window.setTimeout(() => { setScene(name); showScreen('environment'); }, 1100);
  window.setTimeout(() => { app.classList.remove('is-transitioning'); locked = false; card.classList.remove('is-selected'); document.querySelectorAll('.scent-card').forEach((item) => item.classList.remove('is-muted')); }, 1550);
}

document.querySelector('#enter-button').addEventListener('click', () => showScreen('choice'));
document.querySelectorAll('.scent-card').forEach((card) => card.addEventListener('click', () => chooseScent(card)));
document.querySelectorAll('[data-switch]').forEach((button) => button.addEventListener('click', () => setScene(button.dataset.switch)));
document.querySelector('#back-button').addEventListener('click', () => showScreen('choice'));
document.querySelector('#back-to-scents').addEventListener('click', () => showScreen('choice'));
window.addEventListener('resize', resizeCanvas); resizeCanvas();
