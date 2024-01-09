
function main() {
  const glManager =
      GLManager.create('canvas', 'vertex-editor', 'fragment-editor');
  let last_time = undefined
  let frame = (time) => {
    glManager.drawScene(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

window.addEventListener('load', (_) => main());