#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float vHeight;
varying float vFlicker;

uniform sampler2D uSampler;
uniform float uTime;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    vec3 bottomColor = vec3(1.0, 0.1, 0.0);   // Deep red
    vec3 middleColor = vec3(1.0, 0.4, 0.05);  // Orange
    vec3 topColor = vec3(1.0, 0.7, 0.2);      // Yellow-orange
    vec3 fireColor;
    if (vHeight < 0.5) {
        fireColor = mix(bottomColor, middleColor, vHeight * 2.0);
    } else {
        fireColor = mix(middleColor, topColor, (vHeight - 0.5) * 2.0);
    }
    float flicker = 0.9 + 0.1 * vFlicker;
    fireColor *= flicker;
    float alpha = 1.0 - vHeight * 0.5;
    alpha *= texColor.a;
    gl_FragColor = vec4(fireColor * texColor.rgb, alpha);
}
