#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float time;

varying float vPerc;
varying vec3 vPos;
varying float vGraphPos;
varying float vTime;

const vec3 lightPos   = vec3(100,100,100);
const vec3 ambientColor = vec3(0.1, 0.1, 0.1);
// const vec3 diffuseColor = vec3(0.8, 0.8, 0.8);
const vec3 specColor  = vec3(0.1);

void main() {
  vec3 normal = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 lightDir = normalize(lightPos - vPos);
  vec3 diffuseColor = vec3(vGraphPos, (vTime + vPerc) * 0.5, 1.0 - vGraphPos);
  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {
    vec3 viewDir = normalize(-vPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, 16.0);
  }


  gl_FragColor = vec4(ambientColor + lambertian * diffuseColor + specular * specColor, 1.0);
  // gl_FragColor = vec4(diffuseColor, 1.0);
}

  
