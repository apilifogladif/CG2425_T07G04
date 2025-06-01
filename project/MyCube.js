import {CGFappearance, CGFobject, CGFtexture} from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";

/**
 * MyCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyCube extends CGFobject {
    constructor(scene) {
        super(scene);
    }
    
    display() {
        this.quad = new MyQuad(this.scene);
            // Front face
            this.scene.pushMatrix();
            this.scene.translate(0, 0, 0.5);
            this.quad.display();
            this.scene.popMatrix();
            
            // Back face
            this.scene.pushMatrix();
            this.scene.translate(0, 0, -0.5);
            this.scene.rotate(Math.PI, 0, 1, 0);
            this.quad.display();
            this.scene.popMatrix();
            
            // Left face
            this.scene.pushMatrix();
            this.scene.translate(-0.5, 0, 0);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.quad.display();
            this.scene.popMatrix();
            
            // Right face
            this.scene.pushMatrix();
            this.scene.translate(0.5, 0, 0);
            this.scene.rotate(Math.PI/2, 0, 1, 0);
            this.quad.display();
            this.scene.popMatrix();
            
            // Top face
            this.scene.pushMatrix();
            this.scene.translate(0, 0.5, 0);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.quad.display();
            this.scene.popMatrix();
            
            // Bottom face
            this.scene.pushMatrix();
            this.scene.translate(0, -0.5, 0);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.quad.display();
            this.scene.popMatrix();
        
    }
}

