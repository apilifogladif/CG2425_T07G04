import {CGFappearance, CGFobject, CGFtexture,  CGFshader } from "../lib/CGF.js";
import { MyCube } from "./MyCube.js";
import { MyWindow } from "./MyWindow.js";
import { MyDoor } from "./MyDoor.js";
import { MyCircle } from "./MyCircle.js";
import { MyRectangle } from "./MyRectangle.js";
import { MySphere } from "./MySphere.js";

/**
 * MyBuilding
 * @constructor
 * @param scene 
 * @param totalWidth - Total width of the building (all three modules)
 * @param floorHeight - Height of each floor
 * @param sideFloors - Number of floors in side modules (central has +1)
 * @param windowsPerFloor - Number of windows per floor
 * @param buildingColor - RGB color array for building
 * @param defaultHelipadTexture - Texture for the default helipad state
 * @param upHelipadTexture - Texture for the helipad 'UP' state
 * @param downHelipadTexture - Texture for the helipad 'DOWN' state
 */
export class MyBuilding extends CGFobject {
    constructor(scene, totalWidth, floorHeight, sideFloors, windowsPerFloor, buildingColor, defaultHelipadTexture, upHelipadTexture, downHelipadTexture) {
        super(scene);
        this.scene = scene;
        this.totalWidth = totalWidth;
        this.sideFloors = sideFloors;
        this.centralFloors = sideFloors + 1; 
        this.windowsPerFloor = windowsPerFloor;
        this.buildingColor = buildingColor;
        this.floorHeight = floorHeight;
        
        this.centralWidth = totalWidth / 2.5;
        this.sideWidth = this.centralWidth * 0.75;
        this.centralDepth = this.centralWidth; 
        this.sideDepth = this.centralDepth * 0.75; 
        this.forwardOffset = 1.0; 
        
        this.initMaterials();
        
        this.cube = new MyCube(this.scene);
        this.cube.initBuffers();

        this.window = new MyWindow(this.scene);
        this.window.initBuffers();

        this.door = new MyDoor(this.scene);
        this.door.initBuffers();

        this.circle = new MyCircle(this.scene, 20, this.centralWidth * 0.75 / 2);
        this.circle.initBuffers();

        this.rectangle = new MyRectangle(this.scene);
        this.rectangle.initBuffers();

        this.defaultTexture = defaultHelipadTexture;
        this.upTexture = upHelipadTexture;
        this.downTexture = downHelipadTexture;

        this.lightShader = new CGFshader(scene.gl, "shaders/light.vert", "shaders/light.frag");
        this.lightShader.setUniformsValues({ 
            uTime: 0.0,
            uFlashing: 0.0, 
            uIntensity: 5.0,  
            uPulseSpeed: 3.0 
        });

        this.cornerSphere = new MySphere(scene, 10, 10);
        this.isManeuvering = false;
        this.maneuverType = null;
        this.mixFactor = 0.0;             // For helipad shader
        this.maneuverTypeForShader = 0;   // 0: default, 1: UP, 2: DOWN for helipad shader

        // Helipad Shader
        this.helipadShader = new CGFshader(this.scene.gl, "shaders/helipad.vert", "shaders/helipad.frag");
        this.helipadShader.setUniformsValues({
            texDefault: 0, // Texture unit 0
            texUp: 1,      // Texture unit 1
            texDown: 2,    // Texture unit 2
            uMixFactor: this.mixFactor,
            uManeuverType: this.maneuverTypeForShader
        });
    }
    
    initMaterials() {
        this.buildingMaterial = new CGFappearance(this.scene);
        this.buildingMaterial.setAmbient(this.buildingColor[0], this.buildingColor[1], this.buildingColor[2], 1.0);
        this.buildingMaterial.setDiffuse(this.buildingColor[0], this.buildingColor[1], this.buildingColor[2], 1.0);
        this.buildingMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.buildingMaterial.setShininess(10.0);

        this.HMaterial = new CGFappearance(this.scene);
        this.HMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.HMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.HMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.HMaterial.setShininess(10.0);
    }
    
