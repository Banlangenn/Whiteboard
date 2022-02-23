import { undoRedoAction } from './UndoRedoManager';
export interface undoRedoContextI {
    redoStack: undoRedoAction[];
    undoStack: undoRedoAction[];
    maxSize: number;
    canUndo: boolean;
    canRedo: boolean;
}
export declare function createUndoRedoContext(maxStackSize: number): undoRedoContextI;
export declare function updateUndoRedoState(undoRedoContext: undoRedoContextI): undoRedoContextI;
//# sourceMappingURL=UndoRedoContext.d.ts.map