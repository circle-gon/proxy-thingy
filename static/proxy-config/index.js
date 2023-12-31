// TODO: compile this

const VUE_CDN_URL =
  "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js";

const NAVIGATE_NAMES = ["Proxy URLs"]

const components = ({ state, computed }) => {
  const OpenerBtn = {
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
      {{state.editorOpened ? "Close" : "Open"}}
    </button>`,
  }
  const OptionNavigator = {
    setup() {
      return {
        state,
        names: NAVIGATE_NAMES
      }
    },
    template: `
    <div id="selector-parent">
    <table id="selector-table">
      <tr v-for="(name, index) in names">
        <td :class="{ active: state.openedTo === index }" class="selector" @click="state.openedTo = index">
          {{name}}
        </td>
      </tr>
    </table>
    </div>
    `
  }
  const OptionContent = {
    setup() {
      const tabNum = computed(() => state.openedTo)
      return {
        tabNum
      }
    },
    template: `
    <div id="config-content">
    <template v-if="tabNum === 0">
    Hello there!
    </template>
    <template v-else-if="tabNum === 1">
    Say hi!
    </template>
    <template v-else>
    Oh noes, this has not been implemented...
    </template>
    </div>
    `
  }
  const OptionModal = {
    setup() {
      return {
        state
      }
    },
    components: {
      OptionNavigator,
      OptionContent
    },
    template: `
    <div id="edit-modal" v-if="state.editorOpened">
      <div id="modal-content">
        <OptionNavigator />
        <OptionContent />
      </div>
    </div>`
  }
  return {
    OpenerBtn,
    OptionModal
  }
};

const ConfigElement = class extends HTMLElement {
  constructor() {
    super();
    this.hasInit = false;
  }
  async connectedCallback() {
    // this method may be called more than once
    if (this.hasInit) return;
    this.hasInit = true;

    const shadow = this.attachShadow({ mode: "open" });
    const c = document.createElement("div");
    const style = document.createElement("link")
    
    style.setAttribute("rel", "stylesheet")
    style.setAttribute("href", "/proxy-config/config.css?proxyresource")
    c.id = "container"

    // lazy the loading
    const { createApp, reactive, computed } = await import(VUE_CDN_URL);

    const state = reactive({
      editorOpened: false,
      openedTo: 0
    });

    const app = createApp({
      components: components({ state, computed }),
      template: `
        <OpenerBtn />
        <OptionModal />
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
