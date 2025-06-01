import { CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyCircle } from './MyCircle.js';

export class MyLake extends MyCircle {
    constructor(scene, slices, radius) {
        super(scene, slices, radius);

        this.lakeMaterial = new CGFappearance(scene);
        this.lakeMaterial.setAmbient(0.1, 0.1, 0.3, 1.0);
        this.lakeMaterial.setDiffuse(0.2, 0.2, 0.8, 1.0);
        this.lakeMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.lakeMaterial.setShininess(50.0);
        this.lakeMaterial.setTexture(new CGFtexture(scene, 'textures/water.jpg'));
    }

    display() {
        this.scene.pushMatrix();
        this.lakeMaterial.apply();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        super.display();
        this.scene.popMatrix();
    }
}
