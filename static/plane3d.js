/**
 * Traveloop AI — 3D Anti-Gravity Airplane Scroll Controller
 * Powered by Three.js & GLTFLoader
 */

(function () {
    'use strict';

    // State & Variables
    let scene, camera, renderer;
    let planeGroup = null;
    let contrailParticles = null;
    let clock = null;
    let isGltfLoaded = false;

    // Flight Dynamics & Lerping Targets
    const currentFlight = {
        x: -4.5,
        y: -1.2,
        z: 2.0,
        rotX: 0.12,
        rotY: Math.PI * 0.45,
        rotZ: -0.2
    };

    const targetFlight = { ...currentFlight };

    let targetScrollFraction = 0;
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    // Initialize when DOM and Three.js are ready
    function init() {
        const canvas = document.getElementById('flightCanvas');
        if (!canvas) {
            console.warn('[3D Plane] Canvas element #flightCanvas not found.');
            return;
        }

        if (typeof THREE === 'undefined') {
            console.error('[3D Plane] Three.js is not loaded.');
            return;
        }

        clock = new THREE.Clock();

        // 1. Scene Setup
        scene = new THREE.Scene();

        // 2. Camera Setup (Wide perspective)
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        camera.position.set(0, 0, 14);
        camera.lookAt(0, 0, 0);

        // 3. Renderer with transparent background
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Fully transparent

        // 4. Lighting System (Cyber-Luxe Aesthetic)
        setupLighting();

        // 5. Plane Container Group
        planeGroup = new THREE.Group();
        planeGroup.position.set(currentFlight.x, currentFlight.y, currentFlight.z);
        planeGroup.rotation.set(currentFlight.rotX, currentFlight.rotY, currentFlight.rotZ);
        scene.add(planeGroup);

        // 6. Contrail Vapor Particles
        setupContrailParticles();

        // 7. Load 3D Model (/static/plane.glb) with Procedural Fallback
        loadPlaneModel();

        // 8. Event Listeners
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Initial scroll calculation
        onScroll();

        // 9. Start Render Loop
        animate();
    }

    function setupLighting() {
        // Soft ambient base
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        // Key light (Cool white/cyan sunlight)
        const keyLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
        keyLight.position.set(6, 10, 8);
        scene.add(keyLight);

        // Electric indigo rim light
        const rimLightIndigo = new THREE.PointLight(0x818cf8, 2.5, 30);
        rimLightIndigo.position.set(-8, 5, 4);
        scene.add(rimLightIndigo);

        // Cyan accent light
        const rimLightCyan = new THREE.PointLight(0x38bdf8, 2.0, 25);
        rimLightCyan.position.set(5, -6, 5);
        scene.add(rimLightCyan);
    }

    function loadPlaneModel() {
        const modelPath = '/static/plane.glb';

        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;

                    // Compute bounding box to auto-normalize scale
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());

                    // Center model geometry inside its group
                    model.position.x -= center.x;
                    model.position.y -= center.y;
                    model.position.z -= center.z;

                    // Normalize size to approx 3.2 units wide
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = 3.2 / (maxDim || 1);
                    model.scale.setScalar(scaleFactor);

                    // Refine materials for dark-mode luster
                    model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.metalness = Math.max(child.material.metalness || 0.6, 0.5);
                            child.material.roughness = Math.min(child.material.roughness || 0.35, 0.4);
                            child.material.needsUpdate = true;
                        }
                    });

                    planeGroup.add(model);
                    isGltfLoaded = true;
                    console.log('[3D Plane] Successfully loaded GLTF plane from', modelPath);
                },
                undefined,
                (error) => {
                    console.info('[3D Plane] /static/plane.glb not found or failed to load. Initializing high-precision procedural supersonic jet fallback.');
                    createProceduralJet();
                }
            );
        } else {
            console.warn('[3D Plane] GLTFLoader not available, using procedural jet.');
            createProceduralJet();
        }
    }

    /**
     * Creates a sleek procedural supersonic business/passenger jet
     * Ensures an immediate, visually stunning 3D airplane without external file dependencies
     */
    function createProceduralJet() {
        const jet = new THREE.Group();

        // High-end materials
        const fuselageMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            metalness: 0.85,
            roughness: 0.22,
            envMapIntensity: 1.2
        });

        const darkAccentMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.9,
            roughness: 0.2
        });

        const indigoAccentMat = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            metalness: 0.7,
            roughness: 0.3
        });

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.95,
            roughness: 0.05
        });

        const engineGlowMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8
        });

        // 1. Fuselage Body (Oriented along X axis)
        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.34, 4.4, 32);
        bodyGeo.rotateZ(Math.PI / 2);
        const fuselage = new THREE.Mesh(bodyGeo, fuselageMat);
        jet.add(fuselage);

        // 2. Nose Cone
        const noseGeo = new THREE.ConeGeometry(0.38, 1.4, 32);
        noseGeo.rotateZ(-Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, fuselageMat);
        nose.position.set(2.8, 0, 0);
        jet.add(nose);

        // 3. Cockpit Windshield Glass
        const cockpitGeo = new THREE.BoxGeometry(0.85, 0.26, 0.44);
        const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
        cockpit.position.set(1.9, 0.28, 0);
        cockpit.rotation.z = -0.15;
        jet.add(cockpit);

        // 4. Main Swept Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(-1.8, 4.2);   // wing tip trailing
        wingShape.lineTo(-1.2, 4.2);   // wing tip leading
        wingShape.lineTo(1.4, 0);      // wing root leading
        wingShape.closePath();

        const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.center();
        wingGeo.rotateX(Math.PI / 2);

        // Left Wing
        const leftWing = new THREE.Mesh(wingGeo, fuselageMat);
        leftWing.position.set(-0.2, 0.02, 2.2);
        leftWing.rotation.x = 0.06; // Dihedral angle
        jet.add(leftWing);

        // Right Wing
        const rightWing = leftWing.clone();
        rightWing.scale.set(1, 1, -1);
        rightWing.position.set(-0.2, 0.02, -2.2);
        rightWing.rotation.x = -0.06;
        jet.add(rightWing);

        // Winglets
        const wingletGeo = new THREE.BoxGeometry(0.4, 0.5, 0.05);
        const leftWinglet = new THREE.Mesh(wingletGeo, indigoAccentMat);
        leftWinglet.position.set(-1.4, 0.28, 4.2);
        leftWinglet.rotation.z = 0.3;
        jet.add(leftWinglet);

        const rightWinglet = leftWinglet.clone();
        rightWinglet.position.set(-1.4, 0.28, -4.2);
        rightWinglet.rotation.z = 0.3;
        jet.add(rightWinglet);

        // 5. Tail Fin (Vertical Stabilizer)
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(-1.3, 1.6);
        finShape.lineTo(-0.7, 1.6);
        finShape.lineTo(0.5, 0);
        finShape.closePath();

        const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
        finGeo.center();
        finGeo.rotateY(Math.PI / 2);
        const verticalFin = new THREE.Mesh(finGeo, indigoAccentMat);
        verticalFin.position.set(-1.9, 0.95, 0);
        jet.add(verticalFin);

        // 6. Horizontal Stabilizers
        const hStabGeo = new THREE.BoxGeometry(0.8, 0.04, 2.2);
        const hStab = new THREE.Mesh(hStabGeo, fuselageMat);
        hStab.position.set(-2.0, 0.2, 0);
        jet.add(hStab);

        // 7. Twin Jet Turbine Engines
        const engineGeo = new THREE.CylinderGeometry(0.22, 0.20, 1.4, 24);
        engineGeo.rotateZ(Math.PI / 2);

        // Left Engine
        const leftEngine = new THREE.Mesh(engineGeo, darkAccentMat);
        leftEngine.position.set(-0.2, -0.28, 1.3);
        jet.add(leftEngine);

        // Right Engine
        const rightEngine = leftEngine.clone();
        rightEngine.position.set(-0.2, -0.28, -1.3);
        jet.add(rightEngine);

        // Exhaust Nozzle Disks (Glowing Blue Afterburners)
        const exhaustGeo = new THREE.CircleGeometry(0.18, 24);
        exhaustGeo.rotateY(-Math.PI / 2);

        const leftExhaust = new THREE.Mesh(exhaustGeo, engineGlowMat);
        leftExhaust.position.set(-0.91, -0.28, 1.3);
        jet.add(leftExhaust);

        const rightExhaust = leftExhaust.clone();
        rightExhaust.position.set(-0.91, -0.28, -1.3);
        jet.add(rightExhaust);

        // Point light from exhaust glow
        const engineLight = new THREE.PointLight(0x38bdf8, 2.0, 6);
        engineLight.position.set(-1.2, -0.28, 0);
        jet.add(engineLight);

        // Scale & adjust base rotation so front faces travel vector
        jet.scale.set(0.85, 0.85, 0.85);

        planeGroup.add(jet);
    }

    function setupContrailParticles() {
        const particleCount = 140;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const alphas = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            alphas[i] = Math.random() * 0.4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x818cf8,
            size: 0.12,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });

        contrailParticles = new THREE.Points(geometry, material);
        scene.add(contrailParticles);
    }

    /**
     * Map page scroll progress (0.0 to 1.0) to 3D Anti-Gravity Flight Trajectory
     */
    function computeFlightWaypoints(progress) {
        // Clamp 0 to 1
        const p = Math.max(0, Math.min(progress, 1));

        // Anti-Gravity Flight Path coordinates:
        // Top of page (Hero): Cruising lower-left, angled upward
        // Mid scroll (Planner & Agents): Climbing steeply through center with dynamic bank
        // Bottom (Result & Dossier): Sweeping high across top-right towards the horizon
        const x = THREE.MathUtils.lerp(-4.8, 5.2, p) + Math.sin(p * Math.PI) * 1.8;
        const y = THREE.MathUtils.lerp(-1.4, 3.8, Math.pow(p, 0.9)) + Math.sin(p * Math.PI * 1.1) * 0.9;
        const z = THREE.MathUtils.lerp(2.2, -0.5, p) + Math.sin(p * Math.PI) * 1.6;

        // Dynamic Rotations (Euler angles):
        // Pitch (rotX): Nose elevated when climbing
        const rotX = 0.18 - (p * 0.15) + Math.sin(p * Math.PI) * 0.08;

        // Yaw (rotY): Facing across screen diagonally
        const rotY = Math.PI * 0.42 + (p * 0.45);

        // Roll (rotZ): Aerodynamic banking into curved turns
        const rotZ = -0.22 + Math.sin(p * Math.PI * 1.3) * 0.42;

        return { x, y, z, rotX, rotY, rotZ };
    }

    function onScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1
        );

        targetScrollFraction = Math.max(0, Math.min(scrollY / maxScroll, 1));

        const waypoints = computeFlightWaypoints(targetScrollFraction);
        targetFlight.x = waypoints.x;
        targetFlight.y = waypoints.y;
        targetFlight.z = waypoints.z;
        targetFlight.rotX = waypoints.rotX;
        targetFlight.rotY = waypoints.rotY;
        targetFlight.rotZ = waypoints.rotZ;
    }

    function onMouseMove(event) {
        // Parallax cursor tracking (-1 to 1)
        targetMouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
        targetMouse.y = (event.clientY / window.innerHeight - 0.5) * -2;
    }

    function onWindowResize() {
        if (!camera || !renderer) return;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        onScroll();
    }

    /**
     * Main Animation & Render Loop
     * Implements smooth exponential interpolation (lerp) for stutter-free 60/120fps motion
     */
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth Lerping Factor
        const LERP_FACTOR = 0.055;

        // Interpolate mouse parallax
        mouse.x += (targetMouse.x - mouse.x) * 0.04;
        mouse.y += (targetMouse.y - mouse.y) * 0.04;

        // Interpolate flight position
        currentFlight.x += (targetFlight.x - currentFlight.x) * LERP_FACTOR;
        currentFlight.y += (targetFlight.y - currentFlight.y) * LERP_FACTOR;
        currentFlight.z += (targetFlight.z - currentFlight.z) * LERP_FACTOR;

        // Interpolate flight orientation
        currentFlight.rotX += (targetFlight.rotX - currentFlight.rotX) * LERP_FACTOR;
        currentFlight.rotY += (targetFlight.rotY - currentFlight.rotY) * LERP_FACTOR;
        currentFlight.rotZ += (targetFlight.rotZ - currentFlight.rotZ) * LERP_FACTOR;

        // Subtle aerodynamic turbulence & idling float
        const idleFloatY = Math.sin(time * 2.2) * 0.12;
        const idleBankZ = Math.cos(time * 1.8) * 0.04;

        if (planeGroup) {
            planeGroup.position.set(
                currentFlight.x + (mouse.x * 0.35),
                currentFlight.y + idleFloatY + (mouse.y * 0.25),
                currentFlight.z
            );

            planeGroup.rotation.set(
                currentFlight.rotX - (mouse.y * 0.08),
                currentFlight.rotY + (mouse.x * 0.12),
                currentFlight.rotZ + idleBankZ
            );
        }

        // Animate ambient particles gently
        if (contrailParticles) {
            contrailParticles.rotation.y = time * 0.02;
            contrailParticles.rotation.x = Math.sin(time * 0.015) * 0.05;
        }

        renderer.render(scene, camera);
    }

    // Launch when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
