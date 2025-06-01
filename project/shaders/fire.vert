#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

varying vec2 vTextureCoord;
varying float vHeight;
varying float vFlicker;

void main() {
    float y = aVertexPosition.y;
    float normalizedHeight = y;
    float timeOffset = uTime * 3.0 + aVertexPosition.x * 2.0;
    float wave = sin(timeOffset) * 0.15 * normalizedHeight;
    float horizontal = sin(uTime * 4.0 + aVertexPosition.z) * 0.1 * normalizedHeight;
    vec3 displaced = aVertexPosition + vec3(
        horizontal,
        wave,
        horizontal * 0.5
    );
    gl_Position = uPMatrix * uMVMatrix * vec4(displaced, 1.0);
    vTextureCoord = aTextureCoord;
    vHeight = normalizedHeight;
    vFlicker = abs(sin(timeOffset * 0.5));
}
