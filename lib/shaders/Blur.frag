precision highp float;

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 direction;

#pragma glslify: blur = require('glsl-fast-gaussian-blur/5');

void main () {
  vec3 blurred = blur(tDiffuse, vUv, resolution, direction).rgb;
  // blurred += blur(tDiffuse, vUv, resolution, direction * 2.0).rgb * 0.25;
  // blurred += blur(tDiffuse, vUv, resolution, direction * 4.0).rgb * 0.125;
  gl_FragColor.rgb = blurred;
  gl_FragColor.a = 1.0;
  // gl_FragColor = texture2D(tDiffuse, vUv);
}
