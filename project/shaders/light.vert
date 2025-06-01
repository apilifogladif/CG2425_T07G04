precision mediump float;

attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;
uniform float uFlashing;
varying float vPulse;

void main() {
    vPulse = (uFlashing > 0.5) 
        ? (1.0 + 0.15 * abs(sin(6.2831 * uTime)))
        : 1.0;
    vec3 scaledPosition = aVertexPosition * vPulse; 
    gl_Position = uPMatrix * uMVMatrix * vec4(scaledPosition, 1.0);
}
