/* =========================================================
   HOME.JS - PORTAL INSTITUCIONAL MEJORADO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initActiveNavOnScroll();
  initRevealAnimations();
  initBackToTop();
  initHeaderShadow();
  initSmoothInternalLinks();
});


/* =========================================================
   1. MENÚ RESPONSIVE
   ========================================================= */

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));

    const icon = menuToggle.querySelector("i");

    if (icon) {
      icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  }

  menuToggle.addEventListener("click", toggleMenu);

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
}


/* =========================================================
   2. NAVBAR ACTIVO SEGÚN SCROLL
   ========================================================= */

function initActiveNavOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const navItems = document.querySelectorAll(".nav-link");

  if (!sections.length || !navItems.length) return;

  function updateActiveNavLink() {
    let currentSectionId = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navItems.forEach((item) => {
      const isActive = item.getAttribute("href") === `#${currentSectionId}`;
      item.classList.toggle("active", isActive);
    });
  }

  window.addEventListener("scroll", throttle(updateActiveNavLink, 100));
  window.addEventListener("load", updateActiveNavLink);

  updateActiveNavLink();
}


/* =========================================================
   3. ANIMACIÓN AL HACER SCROLL
   ========================================================= */

function initRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal-item");

  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    revealObserver.observe(item);
  });
}


/* =========================================================
   4. BOTÓN VOLVER ARRIBA
   ========================================================= */

function initBackToTop() {
  const backToTop = document.getElementById("backToTop");

  if (!backToTop) return;

  function toggleBackToTop() {
    backToTop.classList.toggle("show", window.scrollY > 450);
  }

  window.addEventListener("scroll", throttle(toggleBackToTop, 100));

  backToTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  toggleBackToTop();
}


/* =========================================================
   5. HEADER CON SOMBRA AL BAJAR
   ========================================================= */

function initHeaderShadow() {
  const siteHeader = document.querySelector(".site-header");

  if (!siteHeader) return;

  function toggleHeaderShadow() {
    siteHeader.classList.toggle("scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", throttle(toggleHeaderShadow, 100));
  window.addEventListener("load", toggleHeaderShadow);

  toggleHeaderShadow();
}


/* =========================================================
   6. SCROLL SUAVE EN ENLACES INTERNOS
   ========================================================= */

function initSmoothInternalLinks() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      const offset = 86;
      const targetPosition = target.offsetTop - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });
}


/* =========================================================
   7. UTILIDAD THROTTLE
   ========================================================= */

function throttle(callback, delay) {
  let waiting = false;

  return function (...args) {
    if (waiting) return;

    callback.apply(this, args);
    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, delay);
  };
}