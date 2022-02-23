import { limitValue } from './../../utils';
import { pointListPath } from './StrokeComponent';
import { drawLineArrowParams, drawEllipseParams, drawCircularEraserParams, drawRectParams, drawNumberAxisParams } from './../SymbolCanvasRendener';
export declare function getStrokeBounding(stroke: pointListPath): pointListPath & limitValue;
export declare function getArcBounding<T extends drawCircularEraserParams>(circularParams: T): T & limitValue;
export declare function getPolygonBounding<T extends drawRectParams>(pointsMaxMinParams: T): T & limitValue;
export declare function getLineBounding(lineParams: drawLineArrowParams): drawLineArrowParams & limitValue;
export declare function getEllipseBounding<T extends drawEllipseParams>(params: T): T & limitValue;
export declare function getCoordinateAxisBounding(coordinateAxisParams: drawNumberAxisParams): drawNumberAxisParams & limitValue;
