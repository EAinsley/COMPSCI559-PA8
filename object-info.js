let loaded_texture =
    {
        // dog: loadImageURL(
        //     'https://live.staticflickr.com/5564/30725680942_0c6e60a13f_o.jpg'),
        // wood: loadImageName(
        //     'https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg'),
        // grid: loadImageName(
        //     'https://live.staticflickr.com/5726/30206830053_87e9530b48_b.jpg'),
}


class ObjectInfo {
  /**@type {string} name for the object*/
  name
  /**@type {string} name to look up the model*/
  model_name
  /**@type {Image}*/
  texture
  /**@type {string}*/
  texture_name
  /**@type {{x:number, y:number, z: number}} World postion*/
  position
  /**@type {{x:number, y:number, z: number}} scale*/
  scale
  /**@type {Boolean} */
  is_scale_linked
  /**@type {{x: number, y: number, z: number}} in degree*/
  rotation
  /**@type {string} vertex shader*/
  vertex_shader
  /**@type {string} fragment shader*/
  fragment_shader
  /**@type {Boolean} */
  recompile

  /**
   *
   * @param {string} model_name
   * @param {string} name
   * @param {Image} texture
   * @param {{x:number, y:number, z:number}} position
   * @param {{x:number, y:number, z:number}} rotation
   * @param {{x:number, y:number, z:number}} scale
   * @param {Boolean} is_scale_linked
   */
  constructor(
      model_name, name, texture, texture_name, position, rotation, scale,
      is_scale_linked) {
    this.model_name = model_name;
    this.name = name;
    this.texture = texture;
    this.texture_name = texture_name;
    this.position = position;
    this.scale = scale;
    this.is_scale_linked = is_scale_linked;
    this.rotation = rotation;
    this.vertex_shader = codeSnippets['default'][0];
    this.fragment_shader = codeSnippets['default'][1];
    this.recompile = true;
  }

  updateData(field, ele, value) {
    if (value != value) return;
    if (ele != 'x' && ele != 'y' && ele != 'z') {
      console.warn('unknow ele: ', ele);
      return false;
    }
    if (field == 'position') {
      this.position[ele] = value;
    } else if (field == 'rotation') {
      this.rotation[ele] = value;
    } else if (field == 'scale') {
      if (this.is_scale_linked) {
        if (value == 0 || value != value) return;
        let factor = value / this.scale[ele];
        this.scale = {
          x: this.scale.x * factor,
          y: this.scale.y * factor,
          z: this.scale.z * factor
        };
      } else {
        this.scale[ele] = value;
      }
    } else {
      console.warn('Unknow field: ', field);
      return false;
    }
    return true;
  }

  getData(field, ele) {
    if (ele != 'x' && ele != 'y' && ele != 'z') {
      console.warn('unknow ele: ', ele);
      return NaN;
    }
    if (field == 'position') {
      return this.position[ele];
    } else if (field == 'rotation') {
      return this.rotation[ele];
    } else if (field == 'scale') {
      return this.scale[ele];
    } else {
      console.warn('Unknow field: ', field);
    }
  }

  setLink(value) {
    this.is_scale_linked = value;
  }
  getLink() {
    return this.is_scale_linked;
  }
  changeTexture(name) {
    this.texture = loaded_texture[name];
    this.texture_name = name;
  }


  /**
   *
   * @param {string} model_name the name of the model
   * @param {string | undefined } name name of the model
   * @param {{x:number, y:number, z:number} | undefined} position
   * @param {{x:number, y:number, z:number} | undefined} rotation
   * @param {{x:number, y:number, z:number} | undefined} scale
   * @param {string | undefined} texture_name
   */
  static load(model_name, name, position, rotation, scale, texture_name) {
    texture_name = texture_name === undefined ? 'dog' : texture_name;
    let texture = loadImageName(texture_name);
    name = name === undefined ? 'object' : name;
    position = position === undefined ? {x: 0, y: 0, z: 0} : position;
    rotation = rotation === undefined ? {x: 0, y: 0, z: 0} : rotation;
    scale = scale === undefined ? {x: 1, y: 1, z: 1} : scale;
    return new ObjectInfo(
        model_name, name, texture, texture_name, position, rotation, scale,
        true);
  }

  get position_arr() {
    return [this.position.x, this.position.y, this.position.z];
  }

  get rotation_arr() {
    return [this.rotation.x, this.rotation.y, this.rotation.z];
  }

  get scale_arr() {
    return [this.scale.x, this.scale.y, this.scale.z]
  }


  get position() {
    return this.position;
  }
  get rotation() {
    return this.rotation;
  }
  get scale() {
    return this.scale;
  }
}

function loadImageName(name) {
  return loaded_texture[name];
}

function loadImageURL(url) {
  const img = new Image();
  img.crossOrigin = '';
  img.src = url;
  return img;
}

window.addEventListener('load', (_) => {
  // initialize
  console.log('[INF]: initialize texture');
  loaded_texture['dog'] = loadImageURL(
      'https://live.staticflickr.com/5564/30725680942_0c6e60a13f_o.jpg');
  loaded_texture['wood'] = loadImageURL(
      'https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg');
  loaded_texture['grid'] = loadImageURL(
      'https://live.staticflickr.com/5726/30206830053_87e9530b48_b.jpg');
  const texture_select = document.getElementById('texture-select');

  for (let [key, _] of Object.entries(loaded_texture)) {
    texture_select.appendChild(elt('option', {value: key}, key));
  };
});