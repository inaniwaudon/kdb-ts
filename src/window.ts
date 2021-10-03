const styleForDesktop = `
.window {
  position: fixed;
  display: block;
  top: 0;
  resize: both;
  background: white;
  padding: 0.2rem;
  z-index: 5;
  border: solid 2px;
  border-radius: 0.3rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1.2rem 1fr;
  cursor: grab;
  will-change: top, left;
}
.window .controls {
  margin: 0;
  padding: 0;
  padding-bottom: 0.2rem;
  list-style: none;
  display: block;
  height: 1.1rem;
  padding-top: 0.1rem;
  cursor: initial;
  border-bottom: solid 1px;
  cursor: grab;
  user-select: none;
  background: inherit;
  z-index: 1;
}
.window .controls li:not(.title) {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  border: solid 1px #1e1e2a49;
  cursor: pointer;
}
.window .controls li {
  float: left;
  margin-left: 0.1rem;
}
.window .controls li.title {
  font-size: 0.8rem;
  text-align: center;
  display: grid;
  width: calc(100% - 2rem);
  word-break: keep-all;
  white-space: pre;
  text-overflow: ellipsis;
}
.window .body {
  cursor: initial;
}
iframe {
  border: none;
  width: 100%;
  height: 100%;
}
`;

const styleForMobile = `
.window {
  display: block;
  background: white;
  padding: 0.2rem;
  border: solid 2px;
  border-radius: 0.3rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1.2rem 1fr;
  width: calc(100vw - 0.7rem);
  height: 30vh;
}
.window .controls {
  margin: 0;
  padding: 0;
  padding-bottom: 0.2rem;
  list-style: none;
  display: block;
  height: 1.1rem;
  padding-top: 0.1rem;
  cursor: initial;
  border-bottom: solid 1px;
  cursor: grab;
  user-select: none;
}
.window .controls li:not(.title) {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  border: solid 1px #1e1e2a49;
  cursor: pointer;
}
.window .controls li {
  float: left;
  margin-left: 0.1rem;
}
.window .controls li.title {
  font-size: 0.8rem;
  text-align: center;
  display: grid;
  width: calc(100% - 2rem);
  word-break: keep-all;
  white-space: pre;
  text-overflow: ellipsis;
}
.window .body {
  cursor: initial;
}
iframe {
  border: none;
  width: 100%;
  height: 100%;
}
`;

class DraggableWindow extends HTMLElement {
  private start: [number, number] | null;
  private previousWindowPosition: [number, number] | null;
  private windowElement: HTMLDivElement | null;
  private willDisposed: [string, Function][] = [];

  constructor() {
    super();
    this.start = null;
    this.previousWindowPosition = null;
    this.windowElement = null;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    const win = document.createElement('div');
    win.className = 'window';

    this.windowElement = win;

    const controls = document.createElement('ul');
    controls.className = 'controls';

    const closing = document.createElement('li');
    closing.style.background = 'radial-gradient(circle, rgb(255,0,0) 0%, rgb(255,231,192) 100%)';

    const title = document.createElement('li');
    title.className = 'title';

    const titleSlot = document.createElement('slot');
    titleSlot.name = 'title';
    title.append(titleSlot);

    controls.append(closing, title);

    closing.addEventListener('click', () => this.remove());

    const body = document.createElement('div');
    body.className = 'body';

    const bodySlot = document.createElement('slot');
    bodySlot.name = 'body';
    body.append(bodySlot);

    win.append(controls);
    win.append(body);

    shadow.append(win);

    titleSlot.addEventListener('slotchange', () => {
      title.childNodes.forEach((it) => {
        if (it == titleSlot) {
          return;
        }
        //it.remove();
      });

      const nodes = titleSlot.assignedElements();

      nodes.forEach((it) => {
        it.slot = '';
      });

      title.append(...nodes);
    });

    bodySlot.addEventListener('slotchange', () => {
      body.childNodes.forEach((it) => {
        if (it == bodySlot) {
          return;
        }
        //it.remove();
      });

      const nodes = bodySlot.assignedElements();

      nodes.forEach((it) => {
        it.slot = '';
      });

      body.append(...nodes);
    });

    if (window.matchMedia('screen and (max-width: 1100px)').matches) {
      this.connectedCallbackForMobile(shadow, win);
    } else {
      this.connectedCallbackForDesktop(shadow, win);
    }
  }

  connectedCallbackForDesktop(shadow: ShadowRoot, win: HTMLElement) {
    const style = document.createElement('style');
    style.innerHTML = styleForDesktop;
    shadow.append(style);

    win.draggable = true;
    const pointerUpHandler = this.dragEnd.bind(this);
    const pointerMoveHandler = this.drag.bind(this);

    win.addEventListener('dragstart', this.dragStart.bind(this));
    window.addEventListener('pointerup', pointerUpHandler);
    window.addEventListener('pointermove', pointerMoveHandler);

    this.willDisposed.push(['pointerup', pointerUpHandler]);
    this.willDisposed.push(['pointermove', pointerMoveHandler]);
  }

  connectedCallbackForMobile(shadow: ShadowRoot, win: HTMLElement) {
    const style = document.createElement('style');
    style.innerHTML = styleForMobile;
    shadow.append(style);
    this.style.position = 'fixed';
    this.style.left = '0';
    this.style.top = 'calc(70vh - 0.7rem)';
    this.style.zIndex = '5';
  }

  disconnectedCallback() {
    this.willDisposed.forEach(([evt, hdr]) => {
      window.removeEventListener(evt as any, hdr as any);
    });
  }

  /**
   * @param {DragEvent} evt
   */
  dragStart(evt: DragEvent) {
    evt.preventDefault();
    this.start = [evt.pageX, evt.pageY];
    const currentLeft = parseFloat(getComputedStyle(this.windowElement!).left.slice(0, -2)) || 0;
    const currentTop = parseFloat(getComputedStyle(this.windowElement!).top.slice(0, -2)) || 0;

    this.previousWindowPosition = [currentLeft, currentTop];
  }

  /**
   * @param {PointerEvent} evt
   */
  dragEnd(evt: PointerEvent) {
    if (this.start === null) {
      return;
    }
    const delta = [evt.pageX - this.start![0], evt.pageY - this.start![1]];
    this.windowElement!.style.left = `${delta[0] + this.previousWindowPosition![0]}px`;
    this.windowElement!.style.top = `${delta[1] + this.previousWindowPosition![1]}px`;
    this.start = null;
  }

  /**
   * @param {PointerEvent} evt
   */
  drag(evt: PointerEvent) {
    if (this.start === null) {
      return;
    }

    const delta = [evt.pageX - this.start![0], evt.pageY - this.start![1]];
    this.windowElement!.style.left = `${delta[0] + this.previousWindowPosition![0]}px`;
    this.windowElement!.style.top = `${delta[1] + this.previousWindowPosition![1]}px`;
  }
}

if ('customElements' in window) {
  customElements.define('draggable-window', DraggableWindow);
}
