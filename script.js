/* Navigation */
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const navList = document.getElementById("navLinks");
const menuToggle = document.querySelector(".menu-toggle");

function setMenu(open) {
  if (!navList || !menuToggle) return;

  navList.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");

  const icon = menuToggle.querySelector("i");
  if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

if (menuToggle && navList) {
  menuToggle.addEventListener("click", () => {
    setMenu(!navList.classList.contains("open"));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* Hero Typewriter */
const typewriterText = document.getElementById("typewriterText");
const roles = [
  "Software Engineering",
  "Embedded System Developer"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout = 0;

function typeRole() {
  if (!typewriterText) return;

  const current = roles[roleIndex];
  const nextText = isDeleting ? current.slice(0, charIndex - 1) : current.slice(0, charIndex + 1);
  typewriterText.textContent = nextText;
  charIndex = nextText.length;

  let delay = isDeleting ? 38 : 72;

  if (!isDeleting && charIndex === current.length) {
    delay = 1350;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 360;
  }

  typeTimeout = window.setTimeout(typeRole, delay);
}

typeRole();

/* Custom Cursor */
const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

function updateCursor() {
  glowX += (mouseX - glowX) * 0.18;
  glowY += (mouseY - glowY) * 0.18;

  if (cursorDot && cursorGlow) {
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
  }

  requestAnimationFrame(updateCursor);
}

if (!coarsePointer && !prefersReducedMotion && cursorDot && cursorGlow) {
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

/* Hero Circuit Canvas */
const canvas = document.getElementById("circuitCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

let particles = [];
let animationFrame = 0;
let resizeTimer = 0;

function resizeCanvas() {
  if (!canvas || !ctx || !canvas.parentElement) return;

  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const area = rect.width * rect.height;
  const count = Math.max(42, Math.min(88, Math.floor(area / 15500)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    radius: Math.random() * 1.7 + 1,
    pulse: Math.random() * Math.PI * 2
  }));
}

function drawCircuitFrame(animateParticles) {
  if (!canvas || !ctx) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(7, 9, 13, 0.16)";
  ctx.fillRect(0, 0, width, height);

  particles.forEach((particle) => {
    if (animateParticles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += 0.02;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
    }
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.hypot(dx, dy);
      const threshold = width < 720 ? 104 : 146;

      if (distance < threshold) {
        const alpha = (1 - distance / threshold) * 0.3;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }

  particles.forEach((particle, index) => {
    const pulse = animateParticles ? Math.sin(particle.pulse) : Math.sin(index);
    const glow = 0.4 + pulse * 0.22;
    const hue = index % 7 === 0 ? "255, 184, 107" : "0, 229, 255";

    ctx.beginPath();
    ctx.fillStyle = `rgba(${hue}, ${glow})`;
    ctx.shadowColor = `rgba(${hue}, 0.7)`;
    ctx.shadowBlur = 12;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function animateCircuit() {
  drawCircuitFrame(true);
  animationFrame = requestAnimationFrame(animateCircuit);
}

resizeCanvas();
drawCircuitFrame(false);
if (!prefersReducedMotion) animateCircuit();

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    resizeCanvas();
    drawCircuitFrame(false);
  }, 160);
}, { passive: true });

/* Scroll Reveal + Active Section */
const revealTargets = document.querySelectorAll(".reveal, .skill-category");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealTargets.forEach((element) => revealObserver.observe(element));

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
} else {
  revealTargets.forEach((element) => element.classList.add("in-view"));
}

/* Project Screenshot Loading */
function watchImageLoad(image, loadedClass, missingClass) {
  const shell = image.parentElement;
  if (!shell) return;

  const markLoaded = () => {
    shell.classList.add(loadedClass);
    shell.classList.remove(missingClass);
  };

  const markMissing = () => {
    shell.classList.add(missingClass);
    shell.classList.remove(loadedClass);
  };

  image.addEventListener("load", markLoaded, { once: true });
  image.addEventListener("error", markMissing, { once: true });

  if (image.complete) {
    if (image.naturalWidth > 0) markLoaded();
    else markMissing();
  }
}

document.querySelectorAll(".project-shot").forEach((image) => {
  watchImageLoad(image, "is-loaded", "is-missing");
});

/* Project Demo Lightbox */
const projectGalleries = {
  hospital: {
    title: "Hospital Management System",
    slides: [
      {
        tone: "blue",
        src: "Assets/hospital-dashboard.png",
        label: "Desktop UI Screenshot",
        title: "Dashboard overview",
        meta: "Patients, appointments, revenue, doctors on duty",
        alt: "Al-Noor Hospital dashboard showing key operating metrics and today's appointments",
        caption: "Dashboard screenshot showing daily operating metrics and appointment status."
      },
      {
        tone: "blue",
        src: "Assets/hospital-appointments.png",
        label: "Appointment Form",
        title: "Book appointment",
        meta: "Patient, doctor, date, time, clinic",
        alt: "Al-Noor Hospital appointment booking form",
        caption: "Appointment booking screen showing patient and doctor scheduling inputs."
      },
      {
        tone: "blue",
        src: "Assets/hospital-patients.png",
        label: "Medical Records",
        title: "Patient records",
        meta: "Search, patient profile, record timeline",
        alt: "Al-Noor Hospital patient medical records screen",
        caption: "Patient records screen showing searchable profiles and medical history."
      },
      {
        tone: "blue",
        src: "Assets/hospital-billing.png",
        label: "Billing",
        title: "Financial and billing",
        meta: "Payments, insurance, revenue",
        alt: "Al-Noor Hospital billing and payment screen",
        caption: "Billing screen showing payment fields, insurance coverage, and revenue cards."
      },
      {
        tone: "blue",
        src: "Assets/hospital-schedule.png",
        label: "Doctor Schedule",
        title: "Doctor availability",
        meta: "Weekly shifts and available doctors",
        alt: "Al-Noor Hospital doctor schedule view",
        caption: "Doctor schedule screen showing weekly shifts and available doctors."
      }
    ]
  },
  atm: {
    title: "ATM System Simulation",
    slides: [
      {
        tone: "amber",
        src: "Assets/atm-login.png",
        contain: true,
        label: "Terminal UI",
        title: "ATM welcome screen",
        meta: "Login, sign up, exit",
        alt: "ATM System Simulation welcome terminal screen",
        caption: "Initial terminal screen with login, sign up, and exit options."
      },
      {
        tone: "amber",
        src: "Assets/atm-main-menu.png",
        contain: true,
        label: "Terminal UI",
        title: "ATM main menu",
        meta: "Withdraw, deposit, transfer, balance",
        alt: "ATM System Simulation authenticated main menu terminal screen",
        caption: "Authenticated main menu showing the available transaction operations."
      }
    ]
  },
  bmo: {
    title: "BMO AI Assistant",
    slides: [
      {
        tone: "green",
        src: "Assets/bmo-prototype.png",
        label: "Physical Prototype",
        title: "BMO assistant body",
        meta: "Screen face, controller buttons, handmade shell",
        alt: "BMO AI Assistant physical prototype with glowing screen face",
        caption: "Physical prototype screenshot showing the assistant body, screen face, and game-inspired controls."
      }
    ]
  }
};

const lightbox = document.getElementById("projectLightbox");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxVisual = document.getElementById("lightboxVisual");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxClose = document.querySelector(".lightbox-close");
let activeGalleryKey = "";
let activeSlideIndex = 0;
let lastFocusedElement = null;

function createVisualText(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

function renderLightboxSlide() {
  const gallery = projectGalleries[activeGalleryKey];
  if (!gallery || !lightboxVisual || !lightboxTitle || !lightboxCaption || !lightboxCounter) return;

  const slide = gallery.slides[activeSlideIndex];
  lightboxTitle.textContent = gallery.title;
  lightboxCaption.textContent = slide.caption;
  lightboxCounter.textContent = `${activeSlideIndex + 1} / ${gallery.slides.length}`;

  lightboxVisual.textContent = "";
  lightboxVisual.classList.remove("is-loaded", "is-missing");
  lightboxVisual.setAttribute("data-tone", slide.tone);
  lightboxVisual.setAttribute("aria-label", slide.alt);

  if (slide.src) {
    const image = document.createElement("img");
    image.className = slide.contain ? "lightbox-shot lightbox-shot-contain" : "lightbox-shot";
    image.src = slide.src;
    image.alt = slide.alt;
    lightboxVisual.append(image);
    watchImageLoad(image, "is-loaded", "is-missing");
  }

  lightboxVisual.append(
    createVisualText("visual-label", slide.label),
    createVisualText("visual-title", slide.title),
    createVisualText("visual-meta", slide.meta)
  );
}

function openLightbox(galleryKey) {
  if (!lightbox || !projectGalleries[galleryKey]) return;

  activeGalleryKey = galleryKey;
  activeSlideIndex = 0;
  lastFocusedElement = document.activeElement;
  renderLightboxSlide();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");

  if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;

  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function moveLightbox(direction) {
  const gallery = projectGalleries[activeGalleryKey];
  if (!gallery) return;

  activeSlideIndex = (activeSlideIndex + direction + gallery.slides.length) % gallery.slides.length;
  renderLightboxSlide();
}

document.querySelectorAll("[data-gallery]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button.getAttribute("data-gallery")));
});

document.querySelectorAll("[data-close-lightbox]").forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

document.querySelectorAll("[data-lightbox-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    moveLightbox(Number(button.getAttribute("data-lightbox-direction")));
  });
});

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) return;

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    moveLightbox(1);
  } else if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  } else if (event.key === "Tab") {
    const focusable = Array.from(lightbox.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])"));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.addEventListener("pagehide", () => {
  window.clearTimeout(typeTimeout);
  window.clearTimeout(resizeTimer);
  cancelAnimationFrame(animationFrame);
});
