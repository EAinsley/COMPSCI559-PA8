/**
 * Initialize all the buffers
 * @param {WebGL2RenderingContext} gl
 * @returns {{position: WebGLBuffer | null}}
 */
function initBuffers(gl) {
  const positionBuffer = initBuffer(gl);
  const texcoordBuffer = initBuffer(gl);
  const normalBuffer = initBuffer(gl);
  return {
    position: positionBuffer,
    texcoord: texcoordBuffer,
    normal: normalBuffer
  };
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLBuffer | null}
 */
function initBuffer(gl) {
  // Create a buffer.
  const buffer = gl.createBuffer();
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  return buffer;
}
