import { undoRedoAction } from './UndoRedoManager'
export interface undoRedoContextI {
	redoStack: undoRedoAction[]
	undoStack: undoRedoAction[]
	maxSize: number
	canUndo: boolean
	canRedo: boolean
}
export function createUndoRedoContext(maxStackSize: number): undoRedoContextI {
	return {
		redoStack: [],
		undoStack: [],
		maxSize: maxStackSize,
		canUndo: false,
		canRedo: false,
	}
}

/**
 * Update the undo/redo state
 * @param {UndoRedoContext} undoRedoContext Current undo/redo context
 * @return {UndoRedoContext} Updated undo/redo context
 */
export function updateUndoRedoState(
	undoRedoContext: undoRedoContextI,
): undoRedoContextI {
	const undoRedoContextRef = undoRedoContext
	undoRedoContextRef.canUndo = undoRedoContext.undoStack.length > 0
	undoRedoContextRef.canRedo = undoRedoContext.redoStack.length > 0
	return undoRedoContextRef
}
