precision mediump float;

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tBloomDiffuse;
uniform vec2 resolution;

void main () {
  vec4 blurred = texture2D(tBloomDiffuse, vUv);
  vec4 rgba = texture2D(tDiffuse, vUv);
  // gl_FragColor = vec4(rgba.rgb + clamp(blurred.rgb - rgba.rgb, 0.0, 1.0) * 10.0, 1.0);
  gl_FragColor = vec4(rgba.rgb + clamp(blurred.rgb - rgba.rgb, 0.0, 1.0) * 4.0, 1.0);
}
