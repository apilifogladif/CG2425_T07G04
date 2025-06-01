import {CGFobject} from '../lib/CGF.js';
import {MyCircle} from './MyCircle.js';

/**
* MyCylinder
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of divisions around the Y axis
* @param stacks - number of divisions along the Y axis
* @param topDisplay - boolean to control if the top is displayed (default: false)
* @param bottomDisplay - boolean to control if the bottom is displayed (default: false)
*/
export class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks, topDisplay = false, bottomDisplay = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.topDisplay = topDisplay;
        this.bottomDisplay = bottomDisplay;
        
        // Create circle objects for top and bottom
        this.top = new MyCircle(scene, slices);
        this.bottom = new MyCircle(scene, slices);
        
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2 * Math.PI / this.slices;

        // Generate vertices, indices and normals
        for (var stack = 0; stack <= this.stacks; stack++) {
            var stackHeight = stack / this.stacks;

            for (var slice = 0; slice <= this.slices; slice++) {
                // For each slice, we generate a vertex at the corresponding angle
                ang = slice * alphaAng;

                // Vertex position
                this.vertices.push(Math.cos(ang), stackHeight, -Math.sin(ang));

                // Normal - perpendicular to the axis of the cylinder
                this.normals.push(Math.cos(ang), 0, -Math.sin(ang));

                // Texture coordinates
                this.texCoords.push(slice / this.slices, stackHeight);

                // Generate indices
                if (stack < this.stacks && slice < this.slices) {
                    var current = stack * (this.slices + 1) + slice;
                    var next = current + (this.slices + 1);

                    this.indices.push(current, current + 1, next);
                    this.indices.push(current + 1, next + 1, next);
                }
            }
        }

        // If top and bottom are not displayed, make the cylinder visible from inside
        if (!this.topDisplay || !this.bottomDisplay) {
            const vertexCount = this.vertices.length / 3;

            // Duplicate vertices and invert normals
            for (let i = 0; i < vertexCount; i++) {
                this.vertices.push(this.vertices[i * 3], this.vertices[i * 3 + 1], this.vertices[i * 3 + 2]);
                this.normals.push(-this.normals[i * 3], -this.normals[i * 3 + 1], -this.normals[i * 3 + 2]);
                this.texCoords.push(this.texCoords[i * 2], this.texCoords[i * 2 + 1]);
            }

            // Duplicate and reverse indices for the inner side
            const indexCount = this.indices.length;
            for (let i = 0; i < indexCount; i += 3) {
                this.indices.push(
                    this.indices[i + 2] + vertexCount,
                    this.indices[i + 1] + vertexCount,
                    this.indices[i] + vertexCount
                );
            }
        }

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
        // Display the cylinder body
        this.scene.pushMatrix();
        super.display();
        this.scene.popMatrix();
        
        // Display top circle if enabled
        if (this.topDisplay) {
            // Display top circle facing up
            this.scene.pushMatrix();
            this.scene.translate(0, 1, 0);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.top.display();
            this.scene.popMatrix();
            
            // Display top circle facing down
            this.scene.pushMatrix();
            this.scene.translate(0, 1, 0);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.top.display();
            this.scene.popMatrix();
        }
        
        // Display bottom circle if enabled
        if (this.bottomDisplay) {
            // Display bottom circle facing down
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.bottom.display();
            this.scene.popMatrix();
            
            // Display bottom circle facing up
            this.scene.pushMatrix();
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.bottom.display();
            this.scene.popMatrix();
        }
    }
}
