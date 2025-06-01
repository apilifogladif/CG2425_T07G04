import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyWindow } from "./MyWindow.js";
import { MyBuilding } from "./MyBuilding.js"; 
import { MyTree } from "./MyTree.js"; 
import { MyForest } from './MyForest.js';
import { MyHeli } from './MyHeli.js'; 
import { MyLake } from './MyLake.js';
import { MyFire } from './MyFire.js';

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    
    // Initialize the display variables
    this.displayAxis = false;
    this.displayPlane = true;
    this.displaySphere = false;
    this.displayPanorama = true;
    this.displayWindow = false;
    this.displayBuilding = true;
    this.displayTree = false;
    this.displayForest = true;
    this.displayHelicopter = true;
    this.displayLake = true;
    this.displayFire = false;

    // Building position
    this.xH = -30;
    this.zH = -60;
    this.buildingFloorHeight = 5;
    this.buildingSideFloors = 3;
    this.buildingHeight = this.buildingFloorHeight * (this.buildingSideFloors + 1);
    this.buildingWidth = 40;
    this.windowsPerFloor = 2;
    this.buildingColor = { r: 153, g: 153, b: 153 }; 

    // Lake position
    this.xL = -50;
    this.lakeRadius = 20;
    this.zL = 0;
  }
  
  init(application) {
    super.init(application);
    this.startTime = null;
    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.setUpdatePeriod(60);

    //Initialize scene objects
    this.axis = new CGFaxis(this, 40, 1);
    this.plane = new MyPlane(this, 64);
    this.sphere = new MySphere(this, 10, 20, 20);
    this.panorama = new MyPanorama(this, 30, 40, 200);
    this.window = new MyWindow(this);

    this.HTexture = new CGFtexture(this, "textures/H.png");
    this.helipadUpTexture = new CGFtexture(this, "textures/up.png");
    this.helipadDownTexture = new CGFtexture(this, "textures/down.png");
    
    this.createBuilding(); 
    const crownColor = [0.2,0.6,0.2];
    this.tree = new MyTree(this, 0, 'X', 1.5, 30, crownColor, 4);
    this.forest = new MyForest(this, 5, 4, 40, 40);
    this.helicopter = new MyHeli(this, this.xH, this.zH, this.buildingHeight, this.xL, this.zL, this.lakeRadius);
    this.lake = new MyLake(this, 50, this.lakeRadius);
    this.fire = new MyFire(this);

    // Create materials
    this.planeMaterial = new CGFappearance(this);
    this.planeMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.planeMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.planeMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.planeMaterial.setShininess(10.0);

    this.sphereMaterial = new CGFappearance(this);
    this.sphereMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.sphereMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.sphereMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.sphereMaterial.setShininess(10.0);

    this.panoramaMaterial = new CGFappearance(this);
    this.panoramaMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.panoramaMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.panoramaMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.panoramaMaterial.setShininess(10.0);

    this.windowMaterial = new CGFappearance(this);
    this.windowMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.windowMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.windowMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.windowMaterial.setShininess(10.0);

    this.doorMaterial = new CGFappearance(this);
    this.doorMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.doorMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.doorMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.doorMaterial.setShininess(10.0);

    this.HMaterial = new CGFappearance(this);
    this.HMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.HMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.HMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.HMaterial.setShininess(10.0);

    this.bombeirosMaterial = new CGFappearance(this);
    this.bombeirosMaterial.setAmbient(0.5, 0.5, 0.5, 1);
    this.bombeirosMaterial.setDiffuse(0.7, 0.7, 0.7, 1);
    this.bombeirosMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.bombeirosMaterial.setShininess(10.0);

    this.bucketMaterial = new CGFappearance(this);
    this.bucketMaterial.setAmbient(0.3, 0.2, 0.1, 1.0);
    this.bucketMaterial.setDiffuse(0.6, 0.4, 0.2, 1.0);
    this.bucketMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
    this.bucketMaterial.setShininess(10.0);

    this.upperBucketMaterial = new CGFappearance(this);
    this.upperBucketMaterial.setAmbient(0.05, 0.05, 0.025, 1.0);
    this.upperBucketMaterial.setDiffuse(0.10, 0.05, 0.06, 1.0);
    this.upperBucketMaterial.setSpecular(0.05, 0.05, 0.05, 1.0);
    this.upperBucketMaterial.setShininess(5.0);

    this.waterMaterial = new CGFappearance(this);
    this.waterMaterial.setAmbient(0.02, 0.02, 0.05, 0.9);
    this.waterMaterial.setDiffuse(0.05, 0.05, 0.1, 0.9);
    this.waterMaterial.setSpecular(0.1, 0.1, 0.15, 1.0);
    this.waterMaterial.setShininess(80.0);

    this.metalMaterial = new CGFappearance(this);
    this.metalMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
    this.metalMaterial.setDiffuse(0.2, 0.2, 0.2, 1.0);
    this.metalMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
    this.metalMaterial.setShininess(200.0);

    this.defaultMaterial = new CGFappearance(this);
    this.defaultMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.defaultMaterial.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.defaultMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.defaultMaterial.setShininess(10.0);

    this.trunkMaterial = new CGFappearance(this);
    this.trunkMaterial.setAmbient(0.2, 0.1, 0.05, 1.0);
    this.trunkMaterial.setDiffuse(0.3, 0.15, 0.05, 1.0);
    this.trunkMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.trunkMaterial.setShininess(5.0);

    this.bodyMaterial = new CGFappearance(this);
    this.bodyMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
    this.bodyMaterial.setDiffuse(0.4, 0.4, 0.4, 1.0);
    this.bodyMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.bodyMaterial.setShininess(80.0);

    this.detailMaterial = new CGFappearance(this);
    this.detailMaterial.setAmbient(0.8, 0.8, 0.8, 1.0);
    this.detailMaterial.setDiffuse(0.9, 0.9, 0.9, 1.0);
    this.detailMaterial.setSpecular(0.7, 0.7, 0.7, 1.0);
    this.detailMaterial.setShininess(100.0);

    this.bladesMaterial = new CGFappearance(this);
    this.bladesMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
    this.bladesMaterial.setDiffuse(0.2, 0.2, 0.2, 1.0);
    this.bladesMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
    this.bladesMaterial.setShininess(200.0);

    this.cockpitMaterial = new CGFappearance(this);
    this.cockpitMaterial.setAmbient(0.5, 0.5, 0.5, 0.7);
    this.cockpitMaterial.setDiffuse(0.7, 0.7, 0.7, 0.4);
    this.cockpitMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
    this.cockpitMaterial.setShininess(150.0);

    this.cableMaterial = new CGFappearance(this);
    this.cableMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
    this.cableMaterial.setDiffuse(0.2, 0.2, 0.2, 1.0);
    this.cableMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
    this.cableMaterial.setShininess(200.0);

    this.crownMaterial = new CGFappearance(this);
    const [r, g, b] = crownColor;
    this.crownMaterial.setAmbient (r*0.5, g*0.5, b*0.5, 1.0);
    this.crownMaterial.setDiffuse (r,     g,     b,     1.0);
    this.crownMaterial.setSpecular(0.1,   0.1,   0.1,   1.0);
    this.crownMaterial.setShininess(10.0);
    
    this.planeTexture = new CGFtexture(this, "textures/grass.png");
    this.sphereTexture = new CGFtexture(this, "textures/earth.jpg");
    this.panoramaTexture = new CGFtexture(this, "textures/panorama.jpg");
    this.windowTexture = new CGFtexture(this, "textures/window.png");
    this.doorTexture = new CGFtexture(this, "textures/door.png");
    this.bombeirosTexture = new CGFtexture(this, "textures/bombeiros.png");
    this.bucketTexture = new CGFtexture(this, "textures/bucket.jpg");
    this.waterTexture = new CGFtexture(this, "textures/water.jpg");
    this.glassTexture = new CGFtexture(this, "textures/glass.jpg");
    this.bucketTexture = new CGFtexture(this, "textures/bucket.jpg");
    this.waterTexture = new CGFtexture(this, "textures/water.jpg");
    this.bodyTexture = new CGFtexture(this, "textures/heli_body.jpg");
    this.glassTexture = new CGFtexture(this, "textures/glass.jpg");
    this.cableTexture = new CGFtexture(this, "textures/cable.jpg");

    this.trunkMaterial.loadTexture("textures/tree_bark.jpg");
    this.trunkMaterial.setTextureWrap('REPEAT', 'REPEAT');
    this.crownMaterial.loadTexture("textures/tree_leaves.jpg");
    this.crownMaterial.setTextureWrap('REPEAT', 'REPEAT');
    
    this.planeMaterial.setTexture(this.planeTexture);
    this.sphereMaterial.setTexture(this.sphereTexture);
    this.panoramaMaterial.setTexture(this.panoramaTexture);
    this.windowMaterial.setTexture(this.windowTexture);
    this.doorMaterial.setTexture(this.doorTexture);
    this.HMaterial.setTexture(this.HTexture);
    this.bombeirosMaterial.setTexture(this.bombeirosTexture);
    this.bucketMaterial.setTexture(this.bucketTexture);
    this.waterMaterial.setTexture(this.waterTexture);
    this.upperBucketMaterial.setTexture(this.bucketTexture);
    this.bodyMaterial.setTexture(this.bodyTexture);
    this.cockpitMaterial.setTexture(this.glassTexture);
    this.cableMaterial.setTexture(this.cableTexture);

    this.shader = new CGFshader(this.gl, "shaders/fire.vert", "shaders/fire.frag");
  }
  
  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }
  initCameras() {
    this.camera = new CGFcamera(
      0.5,
      0.1,
      1000,
      vec3.fromValues(-30, 100, 200),
      vec3.fromValues(0, 0, 0)
    );
  }
  checkKeys() {
    var text = "Keys pressed: ";
    var keysPressed = false;

    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW") && this.helicopter.isFlying())
      this.helicopter.accelerate(0.05);
    if (this.gui.isKeyPressed("KeyS") && this.helicopter.isFlying())
      this.helicopter.accelerate(-0.05);
    if (this.gui.isKeyPressed("KeyA") && this.helicopter.isFlying())
      this.helicopter.turn(0.05);
    if (this.gui.isKeyPressed("KeyD") && this.helicopter.isFlying())
      this.helicopter.turn(-0.05);
    if (this.gui.isKeyPressed("KeyR"))
      this.helicopter.reset();
    if (this.gui.isKeyPressed("KeyP")) {
      this.helicopter.takeOff();
    }
    if (this.gui.isKeyPressed("KeyL")) {
      this.helicopter.land();
    }
    if (this.gui.isKeyPressed("KeyO")) {
      if (this.helicopter.inFlight) {
        this.helicopter.startFireFighting(this.forest);
      }
    }

    if (keysPressed)
      console.log(text);
  }

  update(t) {
    if (this.startTime === null)
      this.startTime = t;
    this.time = (t - this.startTime) / 1000.0;
    this.checkKeys();
    // Update helicopter rotors
    if (this.displayHelicopter) {
      this.helicopter.update(50);
    }
    this.building.update(t);
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }
  
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation)
    this.updateProjectionMatrix();
    this.loadIdentity();
    
    const MAX_RADIUS = 200;
    const MIN_HEIGHT = 5;

    const cameraPos = this.camera.position;
    const radius = Math.sqrt(
      cameraPos[0] * cameraPos[0] + 
      cameraPos[1] * cameraPos[1] + 
      cameraPos[2] * cameraPos[2]
    );

    // Clamp the distance while preserving direction
    if (radius > MAX_RADIUS) {
      const scale = MAX_RADIUS / radius;
      cameraPos[0] *= scale;
      cameraPos[1] *= scale;
      cameraPos[2] *= scale;
    }

    // Enforce minimum height (Y axis only)
    if (cameraPos[1] < MIN_HEIGHT) {
      cameraPos[1] = MIN_HEIGHT;
    }

    
    this.applyViewMatrix();

    // Draw axis
    if (this.displayAxis) {
      this.axis.display();
    }

    // Plane with texture
    if (this.displayPlane) {
      this.planeMaterial.apply();
      this.pushMatrix();
      this.scale(400, 1, 400);
      this.rotate(-Math.PI / 2, 1, 0, 0);
      this.plane.display();
      this.popMatrix();
    }
    
    // Sphere with texture
    if (this.displaySphere) {
      this.sphereMaterial.apply();
      this.pushMatrix();
      this.rotate(Math.PI, 1, 0, 0);
      this.rotate(-13 * Math.PI / 16, 0, 1, 0);
      this.translate(0, -30, 0);
      this.sphere.display();
      this.popMatrix();
    }

    // Panorama with texture
    if (this.displayPanorama) {
      this.panoramaMaterial.apply();
      this.pushMatrix();
      this.rotate(Math.PI, 1, 0, 0);
      this.rotate(-13 * Math.PI / 16, 0, 1, 0);
      this.panorama.display();
      this.popMatrix();
    }

    if (this.displayWindow) {
      this.windowMaterial.apply();
      this.pushMatrix();
      this.translate(0, 10, 0); 
      this.scale(5, 5, 1); 

      // Window visible from both sides
      this.gl.disable(this.gl.CULL_FACE);
      this.window.display();
      this.gl.enable(this.gl.CULL_FACE);

      this.popMatrix();
    }
    
    if (this.displayBuilding) {
      this.pushMatrix();
      this.translate(this.xH, 0, this.zH);
      this.building.display();
      this.popMatrix();
    }

    if (this.displayTree) {
      this.pushMatrix();
      this.tree.display();
      this.popMatrix();
    }    

    if (this.displayForest) {
      this.defaultMaterial.apply();
      this.pushMatrix();
      this.forest.display();
      this.popMatrix();
    }
    
    if (this.displayHelicopter) {
      this.defaultMaterial.apply();
      this.pushMatrix();
      // this.scale(2, 2, 2); 
      this.helicopter.display();
      this.popMatrix();
    }

    if (this.displayLake) {
      this.pushMatrix();
      this.translate(this.xL, 0.1, this.zL);  
      this.lake.display();
      this.popMatrix();
    }

    if (this.displayFire) {
      this.pushMatrix();
      this.translate(20, 0, -20); 
      this.fire.display();
      this.popMatrix();
    }
    
    this.defaultMaterial.apply();
      
  }

  createBuilding() {
    this.buildingHeight = this.buildingFloorHeight * (this.buildingSideFloors + 1);
    const colorArray = this.buildingColor 
      ? [this.buildingColor.r / 255, this.buildingColor.g / 255, this.buildingColor.b / 255]
      : [0.6, 0.6, 0.6]; 
    this.building = new MyBuilding(this, this.buildingWidth, this.buildingFloorHeight, this.buildingSideFloors, this.windowsPerFloor, colorArray, this.HTexture, this.helipadUpTexture, this.helipadDownTexture);
  }

  updateBuilding() {
    this.createBuilding();
    if (this.helicopter) {
      this.helicopter.buildingHeight = this.buildingHeight;
      this.helicopter.yH = this.buildingHeight;
      this.helicopter.Hposition = vec3.fromValues(this.xH + 1.8, this.buildingHeight, this.zH);
      if (!this.helicopter.inFlight) {
        this.helicopter.position = vec3.fromValues(this.xH, this.buildingHeight + 1.8, this.zH);
      }
    }
  }
}
