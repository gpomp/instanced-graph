var glslify = require('glslify');
const objectAssign = require('object-assign');

// var INSTANCES = 42500;
module.exports = function (app, opts) {
  var nbInstances = opts.instances;
  var ctn = new THREE.Object3D();
  var mesh = new THREE.Mesh(buildGeometry(), getMaterial());
  var uniforms = mesh.material.uniforms;
  ctn.add(mesh);
  mesh.castShadow = true;

  return {
    object3d: ctn,
    update: () => {
      uniforms.time.value += 0.0001;
      uniforms.timeFast.value += 0.01;
    },
    material: mesh.material,
    uniforms: uniforms
  }

  function buildGeometry () {
    var geometry = new THREE.InstancedBufferGeometry();
    
    var spheres = 1;

    geometry.maxInstancedCount = nbInstances;
    var size = new THREE.Vector3(1 + Math.random(), 1 + Math.random(), 1 + Math.random());
    var boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    boxGeometry.vertices.forEach(v => {
      v.x += -size.x * 0.4 + Math.random() * size.x * 0.8;
      v.y += -size.y * 0.4 + Math.random() * size.y * 0.8;
      v.z += -size.z * 0.4 + Math.random() * size.z * 0.8;
    })
    boxGeometry.verticesNeedsUpdate = true;
    var sphereBufferGeom = new THREE.BufferGeometry();
    sphereBufferGeom.fromGeometry(boxGeometry);

    var position = sphereBufferGeom.attributes.position.clone();
    var uv = sphereBufferGeom.attributes.uv.clone();

    geometry.addAttribute('position', position);
    geometry.addAttribute('uv', uv);

    var offsets = new THREE.InstancedBufferAttribute( new Float32Array(nbInstances * 3), 3, 1 );

    for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
      var x = Math.random();
      var y = Math.random();
      var z = 0.5 + Math.random() * 0.5;
      offsets.setXYZ( i, x, y, z );
    }

    geometry.addAttribute( 'offset', offsets );

    var indexGeom = new THREE.InstancedBufferAttribute( new Float32Array(nbInstances * 1), 1, 1 );
    for ( var i = 0, ul = indexGeom.count; i < ul; i++ ) {
      indexGeom.array[i] = i;
    }

    geometry.addAttribute('indexInst', indexGeom);

    return geometry;
  }

  function getMaterial () {
    var defines = { NUM_CLIPPING_PLANES: 0, PHONG: true };
    var extensions = { derivatives: true };
    return new THREE.ShaderMaterial({
      vertexShader: glslify('../shaders/graph.vert'),
      fragmentShader: glslify('../shaders/graph.frag'),
      extensions: extensions,
      defines: defines,
      lights: true,
      shading: THREE.FlatShading,
      uniforms: objectAssign({},
        THREE.UniformsLib.common,
        THREE.UniformsLib.aomap,
        THREE.UniformsLib.lightmap,
        THREE.UniformsLib.emissivemap,
        THREE.UniformsLib.bumpmap,
        THREE.UniformsLib.normalmap,
        THREE.UniformsLib.displacementmap,
        THREE.UniformsLib.gradientmap,
        THREE.UniformsLib.fog,
        THREE.UniformsLib.lights,
        {
          ambientColor: {
            type: 'v3',
            value: new THREE.Vector3(0, 0, 0)
          },
          emissive: {
            type: 'v3',
            value: new THREE.Vector3(0.1, 0.1, 0.1)
          },
          specular: {
            type: 'v3',
            value: new THREE.Vector3(0.6, 0.6, 0.6)
          },
          shininess: {
            type: 'f',
            value: 1
          },
          time: {
            type: 'f',
            value: 1000 + Math.random() * 1000
          },
          timeFast: {
            type: 'f',
            value: 1000 + Math.random() * 1000
          },
          total: {
            type: 'f',
            value: nbInstances
          },
          graphSource: {
            type: 't',
            value: opts.graphSource
          },
          length: opts.gui.length,
          uScale: opts.gui.uScale,
          rad: opts.gui.rad,
          amplitude: opts.gui.amplitude,
          textureWidth: opts.gui.textureWidth
  // transparent: true,
  // blending: THREE.AdditiveBlending
      })
    });
  }

  /*function getData () {
    var width = 128;
    var height = 1;
    var pixelData = [];
    for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const r = Math.floor();
      pixelData.push(r, r, r);
    }
  }
  }*/
}
