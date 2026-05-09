class LuniSolarEmbed extends HTMLElement {
  static get observedAttributes() {
    return ["app-base", "location", "lat", "lon", "date", "height", "title"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleMessage = this.handleMessage.bind(this);
  }

  connectedCallback() {
    window.addEventListener("message", this.handleMessage);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.handleMessage);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  get iframeHeight() {
    const requested = Number.parseInt(this.getAttribute("height") || "", 10);
    return Number.isFinite(requested) && requested > 0 ? requested : 1280;
  }

  buildSrc() {
    const base = this.getAttribute("app-base") || "./index.html";
    const url = new URL(base, window.location.href);
    const params = url.searchParams;

    params.set("embed", "1");

    const location = this.getAttribute("location");
    const lat = this.getAttribute("lat");
    const lon = this.getAttribute("lon");
    const date = this.getAttribute("date");

    if (location) params.set("loc", location);
    if (lat) params.set("lat", lat);
    if (lon) params.set("lon", lon);
    if (date) params.set("at", date);

    return url.toString();
  }

  handleMessage(event) {
    if (!this.iframe || event.source !== this.iframe.contentWindow) return;
    const data = event.data || {};
    if (data.type !== "luni-solar:resize") return;

    const nextHeight = Math.max(this.iframeHeight, Number(data.height) || 0);
    this.iframe.style.height = `${nextHeight}px`;
  }

  render() {
    const src = this.buildSrc();
    const title = this.getAttribute("title") || "Luni Solar Calendar";
    const height = this.iframeHeight;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .frame {
          width: 100%;
          border: 0;
          border-radius: 0;
          display: block;
          background: #020307;
          min-height: ${height}px;
        }
      </style>
      <iframe
        class="frame"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="geolocation"
        title="${title}"
        src="${src}">
      </iframe>
    `;

    this.iframe = this.shadowRoot.querySelector("iframe");
    this.iframe.style.height = `${height}px`;
  }
}

customElements.define("luni-solar-embed", LuniSolarEmbed);
