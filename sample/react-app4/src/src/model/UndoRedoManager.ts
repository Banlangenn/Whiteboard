import * as InkModel from '../model/InkModel'
import * as UndoRedoContext from './UndoRedoContext'
import { logger } from './../utils'
import { editDataI } from '../render/SymbolCanvasRendener'
// import Constants from '../configuration/Constants';

export enum undoRedoStatus {
	APPEND = 1,
	REMOVE = 2,
}

export interface undoRedoAction {
	status: undoRedoStatus
	data: editDataI[]
}

export function resetUndoRedo(
	undoRedoContext: UndoRedoContext.undoRedoContextI,
): UndoRedoContext.undoRedoContextI {
	return {
		redoStack: [],
		undoStack: [],
		maxSize: undoRedoContext.maxSize,
		canUndo: false,
		canRedo: false,
	}
}
/**
 *
 * @param undoRedoContext 撤销的数据
 * @param undoRedo  栈数据
 */
export function updateModel(
	undoRedoContext: UndoRedoContext.undoRedoContextI,
	undoRedo: undoRedoAction,
) {
	const undoRedoContextReference = undoRedoContext
	undoRedoContext.undoStack.push(undoRedo)
	if (
		undoRedoContextReference.undoStack.length > undoRedoContextReference.maxSize
	) {
		undoRedoContextReference.undoStack.shift()
	}
	// 新加东西进来 就清掉 右边的撤回
	if (undoRedoContextReference.redoStack.length !== 0) {
		undoRedoContextReference.redoStack = []
	}
	// 新加东西进来 就清掉 右边的撤回
	logger.debug('新加笔记', undoRedo)
	UndoRedoContext.updateUndoRedoState(undoRedoContextReference)
	return undoRedoContextReference
}

export function undo(
	undoRedoContext: UndoRedoContext.undoRedoContextI,
	model: InkModel.model,
) {
	// 左边
	const undoRedoContextReference = undoRedoContext
	if (!undoRedoContextReference.canUndo) return model
	const undoRedo = undoRedoContextReference.undoStack.pop() as undoRedoAction
	undoRedoContextReference.redoStack.push({
		status:
			undoRedo.status === undoRedoStatus.REMOVE
				? undoRedoStatus.APPEND
				: undoRedoStatus.REMOVE,
		data: undoRedo.data,
	})

	if (
		undoRedoContextReference.redoStack.length > undoRedoContextReference.maxSize
	) {
		undoRedoContextReference.redoStack.shift()
	}
	return changModel(undoRedoContextReference, model, undoRedo)
}

export function redo(
	undoRedoContext: UndoRedoContext.undoRedoContextI,
	model: InkModel.model,
): InkModel.model {
	// 右边
	const undoRedoContextReference = undoRedoContext

	if (!undoRedoContextReference.canRedo) return model
	const redoRedo = undoRedoContextReference.redoStack.pop() as undoRedoAction
	undoRedoContextReference.undoStack.push({
		status:
			redoRedo.status === undoRedoStatus.REMOVE
				? undoRedoStatus.APPEND
				: undoRedoStatus.REMOVE,
		data: redoRedo.data,
	})
	if (
		undoRedoContextReference.undoStack.length > undoRedoContextReference.maxSize
	) {
		undoRedoContextReference.undoStack.shift()
	}
	return changModel(undoRedoContextReference, model, redoRedo)
}

function changModel(
	undoRedoContext: UndoRedoContext.undoRedoContextI,
	model: InkModel.model,
	RedoUndo: undoRedoAction,
): InkModel.model {
	const undoRedoContextReference = undoRedoContext
	const modelReference = model
	UndoRedoContext.updateUndoRedoState(undoRedoContextReference)
	// 更新model
	if (RedoUndo.status === undoRedoStatus.APPEND) {
		const len = RedoUndo.data.length
		const start = modelReference.activeGroupStroke.length - len
		modelReference.activeGroupStroke.splice(start, len)
	} else {
		modelReference.activeGroupStroke.push(...RedoUndo.data)
	}
	return modelReference
}
