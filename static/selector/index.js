// TODO: compile this

const VUE_CDN_URL = "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js"

const ConfigElement = class extends HTMLElement {
  constructor() {
    super();
    this.hasInit = false;
  }
  async connectedCallback() {
    // this method may be called more than once
    if (this.hasInit) return;
    this.hasInit = true;

    // lazy the loading
    const { createApp } = await import(VUE_CDN_URL);

    const shadow = this.attachShadow({ mode: "closed" });
    const c = document.createElement("div");
    const app = createApp({
      data() {
        return {
          count: 0,
        };
      },
      template: `
        <button @click="count++">{{ count }}</button>
      `,
    });
    app.mount(c);
    shadow.append(c);
  }
};

export function mountConfig() {
  const ele = document.createElement("proxy-config");
  document.body.append(ele);
}

customElements.define("proxy-config", ConfigElement);
