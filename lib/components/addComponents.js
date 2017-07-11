const getBox = require('./getBox');
const getGraph = require('./getGraph');
const query = require('../util/query');
const datGUI = require('../ui/dat').instance;
module.exports = function ({ app, components }) {
  if (!query.gui) {
    const ui = document.querySelector('.dg.ac');
    ui.style.display = 'none';
  } else {
    const ui = document.querySelector('.dg.ac');
    ui.style.zIndex = 1000;
  }

  var gui = {
    length: {
      type: 'f',
      value: 400.0
    },
    rad: {
      type: 'f',
      value: 20.0
    },
    uScale: {
      type: 'f',
      value: 2.2
    },
    amplitude: {
      type: 'f',
      value: 24.0
    },
    textureWidth: {
      type: 'f',
      value: 64
    }
  }

  var graphSource = null;

  datGUI.add(gui.length, 'value', 200, 800).name('length');
  datGUI.add(gui.rad, 'value', 10, 400).name('radius');
  datGUI.add(gui.uScale, 'value', 0.1, 4).name('scale');
  datGUI.add(gui.amplitude, 'value', 0, 40).name('amplitude');
  datGUI.add(gui.textureWidth, 'value', [32, 64, 128, 256, 512, 1024]).name('amplitude').onChange(updateTexture);

  var light = new THREE.PointLight(0xfffffff, 1, 550);
  light.position.set(100, 100, 0);
  app.scene.add(light);
  /*light.castShadow = true;
  light.shadow.mapSize.width = 512;  // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5;       // default
  light.shadow.camera.far = 500;*/     // default

  var ambLight = new THREE.AmbientLight(0x999999); // soft white light
  app.scene.add(ambLight);

  var around = new THREE.Mesh(new THREE.BoxBufferGeometry(1000, 1000, 1000), new THREE.MeshPhongMaterial({
    color: 0xCCCCCC,
    side: THREE.BackSide,
    shininess: 0.1,
    emissive: 0x000000,
    specular: 0x111111,
    depthTest: false,
    depthWrite: false
  }));

  around.receiveShadow = true;

  app.scene.add(around);

  // const box = components.add(getBox(app));
  const graphc = components.add(getGraph(app, {
    instances: 10000, 
    graphSource,
    gui
  }));
  const graphs = components.add(getGraph(app, {
    instances: 10000, 
    type: 'sphere', 
    graphSource,
    gui
  }));
  const graphb = components.add(getGraph(app, {
    instances: 10000, 
    type: 'box', 
    graphSource,
    gui}));
  // 
  const allGraph = [graphc, graphs, graphb];

  updateTexture();

  function updateTexture () {
    var data = [];
    for (var i = 0; i < gui.textureWidth.value * 2 * 3; i+=3) {
      var c = Math.floor(Math.random() * 255);
      data.push(c, c, c);
    }

    graphSource = new THREE.DataTexture(Uint8Array.from(data), 128, 1, THREE.RGBFormat);
    graphSource.needsUpdate = true;

    allGraph.forEach(g => { g.uniforms.graphSource.value = graphSource; g.uniforms.graphSource.value.needsUpdate = true; });
  }

};
