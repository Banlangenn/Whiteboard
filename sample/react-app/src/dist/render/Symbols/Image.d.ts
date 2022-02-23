import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape, PointerDownState, MaybeTransformHandleType } from './Shape';
import RectShape from './Rect';
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
    pointerDownState: PointerDownState;
    rectBounding: InstanceType<typeof RectShape>;
    maybeTransformHandleType: MaybeTransformHandleType;
    private image;
    constructor(userOptions: ImageShapeProperties);
    getSrc(): string;
    initPointerDownState(p?: {
        x: number;
        y: number;
    }): {
        startPoint: {
            x: number;
            y: number;
        };
        offset: point;
        angle: number;
        maxX: number;
        maxY: number;
        minX: number;
        minY: number;
    };
    getSourceRect(): void;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): ImageShape;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeCrash(p: point, lineDis: number): boolean;
}
//# sourceMappingURL=Image.d.ts.map