import { CGFobject, CGFappearance, CGFshader } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

export class MyFire extends CGFobject {
  constructor(scene, baseRadius = 1.5, height = 5, intensity = 4, baseY = 0) {
    super(scene);
    
    this.baseRadius = baseRadius;
    this.height = height;
    this.intensity = intensity;
    this.baseY = baseY;

    this.triangle = new MyTriangle(scene);
  
    this.extinguished = false;
    this.flames = Array.from({ length: this.intensity }, () => {
      const angle = Math.random() * 2 * Math.PI;
      const radiusOffset = this.baseRadius * (0.8 + Math.random() * 0.3);
      return {
        x: Math.cos(angle) * radiusOffset,
        z: Math.sin(angle) * radiusOffset,
        heightOffset: Math.random() * this.height * 0.1,
        widthScale: 0.8 + Math.random() * 0.4,
        heightScale: 0.5 + Math.random() * 0.3,
        rotation: Math.random() * 2 * Math.PI,
      };
    });
  }

  display() {
    if (this.extinguished) return;
    
    const time = this.scene.time || 0;
    
    this.scene.setActiveShader(this.scene.shader);
    this.scene.shader.setUniformsValues({ uTime: time, uSampler: 0 });

    for (const flame of this.flames) {
      this.scene.pushMatrix();
      this.scene.translate(flame.x, this.baseY + flame.heightOffset, flame.z);
      this.scene.rotate(flame.rotation, 0, 1, 0);
      this.scene.scale(flame.widthScale, this.height * flame.heightScale, flame.widthScale);
      this.triangle.display();
      this.scene.popMatrix();
    }
    
    this.scene.setActiveShader(this.scene.defaultShader);
  }
}
