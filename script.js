const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const navList = document.getElementById("navLinks");
const menuToggle = document.querySelector(".menu-toggle");
const typewriterText = document.getElementById("typewriterText");
const roles = ["Software Engineering", "Embedded Systems Development"];
const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");
const canvas = document.getElementById("circuitCanvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;
let particles = [];
let animationFrame = 0;
let resizeTimer = 0;

function setMenu(open) {
  navList.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  const icon = menuToggle.querySelector("i");
  icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

menuToggle.addEventListener("click", () => {
  setMenu(!navList.classList.contains("open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function typeRole() {
  const current = roles[roleIndex];
  const nextText = isDeleting ? current.slice(0, charIndex - 1) : current.slice(0, charIndex + 1);
  typewriterText.textContent = nextText;
  charIndex = nextText.length;

  let delay = isDeleting ? 45 : 82;

  if (!isDeleting && charIndex === current.length) {
    delay = 1300;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 360;
  }

  typeTimeout = window.setTimeout(typeRole, delay);
}

typeRole();

function updateCursor() {
  glowX += (mouseX - glowX) * 0.18;
  glowY += (mouseY - glowY) * 0.18;

  if (cursorDot && cursorGlow) {
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
  }

  requestAnimationFrame(updateCursor);
}

if (!window.matchMedia("(pointer: coarse)").matches) {
  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  document.querySelectorAll("a, button, .chip, .cert-chip, .contact-method").forEach((item) => {
    item.addEventListener("pointerenter", () => document.body.classList.add("cursor-active"));
    item.addEventListener("pointerleave", () => document.body.classList.remove("cursor-active"));
  });

  updateCursor();
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const area = rect.width * rect.height;
  const count = Math.max(44, Math.min(96, Math.floor(area / 14000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    radius: Math.random() * 1.9 + 1.1,
    pulse: Math.random() * Math.PI * 2
  }));
}

function drawCircuit() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(10, 10, 15, 0.12)";
  ctx.fillRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.pulse += 0.02;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    particle.x = Math.max(0, Math.min(width, particle.x));
    particle.y = Math.max(0, Math.min(height, particle.y));
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.hypot(dx, dy);
      const threshold = width < 720 ? 105 : 150;

      if (distance < threshold) {
        const alpha = (1 - distance / threshold) * 0.34;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }

  particles.forEach((particle) => {
    const glow = 0.45 + Math.sin(particle.pulse) * 0.25;
    ctx.beginPath();
    ctx.fillStyle = `rgba(0, 245, 255, ${glow})`;
    ctx.shadowColor = "rgba(0, 245, 255, 0.85)";
    ctx.shadowBlur = 12;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  animationFrame = requestAnimationFrame(drawCircuit);
}

resizeCanvas();
if (!prefersReducedMotion) drawCircuit();

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    resizeCanvas();
    if (prefersReducedMotion) {
      drawCircuit();
      cancelAnimationFrame(animationFrame);
    }
  }, 160);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal, .skill-category").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute("id");
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  });
}, {
  rootMargin: "-42% 0px -48% 0px",
  threshold: 0
});

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

window.addEventListener("pagehide", () => {
  window.clearTimeout(typeTimeout);
  cancelAnimationFrame(animationFrame);
});
