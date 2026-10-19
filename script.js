const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const toast = document.getElementById("toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navAnchors = Array.from(navLinks.querySelectorAll("a"));

document.getElementById("year").textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
});

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});

const closeMenu = () => {
  navLinks.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

/* ---------- Smooth in-page navigation ---------- */
navAnchors.forEach((link) =>
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault();
        try {
          history.replaceState(null, "", href);
        } catch {
          location.hash = href;
        }
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    }
    closeMenu();
  })
);

if (location.hash) {
  const initial = document.getElementById(location.hash.slice(1));
  if (initial) requestAnimationFrame(() => initial.scrollIntoView({ behavior: "auto", block: "start" }));
}

/* ---------- Scroll spy: highlight the section in view ---------- */
const spySections = navAnchors
  .map((a) => a.getAttribute("href"))
  .filter((h) => h && h.startsWith("#"))
  .map((h) => document.getElementById(h.slice(1)))
  .filter(Boolean);

if ("IntersectionObserver" in window && spySections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  spySections.forEach((s) => spyObserver.observe(s));
}

/* ---------- Reveal on scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((item, i) => {
    item.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll(".stat-num");
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window && !reducedMotion) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => countObserver.observe(c));
} else {
  counters.forEach((c) => {
    c.textContent = c.dataset.count + (c.dataset.suffix || "");
  });
}

/* ---------- Typed roles ---------- */
const roles = [
  "responsive web interfaces.",
  "Python data pipelines.",
  "machine-learning models.",
  "REST APIs with Django.",
  "business dashboards.",
];
const typedEl = document.getElementById("typed");

if (reducedMotion) {
  typedEl.textContent = roles[0];
} else {
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    typedEl.textContent = current.slice(0, charIndex);

    let delay = deleting ? 40 : 80;
    if (!deleting && charIndex === current.length) {
      delay = 2000;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }
    setTimeout(type, delay);
  };
  type();
}

/* ---------- Toast ---------- */
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
};

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

if (lightbox && lightboxImg && lightboxClose) {
  document.querySelectorAll(".zoomable").forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("open");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ---------- Contact form (FormSubmit → email) ---------- */
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("cf-submit");

if (form && formStatus && submitBtn) {
  const submitIcon = submitBtn.innerHTML;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (location.protocol === "file:") {
      formStatus.textContent =
        "This page is opened as a local file, so the form cannot send. Run a web server in this folder (python -m http.server 8000) and open http://localhost:8000 — or deploy the site online.";
      formStatus.classList.add("err");
      showToast("Forms need a web server — not file://");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        body: new FormData(form),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an unexpected response (HTTP " + res.status + ").");
      }

      if (data.success === true || data.success === "true") {
        formStatus.textContent = "Message sent! I will get back to you soon.";
        formStatus.classList.add("ok");
        showToast("Message sent — thank you!");
        form.reset();
      } else {
        formStatus.textContent =
          (data.message || "Send failed.") +
          " — first submission may need activation: open the confirmation email FormSubmit sends to maroofmemon.it@gmail.com and click the activation link.";
        formStatus.classList.add("err");
        showToast("Message not sent yet — check the note below.");
      }
    } catch (err) {
      formStatus.textContent =
        "Could not send right now (" +
        (err && err.message ? err.message : "network error") +
        ") — please email maroofmemon.it@gmail.com directly.";
      formStatus.classList.add("err");
      showToast("Something went wrong — please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitIcon;
    }
  });
}