    update(t) {
        if (this.isManeuvering) {
            if (this.scene.helicopter.landing || this.scene.helicopter.ascending) {
                this.mixFactor = (Math.sin(t / 250.0) + 1.0) / 2.0; 
                if (this.maneuverType === "UP") {
                    this.maneuverTypeForShader = 1; 
                } else if (this.maneuverType === "DOWN") {
                    this.maneuverTypeForShader = 2; 
                } else {
                    this.maneuverTypeForShader = 0; 
                    this.mixFactor = 0.0;
                }
            } else {
                this.isManeuvering = false;
                this.maneuverTypeForShader = 0; 
                this.mixFactor = 0.0;        
                this.maneuverType = null;     
            }
        } else {
            this.maneuverTypeForShader = 0; 
            this.mixFactor = 0.0;       
        }

        this.helipadShader.setUniformsValues({
            uMixFactor: this.mixFactor,
            uManeuverType: this.maneuverTypeForShader
        });

        const distToLake = Math.sqrt(
            Math.pow(this.scene.helicopter.position[0] - this.scene.helicopter.lakePosition[0], 2) + 
            Math.pow(this.scene.helicopter.position[2] - this.scene.helicopter.lakePosition[2], 2)
        );

        const isFlashingLights = (this.scene.helicopter.landing || this.scene.helicopter.ascending) && !(distToLake < this.scene.helicopter.lakeRadius);
        this.lightShader.setUniformsValues({ 
            uTime: t / 1000.0, 
            uFlashing: isFlashingLights ? 1.0 : 0.0, 
            uIntensity: isFlashingLights ? 10.0 : 2.0,
            uPulseSpeed: isFlashingLights ? 5.0 : 1.0
        });
    }

