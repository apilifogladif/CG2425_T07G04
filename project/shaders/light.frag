precision mediump float;

uniform float uFlashing;
varying float vPulse;

void main() {
    vec3 color = (uFlashing > 0.5)
        ? vec3(vPulse, vPulse, 0.0) * 2.0  
        : vec3(0.4); 
    gl_FragColor = vec4(color, 1.0);
}
