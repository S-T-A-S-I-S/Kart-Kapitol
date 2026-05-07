/* Kart Kapitol — app.js
   Single source of truth: content.json drives all text.
   This file handles injection, animations, navigation, modals, and page transitions.
*/
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Resolve a dot-notation path from an object ("home.lead" → content.home.lead)
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
  }

  const transitionEl = $("#pageTransition");
  const navToggle   = $(".nav-toggle");
  const mobileNav   = $("#mobileNav");
  const modal       = $("#modal");
  const modalTitle  = $("#modalTitle");
  const modalBody   = $("#modalBody");

  // Content is loaded once and stored here; openModal() uses it for all modal text
  let _content = {};

  // ─────────────────────────────
  //  MODAL
  // ─────────────────────────────
  function openModal(key) {
    if (!modal || !modalTitle || !modalBody) return;
    const data = _content?.modals?.[key] || {};
    modalTitle.textContent = data.title || "Info";
    modalBody.innerHTML    = data.body  || "<p>Coming soon.</p>";
    modal.showModal();
  }

  // ─────────────────────────────
  //  NAVIGATION
  // ─────────────────────────────
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

  // ─────────────────────────────
  //  PAGE TRANSITION
  // ─────────────────────────────
  function showTransition() {
    if (!transitionEl || prefersReducedMotion()) return;
    transitionEl.classList.add("show");
  }

  // ─────────────────────────────
  //  INTRO ANIMATION
  // ─────────────────────────────
  function runIntroAnimation() {
    if (prefersReducedMotion()) return;
    $(".brand-wordmark")?.classList.add("intro");
    setTimeout(() => $(".kart-streak")?.classList.add("run"),    320);
    setTimeout(() => $(".kart-streak")?.classList.remove("run"), 1700);
  }

  // ─────────────────────────────
  //  SCROLL REVEAL
  // ─────────────────────────────
  function initScrollReveal() {
    if (prefersReducedMotion()) {
      $$(".reveal").forEach(el => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: "0px 0px -36px 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  }

  // ─────────────────────────────
  //  YEAR
  // ─────────────────────────────
  function setYear() {
    const el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }

  // ─────────────────────────────
  //  HOMEPAGE EVENT LIST
  // ─────────────────────────────
  function renderEventsHome(events) {
    const stack = $("#eventsList");
    if (!stack) return;
    stack.innerHTML = "";

    const badgeMap = {
      upcoming: `<span class="event-badge upcoming">Upcoming</span>`,
      past:     `<span class="event-badge past">Past</span>`,
      weekly:   `<span class="event-badge weekly">Weekly</span>`,
      featured: `<span class="event-badge featured">Featured</span>`,
    };

    events.slice(0, 5).forEach((ev, idx) => {
      const badge = badgeMap[ev.status] || badgeMap.upcoming;
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <span class="event-num" aria-hidden="true">${String(idx + 1).padStart(2, "0")}</span>
        <div class="event-info">
          <div class="event-name">${ev.title || "Untitled Event"}</div>
          <div class="event-meta">${ev.date || ev.date_start || "TBD"} · ${ev.location || ev.location_name || "Marshalltown"}</div>
        </div>
        ${badge}
      `;
      stack.appendChild(row);
    });
  }

  // ─────────────────────────────
  //  TICKER RENDERER
  // ─────────────────────────────
  function renderTicker(items) {
    const track = $(".ticker-track");
    if (!track || !items?.length) return;
    // Double the items for seamless loop
    const doubled = [...items, ...items];
    track.innerHTML = doubled.map(item =>
      `<span class="ticker-item">${item} <span class="ticker-sep" aria-hidden="true">·</span></span>`
    ).join("");
  }

  // ─────────────────────────────
  //  ORG GRID RENDERER (home page)
  // ─────────────────────────────
  function renderOrgs(orgs) {
    const grid = $("#home-orgs-grid");
    if (!grid || !orgs?.length) return;

    const btnStyles = {
      sky:  `class="btn sm outline-sky"`,
      gold: `class="btn sm" style="background:linear-gradient(135deg,var(--gold),var(--harvest));color:#111;border:none;"`,
      pink: `class="btn sm pink"`,
    };

    grid.innerHTML = orgs.map((org, i) => {
      const delay = `reveal-delay-${i + 1}`;
      const btn   = btnStyles[org.accent] || `class="btn sm ghost"`;
      return `
        <article class="org-card reveal ${delay}" data-accent="${org.accent || "sky"}">
          <div class="org-card-top">
            <div class="org-icon" aria-hidden="true">${org.abbr}</div>
            <div class="org-name">${org.name}</div>
            <div class="org-full">${org.full}</div>
            <p class="org-desc">${org.desc}</p>
          </div>
          <div class="org-card-bottom">
            <span class="org-tag"><span class="tag-dot" aria-hidden="true"></span>${org.tag}</span>
            <a ${btn} href="${org.link || "exhibits.html"}">Learn More</a>
          </div>
        </article>`;
    }).join("");

    // Re-observe newly added reveal elements
    initScrollReveal();
  }

  // ─────────────────────────────
  //  GIVEBACK STATS RENDERER (home page)
  // ─────────────────────────────
  function renderGivebackStats(stats) {
    const grid = $("#home-giveback-grid");
    if (!grid || !stats?.length) return;

    grid.innerHTML = stats.map(stat => `
      <div class="giveback-stat reveal" data-accent="${stat.accent}">
        <div class="giveback-big">${stat.num}</div>
        <div class="giveback-label">${stat.label}</div>
        <div class="giveback-sub">${stat.desc}</div>
      </div>`
    ).join("");

    initScrollReveal();
  }

  // ─────────────────────────────
  //  COMMUNITY PARTNER CHIPS RENDERER
  // ─────────────────────────────
  function renderPartnerChips(partners) {
    const row = $("#home-partner-row");
    if (!row || !partners?.length) return;

    row.innerHTML = partners.map(p => `
      <div class="partner-chip">
        <span class="chip-icon" aria-hidden="true" style="${p.style || ""}">${p.abbr}</span>
        ${p.name}
      </div>`
    ).join("");
  }

  // ─────────────────────────────
  //  GALLERY STRIP RENDERER (home page)
  // ─────────────────────────────
  function renderGalleryStrip(photos) {
    const strip = $("#home-gallery-strip");
    if (!strip || !photos?.length) return;

    strip.innerHTML = photos.map((photo, i) => `
      <div class="gallery-panel${i === 0 ? " wide" : ""}" role="listitem">
        <img src="${photo.src}" alt="${photo.alt || ""}" loading="lazy" />
        <div class="gallery-label">${photo.label}</div>
      </div>`
    ).join("");
  }

  // ─────────────────────────────
  //  FEATURED EVENT CARD INJECTOR
  // ─────────────────────────────
  function injectFeaturedEvent(home) {
    const label = $("#featured-event-label");
    const title = $("#featured-event-title");
    const desc  = $("#featured-event-desc");
    const wLabel = $("#weekly-event-label");
    const wTitle = $("#weekly-event-title");
    const wMeta  = $("#weekly-event-meta");
    if (label) label.textContent = home.featuredEventLabel || "";
    if (title) title.textContent = home.featuredEventTitle || "";
    if (desc)  desc.textContent  = home.featuredEventDesc  || "";
    if (wLabel) wLabel.textContent = home.weeklyEventLabel || "";
    if (wTitle) wTitle.textContent = home.weeklyEventTitle || "";
    if (wMeta)  wMeta.textContent  = home.weeklyEventMeta  || "";
  }

  // ─────────────────────────────
  //  MECHDYNE TEXT INJECTOR
  // ─────────────────────────────
  function injectMechdyne(home) {
    const desc = $("#home-mechdyne-desc");
    if (desc && home.mechdyneDesc) desc.textContent = home.mechdyneDesc;
  }

  // ─────────────────────────────
  //  HERO STATS INJECTOR
  // ─────────────────────────────
  function injectStats(stats) {
    const badges = $$(".stat-badge");
    if (!badges.length || !stats?.length) return;
    stats.forEach((stat, i) => {
      if (!badges[i]) return;
      const numEl   = badges[i].querySelector(".stat-num");
      const labelEl = badges[i].querySelector(".stat-label");
      if (numEl)   numEl.textContent   = stat.num;
      if (labelEl) labelEl.textContent = stat.label;
    });
  }

  // ─────────────────────────────
  //  SIMPLE DATA-CONTENT INJECTION
  //  Add data-content="path.to.key" to any element and it gets filled.
  // ─────────────────────────────
  function injectDataContent(content) {
    $$("[data-content]").forEach(el => {
      const val = getPath(content, el.getAttribute("data-content"));
      if (val !== undefined && typeof val === "string") el.textContent = val;
    });
  }

  // ─────────────────────────────
  //  FOOTER INJECTION
  // ─────────────────────────────
  function injectFooter(content) {
    const taglines = $$(".footer-tagline");
    taglines.forEach(el => {
      if (content.site?.tagline) el.textContent = content.site.tagline;
    });
    $$("#year").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  // ─────────────────────────────
  //  APPLY ALL CONTENT
  // ─────────────────────────────
  function applyContent(content) {
    _content = content;

    // Hero text — target the inner spans so we don't destroy structure
    const line1 = $("#home-hero-line1");
    const line2 = $("#home-hero-line2");
    if (line1 && content.home?.heroLine1) line1.textContent = content.home.heroLine1;
    if (line2 && content.home?.heroLine2) line2.textContent = content.home.heroLine2;

    // Eyebrow label — target only the text span (not the dot span)
    const eyebrowLabel = $("#home-eyebrow-label");
    if (eyebrowLabel && content.home?.eyebrow) eyebrowLabel.textContent = content.home.eyebrow;

    // Hero lead + CTAs
    const lead      = $("#home-lead");
    const primaryCta   = $("#home-primary-cta");
    const secondaryCta = $("#home-secondary-cta");
    if (lead && content.home?.lead)               lead.textContent = content.home.lead;
    if (primaryCta && content.home?.primaryCtaText) {
      primaryCta.textContent = content.home.primaryCtaText;
      primaryCta.href = content.home.primaryCtaLink || "events.html";
    }
    if (secondaryCta && content.home?.secondaryCtaText) {
      secondaryCta.textContent = content.home.secondaryCtaText;
      secondaryCta.href = content.home.secondaryCtaLink || "exhibits.html";
    }

    // Visit CTA section
    const visitTitle = $("#home-visit-cta-title");
    const visitLead  = $("#home-visit-cta-lead");
    if (visitTitle && content.home?.visitCtaTitle) visitTitle.textContent = content.home.visitCtaTitle;
    if (visitLead  && content.home?.visitCtaLead)  visitLead.textContent  = content.home.visitCtaLead;

    // Hero stats
    if (content.home?.stats) injectStats(content.home.stats);

    // Ticker
    if (content.ticker?.items) renderTicker(content.ticker.items);

    // Dynamic sections (home page only)
    if (content.home?.orgs)              renderOrgs(content.home.orgs);
    if (content.home?.givebackStats)     renderGivebackStats(content.home.givebackStats);
    if (content.home?.communityPartners) renderPartnerChips(content.home.communityPartners);
    if (content.home?.galleryPhotos)     renderGalleryStrip(content.home.galleryPhotos);

    // Featured event card text
    if (content.home) injectFeaturedEvent(content.home);

    // Mechdyne description
    if (content.home) injectMechdyne(content.home);

    // Inject any [data-content="..."] attributes across the page
    injectDataContent(content);

    // Footer tagline
    injectFooter(content);

    // Site name in footer brand
    $$(".footer-wordmark, .footer-brand").forEach(el => {
      if (content.site?.name) el.textContent = content.site.name;
    });
  }

  // ─────────────────────────────
  //  LOAD AND APPLY CONTENT
  // ─────────────────────────────
  async function loadAndApply() {
    let content = {};
    try {
      const res = await fetch("content.json", { cache: "no-store" });
      if (res.ok) content = await res.json();
    } catch (err) {
      console.error("content.json load failed:", err);
    }

    applyContent(content);

    // Events list on home page — pulled from content.json
    const defaults = [
      { title: "Marshalltown Esports Showcase",   date: "Spring 2026",  location: "Featured Venue",   status: "upcoming" },
      { title: "Super Smash Bros Weekly",         date: "Every Week",   location: "Marshalltown",     status: "weekly"   },
      { title: "IAHSEA State Showdown",           date: "Nov 2025",     location: "Marshalltown",     status: "featured" },
      { title: "Meet in Marshalltown",            date: "Summer 2026",  location: "Marshalltown",     status: "upcoming" },
      { title: "Esports Give Back Night",         date: "Recent",       location: "Community Space",  status: "past"     },
    ];
    renderEventsHome(content.home?.events || defaults);
  }

  // ─────────────────────────────
  //  EVENT LISTENERS
  // ─────────────────────────────
  navToggle?.addEventListener("click", () => {
    navToggle.getAttribute("aria-expanded") === "true"
      ? closeMobileNav()
      : openMobileNav();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMobileNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMobileNav();
  });

  document.addEventListener("click", e => {
    // Modal opener
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
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", href);
      return;
    }

    e.preventDefault();
    showTransition();
    setTimeout(() => { window.location.href = href; }, prefersReducedMotion() ? 0 : 180);
  });

  window.addEventListener("pageshow", () => {
    transitionEl?.classList.remove("show");
  });

  // ─────────────────────────────
  //  INIT
  // ─────────────────────────────
  setYear();
  loadAndApply();
  initScrollReveal();
  window.addEventListener("load", runIntroAnimation);
})();
