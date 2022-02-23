import { limitValue, point } from '../../utils';
import { newPoint, EventHub } from './../../utils';
export interface pointListPath extends properties {
    xs: number[];
    ys: number[];
    t: number[];
    p: number[];
    l: number[];
}
export interface pointListPathItem extends newPoint {
    p: number;
    l: number;
}
declare type pointListI = pointListPath | point[] | [point, point];
export declare function getPointByIndex(stroke: pointListPath, index: number): pointListPathItem;
export declare function fnAfter(context: any, fn: (...argArray: any) => any, afterFn: (...argArray: any) => any): (...arg: any) => any;
export interface properties {
    x: number;
    y: number;
    key: number;
    fill?: boolean;
    fillColor?: string;
    globalAlpha?: number;
    color?: string;
    isDash?: boolean;
    opacity?: number;
    angle?: number;
    width: number;
    height: number;
    lineWidth: number;
    available?: boolean;
    disabled?: boolean;
    path2d?: {
        path: Path2D;
        end: boolean;
    };
}
export declare abstract class BaseShape<T extends properties> {
    static key: number | string;
    static cache: boolean;
    isEdit: boolean;
    appendPointCallTimes: number;
    disabled: boolean;
    data: T;
    threshold: number;
    transformHandles: TransformHandles;
    limitValue: limitValue;
    subEvents: {
        type: string;
        fn: (...args: unknown[]) => void;
    }[];
    constructor();
    get available(): boolean;
    destroy(events: EventHub): void;
    drawAttributeInit(context: CanvasRenderingContext2D): void;
    polygonCheckCrash(ePoint: point, points: point[], lineDis: number): boolean;
    lineCheckCrash(ePoint: point, pointList: pointListI, lineDis: number): boolean;
    getAllPointByIndex(points: pointListPath | point[], index: number): point;
    setEditStatus(b: boolean): void;
    setDisabledStatus(b: boolean): void;
    setData(data: Partial<T>): this;
    getData(): T;
    setContent(_g: Graphics[]): this;
    getContent(): Graphics[];
    initLimitValue(): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    isClientVisible(lm: limitValue): boolean;
    getTransformHandles(limit: limitValue, angle: number, omitSides?: {
        [T in TransformHandleType]?: boolean;
    }): TransformHandles;
    renderTransformHandles(context: CanvasRenderingContext2D, transformHandles: TransformHandles, angle: number): void;
    resizeTest(p: point, th: TransformHandles): MaybeTransformHandleType;
    auxiliary(ctx: CanvasRenderingContext2D): void;
    getSourceRect(isAppend?: boolean): void;
    abstract computeClick(p: point, events: InstanceType<typeof EventHub>): boolean;
    abstract draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void;
    abstract computeOffsetPath(deviationX: number, deviationY: number): void;
    abstract computeCrash(p: point, lineDis: number): boolean;
    abstract initPending(ctx: CanvasRenderingContext2D, p: newPoint, events: InstanceType<typeof EventHub>, translatePosition?: {
        x: number;
        y: number;
    }): void;
    abstract appendPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: InstanceType<typeof EventHub>): void;
    abstract endPendingPoint(ctx: CanvasRenderingContext2D, p: newPoint, events: InstanceType<typeof EventHub>): void;
    abstract clone(): any;
}
export declare type Graphics = BaseShape<properties> & (new (userOptions: properties, ...rest: unknown[]) => Graphics) & {
    key: number;
};
export declare type TransformHandleDirection = 'n' | 's' | 'w' | 'e' | 'nw' | 'ne' | 'sw' | 'se';
export declare type MaybeTransformHandleType = TransformHandleType | false;
export declare type TransformHandleType = TransformHandleDirection | 'rotation';
export interface TransformHandle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare type TransformHandles = Partial<{
    [T in TransformHandleType]: TransformHandle;
}>;
export declare const rotate: (x1: number, y1: number, x2: number, y2: number, angle: number) => point;
export declare const rotatePoint: (point: point, center: point, angle: number) => point;
export declare function dragElements(pointerDownState: PointerDownState, element: BaseShape<properties>, pointer: point): void;
export interface PointerDownState extends limitValue {
    startPoint: point;
    offset: point;
    angle: number;
}
export declare function transformElements(pointerDownState: PointerDownState, element: BaseShape<properties>, shouldKeepSidesRatio: boolean, transformHandleType: MaybeTransformHandleType, isResizeFromCenter: boolean, pointer: point, isRotateWithDiscreteAngle?: boolean): void;
export declare function resizeShapeElement(pointerDownState: PointerDownState, element: BaseShape<properties>, shouldKeepSidesRatio: boolean, transformHandleDirection: TransformHandleDirection, isResizeFromCenter: boolean, pointer: point): void;
export declare const getResizeOffsetXY: (transformHandleType: MaybeTransformHandleType, selectedElement: BaseShape<properties>, pointer: point) => point;
export {};
