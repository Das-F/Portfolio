window.addEventListener("load", () => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;
  const track = carousel.querySelector(".carousel__track");
  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  // Duplicate slides for seamless loop
  const originalSlides = slides.slice();
  originalSlides.forEach((s) => track.appendChild(s.cloneNode(true)));

  // Calculate widths after images loaded
  const calcWidths = () => {
    const slideRects = originalSlides.map((s) => s.getBoundingClientRect());
    const originalWidth = slideRects.reduce((sum, r) => sum + r.width, 0) + parseFloat(getComputedStyle(track).gap || 0) * (originalSlides.length - 1);
    return { originalWidth, slideWidth: slideRects[0].width };
  };

  let { originalWidth, slideWidth } = calcWidths();
  window.addEventListener("resize", () => {
    const sizes = calcWidths();
    originalWidth = sizes.originalWidth;
    slideWidth = sizes.slideWidth;
  });

  let pos = 0; // translateX value in px
  const speed = 1.0; // px per frame (plus rapide)
  let rafId = null;
  let paused = false;

  function animate() {
    if (!paused) {
      pos -= speed;
      if (Math.abs(pos) >= originalWidth) pos += originalWidth; // loop
      track.style.transform = `translateX(${pos}px)`;
    }
    rafId = requestAnimationFrame(animate);
  }

  // Pause on hover/focus
  carousel.addEventListener("mouseenter", () => (paused = true));
  carousel.addEventListener("mouseleave", () => (paused = false));
  carousel.addEventListener("focusin", () => (paused = true));
  carousel.addEventListener("focusout", () => (paused = false));

  // Navigation buttons
  const btnPrev = carousel.querySelector(".carousel__nav--prev");
  const btnNext = carousel.querySelector(".carousel__nav--next");

  const smoothShift = (dx) => {
    // temporarily animate shift
    cancelAnimationFrame(rafId);
    const prevTransition = track.style.transition;
    track.style.transition = "transform 0.6s ease";
    pos += dx;
    track.style.transform = `translateX(${pos}px)`;
    setTimeout(() => {
      track.style.transition = prevTransition;
      rafId = requestAnimationFrame(animate);
    }, 620);
  };

  btnPrev.addEventListener("click", () => {
    // move right (previous)
    smoothShift(slideWidth + parseFloat(getComputedStyle(track).gap || 0));
  });
  btnNext.addEventListener("click", () => {
    // move left (next)
    smoothShift(-(slideWidth + parseFloat(getComputedStyle(track).gap || 0)));
  });

  // Respect prefers-reduced-motion
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    // disable animation
    paused = true;
    return;
  }

  rafId = requestAnimationFrame(animate);
});
