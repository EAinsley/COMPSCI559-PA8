// const img_src_map = {
//   dog: 'https://live.staticflickr.com/5564/30725680942_0c6e60a13f_o.jpg',
//   wood: 'https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg',
//   grid: 'https://live.staticflickr.com/5726/30206830053_87e9530b48_b.jpg',
// }



class GLManager {
  /**@type {WebGL2RenderingContext} */
  #gl
  /**@type {Object} the data from controller*/
  #controller_ref
  #vertexSource
  #fragmentSource
  /**@type {Array<Image>} skybox */
  #skybox
  /**@type {WebGLTexture} */
  #sky_texture
  /**@type {WebGLTexture} */
  #object_texture
  /**@type {Object} */
  #skybox_program_info

  // /**@type {Array<Object>} */
  // #loaded_texture
  // /**@type {Array<Object>} */
  // #loaded_object

  /**@type {Array<ObjectInfo | number>} */
  #obj_list = [];
  /**@type {number} */
  #stack_top;
  /**@type {Array<ProgramInfo>} */
  #program_list = [];

  /**
   * @param {WebGL2RenderingContext} gl the webgl redering context
   * @param {WebGLProgram} program the current webgl program
   * @param {HTMLTextAreaElement} vertexEditor
   * @param {HTMLTextAreaElement} fragmentEditor
   */
  constructor(gl, vertexEditor, fragmentEditor) {
    const skyboxInfo = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: 'https://i.ibb.co/DDbNzZp/pos-x.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: 'https://i.ibb.co/Wp31X3V/neg-x.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: 'https://i.ibb.co/D4y5Tqr/pos-y.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: 'https://i.ibb.co/DpwyWch/neg-y.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: 'https://i.ibb.co/vL0KbBg/pos-z.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: 'https://i.ibb.co/sqMvVMB/neg-z.jpg',
      },
    ];
    this.#sky_texture = gl.createTexture();
    this.#skybox = [];
    skyboxInfo.forEach((item) => {
      const {target, url} = item;
      gl.activeTexture(gl.TEXTURE0);
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 512;
      const height = 512;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      gl.texImage2D(
          target, level, internalFormat, width, height, 0, format, type, null);
      const image = new Image();
      image.crossOrigin = '';
      image.src = url;
      image.addEventListener('load', (_) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#sky_texture);
        gl.texImage2D(
            target, level, internalFormat, width, height, 0, format, type,
            image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
      this.#skybox.push(image);
    });
    this.#object_texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.#object_texture);
    this.#vertexSource = vertexEditor;
    this.#fragmentSource = fragmentEditor;
    this.#gl = gl;
    this.load(default_models);
    this.#controller_ref = initializeController(gl.canvas, this);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 255, 255]));
    this.createSkyboxProgram(gl);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.drawScene();
  }

  /**
   * Create the GLManager and attach it to the specified canvas and editor.
   * @param {string} canvas_id The id of the gl canvas (without #)
   * @param {string} vertex_editor_id The id of the vertex editor (without #)
   * @param {string} fragment_editor_id The id of the fragment editor (without
   *     #)
   * @returns {GLManager}
   */
  static create(canvas_id, vertex_editor_id, fragment_editor_id) {
    // Get gl
    /**@type {HTMLCanvasElement} */
    const canvas = document.querySelector('#' + canvas_id);
    const gl = canvas.getContext('webgl2');
    /**@type {HTMLTextAreaElement} */
    const vertexEditor = document.querySelector('#' + vertex_editor_id);
    /**@type {HTMLTextAreaElement} */
    const fragmentEditor = document.querySelector('#' + fragment_editor_id);


    return new GLManager(gl, vertexEditor, fragmentEditor)
  }


  updateData(index, field, ele, value) {
    let obj = this.#obj_list[index];
    if (obj === null || obj === undefined) return false;
    return obj.updateData(field, ele, value);
  }
  getInfoData(index, field, ele) {
    let obj = this.#obj_list[index];
    if (obj === null || obj === undefined) return NaN;
    return obj.getData(field, ele);
  }

  setObjectLink(index, value) {
    let obj = this.#obj_list[index];
    if (obj === null || obj === undefined) return;
    obj.setLink(value);
  }
  getObjectLink(index) {
    return this.#obj_list[index].getLink();
  }

  compile(i) {
    if (!this.#obj_list[i].recompile) return;
    this.#obj_list[i].recompile = false;
    const gl = this.#gl;
    const obj = this.#obj_list[i];
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, obj.vertex_shader);

    if (vertexShader === null) {
      if (logLevel <= 2) {
        console.log(`[WARN]: vertex shader compile error on object ${i}.`);
      }
      return;
    }
    let fragmentShader =
        loadShader(gl, gl.FRAGMENT_SHADER, obj.fragment_shader);
    if (fragmentShader === null) {
      if (logLevel <= 2) {
        console.log(`[WARN]: fragment shader compile error on object ${i}`);
      }
      return;
    }
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (program !== null) {
      if (logLevel <= 1) {
        console.log(`[INFO]: create gl program successfully on object ${i}`);
      }
    } else {
      if (logLevel <= 2) {
        console.log(`[WARN]: recompile failed on object ${i}.`)
      }
    }

    const programInfo = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, 'a_position'),
        normalLocation: gl.getAttribLocation(program, 'a_normal'),
        texcoordLocation: gl.getAttribLocation(program, 'a_texcoord'),
        worldMatrixLocation: gl.getUniformLocation(program, 'u_worldMatrix'),
        cameraMatrixLocation: gl.getUniformLocation(program, 'u_cameraMatrix'),
        projectionMatrixLocation:
            gl.getUniformLocation(program, 'u_projectionMatrix'),
        worldCameraPosition:
            gl.getUniformLocation(program, 'u_worldCameraPosition'),
        timeLocation: gl.getUniformLocation(program, 'time'),
        textureLocation: gl.getUniformLocation(program, 'u_texture'),
        skyboxLocation: gl.getUniformLocation(program, 'u_skybox')
      },
      vertexArray: initVertexArray(gl),
      buffers: initBuffers(gl),
    };
    gl.uniform1i(
        programInfo.attribLocations.skyboxLocation, 0);  // texture unit 0
    gl.uniform1i(
        programInfo.attribLocations.textureLocation, 1);  // texture unit 1
    setAttrbute(gl, programInfo.buffers, programInfo.attribLocations);
    this.#program_list[i] = programInfo;
  }

  drawSkybox() {
    const gl = this.#gl;
    const quad = new Float32Array([
      -10, -10,  //
      10, -10,   //
      -10, 10,   //
      -10, 10,   //
      10, -10,   //
      10, 10
    ]);
    this.#gl.useProgram(this.#skybox_program_info.program);
    this.#gl.bindVertexArray(this.#skybox_program_info.vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#skybox_program_info.buffers.quad);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    // Put the positions in the buffer
  }
  /**
   * Draw the scene
   */
  drawScene(time) {
    // if (!this.#need_redraw) return;
    // Bind the attribute/buffer set we want.
    const gl = this.#gl;
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    for (let i = 0; i < this.#obj_list.length; i++) {
      const obj = this.#obj_list[i];
      if (this.#program_list[i] === undefined || obj.recompile) {
        this.compile(i);
      }
    }
    this.setUniformsForAll(time);
    // Start to draw
    for (let i = 0; i < this.#obj_list.length; i++) {
      const obj = this.#obj_list[i];
      const programInfo = this.#program_list[i];

      gl.useProgram(programInfo.program);
      gl.bindVertexArray(programInfo.vertexArray);
      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      // Set Data
      const count = setObj(gl, obj.model_name, programInfo.buffers);
      // Set uniforms
      this.setUniforms(this.#gl, obj, programInfo, time);
      gl.drawArrays(primitiveType, offset, count);
    }
    this.drawSkybox();
  }

  addObject() {
    let position = this.#stack_top;
    if (this.#obj_list[this.#stack_top] === undefined) {
      this.#stack_top += 1;
    } else {
      this.#stack_top = this.#obj_list[this.#stack_top];
    }
    this.#obj_list[position] =
        ObjectInfo.load('F-letter', `Object-${position}`);
    return position;
  }
  changeObject(index, name) {
    const obj = this.#obj_list[index];
    obj.model_name = name;
  }

  changeTexture(index, name) {
    const obj = this.#obj_list[index];
    obj.changeTexture(name);
  }

  getObject(index) {
    return this.#obj_list[index].model_name;
  }
  getTexture(index) {
    return this.#obj_list[index].texture_name;
  }
  getVertexShader(index) {
    return this.#obj_list[index].vertex_shader;
  }
  getFragmentShader(index) {
    return this.#obj_list[index].fragment_shader;
  }

  setUniformsForAll(time) {
    const gl = this.#gl;
    // uniform matrix
    const project_matrix = mat4.create();
    // projection matrix
    mat4.ortho(
        project_matrix, -gl.canvas.width / 2, gl.canvas.width / 2,
        -gl.canvas.height / 2, gl.canvas.height / 2, 400, -400);
    mat4.perspective(
        project_matrix, 1 / 4 * Math.PI,
        gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 4000);


    // camera_matrix
    const camera_rot = quat.create();
    quat.fromEuler(
        camera_rot, this.#controller_ref.rotation.x,
        this.#controller_ref.rotation.y, this.#controller_ref.rotation.z)
    const camera_translate = vec3.fromValues(
        this.#controller_ref.translation.x, this.#controller_ref.translation.y,
        this.#controller_ref.translation.z)
    const camera_matrix = mat4.create();
    const camera_matrix_inverse = mat4.create();
    const scale = vec3.fromValues(
        this.#controller_ref.scale,
        this.#controller_ref.scale,
        this.#controller_ref.scale,
    );

    mat4.fromRotationTranslationScaleOrigin(
        camera_matrix_inverse, camera_rot, camera_translate, scale,
        camera_translate);
    mat4.invert(camera_matrix, camera_matrix_inverse);



    if (logLevel <= 0) {
      console.log(`[DATA]: set matrix values`, camera_matrix);
    }


    for (const {program, attribLocations, vertexArray, buffers} of this
             .#program_list) {
      gl.useProgram(program);
      gl.bindVertexArray(vertexArray);
      gl.uniformMatrix4fv(
          attribLocations.projectionMatrixLocation, false, project_matrix);
      gl.uniformMatrix4fv(
          attribLocations.cameraMatrixLocation, false, camera_matrix);
      gl.uniform3fv(attribLocations.worldCameraPosition, camera_translate);
      gl.uniform1f(attribLocations.timeLocation, time / 10000);
    }

    // Skybox

    gl.useProgram(this.#skybox_program_info.program);
    gl.bindVertexArray(this.#skybox_program_info.vertexArray);

    camera_matrix[12] = 0;
    camera_matrix[13] = 0;
    camera_matrix[14] = 0;

    camera_matrix_inverse[12] = 0;
    camera_matrix_inverse[13] = 0;
    camera_matrix_inverse[14] = 0;
    const camera_project_matrix = mat4.create();
    mat4.mul(camera_project_matrix, project_matrix, camera_matrix);
    const view_project_matrix_inverse = mat4.create();
    mat4.invert(view_project_matrix_inverse, camera_project_matrix);

    gl.uniformMatrix4fv(
        this.#skybox_program_info.attribLocations
            .viewDirectionProjectionInverseLocation,
        false, view_project_matrix_inverse);

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(this.#skybox_program_info.attribLocations.skyboxLocation, 0);
  }

  /**
   *
   * @param {WebGL2RenderingContext} gl
   * @param {ObjectInfo} obj
   */
  setUniforms(gl, obj, programInfo, time) {
    // TODO - move the comman uniforms to outside
    const attribLocations = programInfo.attribLocations;
    // world matrix
    const world_pos = vec3.fromValues(...obj.position_arr)
    const world_rot = quat.create();
    quat.fromEuler(world_rot, ...obj.rotation_arr);
    const world_scale = vec3.fromValues(...obj.scale_arr);
    const world_matrix = mat4.create();
    mat4.fromRotationTranslationScale(
        world_matrix, world_rot, world_pos, world_scale);
    gl.uniformMatrix4fv(
        attribLocations.worldMatrixLocation, false, world_matrix);

    gl.bindTexture(gl.TEXTURE_2D, this.#object_texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj.texture);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  requestCompile(index) {
    const obj = this.#obj_list[index];
    obj.recompile = true;
    obj.vertex_shader = this.#vertexSource.value;
    obj.fragment_shader = this.#fragmentSource.value;
  }

  save() {
    const saved_file = {
      object_list: this.#obj_list,
      stack_top: this.#stack_top,
      // loaded_obj,
      // loaded_texture
    };
    const json_file = JSON.stringify(saved_file);
    const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(json_file);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'download.json');
    document.body.appendChild(downloadAnchorNode);  // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    console.log(json_file);
  }
  load(file) {
    const loaded_file = JSON.parse(file);
    // loaded_obj = loaded_file.loaded_obj;
    // loaded_texture = loaded_file.loaded_texture;
    this.#obj_list = Array(loaded_file.object_list.length);
    for (let i = 0; i < loaded_file.object_list.length; i++) {
      const obj_data = loaded_file.object_list[i];
      this.#obj_list[i] = ObjectInfo.load(
          obj_data.model_name, obj_data.name, obj_data.position,
          obj_data.rotation, obj_data.scale, obj_data.texture_name);
      this.#obj_list[i].vertex_shader = obj_data.vertex_shader;
      this.#obj_list[i].fragment_shader = obj_data.fragment_shader;
      this.#obj_list[i].recompile = true;
    }

    this.#stack_top = this.#obj_list.length;
    console.log('load_successfully');
  }
  get objects_number() {
    return this.#obj_list.length;
  }
  createSkyboxProgram(gl) {
    const vertexShaderSource = /* glsl */ `#version 300 es
in vec4 a_position;
out vec4 v_position;
void main() {
  v_position = a_position;
  gl_Position = a_position;
  gl_Position.z = 1.0;
}`;
    const fragmentShaderSource = /* glsl */ `#version 300 es
precision highp float;

uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;

in vec4 v_position;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec4 t = u_viewDirectionProjectionInverse * v_position;
  // outColor = vec4(1.0, 0.0, 1.0, 1.0);
  outColor = texture(u_skybox, normalize(t.xyz / t.w));
}`;
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader =
        loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    this.#skybox_program_info = {
      program,
      attribLocations: {
        positionLocation: gl.getAttribLocation(program, 'a_position'),
        skyboxLocation: gl.getUniformLocation(program, 'u_skybox'),
        viewDirectionProjectionInverseLocation:
            gl.getUniformLocation(program, 'u_viewDirectionProjectionInverse'),
      },
      vertexArray: initVertexArray(gl),
      buffers: {quad: initBuffer(gl)},
    };
    gl.enableVertexAttribArray(
        this.#skybox_program_info.attribLocations.positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#skybox_program_info.buffers.quad);

    gl.vertexAttribPointer(
        this.#skybox_program_info.attribLocations.positionLocation, 2, gl.FLOAT,
        false, 0, 0);
    gl.uniform1i(this.#skybox_program_info.attribLocations.skyboxLocation, 0);
  }
}



/**
 *
 * @param {Number} range
 * @returns {Number}
 */
function randomInt(range) {
  return Math.floor(Math.random() * range);
}
