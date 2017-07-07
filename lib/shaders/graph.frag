#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float time;

varying float vPerc;
varying vec3 vPos;

const vec3 lightPos   = vec3(200,60,100);
const vec3 ambientColor = vec3(0.2, 0.0, 0.2);
const vec3 diffuseColor = vec3(0.5, 0.8, 0.0);
const vec3 specColor  = vec3(1.0, 1.0, 1.0);

void main() {
  vec3 normal = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 lightDir = normalize(lightPos - vPos);

  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {
    vec3 viewDir = normalize(-vPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, 16.0);
  }


  gl_FragColor = vec4(ambientColor + lambertian * diffuseColor + specular * specColor, 1.0);
}

  
