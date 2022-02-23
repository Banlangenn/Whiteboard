import { pointListPath } from './StrokeComponent';
import { point } from './../../utils';
import { drawPolygonParams, drawEllipseParams, drawCircularParams, drawNumberAxisParams } from './../SymbolCanvasRendener';
export declare function coordinateAxisCheckCrash(point: point, coordinateAxisParams: drawNumberAxisParams, lineDis: number): boolean;
export declare function arcCheckCrash(point: point, arcParams: drawCircularParams, lineDis: number): boolean;
export declare function polygonCheckCrash(ePoint: point, polygonParams: drawPolygonParams, lineDis: number): boolean;
export declare function ellipseCheckCrash({ x, y }: point, ellipseParams: drawEllipseParams, lineDis: number): boolean;
declare type pointListI = pointListPath | point[] | [point, point];
export declare function lineCheckCrash(ePoint: point, pointList: pointListI, lineDis: number): boolean;
export {};
//# sourceMappingURL=crashSymbol.d.ts.map