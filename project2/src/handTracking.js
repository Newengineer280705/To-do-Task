
export class HandTracking {
    constructor(videoElement, onResults) {
        this.videoElement = videoElement;
        this.onResults = onResults;

        if (!window.Hands) {
            console.error("MediaPipe Hands not loaded!");
            return;
        }

        this.hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.handleResults.bind(this));

        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 640,
            height: 480
        });
    }

    start() {
        this.camera.start().catch(e => console.error("Camera error:", e));
    }

    handleResults(results) {
        if (this.onResults) {
            this.onResults(results);
        }
    }
}
