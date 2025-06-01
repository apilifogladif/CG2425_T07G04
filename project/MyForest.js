import { CGFobject } from '../lib/CGF.js';
import { MyTree } from './MyTree.js';
import { MyFire } from './MyFire.js';

export class MyForest extends CGFobject {
  /**
   * @param {CGFscene} scene
   * @param {number} rows      
   * @param {number} cols      
   * @param {number} width      
   * @param {number} depth      
   */
  constructor(scene, rows = 5, cols = 4, width = 40, depth = 40) {
    super(scene);

    this.rows = rows;
    this.cols = cols;
    this.width = width;
    this.depth = depth;

    this.cellW = this.width / this.cols;
    this.cellD = this.depth / this.rows;

    this.ranges = {
      angleDeg:   { min: -10, max: 10 },
      radius:     { min: 1.5, max: 2.0 },
      height:     { min: 20,  max: 35  },
      pyramids:   { min: 2,  max: 6    }
    };

    const fire = new MyFire(scene, 3, 5, 4, 0);

    this.fires = [];
    for (let i = 0; i < 2; i++) { 
      const x = (Math.random() - 0.5) * this.width;
      const z = (Math.random() - 0.5) * this.depth;
      this.fires.push({ fire: fire, x, z }); 
    }

    this._generateTrees();
  }

  updateForest() {
    this.cellW = this.width / this.cols;
    this.cellD = this.depth / this.rows;

    this._generateTrees();

    this.fires = [];
    const fire = new MyFire(this.scene, 3, 5, 4, 0);
    for (let i = 0; i < 2; i++) { 
      const x = (Math.random() - 0.5) * this.width;
      const z = (Math.random() - 0.5) * this.depth;
      this.fires.push({ fire: fire, x, z }); 
    }
  }

  _generateTrees() {
    this.trees = [];

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const baseX = (j + 0.5) * this.cellW - this.width / 2;
        const baseZ = (i + 0.5) * this.cellD - this.depth / 2;

        let tries = 0;
        let success = false;

        while (!success && tries < 50) {
          const angleDeg = this._randRange(this.ranges.angleDeg);
          const axis = Math.random() < 0.5 ? 'X' : 'Z';
          const angleRad = angleDeg * Math.PI / 180;
          const radius = this._randRange(this.ranges.radius);
          const height = this._randRange(this.ranges.height);
          const pyramids = Math.floor(this._randRange(this.ranges.pyramids));
          const color = [
              this._randRange({ min: 0.0, max: 0.3 }),
              this._randRange({ min: 0.4, max: 0.8 }),
              this._randRange({ min: 0.0, max: 0.3 }),
            ];
          const hasFire = Math.random() < 0.5;

          const dx = height * Math.sin(angleRad);

          if (dx + radius <= Math.min(this.cellW, this.cellD) / 2) {
            const tree = new MyTree(this.scene, angleDeg, axis, radius, height, color, pyramids, hasFire);
            this.trees.push({ tree, x: baseX, z: baseZ });
            success = true;
          }

          tries++;
        }
      }
    }
  }

  _randRange({ min, max }) {
    return min + Math.random() * (max - min);
  }

  display() {
    this.scene.pushMatrix();
    for (const {tree, x, z} of this.trees) {
      this.scene.pushMatrix();
      this.scene.translate(x, 0, z);
      tree.display();
      this.scene.popMatrix();
    }
    for (const {fire, x, z} of this.fires) {
      if (!fire.extinguished) {
        this.scene.pushMatrix();
        this.scene.translate(x, 0, z);
        fire.display();
        this.scene.popMatrix();
      }
    }

    this.scene.popMatrix();
  }

}
