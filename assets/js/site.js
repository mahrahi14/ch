document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });
  primaryNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}

const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${Math.min(100, percent)}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const filterButtons = document.querySelectorAll(".filter-button");
const workCards = document.querySelectorAll(".work-card");
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    workCards.forEach(card => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

const lightbox = document.querySelector("#gallery-lightbox");
if (lightbox) {
  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector("p");
  const closeButton = lightbox.querySelector(".lightbox-close");
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      image.src = item.dataset.full;
      image.alt =
        item.querySelector("img")?.alt ||
        item.dataset.caption ||
        "Gallery image";
      caption.textContent = item.dataset.caption || "";
      if (typeof lightbox.showModal === "function") lightbox.showModal();
      else lightbox.setAttribute("open", "");
    });
  });
  closeButton?.addEventListener("click", () => lightbox.close?.());
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.close?.();
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const fields = new FormData(contactForm);
    const name = String(fields.get("name") || "").trim();
    const email = String(fields.get("email") || "").trim();
    const phone = String(fields.get("phone") || "").trim();
    const service = String(fields.get("service") || "Not specified").trim();
    const subject = String(fields.get("subject") || "").trim();
    const message = String(fields.get("message") || "").trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Service: ${service}`,
      "",
      message,
    ].join("\n");
    const mailto = `mailto:mahrahi774@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (formStatus)
      formStatus.textContent =
        "Your email app should open with the message prepared. Please send it there to complete your inquiry.";
    window.location.href = mailto;
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const revealTargets = document.querySelectorAll(
  ".section-index, .section-heading, .service-card, .work-card, .timeline-item, .education-card, .testimonial-card, .gallery-item, .vision-grid article"
);
revealTargets.forEach(element => element.classList.add("reveal"));
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
  );
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add("is-visible"));
}
