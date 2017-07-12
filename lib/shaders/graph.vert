#pragma glslify: snoise2 = require(glsl-noise/classic/2d)
#define M_PI 3.1415926535897932384626433832795

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

  varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform float timeFast;
uniform float total;
uniform sampler2D graphSource;
uniform sampler2D noiseTexture;

uniform float fade;
uniform float rad;
uniform float length;
uniform float uScale;
uniform float amplitude;
uniform float textureWidth;

attribute vec3 offset;
attribute float indexInst;

varying float vPerc;
varying float vGraphPos;
varying float vTime;
varying float vReveal;

mat4 rotationMatrix(vec3 axis, float angle)
{
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  
  return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
              0.0,                                0.0,                                0.0,                                1.0);
}

void main() {

  #include <uv_vertex>
  #include <uv2_vertex>
  #include <color_vertex>

  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>

  float percTex = textureWidth;
  float perc = indexInst / total;
  vPerc = perc;
  vTime = mod(time * clamp(offset.x, 0.1, 1.0) + perc, 1.0);
  vReveal = clamp(smoothstep(max(0.0, vTime - 0.2), vTime, fade), 0.0, 1.0);
  float timeFastMod = mod(timeFast, 1.0);
  float timeReg = (vTime * 2.0 - 1.0);
  vec3 noiseImage = texture2D(noiseTexture, vec2(vTime, offset.x * perc)).rgb;
  float z = timeReg * length;
  float curr = floor((vTime + 1.0 / percTex) * percTex) / percTex;
  float prev = floor(vTime * percTex) / percTex;
  float next = vTime + 0.001;
  float currT = texture2D(graphSource, vec2(curr, 0.0)).r;
  float prevT = texture2D(graphSource, vec2(prev, 0.0)).r;
  float nextT = texture2D(graphSource, vec2(next, 0.0)).r;
  float percT = (vTime - prev) / (curr - prev);
  // float graphPos = smoothstep(prevT, currT, (vTime - prev) / (curr - prev)) * 2.0 - 1.0;
  vGraphPos = mix(prevT, currT, percT);

  float noise = snoise2(vec2(z, offset.x * time) * 0.1);
  float scale = offset.y * ((noise + 1.0) * 0.5) * uScale * smoothstep(0.01, 0.02, vTime) * smoothstep(0.99, 0.98, vTime);
  float radius = rad;
  float depY = -radius / 2.0 + sin(timeFast + (offset.x * 2.0 - 1.0) * 4.0) * offset.z * radius * noise;
  float posY = (vGraphPos * 2.0 - 1.0) * amplitude + depY;
  float nPosY = (nextT * 2.0 - 1.0) * amplitude + depY;
  float angle = atan(nPosY - posY, 2.0);

  vec4 orientation = rotationMatrix(vec3(1.0, 0, 0), angle)[2].xyzw;
  vec3 vcV = cross(orientation.xyz, position);
  transformed = position * vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + position) * (scale + (1.0 - vReveal) * scale * 3.0);
  float noiseLength = length * 3.0;
  vec3 floating = vec3((noiseImage.r * 2.0 - 1.0) * noiseLength, noiseLength / 2.0 + (noiseImage.g * 2.0 - 1.0) * noiseLength, -(noiseImage.b * 2.0 - 1.0) * noiseLength);
  vec3 destination = mix(floating, vec3(-radius / 2.0 + cos(timeFast + (offset.x * 2.0 - 1.0) * 4.0) * offset.z * radius * noise, posY, z), vReveal);
  transformed = transformed + destination;
  // pos = pos
  vec4 sPos = modelViewMatrix * vec4(transformed,1.0);

  #include <displacementmap_vertex>
  #include <morphtarget_vertex>

  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>

  vViewPosition = -mvPosition.xyz;

  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>

}
