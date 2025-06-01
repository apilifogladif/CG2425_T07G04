import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name('Display Axis');
        this.gui.add(this.scene, 'displaySphere').name('Display Sphere');
        
        const buildingFolder = this.gui.addFolder('Building');
        buildingFolder.add(this.scene, 'buildingSideFloors', 0, 8)
            .name('Side Floors')
            .step(1)
            .onChange((value) => {
                this.scene.updateBuilding();
            });
        
        buildingFolder.add(this.scene, 'buildingWidth', 20, 80)
            .name('Building Width')
            .step(5)
            .onChange((value) => {
                this.scene.updateBuilding();
            });
        
        buildingFolder.add(this.scene, 'windowsPerFloor', 1, 16)
            .name('Windows Per Floor')
            .step(1)
            .onChange((value) => {
                this.scene.updateBuilding();
            });

        buildingFolder.addColor(this.scene, 'buildingColor')
            .name('Building Color')
            .onChange((value) => {
                this.scene.updateBuilding();
            });

        const cameraFolder = this.gui.addFolder('Camera Controls');
        this.scene.cameraZoomFactor = 1;
        this.scene.initialCameraPosition = [...this.scene.camera.position];
        cameraFolder.add(this.scene, 'cameraZoomFactor', 1, 5.0)
            .name('Zoom')
            .step(0.1)
            .onChange((value) => {
                if (this.scene.isAtMaxDistance && value < 1.0) {
                    return; 
                }
                
                const initialPos = this.scene.initialCameraPosition;
                const direction = vec3.normalize([], initialPos);
                const distance = vec3.length(initialPos) / value;
                
                if (distance > this.scene.MAX_CAMERA_RADIUS) {
                    const cappedDistance = this.scene.MAX_CAMERA_RADIUS;
                    const newPosition = vec3.scale([], direction, cappedDistance);
                    this.scene.camera.position = newPosition;
                } else {
                    const newPosition = vec3.scale([], direction, distance);
                    this.scene.camera.position = newPosition;
                }
            });
            
        // Helicopter controls
        const helicopterFolder = this.gui.addFolder('Helicopter');
        helicopterFolder.add(this.scene.helicopter, 'rotationSpeed', 0, 9)
            .name('Rotor Speed')
            .step(0.5);
            
        // Add speed factor control for helicopter
        helicopterFolder.add(this.scene.helicopter, 'speedFactor', 0.5, 3.0)
            .name('Speed Factor')
            .step(0.1);

        const forestFolder = this.gui.addFolder('Forest');

        const rowsController = forestFolder.add(this.scene.forest, 'rows', 1, 6)
            .name('Rows')
            .step(1)
            .onChange(() => {
                this.scene.forest.updateForest();
            });

        const colsController = forestFolder.add(this.scene.forest, 'cols', 1, 6)
            .name('Columns')
            .step(1)
            .onChange(() => {
                this.scene.forest.updateForest();
            });

        forestFolder.add(this.scene.forest, 'depth', 10, 60)
            .name('Depth')
            .step(1)
            .onChange((value) => {
                const maxRows = Math.floor(value * 6 / 40);
                rowsController.max(maxRows);

                if (this.scene.forest.rows > maxRows) {
                    this.scene.forest.rows = maxRows; 
                }

                rowsController.updateDisplay();
                this.scene.forest.updateForest();
            });

        forestFolder.add(this.scene.forest, 'width', 10, 60)
            .name('Width')
            .step(1)
            .onChange((value) => {
                const maxCols = Math.floor(value * 6 / 40);
                colsController.max(maxCols);

                if (this.scene.forest.cols > maxCols) {
                    this.scene.forest.cols = maxCols;
                }

                colsController.updateDisplay(); 
                this.scene.forest.updateForest();
            });

        this.initKeys();

        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;

        // disable the processKeyboard function
        this.processKeyboard = function () { };

        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }
    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        // returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }

}