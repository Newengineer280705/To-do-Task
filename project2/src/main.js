import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { HandTracking } from './handTracking.js';
import { ParticleSystem } from './particleSystem.js';
import { config } from './config.js';

// --- Initialization ---
const scene = new THREE.Scene();
// Dark void fog
scene.fog = new THREE.FogExp2(0x050510, 0.02);
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true; // Cinematic feel
controls.autoRotateSpeed = 0.5;

// --- Components ---
const particles = new ParticleSystem(scene, config.particleCount);

// --- Post Processing ---
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.6; // Stronger glow
bloomPass.radius = 0.8;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);


// --- Tracking & Logic ---
const videoElement = document.querySelector('.input_video');
const loadingElement = document.getElementById('loading');

let lastResults = null;

const tracker = new HandTracking(videoElement, (results) => {
    if (loadingElement.style.display !== 'none') {
        loadingElement.style.display = 'none';
        videoElement.style.opacity = '0.2';
    }

    lastResults = results;

    // Shape Switching Logic
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Stop rotation if user is interacting
        controls.autoRotate = false;

        if (results.multiHandLandmarks.length === 2) {
            const h1 = results.multiHandLandmarks[0][9];
            const h2 = results.multiHandLandmarks[1][9];

            const dx = h1.x - h2.x;
            const dy = h1.y - h2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // New Shape Mappings
            if (dist < 0.25) {
                particles.setShape('KNOT'); // Close = Intricate Knot
            } else if (dist > 0.6) {
                particles.setShape('HELIX'); // Far = DNA Helix
            } else {
                particles.setShape('GALAXY'); // Middle = Galaxy
            }
        } else {
            particles.setShape('GALAXY');
        }
    } else {
        // Resume rotation if idle
        controls.autoRotate = true;
    }
});

tracker.start();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Manual time delta for smoothness
    const dt = 0.016;
    controls.update();

    particles.update(dt, lastResults);
    composer.render();
}

animate();
