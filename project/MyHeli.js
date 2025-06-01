import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyCone } from './MyCone.js';
import { MyCylinder } from './MyCylinder.js';
import { MyBucket } from './MyBucket.js';

export class MyHeli extends CGFobject {
  constructor(scene, xH, zH, yH, xLake, zLake, lakeRadius) {
    super(scene);

    this.hasWater = false;

    // Detailed components
    this.body = new MySphere(scene, 60, 60);
    this.tailBoom = new MyCylinder(scene, 40, 1, true, true);
    this.tailFin = new MyCone(scene, 20, 1, true);
    this.engineHousing = new MySphere(scene, 20, 20);
    this.mainRotorHub = new MySphere(scene, 12, 12);
    this.mainRotorBlade = new MyCylinder(scene, 10, 1, true, true);
    this.tailRotorHub = new MySphere(scene, 10, 10);
    this.tailRotorBlade = new MyCylinder(scene, 8, 1, true, true);
    this.skid = new MyCylinder(scene, 12, 1, true, true);
    this.cockpit = new MySphere(scene, 30, 30);
    this.cable = new MyCylinder(scene, 20, 1, true, true);
    this.waterBucket = new MyBucket(scene, 20, 1, 0.4, 0.7, this.hasWater);

    // Animation properties
    this.mainRotorAngle = 0;
    this.tailRotorAngle = 0;
    this.rotationSpeed = 0;

    this.goingToLake = false;
    this.goingToH = false;

    // H position
    this.xH = xH;
    this.zH = zH;
    this.yH = yH;

    this.Hposition = vec3.fromValues(xH + 1.8, yH, zH);
    this.lakePosition = vec3.fromValues(xLake, 0, zLake);
    this.lakeRadius = lakeRadius;
    
    // Position, orientation and velocity
    this.position = vec3.fromValues(xH, yH + 1.8, zH);
    this.orientation = -Math.PI/2;
    this.velocity = vec3.fromValues(0, 0, 0);
    this.speedFactor = 1.0;
    this.cruiseAltitude = yH + 20; 
    this.inFlight = false;
    this.landing = false;
    this.ascending = false;
    this.incline = 0;

    this.fightingFires = false;
    this.targetFire = null;
    this.droppingWater = false;
    this.sprayingWater = false;

    this.waterDrops = [];
    this.maxWaterDrops = 50;
    this.createWaterDrops();


  }

  update(deltaTime) {
    const dt = deltaTime / 1000;
    this.cruiseAltitude = this.yH + 20;

    // Update rotors
    this.mainRotorAngle = (this.mainRotorAngle + this.rotationSpeed * dt) % (2 * Math.PI);
    this.tailRotorAngle = (this.tailRotorAngle + this.rotationSpeed * 2 * dt) % (2 * Math.PI);

    // Apply damping to velocity for smoother stopping
    const dampingFactor = 0.98;
    vec3.scale(this.velocity, this.velocity, dampingFactor);

    // Set velocity to zero if below a small threshold
    const velocityThreshold = 0.01;
    if (vec3.length(this.velocity) < velocityThreshold) {
        vec3.set(this.velocity, 0, 0, 0);
    }

    // Update position
    let scaledVel = vec3.create();
    vec3.scale(scaledVel, this.velocity, dt);
    vec3.add(this.position, this.position, scaledVel);

    const maxDistance = 190;
    const distToOrigin = Math.sqrt(this.position[0] ** 2 + this.position[2] ** 2);
    if (distToOrigin > maxDistance) {
      const scale = maxDistance / distToOrigin;
      this.position[0] *= scale;
      this.position[2] *= scale;
    }

    // Update the bucket animation
    this.waterBucket.update(deltaTime);

    // Stop small velocity shaking
    if (vec3.length(this.velocity) < 0.001) {
      vec3.set(this.velocity, 0, 0, 0);
    }
    if (Math.abs(this.incline) < 0.01)
      this.incline = 0;
    else if (this.incline > 0)
      this.incline -= 0.02;
    else if (this.incline < 0)
      this.incline += 0.02;
    
    // Continue the landing process if in landing mode
    if (this.landing) {
      this.continueLandingProcess();
    }
    
    // Continue the ascent process if in ascending mode
    if (this.ascending) {
      this.continueAscendingProcess();
    }

    if (this.fightingFires && this.targetFire) {
      this.handleFireFightingProcess(deltaTime);
    }

    if (this.sprayingWater && this.hasWater && this.isInForest()) {
        for (let drop of this.waterDrops) {
            drop.y -= drop.speed * (deltaTime / 1000);
            if (drop.y <= -this.position[1]) {
                drop.y = -2.5;
                drop.x = (Math.random() - 0.5) * 1.5;
                drop.z = (Math.random() - 0.5) * 1.5;
                drop.speed = 8 + Math.random() * 4;
            }
        }
    }

    if (this.target != null && ((this.targetFire.type === 'ground' && this.targetFire.ref.intensity === 0) ||
        (this.targetFire.type === 'tree' && !this.targetFire.ref.hasFire))) {
          console.log("Target fire extinguished, nexting...");
        this.nextFireTarget();
    }
  }

