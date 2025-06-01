import {CGFobject} from '../lib/CGF.js';
import {MyCircle} from './MyCircle.js';

/**
* MyCone
* @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 * @param stacks - number of divisions along the Y axis
 * @param bottomDisplay - boolean to control if the bottom is displayed (default: false)
*/
export class MyCone extends CGFobject {
    constructor(scene, slices, stacks, bottomDisplay = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.bottomDisplay = bottomDisplay;
        
        // Create circle object for bottom
        this.bottom = new MyCircle(scene, slices);
        
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2*Math.PI/this.slices;

        for(var i = 0; i < this.slices; i++){
            const x = Math.cos(ang);
            const z = -Math.sin(ang);
            this.vertices.push(Math.cos(ang), 0, -Math.sin(ang));
            this.indices.push(i, (i+1) % this.slices, this.slices);
            this.normals.push(Math.cos(ang), Math.cos(Math.PI/4.0), -Math.sin(ang));
            this.texCoords.push(i / this.slices, 1);
            ang+=alphaAng;
        }
        this.vertices.push(0,1,0);
        this.normals.push(0,1,0);
        this.texCoords.push(0.5, 0)

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of slices
     */
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity);

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
    
    display() {
        // Display the cone body
        this.scene.pushMatrix();
        super.display();
        this.scene.popMatrix();
        
        // Display bottom circle if enabled
        if (this.bottomDisplay) {
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI, 0, 1, 0);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.bottom.display();
            this.scene.popMatrix();
        }
    }
}


