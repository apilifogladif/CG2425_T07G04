import {CGFobject} from '../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param {MyScene} scene - Reference to MyScene object
 * @param {Array} coords - Array of texture coordinates (optional)
 */
export class MyRectangle extends CGFobject {
    constructor(scene, coords) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            -1.0, -0.35, 0,
             1.0, -0.35, 0,
            -1.0,  0.35, 0,
             1.0,  0.35, 0 
        ];
    
        // Rest of the method remains the same
        //Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];
    
        //Facing Z positive
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];
        
        this.texCoords = [
            0, 1,
            1, 1,
            0, 0,
            1, 0
        ]
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

