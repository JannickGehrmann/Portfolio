const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const backToTop = document.querySelector(".back-to-top");
const cursorGlow = document.querySelector(".cursor-glow");
const revealElements = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".site-nav a");
const tiltCards = document.querySelectorAll(".tilt-card");

function updateHeader() {
  const scrolled = window.scrollY > 18;
  header?.classList.toggle("scrolled", scrolled);
  backToTop?.classList.toggle("visible", window.scrollY > 720);
}

function updateActiveNav() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const current = sections.findLast(section => window.scrollY >= section.offsetTop - 180);

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    const isAnchor = href && href.startsWith("#");
    link.classList.toggle("active", isAnchor && current && href === `#${current.id}`);
  });
}

window.addEventListener("scroll", () => {
  updateHeader();
  updateActiveNav();
});

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children];
      const delay = siblings.indexOf(entry.target) * 70;
      entry.target.style.transitionDelay = `${Math.min(delay, 260)}ms`;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.13,
  rootMargin: "0px 0px -5% 0px"
});

revealElements.forEach(element => revealObserver.observe(element));

window.addEventListener("mousemove", event => {
  if (!cursorGlow) return;
  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

document.addEventListener("mouseleave", () => {
  if (cursorGlow) cursorGlow.style.opacity = "0";
});

tiltCards.forEach(card => {
  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 2.4;
    const rotateX = ((y / rect.height) - 0.5) * -2.4;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-1px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});


updateHeader();
updateActiveNav();



/* ==========================================================================
   V8 interaction layer
   Small, framework-free interactions for the portfolio.
   ========================================================================== */

// Contact form removed in V9. The mail badge now uses a direct mailto link.

/* Career timeline.
   The dot and the colored portion of the track follow scroll progress
   through the section: 0% when the timeline's top reaches the viewport
   center, 100% when its bottom does.
*/
const careerTimeline = document.querySelector("[data-career-timeline]");
const careerFill = document.querySelector("[data-career-fill]");
const careerDot = document.querySelector("[data-career-dot]");

function updateCareerProgress() {
  if (!careerTimeline || !careerFill || !careerDot) return;

  const rect = careerTimeline.getBoundingClientRect();
  const viewportCenter = window.innerHeight * 0.5;
  const progress = Math.min(1, Math.max(0, (viewportCenter - rect.top) / rect.height));

  careerFill.style.height = `${progress * 100}%`;
  careerDot.style.top = `${progress * 100}%`;
}

if (careerTimeline) {
  let careerTicking = false;

  window.addEventListener("scroll", () => {
    if (careerTicking) return;
    careerTicking = true;
    window.requestAnimationFrame(() => {
      updateCareerProgress();
      careerTicking = false;
    });
  });

  window.addEventListener("resize", updateCareerProgress);
  updateCareerProgress();
}


/* Landing console animation.
   It starts with a connection state and then types profile information line by line.

   Two shortcuts keep this from being a mandatory wait on every visit:
   - Returning visitors (flagged in localStorage) skip straight to the final state.
   - Any click or key press during the animation fast-forwards it immediately,
     rather than only speeding up the *next* step.
*/
const INTRO_SEEN_KEY = "jg-portfolio-intro-seen";

const consoleStream = document.querySelector("[data-console-stream]");
const consoleStatus = document.querySelector("[data-console-status]");
const connectionText = document.querySelector("[data-connection-text]");
const connectionLine = document.querySelector(".connection-line");

let introSkipRequested = false;
let pendingSkipResolvers = [];

function requestIntroSkip() {
  if (introSkipRequested) return;
  introSkipRequested = true;
  pendingSkipResolvers.forEach((resolve) => resolve());
  pendingSkipResolvers = [];
}

function sleep(ms) {
  if (introSkipRequested) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    pendingSkipResolvers.push(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

async function typeConsoleLine(text, speed = 22) {
  if (!consoleStream) return;

  const line = document.createElement("p");
  line.className = "console-cursor";
  consoleStream.appendChild(line);

  if (introSkipRequested) {
    line.textContent = text;
  } else {
    for (const char of text) {
      line.textContent += char;
      await sleep(speed);
    }
  }

  line.classList.remove("console-cursor");
}

async function runLandingConsole() {
  if (!consoleStream || !consoleStatus || !connectionText || !connectionLine) return;

  if (window.localStorage?.getItem(INTRO_SEEN_KEY) === "1") {
    requestIntroSkip();
  }

  const dots = ["", ".", "..", "..."];
  let tick = 0;

  const connectingInterval = window.setInterval(() => {
    connectionText.textContent = `connecting to portfolio profile${dots[tick % dots.length]}`;
    tick += 1;
  }, 360);

  await sleep(1500);

  window.clearInterval(connectingInterval);
  connectionLine.classList.add("is-success");
  consoleStatus.textContent = "connected";
  connectionText.textContent = "connection established";

  await sleep(520);

  const lines = [
    "name: Jannick Gehrmann",
    "role: Software Developer",
    "focus: Frontend · Automation · Agentic Workflows",
    "projects: Portfolios · Storefront Pages · Modding",
    "active on: GitHub · NexusMods · Chess.com",
    "security: clean data flow · scoped execution",
    "status: ready for entry"
  ];

  for (const line of lines) {
    await typeConsoleLine(line, 18);
    await sleep(160);
  }

  const enterButton = document.querySelector("[data-enter-button]");
  enterButton?.removeAttribute("disabled");
  enterButton?.classList.add("is-ready");

  window.localStorage?.setItem(INTRO_SEEN_KEY, "1");
}

runLandingConsole();

if (consoleStream) {
  document.addEventListener("click", requestIntroSkip);
  document.addEventListener("keydown", requestIntroSkip);
  document.addEventListener("touchstart", requestIntroSkip, { passive: true });
}





/* Landing entry transition.
   The Matrix effect was removed. The Enter button now uses a calm interface
   exit animation before opening the main portfolio page: the left column
   slides out to the left, the right column slides out to the right, then
   navigation happens once both have cleared the viewport.
*/
const consoleEnterButton = document.querySelector("[data-enter-button]");

function enterPortfolioCleanly() {
  if (!document.body.classList.contains("entry-body")) return;
  if (document.body.classList.contains("is-clean-entering")) return;

  document.body.classList.add("is-clean-entering");

  window.setTimeout(() => {
    window.location.href = "../index.html";
  }, 440);
}

consoleEnterButton?.addEventListener("click", enterPortfolioCleanly);




/* Email obfuscation.
   The address is split across two data attributes in the markup and only
   assembled here at runtime, so plain-text scrapers reading the HTML source
   never see a full address.
*/
document.querySelectorAll("[data-mail-user]").forEach((el) => {
  const address = `${el.dataset.mailUser}@${el.dataset.mailDomain}`;

  if (el.tagName === "A") {
    el.href = `mailto:${address}`;
  }

  if (el.dataset.mailReveal === "true") {
    el.textContent = address;
  }
});
