import { FC, useRef, useEffect } from 'react';

const Recolorizer: FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const canvasEl = canvasRef.current;
    const ctx = canvasEl?.getContext('2d');

    const videoEl = videoRef.current;

    
    useEffect(() => {
        const constraints = { video: { width: 1280, height: 720 } };
        if (!canvasEl || !videoEl) return;
        const playListener = () => {
            let lastTimeCalled = performance.now();
            let now = performance.now();
            let [delta, fps] = [0.0, 0.0];
            function step() {
                // Calculate FPS
                now = performance.now();
                delta = (now - lastTimeCalled) / 1000;
                lastTimeCalled = now;
                fps = 1 / delta;

                // Draw frame
                ctx?.drawImage(videoEl!, 0, 0, canvasEl!.width, canvasEl!.height);
                // Draw fps label
                if (ctx) {
                    ctx.font = '18px serif';
                    ctx.fillStyle = '#cb9eff';
                }
                ctx?.fillText(`${fps.toFixed(0)} fps`, 15, 20);
                requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        };
        window.navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                videoEl.addEventListener('play', playListener);
                videoEl.srcObject = stream;
                videoEl.onloadedmetadata = (e) => {
                    videoEl.play();
                };
            })
            .catch(() => alert('Failed to receive camera access'));

        return () => {
            videoEl.removeEventListener('play', playListener);
        };
    }, [canvasEl, videoEl, ctx]);

    return (
        <div>
            <div id="container">
                <video ref={videoRef} muted hidden></video>
            </div>
            <canvas ref={canvasRef} width={1280} height={720}></canvas>
        </div>
    );
};

export default Recolorizer;