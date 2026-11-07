/**
 * Generates points for premium, complex 3D shapes.
 */
export class ShapeGenerator {
    // 1. Galaxy Spiral (Replaces Sphere)
    static getGalaxy(count, radius) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Power distribution for center concentration
            const r = Math.pow(Math.random(), 3) * radius;
            const spiral = 3 * angle; // winding

            // Spiral arms
            const armOffset = (i % 3) * (Math.PI * 2 / 3);

            positions[i * 3] = r * Math.cos(angle * 5 + armOffset);
            positions[i * 3 + 1] = (Math.random() - 0.5) * (radius * 0.2); // Flattened disk
            positions[i * 3 + 2] = r * Math.sin(angle * 5 + armOffset);
        }
        return positions;
    }

    // 2. Double Helix / DNA (Replaces Cube)
    static getHelix(count, height) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 20; // Verticle progress + spin
            const angle = t;

            const radius = 3;
            // Strand 1
            if (i % 2 === 0) {
                positions[i * 3] = radius * Math.cos(angle);
                positions[i * 3 + 1] = (i / count - 0.5) * height;
                positions[i * 3 + 2] = radius * Math.sin(angle);
            } else {
                // Strand 2 (Offset by PI)
                positions[i * 3] = radius * Math.cos(angle + Math.PI);
                positions[i * 3 + 1] = (i / count - 0.5) * height;
                positions[i * 3 + 2] = radius * Math.sin(angle + Math.PI);
            }

            // Add some jitter/thickness
            positions[i * 3] += (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] += (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
        }
        return positions;
    }

    // 3. Torus Knot (Replaces Heart)
    static getTorusKnot(count, scale) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2 * 3; // 3 loops

            // Trefoil knot params or (p,q) torus knot
            const p = 2;
            const q = 3;

            const r = 2 + Math.cos(q * t);

            positions[i * 3] = scale * r * Math.cos(p * t);
            positions[i * 3 + 1] = scale * r * Math.sin(p * t);
            positions[i * 3 + 2] = scale * Math.sin(q * t) * 1.5;

            // Volume
            positions[i * 3] += (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] += (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
        }
        return positions;
    }
}
