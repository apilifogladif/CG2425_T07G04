import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyCone } from './MyCone.js';
import { MyPyramid } from './MyPyramid.js';
import { MyFire } from './MyFire.js';

export class MyTree extends CGFobject {
  constructor(scene, inclinationAngleDeg = 0, inclinationAxis = 'X', trunkRadius = 1, treeHeight = 10, crownColor = [0.1, 0.3, 0.1], numPyramids = null, hasFire = false) {
    super(scene);

    this.inclinationAngle = inclinationAngleDeg * Math.PI / 180;
    this.inclinationAxis = inclinationAxis;
    this.trunkRadius = trunkRadius;
    this.treeHeight = treeHeight;
    this.hasFire = hasFire;

    this.trunkHeight = treeHeight * 0.2;
    this.crownHeight = treeHeight * 0.8;
    this.numPyramids = numPyramids !== null
                      ? numPyramids
                      : Math.max(1, Math.round(this.crownHeight / (this.trunkRadius * 2)));
    this.pyramidRadius = trunkRadius * 2;
    this.pyramidHeight = this.crownHeight / this.numPyramids;

    this.trunk = new MyCone(scene, 10, 10);
    this.pyramids = Array.from({ length: this.numPyramids }, () => new MyPyramid(scene, 6, 1));

    if (hasFire) {
      const fireHeight = this.crownHeight * 0.3;  
      this.fire = new MyFire(scene, this.trunkRadius * 0.7, fireHeight, 5, this.crownHeight * 0.15);
    }
  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0, -this.trunkHeight / 2, 0);

    if (this.inclinationAxis === 'X') {
      this.scene.rotate(this.inclinationAngle, 1, 0, 0);
    } else {
      this.scene.rotate(this.inclinationAngle, 0, 0, 1);
    }

    // Tronco
    this.scene.pushMatrix();
    this.scene.trunkMaterial.apply();
    this.scene.translate(0, this.trunkHeight / 2, 0);
    this.scene.scale(this.trunkRadius, this.trunkHeight, this.trunkRadius);
    this.trunk.display();
    this.scene.popMatrix();

    // Copa
    this.scene.crownMaterial.apply();
    for (let i = 0; i < this.numPyramids; i++) {
      this.scene.pushMatrix();
      const scale = 1 - (i / this.numPyramids) * 0.45;
      const currentRadius = this.pyramidRadius * scale;
      const currentHeight = currentRadius * (this.pyramidHeight / this.pyramidRadius);
      const yOffset = this.trunkHeight + i * this.pyramidHeight * 0.45;
      this.scene.translate(0, yOffset, 0);
      this.scene.scale(currentRadius, currentHeight, currentRadius);
      this.pyramids[i].display();
      this.scene.popMatrix();
    }
    this.scene.defaultMaterial.apply();

    // Fogo no topo da árvore
    if (this.hasFire) {
      const fireBaseHeight = this.trunkHeight + this.crownHeight * 0.25; 
      this.scene.pushMatrix();
      this.scene.translate(0, fireBaseHeight, 0);
      const fireScale = this.trunkRadius * 0.5; 
      this.scene.scale(fireScale, fireScale, fireScale);
      this.fire.display();
      this.scene.popMatrix();
    }
    this.scene.popMatrix();
  }
}
