// NOTE - This file is responsible for data interaction. Any control that
// require data or update data should go into this file.


/**
 * Set up the controller on canvas
 * @param {HTMLCanvasElement} canvas
 * @param {GLManager} glManager
 * @return {Object} the reference to all the data
 */
function initializeController(canvas, glManager) {
  let ref = {
    translation: {x: 0, y: 0, z: 400},
    rotation: {x: 0, y: 0, z: 0},
    scale: 1.0
  };
  let current_index = 0;

  const parent = document.querySelector('#scene-controls');
  initRange(
      parent, 'x-pos', -canvas.width, canvas.width, 1, ref.translation.x,
      ref.translation, 'x', glManager);
  initRange(
      parent, 'y-pos', -canvas.height, canvas.height, 1, ref.translation.y,
      ref.translation, 'y', glManager);
  initRange(
      parent, 'z-pos', -800, 800, 1, ref.translation.z, ref.translation, 'z',
      glManager);
  initRange(
      parent, 'x-rot', -180, 180, 0.1, ref.rotation.x, ref.rotation, 'x',
      glManager);
  initRange(
      parent, 'y-rot', -180, 180, 0.1, ref.rotation.y, ref.rotation, 'y',
      glManager);
  initRange(
      parent, 'z-rot', -180, 180, 0.1, ref.rotation.z, ref.rotation, 'z',
      glManager);
  initText(parent, 'scale', ref.scale, ref, 'scale', glManager);
  // compiler
  const button = document.querySelector('#compile-button');
  button.addEventListener(
      'click', (_) => glManager.requestCompile(current_index));
  // object
  const objctSelect = document.querySelector('#object-select');
  objctSelect.addEventListener(
      'input', (e) => glManager.changeObject(current_index, e.target.value));


  /**@type {HTMLInputElement} */
  const fileElement = document.querySelector('#file-element');
  // info editor

  /**@type {HTMLTextAreaElement} */
  const vertexEditor = document.querySelector('#vertex-editor');
  /**@type {HTMLTextAreaElement} */
  const fragmentEditor = document.querySelector('#fragment-editor');
  const info_elements = [['position', 'rotation', 'scale'], ['x', 'y', 'z']];
  for (let field of info_elements[0]) {
    for (let ele of info_elements[1]) {
      if (field == 'postion' || field == 'rotation') {
        document.querySelector(`#${field}-${ele}`)
            .addEventListener(
                'input',
                (e) => {glManager.updateData(
                    current_index, field, ele,
                    Number.parseFloat(e.target.value))});
      } else {
        document.querySelector(`#${field}-${ele}`)
            .addEventListener('input', (e) => {
              if (glManager.updateData(
                      current_index, field, ele,
                      Number.parseFloat(e.target.value))) {
                for (let sub_ele of info_elements[1]) {
                  if (sub_ele != ele)
                    document.getElementById(`${field}-${sub_ele}`).value =
                        glManager.getInfoData(current_index, field, sub_ele);
                }
              }
            });
      }
    }
  }
  // The link check
  const scale_link = document.getElementById('scale-link');
  scale_link.addEventListener('input', (e) => {
    glManager.setObjectLink(current_index, e.target.checked);
  });

  // Texture selection
  const texture_select = document.getElementById('texture-select');
  texture_select.addEventListener('input', (e) => {
    glManager.changeTexture(current_index, e.target.value);
  })

  // Add object
  const add_object_button = document.getElementById('add-object-button');
  const directory = document.getElementById('directory-container');
  add_object_button.addEventListener('click', (_) => {
    const index = glManager.addObject();
    const li =
        elt('li', {class: 'object', id: `Object-${index}`}, `Object ${index}`);
    li.addEventListener('click', (e) => {
      document.getElementById(`Object-${current_index}`)
          .classList.remove('active');
      current_index = Number.parseInt(e.target.id.split('-')[1]);
      e.target.classList.add('active');
      // Update all the data
      for (let field of info_elements[0]) {
        for (let ele of info_elements[1]) {
          document.getElementById(`${field}-${ele}`).value =
              glManager.getInfoData(current_index, field, ele);
        }
      }
      objctSelect.value = glManager.getObject(current_index);
      texture_select.value = glManager.getTexture(current_index);
      scale_link.checked = glManager.getObjectLink(current_index);
      vertexEditor.value = glManager.getVertexShader(current_index);
      fragmentEditor.value = glManager.getFragmentShader(current_index);
    });
    directory.appendChild(li);
  });

  // Download files
  const save_button = document.getElementById('save-object-button');
  save_button.addEventListener('click', (_) => glManager.save());

  // Load files
  const load_file = document.getElementById('load-object-file');
  const load_button = document.getElementById('load-object-button');
  load_button.addEventListener('click', (_) => {
    load_file.click();
  });
  load_file.addEventListener('input', (_) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      glManager.load(e.target.result);
      // remove and add new
      while (directory.firstChild) {
        directory.removeChild(directory.lastChild);
      }
      for (let index = 0; index < glManager.objects_number; index++) {
        const li = elt(
            'li', {class: 'object', id: `Object-${index}`}, `Object ${index}`);
        li.addEventListener('click', (e) => {
          document.getElementById(`Object-${current_index}`)
              .classList.remove('active');
          current_index = Number.parseInt(e.target.id.split('-')[1]);
          e.target.classList.add('active');
          // Update all the data
          for (let field of info_elements[0]) {
            for (let ele of info_elements[1]) {
              document.getElementById(`${field}-${ele}`).value =
                  glManager.getInfoData(current_index, field, ele);
            }
          }
          objctSelect.value = glManager.getObject(current_index);
          texture_select.value = glManager.getTexture(current_index);
          scale_link.checked = glManager.getObjectLink(current_index);
          vertexEditor.value = glManager.getVertexShader(current_index);
          fragmentEditor.value = glManager.getFragmentShader(current_index);
        });
        directory.appendChild(li);
      }
      current_index = 0;
      document.getElementById(`Object-${0}`).click();
    };
    reader.readAsText(load_file.files[0]);
    console.log('load file clicked');
  });
  // const texture_file = document.getElementById('texture-file');
  // texture_file.addEventListener('input', (_) => {
  //   const reader = new FileReader()
  //   let name = null;
  //   reader.onload = (e) => {};
  // })


  fileElement.addEventListener('input', (_) => {
    const reader = new FileReader()
    let name = null;
    reader.onload = (e) => {
      uploadObj(name, e.target.result);
      objctSelect.appendChild(elt('option', {value: name}, name));
    };

    name = fileElement.files[0].name;
    reader.readAsText(fileElement.files[0]);
  });

  // Load default


  for (let index = 0; index < glManager.objects_number; index++) {
    const li = elt('li', {class: 'object', id: `Object-${index}`}, `Object
        ${index}`);
    li.addEventListener('click', (e) => {
      document.getElementById(`Object-${current_index}`)
          .classList.remove('active');
      current_index = Number.parseInt(e.target.id.split('-')[1]);
      e.target.classList.add('active');
      // Update all the data
      for (let field of info_elements[0]) {
        for (let ele of info_elements[1]) {
          document.getElementById(`${field}-${ele}`).value =
              glManager.getInfoData(current_index, field, ele);
        }
      }
      objctSelect.value = glManager.getObject(current_index);
      texture_select.value = glManager.getTexture(current_index);
      scale_link.checked = glManager.getObjectLink(current_index);
      vertexEditor.value = glManager.getVertexShader(current_index);
      fragmentEditor.value = glManager.getFragmentShader(current_index);
    });
    directory.appendChild(li);
  }
  current_index = 0;
  document.getElementById(`Object-${0}`).click();
  console.log('load finished');

  return ref;
}

