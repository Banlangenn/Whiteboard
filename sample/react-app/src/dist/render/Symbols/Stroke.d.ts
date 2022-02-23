import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape } from './Shape';
import RectShape from './Rect';
export interface StrokeShapeProperties extends properties, pointListPath {
    readonly lineWidth: number;
    readonly color: string;
    readonly offset: number;
    readonly activeGroupName: number | string;
    readonly isDash?: boolean;
    xs: number[];
    ys: number[];
    t: number[];
    p: number[];
    l: number[];
}
export default class StrokeShape extends BaseShape<StrokeShapeProperties> {
    static key: number;
    name: string;
    movePoint: point;
    rectBounding: InstanceType<typeof RectShape>;
    constructor(userOptions: StrokeShapeProperties);
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    addPoint(point: newPoint): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    getSourceRect(): void;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): StrokeShape;
    computeCrash(p: point, lineDis: number): boolean;
}
interface pointListPath extends properties {
    xs: number[];
    ys: number[];
    t: number[];
    p: number[];
    l: number[];
}
export {};
//# sourceMappingURL=Stroke.d.ts.map