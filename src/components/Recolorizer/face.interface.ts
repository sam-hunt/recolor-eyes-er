export interface IFace {
    faceInViewConfidence: number,
    boundingBox: {
        topLeft: [number, number], // [x, y]
        bottomRight: [number, number],
    },
    mesh: [number, number, number][], // [x, y, z]

    // x,y,z positions of each facial landmark within the input space.
    scaledMesh: [number, number, number][],

    // Semantic groupings of x,y,z positions.
    annotations: {
        leftCheek: [number, number, number][],
        leftEyeIris: [number, number, number][],
        leftEyeLower0: [number, number, number][],
        leftEyeLower1: [number, number, number][],
        leftEyeLower2: [number, number, number][],
        leftEyeLower3: [number, number, number][],
        leftEyeUpper0: [number, number, number][],
        leftEyeUpper1: [number, number, number][],
        leftEyeUpper2: [number, number, number][],
        leftEyebrowLower: [number, number, number][],
        leftEyebrowUpper: [number, number, number][],
        lipsLowerInner: [number, number, number][],
        lipsLowerUpper: [number, number, number][],
        lipsUpperInner: [number, number, number][],
        lipsUpperOuter: [number, number, number][],
        midwayBetweenEyes: [number, number, number][],
        noseBottom: [number, number, number][],
        noseLeftCorner: [number, number, number][],
        noseRightCorner: [number, number, number][],
        noseTip: [number, number, number][],
        rightCheek: [number, number, number][],
        rightEyeIris: [number, number, number][],
        rightEyeLower0: [number, number, number][],
        rightEyeLower1: [number, number, number][],
        rightEyeLower2: [number, number, number][],
        rightEyeLower3: [number, number, number][],
        rightEyeUpper0: [number, number, number][],
        rightEyeUpper1: [number, number, number][],
        rightEyeUpper2: [number, number, number][],
        rightEyebrowLower: [number, number, number][],
        rightEyebrowUpper: [number, number, number][],
        silhouette: [number, number, number][],
    },
}