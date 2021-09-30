class DraggableWindow extends HTMLElement {
  constructor() {
    super();
    this.start = null;
    this.windowElement = null;
  }

  connectedCallback() {
    let shadow = this.attachShadow({ 'mode': 'closed' });
    let style = document.createElement('style');

    style.innerHTML = `
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
    }
    .window .controls {
      margin: 0;
      padding: 0;
      list-style: none;
      display: block;
      height: 1.1rem;
      padding-top: 0.1rem;
      cursor: initial;
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
    `

    shadow.append(style)

    let win = document.createElement('div');
    win.className = 'window';
    win.draggable = true;
    win.addEventListener('dragstart', this.dragStart.bind(this));
    win.addEventListener('dragend', this.dragEnd.bind(this));
    this.windowElement = win;

    let controls = document.createElement('ul');
    controls.className = 'controls';
    controls.innerHTML = `
    <li style="background: radial-gradient(circle, rgb(255,0,0) 0%, rgb(255,231,192) 100%);"></li>
    <!--li style="background: radial-gradient(circle, rgb(255,255,0) 0%, rgb(255,255,0) 25%, rgb(227,255,228) 100%);"></li>
    <li style="background: radial-gradient(circle, rgb(0,255,0) 0%, rgb(0,255,0) 25%, rgb(215,255,254) 100%)"></li-->
    <li class="title"><slot name="title"></slot></li>`;

    controls.children.item(0).addEventListener('click', () => this.remove());

    let body = document.createElement('div');
    body.className = 'body';
    body.innerHTML = '<slot name="body"></slot>';

    win.append(controls);
    win.append(body);

    shadow.append(win);
  }

  /**
   * @param {DragEvent} evt
   */
  dragStart(evt) {
    this.start = [evt.pageX, evt.pageY];
    console.log("start", this.start);
  }

  /**
   * @param {DragEvent} evt
   */
  dragEnd(evt) {
    console.log("end", this.start);
    let delta = [evt.pageX - this.start[0], evt.pageY - this.start[1]];
    let currentLeft = parseFloat(getComputedStyle(this.windowElement).left.slice(0, -2)) || 0;
    let currentTop = parseFloat(getComputedStyle(this.windowElement).top.slice(0, -2)) || 0;
    this.windowElement.style.left = `${delta[0] + currentLeft}px`;
    this.windowElement.style.top = `${delta[1] + currentTop}px`;
    this.start = null;
  }
}

if ('customElements' in window) {
  customElements.define('draggable-window', DraggableWindow);
}