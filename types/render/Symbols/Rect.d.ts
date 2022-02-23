import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape, PointerDownState, MaybeTransformHandleType } from './Shape';
export interface RectShapeProperties extends properties {
    x: number;
    y: number;
    color: string;
    radius: number;
    isAuxiliary: boolean;
}
export default class RectShape extends BaseShape<RectShapeProperties> {
    static key: number;
    name: string;
    vertex: point[];
    pointerDownState: PointerDownState;
    maybeTransformHandleType: MaybeTransformHandleType;
    rectBounding: InstanceType<typeof RectShape>;
    constructor(userOptions: RectShapeProperties);
    roundRect(context: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    getSourceRect(isAppend?: boolean): void;
    getVertex(): point[];
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): RectShape;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    computeCrash(p: point, lineDis: number): boolean;
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
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeBounding(): void;
}
