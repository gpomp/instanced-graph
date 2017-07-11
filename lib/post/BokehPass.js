const glslify = require('glslify');
const path = require('path');
const clamp = require('clamp');
const downsample = 2.0;
const maxSize = 2048;

module.exports = BokehPass;
function BokehPass ( scene, camera, params = {} ) {

  this.scene = scene;
  this.camera = camera;

  var focus = ( params.focus !== undefined ) ? params.focus : 0.3;
  var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
  var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.01;
  var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 0.5;

  // render targets

  this.renderTargetColor = new THREE.WebGLRenderTarget( 1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat
  } );

  // depth material

  // this.materialDepth = new THREE.MeshDepthMaterial();

  var bokehUniforms = {
    tColor: {
      type: 't',
      value: null
    },
    tDepth: {
      type: 't',
      value: params.tDepth
    },
    cameraNear: {
      type: 'f',
      value: camera.near
    },
    cameraFar: {
      type: 'f',
      value: camera.far
    },
    focus: {
      type: 'f',
      value: focus
    },
    aspect: {
      type: 'f',
      value: aspect
    },
    aperture: {
      type: 'f',
      value: aperture
    },
    maxblur: {
      type: 'f',
      value: maxblur
    }
  };

  this.materialBokeh = new THREE.RawShaderMaterial({
    uniforms: bokehUniforms,
    vertexShader: glslify(path.resolve(__dirname + '/../shaders/pass.vert')),
    fragmentShader: glslify(path.resolve(__dirname + '/../shaders/bokeh.frag'))
  });

  this.uniforms = bokehUniforms;

  this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene2 = new THREE.Scene();

  this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.materialBokeh);
  this.scene2.add(this.quad2);

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;

};

BokehPass.prototype = {

  constructor: THREE.BokehPass,

  _updateTargets: function (renderTarget) {
    var width = renderTarget.width;
    var height = renderTarget.height;
    var downWidth = clamp(Math.floor(width / downsample), 2, maxSize);
    var downHeight = clamp(Math.floor(height / downsample), 2, maxSize);
    if (!this.renderTargetColor) {      
      this.renderTargetColor = new THREE.WebGLRenderTarget(downWidth, downHeight);
      this.renderTargetColor.texture.minFilter = THREE.LinearFilter;
      this.renderTargetColor.texture.magFilter = THREE.LinearFilter;
      this.renderTargetColor.texture.generateMipmaps = false;
      this.renderTargetColor.depthBuffer = true;
      this.renderTargetColor.stencilBuffer = false;
    } else if (this.renderTargetColor.width !== width || this.renderTargetColor.height !== height) {
      this.renderTargetColor.setSize(downWidth, downHeight);
    }
  },

  render: function (renderer, writeBuffer, readBuffer) {
    this._updateTargets(readBuffer);

    // Render bokeh composite

    this.uniforms['tColor'].value = readBuffer.texture;

    if ( this.renderToScreen ) {

      renderer.render( this.scene2, this.camera2 );

    } else {

      renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

    }


  }

};
