var glslify = require('glslify');

// var INSTANCES = 42500;
module.exports = function (app, opts) {
  var nbInstances = opts.instances;
  var ctn = new THREE.Object3D();
  var mesh = new THREE.Mesh(buildGeometry(), getMaterial());
  var uniforms = mesh.material.uniforms;
  ctn.add(mesh);

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

    var sphereBufferGeom;

    switch(opts.type) {
      case 'sphere':
        sphereBufferGeom = new THREE.SphereBufferGeometry(1, 5, 6);
      break;
      case 'box':
        sphereBufferGeom = new THREE.BoxBufferGeometry(1, 2.5, 1);
      break;
      default:
        sphereBufferGeom = new THREE.ConeBufferGeometry(1, 2.5, 3);
      break;
    }

    var position = sphereBufferGeom.attributes.position.clone();
    var uv = sphereBufferGeom.attributes.uv.clone();

    geometry.addAttribute('position', position);
    geometry.addAttribute('uv', uv);

    var indices = new Uint16Array(sphereBufferGeom.index.count);

    for (var i = 0; i < sphereBufferGeom.index.array.length; i++) {
      indices[i] = sphereBufferGeom.index.array[i];
    }

    geometry.setIndex(new THREE.BufferAttribute( indices, 1 ));

    var offsets = new THREE.InstancedBufferAttribute( new Float32Array(nbInstances * 3), 3, 1 );

    for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
      var x = Math.random();
      var y = Math.random();
      var z = 0.5 + Math.random() * 0.5;
      // move out at least 5 units from center in current direction
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
    /*var graphSource = new THREE.TextureLoader().load('images/texture/graph-source.png', () => {
      graphSource.minFilter = THREE.NearestFilter;
      graphSource.magFilter = THREE.NearestFilter;
      graphSource.needsUpdate = true;
    });*/
    /*var data = [];
    for (var i = 0; i < 128 * 2 * 3; i+=3) {
      var c = Math.floor(Math.random() * 255);
      data.push(c, c, c);
    }

    var graphSource = new THREE.DataTexture(Uint8Array.from(data), 128, 1, THREE.RGBFormat);
    graphSource.needsUpdate = true;*/
    /*var test = new THREE.Mesh(new THREE.PlaneBufferGeometry(128 * 2 * 3, 3),
      new THREE.MeshBasicMaterial({ map: graphSource, color: 0xFF0000 }));
    ctn.add(test);
    */

    return new THREE.RawShaderMaterial({
      vertexShader: glslify('../shaders/graph.vert'),
      fragmentShader: glslify('../shaders/graph.frag'),
      uniforms: {
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
      },
      // transparent: true,
      // blending: THREE.AdditiveBlending
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
