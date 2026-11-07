import * as THREE from 'three';
import { ShapeGenerator } from './shapes.js';

export class ParticleSystem {
    constructor(scene, count) {
        this.count = count;
        this.scene = scene;

        // Geometry
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(count * 3);
        this.targetPositions = new Float32Array(count * 3);
        this.colors = new Float32Array(count * 3);

        // Start with Galaxy
        const initial = ShapeGenerator.getGalaxy(count, 10);
        this.positions.set(initial);
        this.targetPositions.set(initial);

        // Init Colors
        for (let i = 0; i < count; i++) {
            this.colors[i * 3] = 0;
            this.colors[i * 3 + 1] = 0;
            this.colors[i * 3 + 2] = 0;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        // Material - More premium look
        this.material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.9,
            // Could use a map texture for better particles if we had one, but dots are fine for now
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.currentShape = 'GALAXY';
    }

    update(dt, handData) {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;

        const lerpFactor = 3 * dt; // Slow smooth transitions

        // Premium Colors
        const colorGalaxy = { r: 0.5, g: 0.0, b: 1.0 }; // Deep Purple
        const colorHelix = { r: 0.0, g: 1.0, b: 0.8 }; // Cyan/Green
        const colorKnot = { r: 1.0, g: 0.6, b: 0.1 }; // Gold/Orange

        let targetColor = colorGalaxy;
        if (this.currentShape === 'HELIX') targetColor = colorHelix;
        if (this.currentShape === 'KNOT') targetColor = colorKnot;

        // Animate particles subtly always
        const time = Date.now() * 0.0005;

        for (let i = 0; i < this.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            let tx = this.targetPositions[ix];
            let ty = this.targetPositions[iy];
            let tz = this.targetPositions[iz];

            // Add subtle noise movement to target
            tx += Math.sin(time + i) * 0.05;
            ty += Math.cos(time + i * 0.5) * 0.05;

            // 1. Interpolate
            positions[ix] += (tx - positions[ix]) * lerpFactor;
            positions[iy] += (ty - positions[iy]) * lerpFactor;
            positions[iz] += (tz - positions[iz]) * lerpFactor;

            // 2. Color Morphing
            if (Math.random() > 0.9) {
                colors[ix] += (targetColor.r - colors[ix]) * dt;
                colors[iy] += (targetColor.g - colors[iy]) * dt;
                colors[iz] += (targetColor.b - colors[iz]) * dt;
            }

            // 3. Hand Interaction
            if (handData && handData.multiHandLandmarks) {
                for (const landmarks of handData.multiHandLandmarks) {
                    const palm = landmarks[9];
                    const thumb = landmarks[4];
                    const index = landmarks[8];

                    const dxPinch = thumb.x - index.x;
                    const dyPinch = thumb.y - index.y;
                    const pinchDist = Math.sqrt(dxPinch * dxPinch + dyPinch * dyPinch);
                    const isPinching = pinchDist < 0.05;

                    const wx = (0.5 - palm.x) * 25; // Wider range
                    const wy = (0.5 - palm.y) * 20;
                    const wz = 0;

                    const dx = positions[ix] - wx;
                    const dy = positions[iy] - wy;
                    const dz = positions[iz] - wz;

                    const distSq = dx * dx + dy * dy + dz * dz;
                    const dist = Math.sqrt(distSq);

                    if (isPinching) {
                        // SUPERNOVA IMPLOSION
                        if (dist < 15) {
                            const force = (15 - dist) * 20 * dt;
                            positions[ix] -= (dx / dist) * force;
                            positions[iy] -= (dy / dist) * force;
                            positions[iz] -= (dz / dist) * force;

                            // Add swirl
                            positions[ix] += -dy * dt * 5;
                            positions[iy] += dx * dt * 5;
                        }
                    } else {
                        // FORCE FIELD
                        if (distSq < 8) {
                            const force = (8 - dist) * 15 * dt;
                            positions[ix] += (dx / dist) * force;
                            positions[iy] += (dy / dist) * force;
                            positions[iz] += (dz / dist) * force;
                        }
                    }
                }
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    setShape(type) {
        if (this.currentShape === type) return;
        this.currentShape = type;

        let newPos;
        switch (type) {
            case 'GALAXY':
                newPos = ShapeGenerator.getGalaxy(this.count, 10);
                break;
            case 'HELIX':
                newPos = ShapeGenerator.getHelix(this.count, 15);
                break;
            case 'KNOT':
                newPos = ShapeGenerator.getTorusKnot(this.count, 2.5);
                break;
        }

        if (newPos) {
            this.targetPositions.set(newPos);
        }
    }
}
