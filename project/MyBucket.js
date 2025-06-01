import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';
import { MyCircle } from './MyCircle.js';

/**
 * MyBucket
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of divisions around the Y-axis
 * @param stacks - Number of divisions along the Y-axis
 * @param radius - Radius of the bucket (default: 1)
 * @param height - Height of the bucket (default: 1)
 */
export class MyBucket extends CGFobject {
    constructor(scene, slices, stacks, radius = 1, height = 1, hasWater) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.radius = radius;
        this.height = height;

        this.hasWater = hasWater;

        // Animation properties
        this.position = 1;           // 0: fully extended, 1: fully retracted/hidden, -2: collecting water
        this.targetPosition = 1;     // Target position for animation
        this.movementSpeed = 0.05;   // Movement speed per update

        // Bucket body, bottom, and water surface
        this.bucketBody = new MyCylinder(scene, slices, stacks, false, true);
        this.bucketHolder = new MyCylinder(scene, slices, stacks, false, false);
        this.upperSurface = new MyCircle(scene, slices, radius);
    }

    /**
     * Update the bucket position for animation
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    update(deltaTime) {
        const dt = deltaTime / 1000;
        
        // Smooth movement towards target position
        if (this.position < this.targetPosition) {
            this.position = Math.min(this.position + this.movementSpeed * dt * 10, this.targetPosition);
        } else if (this.position > this.targetPosition) {
            this.position = Math.max(this.position - this.movementSpeed * dt * 10, this.targetPosition);
        }
    }

    /**
     * Set bucket movement direction
     * @param {number} v - Direction: 1 to retract/hide, -1 to extend/show, -2 to collect water
     */
    move(v) {
        console.log("Moving bucket: " + v);
        if (v == -2) {
            this.targetPosition = -2; // For collecting water
        } else if (v > 0) {
            this.targetPosition = 1; // Fully retracted/hidden
        } else {
            this.targetPosition = 0; // Fully extended/visible
        }
    }

    /**
     * Get current visibility status of bucket
     * @returns {boolean} - True if bucket is visible (not fully retracted)
     */
    isVisible() {
        return this.position < 0.95;
    }

    /**
     * Get current position as a factor
     * @returns {number} - Position factor (0: extended, 1: retracted, -2: collecting water)
     */
    getPositionFactor() {
        return this.position;
    }

    display() {
        // Skip display if fully retracted
        if (this.position >= 0.99) return;
        
        // Calculate opacity based on position (fade out as it retracts)
        const opacity = 1.0 - this.position;
        
        // Display bucket body with fading effect
        this.scene.pushMatrix();
        this.scene.bucketMaterial.setDiffuse(0.6, 0.4, 0.2, opacity);
        this.scene.bucketMaterial.apply();
        
        // Apply position transformation for the bucket - move it down based on position
        const bucketYPosition = -this.position * this.height * 2;
        this.scene.translate(0, bucketYPosition, 0);
        
        this.scene.scale(this.radius, this.height, this.radius);
        this.bucketBody.display();
        this.scene.popMatrix();

        // Display water surface with fading effect
        if (this.hasWater) {
            this.scene.pushMatrix();
            this.scene.waterMaterial.setDiffuse(0.3, 0.3, 0.8, opacity * 0.8);
            this.scene.waterMaterial.apply();
            
            // Apply same position transformation for water
            this.scene.translate(0, bucketYPosition + this.height, 0);
            
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.upperSurface.display();
            this.scene.popMatrix();
        } else {
            // If no water, display empty surface
            this.scene.pushMatrix();
            this.scene.upperBucketMaterial.apply();
            
            // Apply same position transformation for empty surface
            this.scene.translate(0, bucketYPosition + this.height, 0);
            
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.upperSurface.display();
            this.scene.popMatrix();
        }

        // Display bucket holder with fading effect
        this.scene.pushMatrix();
        this.scene.metalMaterial.setDiffuse(0.2, 0.2, 0.2, opacity);
        this.scene.metalMaterial.apply();
                
        // Position the holder halfway between the original position and bucket position
        const holderYPosition = bucketYPosition + this.height;
        
        this.scene.translate(this.height / 20, holderYPosition, 0);
        this.scene.scale(this.height / 10, this.height / 2, this.radius - 0.01);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.bucketHolder.display();
        this.scene.popMatrix();
    }

    fillWater() {
        this.hasWater = true;
    }

    emptyWater() {
        this.hasWater = false;
    }
}
