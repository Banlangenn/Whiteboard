import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape, Graphics } from './Shape';
import RectShape from './Rect';
export interface GroupProperties extends properties {
    g: Graphics[];
}
export default class GroupShape extends BaseShape<GroupProperties> {
    static key: number;
    name: string;
    movePoint: point;
    rectBounding: InstanceType<typeof RectShape>;
    constructor(g?: Graphics[]);
    getContent(): Graphics[];
    setContent(g: Graphics[]): this;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): GroupShape;
    getSourceRect(): void;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    computeCrash(p: point, lineDis: number): boolean;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeBounding(): void;
}
export declare class InnerGroupShape extends GroupShape {
    static key: number;
    static cache: boolean;
    name: string;
    constructor(p: properties);
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
}
