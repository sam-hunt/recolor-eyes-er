import { FC, useRef, useEffect, useCallback } from 'react';
import { usePromise } from '../../hooks/use-promise';

import { IFace } from './face.interface';
import { IPackageConfig } from './package-config.interface';

const packageConfig: IPackageConfig = {
    maxFaces: 3,
    maxContinuousChecks: 1
};

declare const faceLandmarksDetection: {
    load: (package: unknown, packageConfig?: IPackageConfig) => Promise<unknown>;
    SupportedPackages: { mediapipeFacemesh: unknown };
};

interface Model {
    estimateFaces: (params: { input: HTMLVideoElement | unknown }) => Promise<IFace[]>
}

const Recolorizer: FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;

    const [model, modelError, modelIsPending] = usePromise<Model | null>(
        useCallback(() => faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, packageConfig), []), null,
    );

    let ctx = canvasEl?.getContext('2d');

    const isLoading = !canvasEl || !videoEl || !model || !ctx;

    useEffect(() => {
        if (isLoading) return;

        const playListener = () => {
            let lastTimeCalled = performance.now();
            let now = performance.now();
            let [delta, fps] = [0.0, 0.0];
            async function step() {
                // Calculate FPS
                now = performance.now();
                delta = (now - lastTimeCalled) / 1000;
                lastTimeCalled = now;
                fps = 1 / delta;

                // Estimate facemeshes
                model!.estimateFaces({ input: videoEl }).then(faces => {
                    // Draw frame
                    ctx!.drawImage(videoEl!, 0, 0, canvasEl!.width, canvasEl!.height);

                    // Draw fps label
                    ctx!.font = '18px serif';
                    ctx!.fillStyle = '#cb9eff';
                    ctx!.fillText(`${fps.toFixed(0)} fps`, 15, 20);
                    // Draw face count label
                    ctx!.fillText(`${faces?.length} face(s)`, 15, 40);

                    // Annotate facemeshes
                    for (const face of faces) {
                        ctx!.strokeStyle = '#cb9eff';
                        const box = face.boundingBox;
                        ctx!.beginPath();
                        ctx!.rect(box.topLeft[0], box.topLeft[1], box.bottomRight[0] - box.topLeft[0], box.bottomRight[1] - box.topLeft[1]);
                        ctx!.closePath();
                        ctx!.stroke();

                        // Draw eyes
                        for (const eye of [face.annotations.leftEyeIris, face.annotations.rightEyeIris]) {
                            for (const keypoint of eye) {
                                ctx!.beginPath();
                                ctx!.arc(keypoint[0], keypoint[1], 2, 0, 2 * Math.PI);
                                ctx!.stroke();
                            }
                            let [minX, minY, maxX, maxY] = [1280, 720, 0, 0];
                            for (const [x, y] of eye) {
                                minX = Math.min(minX, x);
                                minY = Math.min(minY, y);
                                maxX = Math.max(maxX, x);
                                maxY = Math.max(maxY, y);
                            }
                            [minX, minY, maxX, maxY] = [minX, minY, maxX, maxY].map(Math.round);

                            const [w, h] = [maxX-minX, maxY-minY];
                            const imageData = ctx!.getImageData(minX, minY, w, h);
                            // console.log([minX, minY, maxX, maxY, w,h])
                            for (let relX = 0; relX < w; relX++) {
                                for (let relY = 0; relY < h; relY++) {
                                    if (Math.pow((relX-(w/2)),2)+Math.pow((relY-(h/2)),2)<Math.pow((w/2),2)) {
                                        // imageData.data[i] = Math.max(255, imageData.data[i]);
                                        const i = relY*w*4+relX*4;
                                        imageData.data[i] = Math.min(255, imageData.data[i]+40);
                                        // imageData.data[i+1] = Math.max(255, imageData.data[i+1]+10);
                                        imageData.data[i+2] = Math.max(255, imageData.data[i+2]+30);
                                    }
                                }
                            }
                            // for (let i = 0, length = imageData.data.length; i < length; i += 4) {
                            //     imageData.data[i] = Math.min(255, imageData.data[i]+30);
                            //     imageData.data[i+2] = Math.max(255, imageData.data[i+2]+30);
                            // }
                            ctx!.putImageData(imageData, minX, minY);
                        }

                        ctx!.fillText(`100,100`, 100, 100);
                        ctx!.fillText(`1000,650`, 1000, 650);
                        ctx!.fillText(`100, 650`, 100, 650);
                        ctx!.fillText(`1000,100`, 1000, 100);

                        // const leftEyeIrisKeypoints = [468, 469, 470, 471, 472];
                        // const rightEyeIrisKeypoints = [473, 474, 475, 476, 477];
                    }
                    requestAnimationFrame(step);
                });
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