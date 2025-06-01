import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = new Float32Array([
            -1, 0, 0,	//0
            1, 0, 0,	//1
            0, 1, 0,	//2
        ]);

        this.indices = new Uint16Array([
            0, 1, 2,
        ]);

        this.normals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ]);

        this.texCoords = new Float32Array([
            0.0, 1.0,  // A
            1.0, 1.0,  // B
            0.5, 0.0   // C
        ]);


        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

