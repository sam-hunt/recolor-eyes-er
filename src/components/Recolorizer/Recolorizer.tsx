import { FC, useRef, useEffect, useCallback } from 'react';
import { usePromise } from '../../hooks/use-promise';

declare const faceLandmarksDetection: {
    load: (supportedPackage: unknown) => Promise<unknown>;
    SupportedPackages: { mediapipeFacemesh: unknown };
};

const Recolorizer: FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const canvasEl = canvasRef.current;
    const ctx = canvasEl?.getContext('2d');

    const videoEl = videoRef.current;

    const [model, modelError, modelIsPending] = usePromise<unknown | null>(
        useCallback(() => faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh), []), null,
    );

    const isLoading = !canvasEl || !videoEl || !model;


    useEffect(() => {
        if (isLoading) return;

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
            .getUserMedia({ video: { width: 1280, height: 720 } })
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
    }, [canvasEl, videoEl, ctx, model]);

    return (
        <div>
            <video ref={videoRef} muted hidden></video>
            <div>
                {modelIsPending && <div style={{ color: 'primary' }}>Model is loading...<br /><br /></div>}
                {modelError && <div style={{ color: 'red', fontWeight: 'bold' }}>Failed to load model.<br />{modelError}<br /><br /></div>}
                {model && <div style={{ color: 'var(--accent-color)' }}>Model is loaded.<br /><br /></div>}
            </div>
            <canvas ref={canvasRef} width={1280} height={720}></canvas>

        </div>
    );
};

export default Recolorizer;