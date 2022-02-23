import { StrokeShapeProperties } from './../Symbols/Stroke';
import { point } from './../../utils';
export interface strokePoint extends point {
    p: number;
}
export declare function renderArc(context: Path2D | CanvasRenderingContext2D, center: point, radius: number): void;
export declare function drawStroke(context: CanvasRenderingContext2D, stroke: StrokeShapeProperties, savePath: boolean): void;
export declare function drawStrokev5(context: CanvasRenderingContext2D, stroke: StrokeShapeProperties, savePath: boolean): void;
//# sourceMappingURL=QuadraticCanvasStroker.d.ts.map