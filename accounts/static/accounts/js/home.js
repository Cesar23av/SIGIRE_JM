/* =========================================================
   HOME.JS - PORTAL INSTITUCIONAL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */


/* =========================================================
   1. MENÚ RESPONSIVE
   Abre y cierra el menú en pantallas pequeñas.
   ========================================================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuToggle.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.classList.remove("active");
    });
  });
}


/* =========================================================
   2. NAVBAR ACTIVO SEGÚN SCROLL
   Marca el enlace activo según la sección visible.
   ========================================================= */

const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-link");

function updateActiveNavLink() {
  let currentSectionId = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 130;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute("id");
    }
  });

  navItems.forEach((item) => {
    item.classList.remove("active");

    if (item.getAttribute("href") === `#${currentSectionId}`) {
      item.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNavLink);
window.addEventListener("load", updateActiveNavLink);


/* =========================================================
   3. ANIMACIÓN AL HACER SCROLL
   Muestra tarjetas, pasos y elementos cuando entran en pantalla.
   ========================================================= */

const revealItems = document.querySelectorAll(".reveal-item");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});


/* =========================================================
   4. BOTÓN VOLVER ARRIBA
   Aparece cuando el usuario baja en la página.
   ========================================================= */

const backToTop = document.getElementById("backToTop");

function toggleBackToTop() {
  if (!backToTop) return;

  if (window.scrollY > 450) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
}

if (backToTop) {
  window.addEventListener("scroll", toggleBackToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}


/* =========================================================
   5. HEADER CON SOMBRA AL BAJAR
   Refuerza visualmente la navegación fija.
   ========================================================= */

const siteHeader = document.querySelector(".site-header");

function toggleHeaderShadow() {
  if (!siteHeader) return;

  if (window.scrollY > 20) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", toggleHeaderShadow);
window.addEventListener("load", toggleHeaderShadow);