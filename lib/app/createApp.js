/*
  This is a generic "ThreeJS Application"
  helper which sets up a renderer and camera
  controls.
 */

const createControls = require('orbit-controls');
const createLoop = require('raf-loop');
const assign = require('object-assign');
const Stats = require('stats-js');
const query = require('../util/query');
const datGUI = require('../ui/dat').instance;
const BokehPass = require('../post/BokehPass');
// const BloomPass = require('../post/BloomPass');

const EffectComposer = require('../post/EffectComposer');

const showFPS = query.fps;

module.exports = createApp;
function createApp (opt = {}) {
  // Scale for retina
  let dpr = Math.min(2, window.devicePixelRatio);
  if (typeof query.dpr === 'number') dpr = query.dpr;

  const stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  if (showFPS) document.body.appendChild(stats.domElement);
  // Our WebGL renderer with alpha and device-scaled
  const renderer = new THREE.WebGLRenderer(assign({
    antialias: false // default enabled
  }, opt));
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 1);
  renderer.sortObjects = false;
  renderer.gammaInput = true;
  renderer.gammaOutput = false;
  renderer.gammaFactor = 2.2;
  /*renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;*/

  let names = 0;
  // Add the <canvas> to DOM body
  const canvas = renderer.domElement;
  document.body.appendChild(canvas);

  // perspective camera
  const near = 1;
  const far = 1500;
  const fieldOfView = 65;
  const camera = new THREE.PerspectiveCamera(fieldOfView, 1, near, far);
  const target = new THREE.Vector3();

  const composer = createComposer();
  const targets = [ composer.renderTarget1, composer.renderTarget2 ];

  // 3D scene
  const scene = new THREE.Scene();

  // slick 3D orbit controller with damping
  const controls = createControls(assign({
    canvas,
    zoomSpeed: 0.1,
    theta: 90 * Math.PI / 180,
    phi: 90 * Math.PI / 180,
    distanceBounds: [ 1, 450 ],
    distance: 100
  }, opt));

  const app = createLoop();

  // Update renderer size
  window.addEventListener('resize', resize);

  // Add post processing
  setupPost();

  // Setup initial size & aspect ratio
  resize();

  // public API
  app.resize = resize;
  app.render = render;
  app.camera = camera;
  app.scene = scene;
  app.canvas = renderer.domElement;
  app.controls = controls;
  app.renderer = renderer;
  app.update = update;
  app.time = 0;

  return app;

  function setupPost () {
    composer.addPass(new EffectComposer.RenderPass(scene, camera));
    var bp = new BokehPass(scene, camera, {
      focus: 0.09,
      aperture: 0.026,
      maxblur: 0.24
    });  
    composer.addPass(bp);
    datGUI.add(bp.uniforms.focus, 'value', 0, 0.5).name('focus');
    datGUI.add(bp.uniforms.aperture, 'value', 0, 0.2).name('aperture');
    datGUI.add(bp.uniforms.maxblur, 'value', 0, 0.5).name('max blur');
    // var bp = new BloomPass(scene, camera);
    // composer.addPass(bp);
    composer.passes[composer.passes.length - 1].renderToScreen = true;
  }

  function update (dt = 0) {
    // update time
    app.time += dt;
    // tick controls
    updateControls();
  }

  function render () {
    if (showFPS) stats.begin();
    if (composer.isActive()) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    if (showFPS) stats.end();
  }

  function updateControls () {
    // update camera controls
    controls.update();
    camera.position.fromArray(controls.position);
    camera.up.fromArray(controls.up);
    target.fromArray(controls.direction).add(camera.position);
    camera.lookAt(target);
  }

  function resize () {
    // 3840x2160
    const width = window.innerWidth;
    const height = window.innerHeight;

    app.width = width;
    app.height = height;
    renderer.setSize(app.width, app.height);

    const dpr = renderer.getPixelRatio();
    targets.forEach(t => {
      t.setSize(app.width * dpr, app.height * dpr);
    });

    composer.passes.forEach(pass => {
      if (pass.uniforms && pass.uniforms.resolution) {
        pass.uniforms.resolution.value.set(width, height);
      }
    });

    // Update camera matrices
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function createRenderTarget (opt = {}) {
    var target = opt.mrt
      ? new THREE.WebGLMultiRenderTarget(window.innerWidth, window.innerHeight)
      : new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

    // MSAA is not working out so well with depth texture etc...
    // new THREE.WebGLMultisampleRenderTarget(window.innerWidth, window.innerHeight);
    // target.samples = samples || 0;
    target.texture.minFilter = THREE.LinearFilter;
    target.texture.magFilter = THREE.LinearFilter;
    target.texture.format = opt.mrt ? THREE.RGBAFormat : THREE.RGBFormat;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = false;
    target.depthBuffer = true;
    target.name = 'renderTarget' + (names++);

    if (opt.depthTexture) {
      target.depthTexture = new THREE.DepthTexture();
      target.depthTexture.image = {
        width: target.width,
        height: target.height,
        data: null
      };
      target.depthTexture.generateMipmaps = false;
      target.depthTexture.minFilter = THREE.NearestFilter;
      target.depthTexture.magFilter = THREE.NearestFilter;
      target.depthTexture.format = THREE.DepthFormat;
      // target.depthTexture.type = THREE.UnsignedShortType;
      target.depthTexture.type = THREE.UnsignedShortType;
    }
    return target;
  }

  function createComposer () {
    const rt1 = createRenderTarget();
    const rt2 = createRenderTarget();
    var initialTarget = createRenderTarget({ depthTexture: true });
    // rtInitial.depthTexture = new THREE.DepthTexture();
    return new EffectComposer(renderer, rt1, rt2, initialTarget);
  }
}
