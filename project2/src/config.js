
// Main configuration and state
export const config = {
    particleCount: 5000,
    handDistanceThreshold: 0.15, // trigger distance
    colors: {
        base: 0x00ffff,
        active: 0xff0055
    }
};

export const state = {
    hands: [], // will store detected hand data
    gesture: 'NONE' // NONE, OPEN, CLOSED, PINCH
};