  isInForest() {
    const forest = this.scene.forest;
    const heliPos = this.position;
    const offset = 5;
    return heliPos[0] >= -forest.width / 2 - offset && heliPos[0] <= forest.width / 2 + offset &&
           heliPos[2] >= -forest.depth / 2 - offset && heliPos[2] <= forest.depth / 2 + offset;
  }

  display() {

    this.scene.pushMatrix();
    this.scene.translate(...this.position);
    this.scene.rotate(this.orientation, 0, 1, 0);
    this.scene.rotate(this.incline, 0, 0, 1);

    // Main body
    this.scene.pushMatrix();
    this.scene.bodyMaterial.apply();
    this.scene.scale(2.2, 1.1, 1.1);
    this.body.display();
    this.scene.popMatrix();

    // Engine housing on top
    this.scene.pushMatrix();
    this.scene.detailMaterial.apply();
    this.scene.translate(0, 0.9, 0);
    this.scene.scale(0.8, 0.3, 0.8);
    this.engineHousing.display();
    this.scene.popMatrix();

    // Cockpit
    this.scene.pushMatrix();
    this.scene.cockpitMaterial.apply();
    this.scene.translate(1.2, 0.25, 0);
    this.scene.scale(1.0, 0.75, 0.85);
    this.cockpit.display();
    this.scene.popMatrix();

    // Tail boom
    this.scene.pushMatrix();
    this.scene.bodyMaterial.apply();
    this.scene.translate(-2.6, 0, 0);
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.scene.scale(0.15, 0.15, 3.4);
    this.tailBoom.display();
    this.scene.popMatrix();

    // Tail fin
    this.scene.pushMatrix();
    this.scene.bodyMaterial.apply();
    this.scene.translate(-6.1, 0.1, -0.1);
    this.scene.rotate(-Math.PI / 2, 0, 0, 1);
    this.scene.scale(1, 0.5, 0.1);
    this.tailFin.display();
    this.scene.popMatrix();

    // Main rotor hub
    this.scene.pushMatrix();
    this.scene.bladesMaterial.apply();
    this.scene.translate(0, 1.3, 0);
    this.scene.scale(0.35, 0.35, 0.35);
    this.mainRotorHub.display();
    this.scene.popMatrix();

    // Main rotor blades
    this.scene.pushMatrix();
    this.scene.bladesMaterial.apply();
    this.scene.translate(0, 1.3, 0);
    this.scene.rotate(this.mainRotorAngle, 0, 1, 0);
    for (let i = 0; i < 4; i++) {
      this.scene.pushMatrix();
      this.scene.rotate((Math.PI / 2) * i, 0, 1, 0);
      this.scene.rotate(Math.PI/2, 1, 0, 0);
      this.scene.scale(0.08, 7, 0.02);
      this.mainRotorBlade.display();
      this.scene.popMatrix();
    }
    this.scene.popMatrix();

    // Tail rotor hub
    this.scene.pushMatrix();
    this.scene.bladesMaterial.apply();
    this.scene.translate(-5.9, 0.1, 0.1);
    this.scene.scale(0.12, 0.12, 0.12);
    this.tailRotorHub.display();
    this.scene.popMatrix();

    // Tail rotor blades
    this.scene.pushMatrix();
    this.scene.bladesMaterial.apply();
    this.scene.translate(-5.9, 0.1, 0.1);
    this.scene.rotate(this.tailRotorAngle, 0, 0, 1);
    for (let i = 0; i < 4; i++) {
      this.scene.pushMatrix();
      this.scene.rotate((Math.PI / 2) * i, 0, 0, 1);
      this.scene.scale(0.04, 1.2, 0.015);
      this.tailRotorBlade.display();
      this.scene.popMatrix();
    }
    this.scene.popMatrix();

    // Supports
    this.scene.pushMatrix();
    this.scene.bodyMaterial.apply();
    [0.9, -0.9].forEach(z => {
      [0.7, -0.7].forEach(x => {
        this.scene.pushMatrix();
        this.scene.translate(x, -1.6, z);
        this.scene.rotate(- Math.PI * z / 7, 1, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.05, 1.4, 0.05);
        this.skid.display();
        this.scene.popMatrix();
      })
    });
    // Landing skids
    [0.9, -0.9].forEach(z => {
      this.scene.pushMatrix();
      this.scene.translate(1.5, -1.6, z);
      this.scene.rotate(Math.PI / 2, 0, 0, 1);
      this.scene.scale(0.05, 3, 0.05);
      this.skid.display();
      this.scene.popMatrix();
    });


    // Cable from the helicopter to the water bucket
    if (this.waterBucket.isVisible()) {
      const cableFactor = 1 - this.waterBucket.getPositionFactor();
      const cableLength = 1.5 * cableFactor;
      var cableVerticalOffset = 0;

      if (cableFactor == 1) cableVerticalOffset = -1.45 + (1 - cableFactor);
      else if (cableFactor == 3) cableVerticalOffset = -1.65 + (1 - cableFactor);
      else cableVerticalOffset = -1.57 + (1 - cableFactor);
      
      this.scene.pushMatrix();
      this.scene.cableMaterial.apply();
      this.scene.translate(0, cableVerticalOffset, 0);
      this.scene.scale(0.02, cableLength, 0.02);
      this.cable.display();
      this.scene.popMatrix();
    }

    // Water bucket
    this.scene.pushMatrix();
    // Position bucket based on its current animation position
    const bucketOffset = -2.5 * (1 - this.waterBucket.getPositionFactor());
    this.scene.translate(0, bucketOffset, 0);
    this.waterBucket.display();
    if (this.sprayingWater && this.hasWater && this.isInForest()) {
      this.scene.waterMaterial.apply();
      for (let drop of this.waterDrops) {
          this.scene.pushMatrix();
          this.scene.translate(drop.x, drop.y, drop.z);
          this.scene.scale(0.05, 0.8, 0.05);
          this.scene.rotate(Math.PI / 2, 1, 0, 0);
          this.cable.display();
          this.scene.popMatrix();
      }
    }
    this.scene.popMatrix();
    this.scene.popMatrix();
  }

