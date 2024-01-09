

/**
 * Tell WebGL how to pull out the data.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLBuffer} buffers
 * @param {any} attribLocations
 */
function setAttrbute(gl, buffers, attribLocations) {
  // const vao = gl.createVertexArray();
  // gl.bindVertexArray(vao);
  setPositionAttribute(gl, buffers.position, attribLocations.vertexPosition);
  setNormalAttribute(gl, buffers.normal, attribLocations.normalLocation);
  setTexcoordsAttrubute(gl, buffers.texcoord, attribLocations.texcoordLocation);
  if (logLevel <= 1) {
    console.log(`[INFO]: set attribute succeed.`);
  }
}



/**
 * Tell WebGL how to pull out the positions from the position buffer into the
 * vertexPosition attribute.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLBuffer} buffers
 * @param {number} attribLocations
 */
function setPositionAttribute(gl, buffer, attribLocation) {
  if (attribLocation == -1) return;
  if (logLevel <= 1) {
    console.log('[INFO]: position attribute location', attribLocation)
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribLocation);
  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      attribLocation,
      size,
      type,
      normalize,
      stride,
      offset,
  );
}

/**
 * Tell WebGL how to pull out the positions from the color buffer into the
 * vertexPosition attribute.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLBuffer} buffers
 * @param {number} attribLocations
 */
function setColorAttribute(gl, buffer, attribLocation) {
  if (attribLocation == -1) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribLocation);
  const size = 3;
  const type = gl.UNSIGNED_BYTE;
  const normalize = true;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      attribLocation,
      size,
      type,
      normalize,
      stride,
      offset,
  );
}


/**
 * Tell WebGL how to pull out the positions from the normals buffer into the
 * vertexPosition attribute.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLBuffer} buffers
 * @param {number} attribLocations
 */
function setNormalAttribute(gl, buffer, attribLocation) {
  if (attribLocation == -1) return;
  if (logLevel <= 1) {
    console.log('[INFO]: normal attribute location', attribLocation)
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribLocation);
  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      attribLocation,
      size,
      type,
      normalize,
      stride,
      offset,
  );
}

/**
 * Tell WebGL how to pull out the positions from the texcoord buffer into the
 * vertexPosition attribute.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLBuffer} buffers
 * @param {number} attribLocations
 */
function setTexcoordsAttrubute(gl, buffer, attribLocation) {
  if (attribLocation == -1) return;
  if (logLevel <= 1) {
    console.log('[INFO]: texcoord attribute location', attribLocation)
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribLocation);
  const size = 2;
  const type = gl.FLOAT;
  const normalize = true;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      attribLocation,
      size,
      type,
      normalize,
      stride,
      offset,
  );
}
