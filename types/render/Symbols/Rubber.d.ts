import { limitValue, point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape } from './Shape';
export interface RubberShapeProperties extends properties {
    center: point;
    radius: number;
}
export default class RubberShape extends BaseShape<RubberShapeProperties> {
    static key: number;
    static cache: boolean;
    name: string;
    constructor(userOptions: RubberShapeProperties);
    isClientVisible(lm: limitValue): boolean;
    getPointsLimitValue(): void;
    isClientArea(lm: limitValue): boolean;
    draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): RubberShape;
    computeCrash(p: point, lineDis: number): boolean;
    computeClick(p: point): boolean;
    computeBounding(): void;
}
