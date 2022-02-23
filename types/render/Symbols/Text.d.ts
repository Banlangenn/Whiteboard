import { point, newPoint, EventHub } from '../../utils';
import { properties, BaseShape } from './Shape';
import RectShape from './Rect';
export interface TextProperties extends properties {
    text: string;
    fontSize: number;
    x: number;
    y: number;
    width: number;
    height: number;
    baseline: number;
    opacity: number;
    strokeColor: string;
    textAlign: string;
    isAuxiliary: boolean;
}
export default class TextShape extends BaseShape<TextProperties> {
    static key: number;
    name: string;
    movePoint: point;
    rectBounding: InstanceType<typeof RectShape>;
    constructor(userOptions: TextProperties);
    draw(context: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    initPending(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub, translatePosition?: {
        x: number;
        y: number;
    }): void;
    appendPoint(ctx: CanvasRenderingContext2D, point: newPoint, events: EventHub): void;
    endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub): void;
    computeOffsetPath(deviationX: number, deviationY: number): void;
    clone(): TextShape;
    getSourceRect(): void;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    computeCrash(p: point, lineDis: number): boolean;
    computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    computeBounding(): void;
}
export declare type FontString = string & {
    _brand: 'fontString';
};
export declare const getFontString: ({ fontSize }: {
    fontSize: number;
}) => FontString;
export declare const measureText: (text: string, font: FontString) => {
    width: number;
    height: number;
    baseline: number;
};
