import { createApp } from "https://cdn.jsdelivr.net/npm/vue@3.3.4/+esm";

const ConfigElement = class extends HTMLElement {
  constructor() {
    super();
    this.hasInit = false;
  }
  connectedCallback() {
    // this method may be called more than once
    if (this.hasInit) return;
    const shadow = this.attachShadow({mode: "closed"})
    const app = createApp()
  }
};
