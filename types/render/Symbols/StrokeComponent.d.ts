import { newPoint } from './../../utils';
import { properties } from './../SymbolCanvasRendener';
export interface pointListPathItem extends newPoint {
    p: number;
    l?: number;
}
export interface pointListPath extends properties {
    x: number[];
    y: number[];
    t: number[];
    p: number[];
    l?: number[];
}
export declare function createStrokeComponent(properties: properties): pointListPath;
export declare function addPoint(stroke: pointListPath, point: newPoint): pointListPath | undefined;
export declare function getPointByIndexV2(stroke: pointListPath, index: number): pointListPathItem;
export declare function getPointByIndex(stroke: pointListPath, index: number): pointListPathItem;
