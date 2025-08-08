/* Overlay interactions for single-page style expansions */
(function () {
  const backdrop = document.getElementById("overlay-root");
  if (!backdrop) return;

  const panel = backdrop.querySelector(".overlay-panel");
  const body = backdrop.querySelector(".overlay-body");
  const closeBtn = backdrop.querySelector(".overlay-close");
  let removeBackdropListeners = null;

  function openOverlay(contentHtml, sourceEl) {
    body.innerHTML = contentHtml;
    // force overlay links to have bordered button style (consistent with list view)
    try {
      body.querySelectorAll('.links a').forEach((el)=>{
        el.classList.add('glass-btn');
      });
    } catch (_) {}
    // prepare overlay visible but panel hidden for measurement
    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    panel.style.opacity = "0";

    // optional flyout animation from the clicked row
    if (sourceEl) {
      try {
        const srcRect = sourceEl.getBoundingClientRect();
        const flyout = document.createElement("div");
        flyout.className = "overlay-flyout";

        const radius = getComputedStyle(sourceEl).borderRadius || "10px";

        Object.assign(flyout.style, {
          position: "fixed",
          top: srcRect.top + "px",
          left: srcRect.left + "px",
          width: srcRect.width + "px",
          height: srcRect.height + "px",
          borderRadius: radius,
          // styles for .overlay-flyout are defined in CSS; here we only set geometry
          zIndex: 1060,
        });

        // force overlay backdrop to appear instantly (no fade) for smoother morph
        backdrop.classList.add("no-fade");
        // Place flyout above backdrop so its backdrop-filter blurs the page, not the backdrop color
        document.body.appendChild(flyout);

        // measure destination after content is set
        const destRect = panel.getBoundingClientRect();
        // For position: fixed, use viewport coordinates directly (no scroll offset)
        flyout.style.top = srcRect.top + "px";
        flyout.style.left = srcRect.left + "px";

        requestAnimationFrame(() => {
          flyout.style.transition = "top 280ms cubic-bezier(0.2, 0.8, 0.2, 1), left 280ms cubic-bezier(0.2, 0.8, 0.2, 1), width 280ms cubic-bezier(0.2, 0.8, 0.2, 1), height 280ms cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 280ms ease";
          flyout.style.top = destRect.top + "px";
          flyout.style.left = destRect.left + "px";
          flyout.style.width = destRect.width + "px";
          flyout.style.height = destRect.height + "px";
          flyout.style.borderRadius = getComputedStyle(panel).borderRadius || "16px";

          flyout.addEventListener(
            "transitionend",
            () => {
              panel.style.opacity = "1"; // reveal real content
              backdrop.classList.remove("no-fade");
              try { flyout.remove(); } catch (_) {}
            },
            { once: true }
          );
        });
      } catch (e) {
        // if any measurement fails, just show panel
        panel.style.opacity = "1";
      }
    } else {
      panel.style.opacity = "1";
    }

    // enable background scrolling via forwarding wheel/touch on backdrop
    setupBackdropScrollPassthrough();

    // focus for accessibility
    setTimeout(() => {
      const focusable = panel.querySelector("[tabindex], a, button, input, textarea, select");
      (focusable || body).focus();
    }, 0);
  }

  function closeOverlay() {
    body.innerHTML = "";
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    if (removeBackdropListeners) {
      removeBackdropListeners();
      removeBackdropListeners = null;
    }
  }

  function setupBackdropScrollPassthrough() {
    const onWheel = (e) => {
      // if wheel happens over panel or its children, let it scroll the overlay body
      if (panel.contains(e.target)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    let lastTouchY = null;
    const onTouchStart = (e) => {
      if (panel.contains(e.target)) return; // allow overlay body gestures
      lastTouchY = e.touches && e.touches.length ? e.touches[0].clientY : null;
    };
    const onTouchMove = (e) => {
      if (panel.contains(e.target)) return;
      if (lastTouchY == null) return;
      const currentY = e.touches && e.touches.length ? e.touches[0].clientY : lastTouchY;
      const deltaY = lastTouchY - currentY; // positive for swipe up
      window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
      lastTouchY = currentY;
      e.preventDefault();
    };

    // Use non-passive listeners so we can preventDefault
    backdrop.addEventListener("wheel", onWheel, { passive: false });
    backdrop.addEventListener("touchstart", onTouchStart, { passive: true });
    backdrop.addEventListener("touchmove", onTouchMove, { passive: false });

    removeBackdropListeners = () => {
      backdrop.removeEventListener("wheel", onWheel, { passive: false });
      backdrop.removeEventListener("touchstart", onTouchStart, { passive: true });
      backdrop.removeEventListener("touchmove", onTouchMove, { passive: false });
    };
  }

  function extractPublicationHtml(entryEl) {
    // Build a structured overlay for publications
    const titleElement = entryEl.querySelector(".title");
    const title = titleElement ? titleElement.innerHTML : "";

    const authorsElement = entryEl.querySelector(".author");
    const authors = authorsElement ? authorsElement.innerHTML : "";
    const periodical = Array.from(entryEl.querySelectorAll(".periodical"))
      .map((p) => p.innerHTML)
      .join("<br>");
    const abstractElement = entryEl.querySelector(".abstract");
    const abstract = abstractElement ? abstractElement.innerHTML : "";

    const awardElement = entryEl.querySelector(".award");
    const award = awardElement ? awardElement.innerHTML : "";

    const linksElement = entryEl.querySelector(".links");
    const links = linksElement ? linksElement.innerHTML : "";

    const rowElement = entryEl.closest(".row");
    const previewImageElement = rowElement ? rowElement.querySelector("img.preview") : null;
    const previewImg = previewImageElement ? previewImageElement.outerHTML : "";

    return `
      <div class="overlay-publication">
        <div class="row">
          <div class="col-sm-4">${previewImg || ""}</div>
          <div class="col-sm">
            <h2 id="overlay-title">${title}</h2>
            <div class="author">${authors}</div>
            <div class="periodical">${periodical}</div>
            ${award ? `<div class="award" style="margin-top:6px; color:red;">${award}</div>` : ""}
            <div class="links" style="margin-top:10px;">${links}</div>
          </div>
        </div>
        ${abstract ? `<hr><div class="abstract">${abstract}</div>` : ""}
      </div>
    `;
  }

  function extractProjectHtml(entryEl) {
    // Projects are also rendered via bib layout when using @project entries
    const titleElement = entryEl.querySelector(".title");
    const title = titleElement ? titleElement.innerHTML : "";
    const descEl = entryEl.querySelector(".description, p");
    const desc = descEl ? descEl.innerHTML : "";
    const linksElement = entryEl.querySelector(".links");
    const links = linksElement ? linksElement.innerHTML : "";
    const rowElement = entryEl.closest(".row");
    const previewImageElement = rowElement ? rowElement.querySelector("img.preview") : null;
    const previewImg = previewImageElement ? previewImageElement.outerHTML : "";

    return `
      <div class="overlay-project">
        <div class="row">
          <div class="col-sm-5">${previewImg || ""}</div>
          <div class="col-sm">
            <h2 id="overlay-title">${title}</h2>
            <div class="description">${desc}</div>
            <div class="links" style="margin-top:10px;">${links}</div>
          </div>
        </div>
      </div>
    `;
  }

  // open from buttons or click on entries
  document.addEventListener("click", function (e) {
    // clicking on card content should open overlay; ignore native links/buttons
    const publicationRow = e.target.closest(".publication-row");
    const publicationEntry = e.target.closest(".publication-entry");
    if ((publicationRow || publicationEntry) && !e.target.closest("a, button")) {
      const container = publicationEntry || publicationRow;
      const key = container.getAttribute("data-entry-key");
      const entryEl = document.querySelector(`.publication-entry[data-entry-key="${key}"]`) || container;
      const isProject = entryEl.closest(".project-grid") !== null;
      const html = isProject ? extractProjectHtml(entryEl) : extractPublicationHtml(entryEl);
      openOverlay(html, publicationRow || publicationEntry);
      return;
    }

    if (e.target === backdrop) {
      closeOverlay();
    }
    if (e.target === closeBtn || e.target.closest(".overlay-close")) {
      closeOverlay();
    }
  });

  // escape key to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.classList.contains("active")) {
      closeOverlay();
    }
    if ((e.key === "Enter" || e.key === " ") && document.activeElement && document.activeElement.classList.contains("publication-row")) {
      const row = document.activeElement;
      const key = row.getAttribute("data-entry-key");
      const entryEl = document.querySelector(`.publication-entry[data-entry-key="${key}"]`) || row;
      const isProject = entryEl.closest(".project-grid") !== null;
      const html = isProject ? extractProjectHtml(entryEl) : extractPublicationHtml(entryEl);
      openOverlay(html, row);
    }
  });
})();


