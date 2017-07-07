const getBox = require('./getBox');
const getGraph = require('./getGraph');
const query = require('../util/query');
module.exports = function ({ app, components }) {
  if (!query.gui) {
    const ui = document.querySelector('.dg.ac');
    ui.style.display = 'none';
  } else {
    const ui = document.querySelector('.dg.ac');
    ui.style.zIndex = 1000;
  }
  // const box = components.add(getBox(app));
  const graph = components.add(getGraph(app, {}));

};
