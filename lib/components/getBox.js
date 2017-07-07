module.exports = function (app) {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 'red',
    depthTest: false,
    depthWrite: false
  });
  const box = new THREE.Mesh(geom, mat);
  box.frustumCulled = false;
  box.position.set(0, 0, 0);
  box.scale.set(10, 10, 10);

  return {
    object3d: box,

    update (dt, state) {

    }
  };
};