/**
 *
 * @param {HTMLElement} parent the parent to add the controller
 * @param {string} tag tag of the controller
 * @param {number} min the minimum number
 * @param {number} max the maximum number
 * @param {number} step the step
 * @param {number} value the value of the range
 * @param {Object} ref ref to the data to update
 * @param {string} name the name of the attribute of the ref
 * @param {GLManager} glManager
 */
function initRange(parent, tag, min, max, step, value, ref, name, glManager) {
  const text = elt('p', {}, value.toFixed(0));
  const range =
      elt('input', {id: tag, tag, min, max, step, value, type: 'range'});
  const label = elt('label', {'for': tag}, tag);
  range.addEventListener('input', (e) => {
    ref[name] = Number(e.target.value);
    text.textContent = e.target.value;
  });
  parent.appendChild(elt('div', {}, label, range, text));
}


/**
 *
 * @param {HTMLElement} parent the parent to add the controller
 * @param {string} tag tag of the controller
 * @param {number} min the minimum number
 * @param {number} max the maximum number
 * @param {number} step the step
 * @param {number} value the value of the range
 * @param {Object} ref ref to the data to update
 * @param {string} name the name of the attribute of the ref
 * @param {GLManager} glManager
 */
function initText(parent, tag, value, ref, name, glManager) {
  const text = elt('input', {id: tag, value});
  const label = elt('label', {'for': tag}, tag);
  text.addEventListener('input', (e) => {
    ref[name] = Number(e.target.value);
  });
  parent.appendChild(elt('div', {}, label, text));
}

/**
 * Get real mouse postion of canvas
 * @param {HTMLCanvasElement} canvas
 * @param {MouseEvent} event
 * @returns {{x:Number, y: Number}}
 */
function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top};
}
