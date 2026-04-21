(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transitionEl = $("#pageTransition");
  const navToggle = $(".nav-toggle");
  const mobileNav = $("#mobileNav");
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");

  const modalContent = {
    curator: {
      title: "Curator’s Note",
      body: `
        <p><strong>Kart Kapitol</strong> is designed as a visitor-facing portfolio for Marshalltown’s esports culture.</p>
        <p>It blends tourism, community storytelling, and event presentation into a museum-style digital experience.</p>
      `
    },
    press: {
      title: "Media & Press Kit",
      body: `
        <p>Recommended story angles:</p>
        <ul>
          <li>Esports as a community attraction</li>
          <li>Student-led media and production</li>
          <li>Visitor-friendly events and showcases</li>
          <li>Local partnerships and growth</li>
        </ul>
      `
    },
    submit: {
      title: "Submit an Exhibit",
      body: `
        <p>Use this space later for a form, QR link, or submission email.</p>
        <p class="muted">For the client demo, this acts as a placeholder for future community submissions.</p>
      `
    },
    contact: {
      title: "Contact / Partnership Inquiry",
      body: `
        <p>Potential partners can use this area to connect about hosting, sponsorship, venue support, or collaborative programming.</p>
      `
    },
    itinerary: {
      title: "Sample Visit Itinerary",
      body: `
        <p><strong>Friday:</strong> Arrival, local dinner, community watch party.</p>
        <p><strong>Saturday:</strong> Featured event, exhibit browsing, media/photo moments.</p>
        <p><strong>Sunday:</strong> Brunch, final stops, archive recap.</p>
      `
    },
    map: {
      title: "Visitor Map",
      body: `
        <p>This will eventually point visitors to venues, event sites, watch-party locations, and community partner spaces.</p>
      `
    },
    exhibitRise: {
      title: "Exhibit A: The Rise",
      body: `<p>How esports became a visible and organized part of the Marshalltown story.</p>`
    },
    exhibitArena: {
      title: "Exhibit B: The Arena",
      body: `<p>The spaces, setups, and live environments where esports becomes a shared experience.</p>`
    },
    exhibitPeople: {
      title: "Exhibit C: The People",
      body: `<p>The organizers, creators, students, and supporters behind the scene.</p>`
    },
    exhibitImpact: {
      title: "Exhibit D: The Impact",
      body: `<p>Education, leadership, tourism, and community value beyond gameplay.</p>`
    },
    exhibitHighlights: {
      title: "Exhibit E: Highlights",
      body: `<p>A wall of featured moments, media, and milestones worth revisiting.</p>`
    },
    timeline1: { title: "Milestone 1", body: `<p>Origin moment.</p>` },
    timeline2: { title: "Milestone 2", body: `<p>First big event.</p>` },
    timeline3: { title: "Milestone 3", body: `<p>Broadcast era.</p>` },
    timeline4: { title: "Milestone 4", body: `<p>Community expansion.</p>` },
    timeline5: { title: "Milestone 5", body: `<p>Recognition moment.</p>` },
    timeline6: { title: "Milestone 6", body: `<p>The next chapter.</p>` },
    collectionArtifacts: { title: "Artifacts", body: `<p>Posters, graphics, overlays, flyers, and visual history.</p>` },
    collectionMedia: { title: "Media", body: `<p>Photos, recap clips, and highlight reels.</p>` },
    collectionStories: { title: "Stories", body: `<p>Short exhibit-style captions that explain why moments mattered.</p>` }
  };

  function setYear() {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function showTransition() {
    if (!transitionEl || prefersReducedMotion()) return;
    transitionEl.classList.add("show");
  }

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

  function openModal(key) {
    if (!modal || !modalTitle || !modalBody) return;
    const data = modalContent[key];
    modalTitle.textContent = data?.title || "Info";
    modalBody.innerHTML = data?.body || "<p>Coming soon.</p>";
    modal.showModal();
  }

  function runIntroAnimation() {
    const title = $(".brand-title");
    const streak = $(".kart-streak");
    title?.classList.add("intro");
    window.setTimeout(() => streak?.classList.add("run"), 220);
    window.setTimeout(() => streak?.classList.remove("run"), 1500);
  }

  function getStoredContentOverrides() {
    try {
      return JSON.parse(localStorage.getItem("kartKapitolContentOverrides") || "{}");
    } catch {
      return {};
    }
  }

  function getStoredDemoEvents() {
    try {
      return JSON.parse(localStorage.getItem("kartKapitolDemoEvents") || "[]");
    } catch {
      return [];
    }
  }

  function mergeDeep(base, override) {
    if (!override || typeof override !== "object") return base;
    if (!base || typeof base !== "object") return override;

    const output = Array.isArray(base) ? [...base] : { ...base };

    Object.keys(override).forEach((key) => {
      const baseVal = base[key];
      const overrideVal = override[key];

      if (
        baseVal &&
        overrideVal &&
        typeof baseVal === "object" &&
        typeof overrideVal === "object" &&
        !Array.isArray(baseVal) &&
        !Array.isArray(overrideVal)
      ) {
        output[key] = mergeDeep(baseVal, overrideVal);
      } else {
        output[key] = overrideVal;
      }
    });

    return output;
  }

  function renderEventsList(events) {
    const list = $("#eventsList");
    if (!list) return;

    list.innerHTML = "";
    events.forEach((event) => {
      const li = document.createElement("li");
      li.className = "event";
      li.innerHTML = `
        <div>
          <strong>${event.title || "Untitled Event"}</strong>
          <span>${event.location || event.location_name || "Marshalltown"}</span>
        </div>
        <div>
          <strong>${event.date || event.date_start || "TBD"}</strong>
        </div>
      `;
      list.appendChild(li);
    });
  }

  function applyContent(content) {
    // Home hero
    const homeEyebrow = $("#home-eyebrow");
    const homeTitle = $("#home-title");
    const homeLead = $("#home-lead");
    const homePrimaryCta = $("#home-primary-cta");
    const homeSecondaryCta = $("#home-secondary-cta");

    if (content.home) {
      if (homeEyebrow) homeEyebrow.textContent = content.home.eyebrow || "";
      if (homeTitle) homeTitle.textContent = content.home.title || "";
      if (homeLead) homeLead.textContent = content.home.lead || "";

      if (homePrimaryCta) {
        homePrimaryCta.textContent = content.home.primaryCtaText || "View events";
        homePrimaryCta.href = content.home.primaryCtaLink || "events.html";
      }

      if (homeSecondaryCta) {
        homeSecondaryCta.textContent = content.home.secondaryCtaText || "Explore exhibits";
        homeSecondaryCta.href = content.home.secondaryCtaLink || "exhibits.html";
      }
    }

    // Home section heading
    const homeSectionTitle = $("#home-section-title");
    const homeSectionSubtitle = $("#home-section-subtitle");
    if (homeSectionTitle && content.home?.sectionTitle) homeSectionTitle.textContent = content.home.sectionTitle;
    if (homeSectionSubtitle && content.home?.sectionSubtitle) homeSectionSubtitle.textContent = content.home.sectionSubtitle;

    // Home cards
    const homeCards = $("#home-cards");
    if (homeCards && Array.isArray(content.home?.cards)) {
      homeCards.innerHTML = content.home.cards.map((card) => `
        <article class="card media-card ${card.accent ? "accent" : ""}">
          <div class="media-card-image placeholder-photo">${card.label || ""}</div>
          <h3>${card.title || ""}</h3>
          <p>${card.text || ""}</p>
          <a class="btn ${card.accent ? "primary" : "secondary"}" href="${card.buttonLink || "#"}">
            ${card.buttonText || "Open"}
          </a>
        </article>
      `).join("");
    }

    // Featured section
    const featuredTitle = $("#home-featured-title");
    const featuredSubtitle = $("#home-featured-subtitle");
    if (featuredTitle && content.home?.featuredTitle) featuredTitle.textContent = content.home.featuredTitle;
    if (featuredSubtitle && content.home?.featuredSubtitle) featuredSubtitle.textContent = content.home.featuredSubtitle;

    // Spotlight wall
    const spotlightTitle = $("#home-spotlight-title");
    const spotlightText = $("#home-spotlight-text");
    const homeSpotlights = $("#home-spotlights");
    if (spotlightTitle && content.home?.spotlightTitle) spotlightTitle.textContent = content.home.spotlightTitle;
    if (spotlightText && content.home?.spotlightText) spotlightText.textContent = content.home.spotlightText;

    if (homeSpotlights && Array.isArray(content.home?.spotlights)) {
      homeSpotlights.innerHTML = content.home.spotlights.map((item) => `
        <div class="spotlight-tile">${item}</div>
      `).join("");
    }

    // Photo section
    const photoTitle = $("#home-photo-title");
    const photoSubtitle = $("#home-photo-subtitle");
    const homeGallery = $("#home-gallery");
    if (photoTitle && content.home?.photoTitle) photoTitle.textContent = content.home.photoTitle;
    if (photoSubtitle && content.home?.photoSubtitle) photoSubtitle.textContent = content.home.photoSubtitle;

    if (homeGallery && Array.isArray(content.home?.gallery)) {
      homeGallery.innerHTML = content.home.gallery.map((item, index) => `
        <div class="gallery-panel ${index === 0 ? "large" : ""}">${item}</div>
      `).join("");
    }

    // Footer
    const footerBrand = $(".footer-brand");
    const footerMuted = $(".site-footer .muted");
    const footerLinks = $(".footer-links");
    const footerAdminLink = $(".footer-admin a");

    if (content.site?.name && footerBrand) footerBrand.textContent = content.site.name;
    if (content.footer?.text && footerMuted) footerMuted.textContent = content.footer.text;

    if (footerLinks && Array.isArray(content.footer?.links)) {
      footerLinks.innerHTML = content.footer.links.map((link) => `
        <a href="${link.href}">${link.text}</a>
      `).join("");
    }

    if (footerAdminLink && content.footer) {
      footerAdminLink.textContent = content.footer.adminText || "Team Sign In";
      footerAdminLink.href = content.footer.adminLink || "login.html";
    }

    // Non-home page hero bindings
    const pageTitle = $("#page-title");
    const pageLead = $("#page-lead");
    const pageName = document.body.dataset.page;

    if (pageTitle && pageLead) {
      if (pageName === "exhibits" && content.exhibits) {
        pageTitle.textContent = content.exhibits.title || "Exhibits";
        pageLead.textContent = content.exhibits.lead || "";
      }
      if (pageName === "visit" && content.visit) {
        pageTitle.textContent = content.visit.title || "Visit";
        pageLead.textContent = content.visit.lead || "";
      }
      if (pageName === "partners" && content.partners) {
        pageTitle.textContent = content.partners.title || "Partners";
        pageLead.textContent = content.partners.lead || "";
      }
    }
  }

  async function loadContentFile() {
    let content = {};
    try {
      const res = await fetch("content.json", { cache: "no-store" });
      if (res.ok) {
        content = await res.json();
      }
    } catch (err) {
      console.error("Content file load failed:", err);
    }

    const overrides = getStoredContentOverrides();
    const mergedContent = mergeDeep(content, overrides);
    applyContent(mergedContent);

    const storedEvents = getStoredDemoEvents();
    if (storedEvents.length) {
      renderEventsList(storedEvents);
    } else {
      renderEventsList([
        { title: "Marshalltown Esports Showcase", date: "Spring 2026", location: "Featured Venue" },
        { title: "Broadcast Feature Night", date: "Upcoming", location: "Community Space" },
        { title: "Regional Tournament Weekend", date: "Recent", location: "Marshalltown" }
      ]);
    }
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

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-modal]");
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-open-modal"));
      return;
    }

    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    closeMobileNav();

    if (
      link.target === "_blank" ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      /^https?:\/\//i.test(href) ||
      /^mailto:/i.test(href) ||
      /^tel:/i.test(href)
    ) return;

    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });
      history.pushState(null, "", href);
      return;
    }

    e.preventDefault();
    showTransition();
    window.setTimeout(() => {
      window.location.href = href;
    }, prefersReducedMotion() ? 0 : 160);
  });

  window.addEventListener("pageshow", () => {
    transitionEl?.classList.remove("show");
  });

  setYear();
  loadContentFile();
  window.addEventListener("load", runIntroAnimation);
})();