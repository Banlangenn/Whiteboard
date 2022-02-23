import Logger from './../model/logger';
export declare const logger: Logger;
export interface rect {
    width: number;
    height: number;
}
export interface point {
    x: number;
    y: number;
}
export interface newPoint extends point {
    t: number;
    p?: number;
}
export interface limitValue {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
}
export interface Dictionary<T> {
    [key: string]: T;
}
export declare function computeMaxArea(originScreen: rect, currentScreen: rect, filledType?: string): {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    filled: string;
};
export declare function computeScreen(originScreen: rect, currentScreen: rect, filledType?: string): {
    styleProperty: {
        top: string;
        transform: string;
        left: number;
        'transform-origin': string;
        width: string;
        height: string;
        position: string;
    } | {
        left: string;
        transform: string;
        top: number;
        'transform-origin': string;
        width: string;
        height: string;
        position: string;
    };
    scale: number;
    filled: string;
};
export declare function getInt(num: number): number;
export declare function limit(value: number, min: number, max: number): number;
export declare function getDistance(p1: point, p2: point): number;
export declare function distanceOfPoint2Line(p1: point, p2: point, { x, y }: point): number;
export declare function rectCheckCrashPoint(a: limitValue, p: point): boolean;
export declare function rectCheckCrash(a: limitValue, b: limitValue): boolean;
export declare function rectContainLine(a: limitValue, b: limitValue): boolean;
export interface clientPoint {
    clientX: number;
    clientY: number;
}
interface containerLocation {
    scale: number;
    width: number;
    height: number;
    left: number;
    top: number;
}
export declare function extractPoint({ clientX, clientY }: clientPoint, { scale, width, height, left, top }: containerLocation, translatePosition: undefined | point, limitVal?: limitValue): newPoint;
export declare function extractPointV2({ clientX, clientY }: {
    clientX: number;
    clientY: number;
}, domElement: HTMLElement, scale: number, translatePosition: null | point): newPoint;
export declare function getPointsLimitValue(points: point[] | {
    x: number[];
    y: number[];
}, threshold?: number): limitValue;
export declare function getRectLimitValue(point: point, width: number, height: number, threshold?: number): limitValue;
export declare function getLimit2Rect(limitVal: limitValue): {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare function points2Rect(p1: point, p2: point): {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare function getRectangularVertex(limitValue: limitValue): point[];
export declare function drawAttributeInit(context: CanvasRenderingContext2D, color: string, width: number, isDash?: boolean): void;
export declare function getMidpoint(p1: point, p2: point): point;
export declare function createImage(url: string): Promise<HTMLImageElement>;
export declare function loadImage<T extends string | string[] = string>(url: T): Promise<T extends string ? HTMLImageElement : HTMLImageElement[]>;
declare type Event = (...args: any[]) => void;
export declare class EventHub {
    private cache;
    private eventTypes;
    constructor(type?: string[]);
    registerType(types: string | string[]): void;
    destroy(): void;
    on(eventType: string, fn: Event): void;
    emit(eventType: string, ...args: unknown[]): void;
    once(eventType: string, fn: Event): void;
    off(eventType?: string, fn?: Event): void;
    private hasType;
}
export declare const nanoid: (size?: number) => string;
export declare class Random {
    seed: number;
    constructor(seed: number);
    next(): number;
}
export declare const randomInteger: () => number;
export declare function cloneDeep<T>(parent: T): T;
export {};
//# sourceMappingURL=index.d.ts.map