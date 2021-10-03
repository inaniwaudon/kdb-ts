import styles from './styles';

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
      const nodes = titleSlot.assignedElements();

      nodes.forEach((it) => {
        it.slot = '';
      });

      title.append(...nodes);
    });

    bodySlot.addEventListener('slotchange', () => {
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
    style.innerHTML = styles.desktop;
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
    style.innerHTML = styles.mobile;
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
