import { drawPolygonParams, drawLineArrowParams, drawCircularEraserParams, drawLineParams, drawEllipseParams, drawCircularParams, drawRectParams, drawNumberAxisParams } from './../SymbolCanvasRendener';
export declare function drawCurveLine(): void;
export declare function drawRect(context: CanvasRenderingContext2D, params: drawRectParams): void;
export declare function drawRectv2(context: CanvasRenderingContext2D, params: drawRectParams): void;
export declare function drawCircular(context: CanvasRenderingContext2D, params: drawCircularParams): void;
export declare function drawPolygon(context: CanvasRenderingContext2D, polygonParams: drawPolygonParams): void;
export declare function drawEllipse(context: CanvasRenderingContext2D, ellipseParams: drawEllipseParams): void;
export declare function drawCircularEraser(context: CanvasRenderingContext2D, props: drawCircularEraserParams): void;
export declare function drawLine(context: CanvasRenderingContext2D, linePrams: drawLineParams): void;
export declare function drawLineArrow(context: CanvasRenderingContext2D, lineArrowParams: drawLineArrowParams): void;
export declare function drawHorizontalNumberAxis(context: CanvasRenderingContext2D, numberAxisParams: drawNumberAxisParams): void;
export declare function drawCoordinateAxis(context: CanvasRenderingContext2D, numberAxisParams: drawNumberAxisParams): void;
