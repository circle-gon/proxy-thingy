// TODO: compile this

const VUE_CDN_URL =
  "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js";

const components = ({ state }) => ({
  OpenerBtn: {
    setup() {
      function toggleOpen() {
        state.editorOpened = !state.editorOpened;
      }
      return {
        state,
        toggleOpen,
      };
    },
    template: `
    <button id="config-btn" @click="toggleOpen">
      {{state.editorOpened ? "FooBar" : "hah"}}
    </button>`,
  },
});

const ConfigElement = class extends HTMLElement {
  constructor() {
    super();
    this.hasInit = false;
  }
  async connectedCallback() {
    // this method may be called more than once
    if (this.hasInit) return;
    this.hasInit = true;

    const shadow = this.attachShadow({ mode: "closed" });
    const c = document.createElement("div");
    const style = document.createElement("link")
    
    style.rel = "stylesheet"
    style.href = "./config.css"

    // lazy the loading
    const { createApp, reactive, onMounted } = await import(VUE_CDN_URL);

    const state = reactive({
      editorOpened: false,
    });

    const { OpenerBtn } = components({ state });

    const app = createApp({
      data() {
        return {
          count: 0,
        };
      },
      components: {
        OpenerBtn,
      },
      template: `
        <OpenerBtn />
      `,
    });
    
    console.log(style)
    
    app.mount(c);
    shadow.append(c, style);
  }
};

export function mountConfig() {
  const ele = document.createElement("proxy-config");
  document.body.append(ele);
}

customElements.define("proxy-config", ConfigElement);