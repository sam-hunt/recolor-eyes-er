export interface IPackageConfig {
    shouldLoadIrisModel?: boolean;
    maxContinuousChecks?: number;
    detectionConfidence?: number;
    maxFaces?: number;
    iouThreshold?: number;
    scoreThreshold?: number;
    modelUrl?: string;
    irisModelUrl?: string;
}