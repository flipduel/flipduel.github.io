(function () {
  const cfg = window.GEOMETRYVIBES3D_CONFIG || {};
  const ga4Id = String(cfg.ga4Id || "").trim();
  const gscVerification = String(cfg.gscVerification || "").trim();

  if (gscVerification) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "google-site-verification");
    meta.setAttribute("content", gscVerification);
    document.head.appendChild(meta);
  }

  if (!ga4Id) return;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || typeof window.gtag !== "function") return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (url.origin === window.location.origin) return;

    window.gtag("event", "outbound_click", {
      event_category: "outbound",
      event_label: link.dataset.trackLabel || url.hostname,
      link_url: url.href,
      link_domain: url.hostname,
      outbound: true,
      transport_type: "beacon",
    });
  });
})();
