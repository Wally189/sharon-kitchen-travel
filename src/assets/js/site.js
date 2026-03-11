const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const motionPanels = Array.from(document.querySelectorAll(".motion-panel[data-float]"));

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (motionPanels.length && !prefersReducedMotion.matches) {
  let frameRequest = 0;

  const updateMotionPanels = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    motionPanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const amplitude = Number(panel.dataset.float || 0);
      const panelMidpoint = rect.top + rect.height / 2;
      const distanceFromCenter = (panelMidpoint - viewportHeight / 2) / viewportHeight;
      const shift = Math.max(-amplitude, Math.min(amplitude, distanceFromCenter * -amplitude * 1.8));

      panel.style.setProperty("--scroll-shift", `${shift.toFixed(2)}px`);
    });
  };

  const requestPanelUpdate = () => {
    if (frameRequest) {
      return;
    }

    frameRequest = window.requestAnimationFrame(() => {
      frameRequest = 0;
      updateMotionPanels();
    });
  };

  window.addEventListener("scroll", requestPanelUpdate, { passive: true });
  window.addEventListener("resize", requestPanelUpdate);
  updateMotionPanels();
}
