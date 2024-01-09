// Note: This file is responsible for outlook change. Don't write any control
// logic here!

const logLevel = 1;
/**
 *
 * @param {String} type
 * @param {Object} atributite
 * @param  {...any} children
 * @returns {HTMLElement}
 */
function elt(type, attribute, ...children) {
  let node = document.createElement(type);
  for (const [key, value] of Object.entries(attribute)) {
    node.setAttribute(key, value);
  }
  for (let child of children) {
    if (typeof child != 'string')
      node.appendChild(child);
    else
      node.appendChild(document.createTextNode(child));
  }
  return node;
}
window.addEventListener('load', (_) => {
  /**@type {HTMLTextAreaElement} */
  const vertexEditor = document.querySelector('#vertex-editor');
  /**@type {HTMLTextAreaElement} */
  const fragmentEditor = document.querySelector('#fragment-editor');
  /**@type {HTMLSelectElement} */
  const codeSelect = document.querySelector('#code-snippet');
  /**@type {HTMLSelectElement} */
  const modelsSelect = document.querySelector('#object-select');
  /**@type {HTMLButtonElement} */
  const fileSelect = document.querySelector('#file-select');
  /**@type {HTMLInputElement} */
  const fileElement = document.querySelector('#file-element');
  fileSelect.addEventListener('click', (_) => fileElement.click());
  let selected = false;
  for (let [key, _] of Object.entries(codeSnippets)) {
    let element = elt('option', {'value': key}, key);
    if (!selected) {
      codeSelect.value = key;
      selected = true;
    }
    codeSelect.appendChild(element);
  }
  codeSelect.addEventListener('input', (e) => {
    const name = e.target.value;
    vertexEditor.value = codeSnippets[name][0];
    fragmentEditor.value = codeSnippets[name][1];
  });

  selected = false;
  for (let [key, _] of Object.entries(models)) {
    let element = elt('option', {'value': key}, key);
    if (!selected) {
      modelsSelect.value = key;
      selected = true;
    }
    modelsSelect.appendChild(element);
  }

  /**@type {Array<HTMLElement>} */
  const tab_list = ['vertex', 'fragment', 'info', 'control'];
  const tab_element_list = tab_list.map((e) => {
    return {
      tab: document.querySelector(`#${e}-tab`),
      panel: document.querySelector(`#${e}-panel`)
    };
  });

  for (let element of tab_element_list) {
    element.tab.addEventListener('click', (_) => {
      for (let e of tab_element_list) {
        e.tab.classList.remove('active');
        e.panel.classList.remove('active');
      }
      element.tab.classList.add('active');
      element.panel.classList.add('active');
    })
  }
  // TODO - remove these line
  vertexEditor.value = codeSnippets[codeSelect.value][0];
  fragmentEditor.value = codeSnippets[codeSelect.value][1];
  console.log('[INFO]: load default shader success.(ui.js)');
});
