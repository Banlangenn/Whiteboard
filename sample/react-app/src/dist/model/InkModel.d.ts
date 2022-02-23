import { pointListPath } from '../render/Symbols/StrokeComponent';
import { editDataI, properties } from '../render/SymbolCanvasRendener';
import { newPoint } from '../utils';
export interface model {
    disappearStroke: pointListPath[];
    currentStroke: editDataI | null;
    _activeGroupName: number | string;
    groupStroke: groupStroke;
    activeGroupStroke: editDataI[];
    lastStroke: editDataI;
    defaultSymbols: editDataI[];
    lastStrokePoint: newPoint | null;
    startPoint: newPoint;
    destroy: any;
}
export declare type groupStroke = {
    [key in number | string]: editDataI[];
};
export declare function createModel(defaultSymbols?: editDataI[]): model;
export declare function appendToCurrentGroup(model: model, newData: editDataI): void;
export declare function resetModel(model: model): model;
export declare function clearGroup(model: model): model;
declare type activeGroupNameI = string | number;
export declare function switchGroup(model: model, activeGroupName?: activeGroupNameI): activeGroupNameI;
export declare function initPendingStroke(model: model, point: newPoint, properties: properties): model;
export declare function appendToPendingStroke(model: model, point: newPoint): model | undefined;
export declare function endPendingStroke(model: model): void;
export declare function initDoublePoint(model: model, point: newPoint, properties: properties): model;
export declare function appendToDoublePoint(model: model, point: newPoint): model;
export declare function getDisappearFirstPointTime(model: model): number;
export {};
//# sourceMappingURL=InkModel.d.ts.map