    display() {
        this.scene.windowMaterial.apply();

        const zSideModuleCenter = this.forwardOffset - (this.centralDepth / 2) + (this.sideDepth / 2);
    
        const leftPos = (this.totalWidth - this.sideWidth) / 2;
        const rightPos = -leftPos;
    
        const maxWindowSize = Math.min(this.sideWidth, this.centralWidth) * 0.20;
        
        const sideWindowSize = Math.min(maxWindowSize, (this.sideWidth * 0.8) / this.windowsPerFloor);
        const centralWindowSize = Math.min(maxWindowSize, (this.centralWidth * 0.8) / this.windowsPerFloor);
        
        const sideSpacing = (this.sideWidth - (sideWindowSize * this.windowsPerFloor)) / (this.windowsPerFloor + 1);
        const centralSpacing = (this.centralWidth - (centralWindowSize * this.windowsPerFloor)) / (this.windowsPerFloor + 1);
    
        const minWindowOffset = this.floorHeight * 0.3; 
        const windowYOffset = Math.max(minWindowOffset, this.floorHeight * 0.5); 
        const doorYOffset = this.floorHeight * 0.25;
    
        const maxDoorSize = Math.min(maxWindowSize * 1.5, this.centralWidth * 0.25, this.floorHeight * 0.6);
        const signScale = Math.min(this.centralWidth * 0.15, maxDoorSize * 0.8); 

        // LEFT SIDE
        if (this.sideFloors > 0) {
            for (let floor = 0; floor < this.sideFloors; floor++) {
                for (let w = 0; w < this.windowsPerFloor; w++) {
                    const xPos = leftPos - this.sideWidth/2 + sideSpacing * (w + 1) + sideWindowSize * (w + 0.5);
                    const yPos = floor * this.floorHeight + windowYOffset;
                    this.scene.pushMatrix();
                    this.scene.translate(xPos, yPos, zSideModuleCenter + this.sideDepth / 2 + 0.1);
                    this.scene.scale(sideWindowSize, sideWindowSize, 0.1);
                    this.window.display();
                    this.scene.popMatrix();
                }
            }
        }

        // CENTRAL 
        for (let floor = 0; floor < this.centralFloors; floor++) {
            if (floor === 0) {
                const doorXPos = 0;
                const doorYPos = floor * this.floorHeight + doorYOffset;
                const doorHeight = this.floorHeight * 0.5;
                const doorSize = maxDoorSize; 

                // BOMBEIROS SIGN 
                this.scene.bombeirosMaterial.apply();
                this.scene.pushMatrix();
                this.scene.translate(doorXPos, doorYPos + doorHeight + 0.2, this.forwardOffset + this.centralDepth / 2 + 0.1);
                this.scene.scale(signScale * 0.6, signScale * 0.3, 1);
                this.rectangle.display();
                this.scene.popMatrix();
                
                // DOOR
                this.scene.doorMaterial.apply();
            
                this.scene.pushMatrix();
                this.scene.translate(doorXPos, doorYPos, this.forwardOffset + this.centralDepth / 2 + 0.1);
                this.scene.scale(doorSize, doorSize, 0.1);
                this.door.display();
                this.scene.popMatrix();
            
                this.scene.windowMaterial.apply();
                continue;
            }
    
            for (let w = 0; w < this.windowsPerFloor; w++) {
                const xPos = -this.centralWidth/2 + centralSpacing * (w + 1) + centralWindowSize * (w + 0.5);
                const yPos = floor * this.floorHeight + windowYOffset;
                this.scene.pushMatrix();
                this.scene.translate(xPos, yPos, this.forwardOffset + this.centralDepth / 2 + 0.1);
                this.scene.scale(centralWindowSize, centralWindowSize, 0.1);
                this.window.display();
                this.scene.popMatrix();
            }
        }
    
        // RIGHT SIDE 
        if (this.sideFloors > 0) {
            for (let floor = 0; floor < this.sideFloors; floor++) {
                for (let w = 0; w < this.windowsPerFloor; w++) {
                    const xPos = rightPos - this.sideWidth/2 + sideSpacing * (w + 1) + sideWindowSize * (w + 0.5);
                    const yPos = floor * this.floorHeight + windowYOffset;
                    this.scene.pushMatrix();
                    this.scene.translate(xPos, yPos, zSideModuleCenter + this.sideDepth / 2 + 0.1);
                    this.scene.scale(sideWindowSize, sideWindowSize, 0.1);
                    this.window.display();
                    this.scene.popMatrix();
                }
            }
        }

        this.scene.pushMatrix();
        this.scene.translate(0, this.centralFloors * this.floorHeight + 0.1, this.forwardOffset);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        
        this.scene.setActiveShader(this.helipadShader);
        
        this.defaultTexture.bind(0);
        this.upTexture.bind(1);
        this.downTexture.bind(2);

        this.circle.display();

        this.scene.setActiveShader(this.scene.defaultShader); 

        this.scene.popMatrix();

        
        this.scene.setActiveShader(this.lightShader);
        const cornerOffsetX = this.centralWidth / 2 - 0.3;
        const cornerOffsetZ = this.centralDepth / 2 - 0.3;
        const yOffset = this.centralFloors * this.floorHeight;
        
        const positions = [
            [cornerOffsetX, yOffset, cornerOffsetZ + this.forwardOffset],
            [-cornerOffsetX, yOffset, cornerOffsetZ + this.forwardOffset],
            [cornerOffsetX, yOffset, -cornerOffsetZ + this.forwardOffset],
            [-cornerOffsetX, yOffset, -cornerOffsetZ + this.forwardOffset],
        ];

        if (!this.lightMaterial) {
            this.lightMaterial = new CGFappearance(this.scene);
            this.lightMaterial.setEmission(1.0, 1.0, 0.0, 1.0); 
            this.lightMaterial.setAmbient(0, 0, 0, 1);
            this.lightMaterial.setDiffuse(0, 0, 0, 1);
            this.lightMaterial.setSpecular(0, 0, 0, 1);
        }

        this.lightMaterial.apply();

        for (const pos of positions) {
            this.scene.pushMatrix();
            this.scene.translate(...pos);
            const isFlashing = this.scene.helicopter.landing || this.scene.helicopter.ascending;
            const scaleFactor = isFlashing 
                ? (0.2 + 0.08 * Math.abs(Math.sin(Date.now() / 800))) 
                : 0.2; 
            this.scene.scale(scaleFactor, scaleFactor, scaleFactor);
            this.cornerSphere.display();
            this.scene.popMatrix();
        }
        this.scene.setActiveShader(this.scene.defaultShader);
    
        this.buildingMaterial.apply();
    
        if (this.sideFloors > 0) {
            this.scene.pushMatrix();
            this.scene.translate(leftPos, this.sideFloors * this.floorHeight / 2, zSideModuleCenter);
            this.scene.scale(this.sideWidth, this.sideFloors * this.floorHeight, this.sideDepth);
            this.cube.display();
            this.scene.popMatrix();
        }
    
        // CENTRAL MODULE
        this.scene.pushMatrix();
        this.scene.translate(0, this.centralFloors * this.floorHeight / 2, this.forwardOffset);
        this.scene.scale(this.centralWidth, this.centralFloors * this.floorHeight, this.centralDepth);
        this.cube.display();
        this.scene.popMatrix();
    
        if (this.sideFloors > 0) {
            this.scene.pushMatrix();
            this.scene.translate(rightPos, this.sideFloors * this.floorHeight / 2, zSideModuleCenter);
            this.scene.scale(this.sideWidth, this.sideFloors * this.floorHeight, this.sideDepth);
            this.cube.display();
            this.scene.popMatrix();
        }
    }
}
