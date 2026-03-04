/* Kart Kapitol — app.js (Multi-page Museum Edition)
   - Safe across pages (guards for missing elements)
   - Mobile nav
   - Modal content for exhibits/timeline/collections
   - Events list demo (optional)
   - Page transitions (internal pages + same-page anchors)
*/

(() => {
  // -------------------------
  // Helpers
  // -------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transitionEl = $("#pageTransition");

  function showTransition() {
    if (!transitionEl || prefersReducedMotion()) return;
    transitionEl.classList.add("show");
  }

  function hideTransition(delay = 520) {
    if (!transitionEl || prefersReducedMotion()) return;
    window.setTimeout(() => transitionEl.classList.remove("show"), delay);
  }

  function runTransitionThen(fn) {
    if (prefersReducedMotion() || !transitionEl) {
      fn();
      return;
    }
    showTransition();
    window.setTimeout(() => {
      fn();
      hideTransition(360);
    }, 160);
  }

  function setYear() {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // -------------------------
  // Boot animation
  // -------------------------
  function runIntroAnimation() {
    const title = $(".brand-title");
    const streak = $(".kart-streak");

    title?.classList.add("intro");

    window.setTimeout(() => {
      streak?.classList.add("run");
    }, 220);

    window.setTimeout(() => {
      streak?.classList.remove("run");
    }, 1500);
  }

  // -------------------------
  // Mobile nav
  // -------------------------
  const navToggle = $(".nav-toggle");
  const mobileNav = $("#mobileNav");

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    mobileNav.hidden = true;
    navToggle?.setAttribute("aria-expanded", "false");
  }

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.hidden = false;
    requestAnimationFrame(() => mobileNav.classList.add("open"));
    navToggle?.setAttribute("aria-expanded", "true");
  }

  navToggle?.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMobileNav() : openMobileNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMobileNav();
  });

  // -------------------------
  // Modal system
  // -------------------------
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");

  const modalContent = {
    // Core
    curator: {
      title: "Curator’s Note",
      body: `
        <p><strong>Kart Kapitol</strong> is a curated esports museum exhibit built as a living portfolio for Marshalltown.</p>
        <p>Instead of recruiting, it documents the ecosystem: signature moments, community culture, production, and impact.</p>
        <p class="muted">As new events happen, this archive grows—like a real exhibit collection.</p>
      `,
    },
    press: {
      title: "Media & Press Kit",
      body: `
        <p><strong>Story angles:</strong></p>
        <ul>
          <li>Esports as community + youth engagement</li>
          <li>Student-led production and media skills</li>
          <li>Tourism moments: events, showcases, visitors</li>
          <li>Partnerships: schools, venues, businesses</li>
        </ul>
        <p><strong>Assets (add links):</strong> logos, photos, highlight clips, sponsor deck, contact.</p>
      `,
    },
    submit: {
      title: "Submit an Exhibit",
      body: `
        <p>Have an event, story, highlight clip, or artifact that belongs in the archive?</p>
        <p><strong>Add your submission method here</strong> (Google Form, email, or QR link).</p>
        <p class="muted">Tip: submissions can be curated into the Timeline Wall and Highlights exhibit.</p>
      `,
    },
    contact: {
      title: "Contact / Partnership Inquiry",
      body: `
        <p><strong>Partners help grow the scene</strong> through venues, sponsorships, and community support.</p>
        <p>Add a contact form or email here. Suggested fields:</p>
        <ul>
          <li>Name + Organization</li>
          <li>Goal (sponsor / host / donate / collaborate)</li>
          <li>Budget or support type</li>
        </ul>
      `,
    },

    // Visit
    itinerary: {
      title: "Esports Weekend Itinerary (Sample)",
      body: `
        <p><strong>Friday:</strong> Arrival + dinner + community watch party / casual showcase.</p>
        <p><strong>Saturday:</strong> Local highlights + featured event block + evening recap.</p>
        <p><strong>Sunday:</strong> Brunch + “best of Marshalltown” stops + departure.</p>
        <p class="muted">Swap these with real venues once confirmed.</p>
      `,
    },
    map: {
      title: "Exhibit Map (How to Explore)",
      body: `
        <ol>
          <li><strong>Lobby:</strong> Home — what’s new + featured highlights</li>
          <li><strong>Exhibits:</strong> Rise / Arena / People / Impact / Highlights</li>
          <li><strong>Events:</strong> calendar + archive</li>
          <li><strong>Visit:</strong> itinerary + “what to expect”</li>
          <li><strong>Partners:</strong> community impact + collaboration</li>
        </ol>
      `,
    },

    // Exhibits
    exhibitRise: {
      title: "Exhibit A: The Rise",
      body: `
        <p><strong>Theme:</strong> How competitive gaming became a shared community experience.</p>
        <ul>
          <li>Early momentum: first organized events and consistent attendance</li>
          <li>Turning points: first “big” showcase moment that drew new interest</li>
          <li>What changed: community identity, participation, and media presence</li>
        </ul>
        <p class="muted">Replace these bullets with real dates + named events when you lock the timeline.</p>
      `,
    },
    exhibitArena: {
      title: "Exhibit B: The Arena",
      body: `
        <p><strong>Theme:</strong> Where esports happens—venues, watch parties, broadcasts, and showcases.</p>
        <ul>
          <li>Venues (campus, community spaces, pop-ups)</li>
          <li>Broadcasting and production workflows</li>
          <li>Visitor-friendly experiences: “watch, learn, vibe”</li>
        </ul>
      `,
    },
    exhibitPeople: {
      title: "Exhibit C: The People",
      body: `
        <p><strong>Theme:</strong> The scene is people—organizers, creators, volunteers, and community energy.</p>
        <ul>
          <li>Organizers: event ops, brackets, logistics</li>
          <li>Creators: casters, editors, designers, stream crew</li>
          <li>Community: families, fans, first-timers, local supporters</li>
        </ul>
      `,
    },
    exhibitImpact: {
      title: "Exhibit D: The Impact",
      body: `
        <p><strong>Theme:</strong> Esports contributes beyond gameplay.</p>
        <ul>
          <li>Education & skills: teamwork, leadership, tech literacy</li>
          <li>Career pathways: media, events, marketing, coaching</li>
          <li>Tourism: repeat visitors and community engagement</li>
        </ul>
      `,
    },
    exhibitHighlights: {
      title: "Exhibit E: Highlights",
      body: `
        <p><strong>Theme:</strong> Rotating wall of moments worth framing.</p>
        <ul>
          <li>Photo wall (add images)</li>
          <li>Highlight reel (add YouTube/Vimeo links)</li>
          <li>Signature wins / crowd favorites</li>
        </ul>
        <p class="muted">This can later become a full gallery page or embedded playlist.</p>
      `,
    },

    // Timeline plaques
    timeline1: {
      title: "Timeline Plaque — Milestone 1",
      body: `
        <p><strong>Origin moment:</strong> The first spark that started local momentum.</p>
        <p class="muted">Add: date, name, where it happened, and why it mattered.</p>
      `,
    },
    timeline2: {
      title: "Timeline Plaque — Milestone 2",
      body: `
        <p><strong>First big event:</strong> A turning point that brought people in.</p>
        <p class="muted">Add: attendance, partners, games, and a signature moment.</p>
      `,
    },
    timeline3: {
      title: "Timeline Plaque — Milestone 3",
      body: `
        <p><strong>Broadcast era:</strong> Production, streaming, and shareable moments.</p>
        <p class="muted">Add: first live show, first recap video, or first major stream.</p>
      `,
    },
    timeline4: {
      title: "Timeline Plaque — Milestone 4",
      body: `
        <p><strong>Community expansion:</strong> New partnerships, venues, or formats.</p>
        <p class="muted">Add: school/community involvement, sponsorships, or growth.</p>
      `,
    },
    timeline5: {
      title: "Timeline Plaque — Milestone 5",
      body: `
        <p><strong>Recognition:</strong> A highlight worth framing on the wall.</p>
        <p class="muted">Add: press mention, award, or “big win” moment.</p>
      `,
    },
    timeline6: {
      title: "Timeline Plaque — Milestone 6",
      body: `
        <p><strong>The next chapter:</strong> What Marshalltown is building toward.</p>
        <ul>
          <li>Expanded events calendar</li>
          <li>Visitor-ready showcase weekends</li>
          <li>Partnership-driven growth</li>
        </ul>
      `,
    },

    // Collections
    collectionArtifacts: {
      title: "Collection: Artifacts",
      body: `
        <p>Artifacts are the physical/visual history of the scene.</p>
        <ul>
          <li>Posters, flyers, signage</li>
          <li>Bracket screenshots and match graphics</li>
          <li>Overlays, logos, and event branding</li>
        </ul>
        <p class="muted">Add links to image folders or a gallery page when ready.</p>
      `,
    },
    collectionMedia: {
      title: "Collection: Media",
      body: `
        <p>Media is what visitors share.</p>
        <ul>
          <li>Highlight reels</li>
          <li>Photos and recap albums</li>
          <li>Broadcast clips / VOD links</li>
        </ul>
      `,
    },
    collectionStories: {
      title: "Collection: Stories",
      body: `
        <p>Stories are “exhibit labels” — short, punchy narratives that explain why moments mattered.</p>
        <ul>
          <li>What happened?</li>
          <li>Why did it matter?</li>
          <li>Who did it impact?</li>
        </ul>
      `,
    },
  };

  function openModal(key) {
    if (!modal || !modalTitle || !modalBody) return;

    const data = modalContent[key];
    modalTitle.textContent = data?.title || "Info";
    modalBody.innerHTML = data?.body || "<p>Coming soon.</p>";
    modal.showModal();
  }

  // Click handler for modal buttons/links
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-modal]");
    if (!opener) return;

    const key = opener.getAttribute("data-open-modal");
    if (!key) return;

    e.preventDefault();
    openModal(key);
  });

  // -------------------------
  // Demo events (optional)
  // - Renders only if #eventsList exists on current page
  // - Adds demo button handler only if #addDemoEvent exists
  // -------------------------
  const eventsList = $("#eventsList");
  const addDemoEventBtn = $("#addDemoEvent");

  const demoEvents = [
    { title: "Community LAN Night", date: "TBD", location: "Add venue" },
    { title: "Marshalltown Esports Showcase", date: "TBD", location: "Add venue" },
    { title: "Intro to Casting Workshop", date: "TBD", location: "Add venue" },
  ];

  function renderEvents(items) {
    if (!eventsList) return;
    eventsList.innerHTML = "";

    items.forEach((ev) => {
      const li = document.createElement("li");
      li.className = "event";
      li.innerHTML = `
        <div>
          <strong>${ev.title}</strong>
          <span>${ev.location}</span>
        </div>
        <div>
          <strong>${ev.date}</strong>
        </div>
      `;
      eventsList.appendChild(li);
    });
  }

  if (eventsList) renderEvents(demoEvents);

  addDemoEventBtn?.addEventListener("click", () => {
    demoEvents.unshift({
      title: "New Event (demo)",
      date: new Date().toLocaleDateString(),
      location: "Marshalltown",
    });
    renderEvents(demoEvents);
  });

  // -------------------------
  // Link navigation transitions
  // 1) Same-page anchors (#something): overlay + smooth scroll
  // 2) Page navigation (exhibits.html, events.html, etc): overlay then navigate
  // -------------------------
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // Close mobile nav when any link is clicked
    closeMobileNav();

    // Ignore new-tab / modified clicks
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Ignore external links
    const isExternal = /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);
    if (isExternal) return;

    // Same-page anchor scroll
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      runTransitionThen(() => {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      });

      // Update hash without default jump
      history.pushState(null, "", href);
      return;
    }

    // Internal page navigation: show transition then go
    // (Only intercept simple internal links like "events.html" or "folder/page.html")
    const isLikelyInternalPage =
      !href.startsWith("javascript:") &&
      !href.startsWith("./#") &&
      !href.startsWith("../#");

    if (isLikelyInternalPage) {
      e.preventDefault();
      showTransition();
      window.setTimeout(() => {
        window.location.href = href;
      }, prefersReducedMotion() ? 0 : 160);
    }
  });

  // Hide transition on page load (in case it was left visible)
  window.addEventListener("pageshow", () => {
    transitionEl?.classList.remove("show");
  });

  // If page loads with a hash, smooth scroll (no overlay)
  window.addEventListener("load", () => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      window.setTimeout(() => {
        document.querySelector(hash).scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }, 40);
    }
  });

  // -------------------------
  // Init
  // -------------------------
  setYear();
  window.addEventListener("load", runIntroAnimation);
})();