import { pointListPath } from './Symbols/StrokeComponent';
import { point, limitValue } from './../utils';
export declare enum Status {
    STATUS_PEN = 2,
    STATUS_ARROW = 3,
    STATUS_RUBBER = 7,
    STATUS_LINE = 10,
    STATUS_TRIANGLE = 11,
    STATUS_RECTANGLE = 12,
    STATUS_TRAPEZIUM = 13,
    STATUS_OVAL = 14,
    STATUS_COORDINATE = 15,
    STATUS_NUMBER_AXIS = 16,
    STATUS_DASH_LINE = 17,
    STATUS_CIRCLE_CENTER = 18,
    STATUS_COMPASSES = 19,
    STATUS_CIRCLE = 20,
    STATUS_DASH = 21,
    STATUS_NO_PATH_PEN = 1000,
    STATUS_MOVE = 101
}
export interface properties extends Partial<limitValue> {
    readonly width: number;
    readonly color: string;
    readonly type: Status;
    readonly offset: number;
    readonly activeGroupName: number | string;
    readonly isDash?: boolean;
    path2d?: {
        path: Path2D;
        end: boolean;
    };
}
declare type baseProperties = properties;
export interface drawRectParams extends baseProperties {
    points: point[];
}
export interface drawCircularParams extends baseProperties {
    center: point;
    radius: number;
    isDrawC: boolean;
}
export interface drawEllipseParams extends baseProperties {
    center: point;
    minRadius: number;
    maxRadius: number;
}
export interface drawCircularEraserParams extends baseProperties {
    center: point;
    radius: number;
    color: string;
}
export interface drawPolygonParams extends baseProperties {
    points: point[];
}
export declare type drawLineParams = drawPolygonParams;
export interface drawLineArrowParams extends drawLineParams {
    theta?: number;
    headlen?: number;
}
export interface drawNumberAxisParams extends drawLineArrowParams {
    center: point;
    interval?: number;
    bulge?: number;
    centerRadius: number;
}
export declare type editData = pointListPath | drawPolygonParams | drawLineArrowParams | drawCircularEraserParams | drawLineParams | drawEllipseParams | drawCircularParams | drawRectParams | drawNumberAxisParams;
export declare type editDataI = editData | (editData & limitValue);
export declare function drawSymbol(context: CanvasRenderingContext2D, symbol: editDataI, savePath?: boolean): void;
export declare function computeBounding(symbol: editDataI): editDataI & limitValue;
export declare function computeCrash(ePoint: point, symbol: editDataI, lineDis: number): boolean;
export declare function computeOffsetPath(symbol: editDataI, offsetX: number, offsetY: number): editDataI;
export {};
