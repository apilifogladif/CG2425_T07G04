import {CGFobject} from '../lib/CGF.js';
/**
* MyCircle
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of divisions around the circle
* @param radius - radius of the circle (default: 1)
*/
export class MyCircle extends CGFobject {
    constructor(scene, slices, radius = 1) {
        super(scene);
        this.slices = slices;
        this.radius = radius;
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
    
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);
    
        var ang = 0;
        var alphaAng = 2*Math.PI/this.slices;
    
        for(var i = 0; i <= this.slices; i++){
            this.vertices.push(this.radius * Math.cos(ang), this.radius * Math.sin(ang), 0);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5 + Math.cos(ang)/2, 0.5 - Math.sin(ang)/2);
            
            if (i < this.slices) {
                this.indices.push(0, i+1, i+2);
            }
            
            ang += alphaAng;
        }
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
}
