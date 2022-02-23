import * as InkModel from '../model/InkModel';
import * as UndoRedoContext from './UndoRedoContext';
import { editDataI } from '../render/SymbolCanvasRendener';
export declare enum undoRedoStatus {
    APPEND = 1,
    REMOVE = 2
}
export interface undoRedoAction {
    status: undoRedoStatus;
    data: editDataI[];
}
export declare function resetUndoRedo(undoRedoContext: UndoRedoContext.undoRedoContextI): UndoRedoContext.undoRedoContextI;
export declare function updateModel(undoRedoContext: UndoRedoContext.undoRedoContextI, undoRedo: undoRedoAction): UndoRedoContext.undoRedoContextI;
export declare function undo(undoRedoContext: UndoRedoContext.undoRedoContextI, model: InkModel.model): InkModel.model;
export declare function redo(undoRedoContext: UndoRedoContext.undoRedoContextI, model: InkModel.model): InkModel.model;
//# sourceMappingURL=UndoRedoManager.d.ts.map