  turn(v) {
    this.orientation += v * this.speedFactor;
    
    // Keep orientation in the range [0, 2π]
    this.orientation = this.orientation % (2 * Math.PI);
    if (this.orientation < 0) {
      this.orientation += 2 * Math.PI;
    }
    
    // Update velocity direction based on new orientation
    const norm = vec3.length(this.velocity);
    if (norm > 0.001) {
      this.velocity[0] = norm * Math.cos(this.orientation);
      this.velocity[2] = -norm * Math.sin(this.orientation);
    }
  }
  
  accelerate(v) {
    // Create a direction vector based on the helicopter's orientation
    const direction = vec3.create();

    direction[0] = Math.cos(this.orientation);
    direction[2] = -Math.sin(this.orientation);
    direction[1] = 0;
    
    // Scale the direction by the acceleration value and speed factor
    vec3.scale(direction, direction, v * this.speedFactor);
    
    // Add to current velocity
    vec3.add(this.velocity, this.velocity, direction);
    
    // Set the visual inclination based on acceleration
    this.incline = v > 0 ? -0.2 : (v < 0 ? 0.2 : this.incline);
  }
  
  takeOff() {
    this.inFlight = true;
    this.landing = false;
    this.ascending = true;
    this.goingToLake = false;
    this.goingToH = false;
    this.rotationSpeed = 5;
    this.velocity = vec3.fromValues(0, 0.2, 0);
    console.log("Taking off to cruise altitude: " + this.cruiseAltitude);

    const distToLake = Math.sqrt(
      Math.pow(this.position[0] - this.lakePosition[0], 2) + 
      Math.pow(this.position[2] - this.lakePosition[2], 2)
    );
    if (distToLake > this.lakeRadius) {
      this.scene.building.isManeuvering = true;
      this.scene.building.maneuverType = "UP";
    }
  }
  
