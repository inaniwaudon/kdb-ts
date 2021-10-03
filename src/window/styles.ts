const desktop = `
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

const mobile = `
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

export default {
  desktop, mobile
}