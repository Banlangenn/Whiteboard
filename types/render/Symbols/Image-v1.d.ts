import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape } from './Shape';
export interface ImageShapeProperties extends properties {
    imageOrUri: string | HTMLImageElement | HTMLCanvasElement;
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function renderArc(context: Path2D | CanvasRenderingContext2D, center: point, radius: number): void;
export default class ImageShape extends BaseShape<ImageShapeProperties> {
    static key: number;
    readonly name = "\u56FE\u7247";
    readonly moveAction: {
        [key: number]: {
            prev: 'x' | 'y';
            value: 'x' | 'y';
            next: 'x' | 'y';
        };
    };
    rectVertex: point[];
    movePoint: point;
    aspectRatio: number;
    selectType: 'Main' | 'Vertex' | undefined;
    selectVertexI: number;
    private image;
    constructor(userOptions: ImageShapeProperties);
    getSrc(): string;
    getPointIndex(index: number, len?: number): {
        prev: number;
        next: number;
    };
    getSourceRect(): void;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    getDeviationValue(value: 'x' | 'y', difference: number): {
        x: number;
        y: number;
    };
    computeVertexMove(p: point): void;
    clone(): ImageShape;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeCrash(p: point, lineDis: number): boolean;
}
