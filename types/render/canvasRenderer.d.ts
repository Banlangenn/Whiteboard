import { limitValue, point, rect } from './../utils';
import { editDataI } from './SymbolCanvasRendener';
import { model } from '../model/InkModel';
export interface canvasContext {
    canvasContainer: HTMLElement;
    scale: number;
    filled: string | undefined;
    left: number;
    top: number;
    width: number;
    height: number;
    pixelRatio: number;
    minHeight: number;
    minWidth: number;
    renderingCanvas: HTMLCanvasElement;
    renderingCanvasContext: CanvasRenderingContext2D;
    capturingCanvas: HTMLCanvasElement;
    capturingCanvasContext: CanvasRenderingContext2D;
    disappearCanvas: HTMLCanvasElement;
    disappearCanvasContext: CanvasRenderingContext2D;
}
export declare function resizeContent(context: canvasContext, originScreen?: rect): canvasContext;
export declare function attach(element: HTMLElement, minHeight?: number, minWidth?: number, originScreen?: rect): canvasContext;
export declare function clearCapturingCanvas(context: canvasContext, x?: number, y?: number): void;
export declare function clearRenderingCanvas(context: canvasContext, x?: number, y?: number): void;
export declare function drawDisappearModel(context: canvasContext, model: model): void;
export declare function translatePartialUpdate(context: canvasContext, model: model, translatePosition: point, rectStroke: drawClipAndStroke | undefined, cb: (stroke: editDataI[]) => void): void;
export declare function translateDrawCurrentStroke(context: canvasContext, model: model, translatePosition: point, strokes: editDataI | editDataI[]): void;
export declare function translateDrawModel(context: canvasContext, model: model, translatePosition: point, strokes?: editDataI[]): void;
export declare function drawModel(context: canvasContext, model: model, strokesLine?: editDataI[]): void;
export declare function drawCurrentStroke(context: canvasContext, model: model, stroker: editDataI | editDataI[]): void;
export declare function clearCanvas(context: canvasContext): void;
export declare function getLineIntersection(line: limitValue, pointList: editDataI[]): editDataI[];
export interface drawClipAndStroke extends point, rect {
    stroke: editDataI[];
}
export declare function getStrokeLimit(stroke: editDataI[]): limitValue;
export declare function getInfluenceRange(model: model, crashActiveLine: editDataI[]): drawClipAndStroke | undefined;
export declare function partialUpdate(context: canvasContext, model: model, rectStroke: drawClipAndStroke | undefined, cb: (stroke: editDataI[]) => void): void;
export declare function pointCheckCrash(stroke: editDataI, { x, y }: point, radius?: number): boolean;
export declare function getCrashActiveLineAndRemoveV2(model: model, ePoint: point, radius: number, once?: boolean): editDataI[];
export declare function getRectCrashLine(model: model, limitValue: limitValue, isRemove: boolean): editDataI[];