  land() {
    // Only start the landing process
    this.landing = true;
    this.ascending = false;

    const distToLake = Math.sqrt(
      Math.pow(this.position[0] - this.lakePosition[0], 2) + 
      Math.pow(this.position[2] - this.lakePosition[2], 2)
    );
    if (distToLake < this.lakeRadius) {
      console.log("Landing over lake, preparing to collect water");
      this.goingToLake = true;
      this.goingToH = false;
    }
    else {
      this.goingToH = true;
      this.goingToLake = false;
      this.scene.building.isManeuvering = true;
      this.scene.building.maneuverType = "DOWN";
    }
  }
  
  // Ascending process until cruise altitude
  continueAscendingProcess() {
    if (this.position[1] < this.cruiseAltitude) {
      // Ensure the rotors are at proper speed
      if (this.rotationSpeed < 5) {
        this.rotationSpeed = 5;
      }
      
      this.elevate(0.5);
      
      // Ensure there's no horizontal movement during ascent
      this.velocity[0] = 0;
      this.velocity[2] = 0;
      
      this.waterBucket.move(-1);
    } else {
      // Reached cruise altitude
      this.position[1] = this.cruiseAltitude; // Ensure exact altitude
      
      // Stop vertical movement
      this.velocity[1] = 0;
      
      // Disable automatic ascent mode
      this.ascending = false;
      console.log("Reached cruise altitude: " + this.cruiseAltitude);
    }
  }
  
