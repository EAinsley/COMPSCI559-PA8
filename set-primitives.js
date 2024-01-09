
let loaded_obj = {};

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {string} source
 * @param {Object} buffers
 */
function setObj(gl, name, buffers) {
  const data = loadObj(name)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data[0]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data[1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data[2]), gl.STATIC_DRAW);
  return parseInt(data[0].length / 3);
}

function loadObj(name) {
  if (loaded_obj[name] === undefined) {
    if (name == 'F-letter') {
      loaded_obj[name] = loadFLetter();
      loaded_obj[name]['scale'] = 1.0;
    } else {
      loaded_obj[name] = parseObj(models[name]['obj']);
      loaded_obj[name][0] =
          loaded_obj[name][0].map((e) => e * models[name]['scale']);
    }
  }
  return loaded_obj[name]
}

function parseObj(source) {
  // modified from
  // https://webgl2fundamentals.org/webgl/lessons/webgl-load-obj.html
  const objPos = [[0, 0, 0]];
  const objTex = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  let objVertexData = [objPos, objTex, objNormals];
  let webglVertexData = [
    [],  // positions
    [],  // texcoords
    [],  // normals
  ];
  const handlers = {
    v(parts) {
      objPos.push(parts.map(parseFloat));
    },
    vt(parts) {
      objTex.push(parts.map(parseFloat))
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat))
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    }
  };

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = source.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const handler = handlers[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1);
      continue;
    }
    handler(unparsedArgs.split(/\s+/));
  }
  return webglVertexData;
}



function uploadObj(name, source) {
  loaded_obj[name] = parseObj(source);
}


/**
 */
function loadFLetter() {
  return [fLetterPositions(), fLetterTexcoords(), fLetterNormals()];
}

function fLetterPositions() {
  return [
    // left column front
    0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

    // top rung front
    30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

    // middle rung front
    30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

    // left column back
    0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

    // top rung back
    30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

    // middle rung back
    30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

    // top
    0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

    // top rung right
    100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

    // under top rung
    30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

    // between top rung and middle
    30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

    // top of middle rung
    30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

    // right of middle rung
    67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

    // bottom of middle rung.
    30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

    // right of bottom
    30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

    // bottom
    0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

    // left side
    0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0
  ]
}

function fLetterTexcoords() {
  return [
    // left column front
    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    // top rung front
    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    // middle rung front
    0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

    // left column back
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    // top rung back
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    // middle rung back
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    // top
    0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

    // top rung right
    0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

    // under top rung
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

    // between top rung and middle
    0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

    // top of middle rung
    0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

    // right of middle rung
    0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

    // bottom of middle rung.
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

    // right of bottom
    0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

    // bottom
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

    // left side
    0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0
  ];
}

function fLetterNormals() {
  return [
    // left column front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // top rung front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // middle rung front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // left column back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

    // top rung back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

    // middle rung back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

    // top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    // top rung right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // under top rung
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

    // between top rung and middle
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // top of middle rung
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    // right of middle rung
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // bottom of middle rung.
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

    // right of bottom
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

    // left side
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
  ];
}
