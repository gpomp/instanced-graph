var glslify = require('glslify');

var INSTANCES = 6500;
module.exports = function (app, opts) {
  var mesh = new THREE.Mesh(buildGeometry(), getMaterial());
  var uniforms = mesh.material.uniforms;

  return {
    object3d: mesh,
    update: () => {
      uniforms.time.value += 0.0001;
    }
  }

  function buildGeometry () {
    var geometry = new THREE.InstancedBufferGeometry();
    
    var spheres = 1;

    geometry.maxInstancedCount = INSTANCES;

    var sphereBufferGeom = new THREE.SphereBufferGeometry(1);

    var position = sphereBufferGeom.attributes.position.clone();
    var uv = sphereBufferGeom.attributes.uv.clone();
    var normal = sphereBufferGeom.attributes.normal.clone();

    geometry.addAttribute('position', position);
    geometry.addAttribute('uv', uv);
    geometry.addAttribute('normal', normal);

    var indices = new Uint16Array(sphereBufferGeom.index.count);

    for (var i = 0; i < sphereBufferGeom.index.array.length; i++) {
      indices[i] = sphereBufferGeom.index.array[i];
    }

    geometry.setIndex(new THREE.BufferAttribute( indices, 1 ));

    var offsets = new THREE.InstancedBufferAttribute( new Float32Array(INSTANCES * 3), 3, 1 );

    for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
      var x = Math.random();
      var y = Math.random();
      var z = 0.5 + Math.random() * 0.5;
      // move out at least 5 units from center in current direction
      offsets.setXYZ( i, x, y, z );
    }

    geometry.addAttribute( 'offset', offsets );

    var indexGeom = new THREE.InstancedBufferAttribute( new Float32Array(INSTANCES * 1), 1, 1 );
    for ( var i = 0, ul = indexGeom.count; i < ul; i++ ) {
      indexGeom.array[i] = i;
    }

    console.log(indexGeom);

    geometry.addAttribute('indexInst', indexGeom);

    return geometry;
  }

  function getMaterial () {
    var graphSource = new THREE.TextureLoader().load('images/texture/graph-source.png', () => {
      graphSource.minFilter = THREE.NearestFilter;
      graphSource.magFilter = THREE.NearestFilter;
      graphSource.needsUpdate = true;
    });
    return new THREE.RawShaderMaterial({
      vertexShader: glslify('../shaders/graph.vert'),
      fragmentShader: glslify('../shaders/graph.frag'),
      uniforms: {
        time: {
          type: 'f',
          value: 0
        },
        total: {
          type: 'f',
          value: INSTANCES
        },
        graphSource: {
          type: 't',
          value: graphSource
        }
      }
    });
  }
}