  // Function to manage the continuous landing process
  continueLandingProcess() {
    // Check if helicopter is over the lake
    const distToLake = Math.sqrt(
      Math.pow(this.position[0] - this.lakePosition[0], 2) + 
      Math.pow(this.position[2] - this.lakePosition[2], 2)
    );
    
    // Check distance to H landing pad
    const distToH = Math.sqrt(
      Math.pow(this.position[0] - this.xH, 2) + 
      Math.pow(this.position[2] - this.zH, 2)
    );
    
    // Over lake and doesn't have water yet - collect water
    if (!this.hasWater && distToLake < this.lakeRadius && this.goingToLake) {
      console.log("Over lake, beginning water collection process");
      
      // If not at water level, descend
      if (this.position[1] > this.lakePosition[1] + 4) {
        console.log("Centered over lake, descending to collect water");
        this.elevate(-0.5);

        // Extend bucket to collect water
        this.waterBucket.move(-2);
        
        // Slow down horizontal movement
        this.velocity[0] *= 0.8;
        this.velocity[2] *= 0.8;
      }
      // At water level, collect water
      else {
        console.log("At water level, collecting water");
        // Set position exactly at desired height
        this.position[1] = this.lakePosition[1] + 4;
        
        // Stop all movement to hover in place
        vec3.set(this.velocity, 0, 0, 0);
        
        this.hasWater = true;
        this.waterBucket.fillWater();
        console.log("Water collected from lake");
        
        // Stay at lake but change state
        this.goingToLake = false;
        this.landing = false;
        
      }
    } 
    // Move to H pad if we have water or want to land
    else if (distToH > 2.0 && this.goingToH) {
      // Guide helicopter towards H pad
      const dirToH = vec3.create();
      dirToH[0] = this.xH - this.position[0];
      dirToH[2] = this.zH - this.position[2];
      vec3.normalize(dirToH, dirToH);
      
      // Adjust orientation toward H pad
      const targetOrientation = Math.atan2(-dirToH[2], dirToH[0]);
      
      // Adjust orientation towards target with smoothing
      this.orientation = this.orientation * 0.9 + targetOrientation * 0.1;
      
      vec3.set(this.velocity, 0, 0, 0);
      const baseSpeed = 1;
      this.velocity[0] = Math.cos(this.orientation) * baseSpeed * this.speedFactor;
      this.velocity[2] = -Math.sin(this.orientation) * baseSpeed * this.speedFactor;
      
      // Adjust altitude using elevate with base value
      if (this.position[1] < this.yH + 3) {
        this.elevate(0.5);
      }
    } else if (distToH <= 2.0 && this.goingToH) {
      // Over H pad - handle bucket retraction before landing
      this.waterBucket.move(1); // Retract bucket
      
      // Now descend
      if (this.position[1] > this.yH + 1.8) {
        this.elevate(-0.5);
        vec3.scale(this.velocity, this.velocity, 0.9);
      } else {
        // Landed on H pad
        this.position[1] = this.yH + 1.8;
        vec3.set(this.velocity, 0, 0, 0);
        
        this.landing = false;
        this.inFlight = false;
        this.goingToH = false;
        this.rotationSpeed = 0;
        this.mainRotorAngle = 0;
        console.log("Landed on H pad");
      }
    }
  }
  
  // Function to move vertically adjusted to use speedFactor consistently
  elevate(v) {
    const direction = vec3.create();
    direction[0] = 0;
    direction[1] = v * this.speedFactor;
    direction[2] = 0;
    
    vec3.add(this.velocity, this.velocity, direction);
  }
  
  reset() {
    this.position = vec3.fromValues(this.xH, this.yH + 1.8, this.zH);
    this.orientation = -Math.PI/2;
    this.velocity = vec3.fromValues(0, 0, 0);
    this.inFlight = false;
    this.rotationSpeed = 0;
    this.mainRotorAngle = 0;
    this.landing = false;
    this.ascending = false;
    this.hasWater = false;
    this.waterBucket.move(1);
    this.waterBucket.emptyWater();
  }

  isFlying() {
    return this.inFlight;
  }

  startFireFighting(forest) {
    this.forest = forest;
    if (!this.hasWater) {
        console.log("No water in bucket!");
        return;
    }
    if (forest.fires.every(f => f.fire.intensity === 0) && forest.trees.every(t => !t.tree.hasFire)) {
        console.log("No fires found!");
        return;
    }
    this.fightingFires = true;
    this.sprayingWater = true;
    this.nextFireTarget();
    this.waterBucket.move(-2);
  }

