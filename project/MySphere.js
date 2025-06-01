import { CGFobject } from '../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of divisions around the Y-axis
 * @param stacks - Number of divisions along the Y-axis
 * @param radius - Radius of the sphere (default: 1)
 */
export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, radius = 1) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks * 2;
        this.radius = radius;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Generate vertices, normals and texture coordinates
        for (let stack = 0; stack <= this.stacks; stack++) {
            // Angle from positive Y-axis (0 at North pole, PI at South pole)
            const phi = (Math.PI * stack) / this.stacks;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            for (let slice = 0; slice <= this.slices; slice++) {
                // Angle around Y-axis (longitude)
                const theta = (2 * Math.PI * slice) / this.slices;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                // Calculate vertex position using standard spherical coordinates
                // x = r * sin(phi) * cos(theta)
                // y = r * cos(phi)
                // z = r * sin(phi) * sin(theta)
                const x = this.radius * sinPhi * cosTheta;
                const y = this.radius * cosPhi;
                const z = this.radius * sinPhi * sinTheta;

                this.vertices.push(x, y, z);
                
                // Normal is simply the direction from origin to vertex (normalized)
                const length = Math.sqrt(x*x + y*y + z*z);
                this.normals.push(x/length, y/length, z/length);
                
                // Texture coordinates - map longitude/latitude to U/V
                this.texCoords.push(slice / this.slices, 1 - stack / this.stacks);
            }
        }

        // Generate indices
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const current = stack * (this.slices + 1) + slice;
                const next = current + this.slices + 1;
                const below = current + this.slices + 1;
                const belowNext = below + 1;
                
                this.indices.push(next, current, current + 1);
                this.indices.push(next + 1, next, current + 1);
                this.indices.push(below, current, next);
                this.indices.push(belowNext, below, current + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
