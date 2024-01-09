
/**
 * creates a shader of the given type, uploads the source and compiles it.
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @returns {WebGLShader | null}
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  // Send the source to the shader object
  gl.shaderSource(shader, source);
  // Compile the shader program
  gl.compileShader(shader);
  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
        `[Error]: failed to compile shader ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Link the shaders and create a program
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 * @returns {WebGLProgram | null}
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`[Error]: Unable to initialize the shader program: ${
        gl.getProgramInfoLog(
            program,
            )}`);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
/**
 *
 * @param {WebGL2RenderingContext} gl
 */
function initVertexArray(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  return vao;
}