  nextFireTarget() {
    if (this.forest.fires.every(f => f.fire.intensity === 0) && this.forest.trees.every(t => !t.tree.hasFire)) {
        console.log("All fires extinguished!");
        this.fightingFires = false;
        this.sprayingWater = false;
        this.hasWater = false;
        this.waterBucket.emptyWater();
        this.waterBucket.move(-1);
        return;
    }
    this.targetFire = null;
    let closestFire = null;
    let closestDist = Infinity;
    for (const f of this.forest.fires) {
      if (f.fire.intensity === 0) continue;
      const dist = Math.sqrt(
        Math.pow(this.position[0] - f.x, 2) +
        Math.pow(this.position[2] - f.z, 2)
      );
      if (dist < closestDist) {
        closestDist = dist;
        closestFire = { x: f.x, z: f.z, type: 'ground', ref: f.fire };
      }
    }
    for (const t of this.forest.trees) {
      if (t.tree.hasFire) {
        const dist = Math.sqrt(
          Math.pow(this.position[0] - t.x, 2) +
          Math.pow(this.position[2] - t.z, 2)
        );
        if (dist < closestDist) {
          closestDist = dist;
          closestFire = { x: t.x, z: t.z, type: 'tree', ref: t.tree };
        }
      }
    }
    if (!closestFire) {
        console.log("No fires found!");
        this.fightingFires = false;
        return;
    }
    this.targetFire = closestFire;
    this.sprayingWater = true;
    console.log("Targeting fire at", this.targetFire.x, this.targetFire.z);
  }

  handleFireFightingProcess(deltaTime) {
    if ((this.targetFire.type === 'ground' && this.targetFire.ref.intensity === 0) ||
        (this.targetFire.type === 'tree' && !this.targetFire.ref.hasFire)) {
        this.nextFireTarget();
        if (!this.targetFire) return; 
    }
    if (!this.targetFire) return;
    const fireX = this.targetFire.x;
    const fireZ = this.targetFire.z;
    const dirToFire = vec3.create();
    dirToFire[0] = fireX - this.position[0];
    dirToFire[2] = fireZ - this.position[2];
    vec3.normalize(dirToFire, dirToFire);
    const targetOrientation = Math.atan2(-dirToFire[2], dirToFire[0]);
    this.orientation = this.orientation * 0.9 + targetOrientation * 0.1;
    this.velocity[0] = Math.cos(this.orientation) * 1.5 * this.speedFactor;
    this.velocity[2] = -Math.sin(this.orientation) * 1.5 * this.speedFactor;
    this.position[1] = this.cruiseAltitude;
    this.velocity[1] = 0;
    this.checkForNearbyFires();
  }

  checkForNearbyFires() {
    if (!this.hasWater) return;

    for (const f of this.forest.fires) {
      if (f.fire.intensity === 0) continue;
      const dist = Math.sqrt(
        Math.pow(this.position[0] - f.x, 2) +
        Math.pow(this.position[2] - f.z, 2)
      );
      if (dist < 5.0) {
        console.log("Extinguished ground fire at", f.x, f.z);
        f.fire.intensity = 0;
        f.fire.extinguished = true;
        if (this.targetFire && this.targetFire.type === 'ground' && 
            this.targetFire.ref === f.fire) {
          this.nextFireTarget();
        }
      }
    }

    for (const t of this.forest.trees) {
      if (!t.tree.hasFire) continue;

      const dist = Math.sqrt(
        Math.pow(this.position[0] - t.x, 2) +
        Math.pow(this.position[2] - t.z, 2)
      );
      if (dist < 5.0) {
        console.log("Extinguished tree fire at", t.x, t.z);
        t.tree.hasFire = false;
        if (this.targetFire && this.targetFire.type === 'tree' && 
            this.targetFire.ref === t.tree) {
          this.nextFireTarget();
        }
      }
    }

    const remainingFires = this.forest.fires.some(f => f.fire.intensity > 0) ||
                      this.forest.trees.some(t => t.tree.hasFire);
    if (!remainingFires) {
      console.log("All fires extinguished!");
      this.fightingFires = false;
      this.sprayingWater = false;
      this.hasWater = false;
      this.waterBucket.emptyWater();
      this.waterBucket.move(-1);
      return;
    }
  }

  createWaterDrops() {
    for (let i = 0; i < this.maxWaterDrops; i++) {
        this.waterDrops.push({
            x: (Math.random() - 0.5) * 1.5,
            z: (Math.random() - 0.5) * 1.5,
            y: -2.5,
            speed: 8 + Math.random() * 4
        });
    }
  } 

}
