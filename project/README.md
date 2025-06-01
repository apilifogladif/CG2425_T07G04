# CG 2024/2025
## Turma 04 - Group 07

| Student Name | Student Number |
| --- | --- |
| Ana Geraldes | 202208030 |
| Filipa Fidalgo | 202208039 |

## Project Notes
We began by creating a simple scene containing a **plane** and a **sphere**, implemented through the `MyPlane` and `MySphere` classes.

To establish an immersive environment, we developed a **panorama** using the `MyPanorama` class. This consists of an inward-facing textured sphere, simulating a surrounding sky or landscape.

![Screenshot 1](screenshots/project-t04g07-1.png)
<p align="center">Figure 1: Panorama</p>

We implemented a customizable **building** using the `MyBuilding` class, with a **helipad** on its roof. It supports various adjustable parameters, including:
- Width and color
- Number of floors
- Number of windows

![Screenshot 2](screenshots/project-t04g07-2.png)
<p align="center">Figure 2: Building</p>

We created a **forest region**, using `MyForest` and `MyTree`, populated with multiple tree instances to enhance the natural atmosphere of the scene. Both the **width** and **depth** of the forest can be modified via the UI.

![Screenshot 3](screenshots/project-t04g07-3.png)
<p align="center">Figure 3: Forest</p>

A fully animated **helicopter**, implemented in the `MyHeli` class, was modeled using several simple geometric shapes, like cylinders etc, and programmed, featuring:
- Controllable flight across the scene
- Rotating blades
- Autonomous landing on the helipad
- A **water bucket** suspended by a cable that extends during flight and retracts when landing

The helicopter interacts dynamically with the environment:
- Collects **water from the lake**
- **Extinguishes forest fires** using the collected water

![Screenshot 4](screenshots/project-t04g07-4.png)
<p align="center">Figure 4: Helicopter</p>

![Screenshot 5](screenshots/project-t04g07-5.png)
<p align="center">Figure 5: Helicopter</p>

We added a **lake**, implemented using the `MyLake` class, serving as the primary **water source** for the helicopter.  
A **fire**, implemented through the `MyFire` class, system was implemented within the forest, which can be actively extinguished by the helicopter.

![Screenshot 6](screenshots/project-t04g07-6.png)
<p align="center">Figure 6: Lake and Fire</p>

To enhance visual realism, we developed **shaders** for:
- **Animated fire effects**
- **Helipad indicators** (UP/DOWN) with smooth **transitions** to guide the helicopter’s landing approach

![Screenshot 7](screenshots/project-t04g07-7.png)
<p align="center">Figure 7: Fire with Shaders</p>

![Screenshot 8](screenshots/project-t04g07-8.png)
<p align="center">Figure 8: UP and DOWN references with shaders for transitions</p>