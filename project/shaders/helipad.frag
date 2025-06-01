precision mediump float;

uniform sampler2D texDefault;
uniform sampler2D texUp;
uniform sampler2D texDown;

uniform float uMixFactor;    
uniform int uManeuverType;

varying vec2 vTextureCoord;

void main() {
    vec4 defaultColor = texture2D(texDefault, vTextureCoord);
    vec4 finalColor = defaultColor;
    if (uManeuverType == 1) { // UP
        vec4 upColor = texture2D(texUp, vTextureCoord);
        finalColor = mix(defaultColor, upColor, uMixFactor);
    } else if (uManeuverType == 2) { // DOWN
        vec4 downColor = texture2D(texDown, vTextureCoord);
        finalColor = mix(defaultColor, downColor, uMixFactor);
    }
    gl_FragColor = finalColor;
}
