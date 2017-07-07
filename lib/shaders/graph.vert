#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

uniform float time;
uniform float total;
uniform sampler2D graphSource;

attribute vec3 position;
attribute vec3 offset;
attribute float indexInst;

varying float vPerc;
varying vec3 vPos;

void main(){
  float percTex = 128.0;
  float perc = indexInst / total;
  vPerc = perc;
  float time1 = mod(time + perc, 1.0);
  float timeReg = (time1 * 2.0 - 1.0);
  float z = timeReg * 800.0;
  float curr = floor((time1 + 1.0 / percTex) * percTex) / percTex;
  float prev = floor(time1 * percTex) / percTex;
  float currT = texture2D(graphSource, vec2(curr, 0.0)).r;
  float prevT = texture2D(graphSource, vec2(prev, 0.0)).r;
  // float graphPos = smoothstep(prevT, currT, (time1 - prev) / (curr - prev)) * 2.0 - 1.0;
  float graphPos = mix(prevT, currT, (time1 - prev) / (curr - prev)) * 2.0 - 1.0;

  float noise = snoise2(vec2(time * 10.0 * perc, offset.x));
  vec3 pos = position * (offset.y * 6.0 * noise) + vec3(noise * offset.z * 10.0, graphPos * 50.0, z);
  vec4 sPos = modelMatrix * vec4(pos,1.0);
  vPos =  sPos.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

}
