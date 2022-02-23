import {
    createUndoRedoContext
} from './../src/model/UndoRedoContext'
import {
    updateModel,
    undoRedoStatus,
    resetUndoRedo,
    undo,
    redo
} from './../src/model/UndoRedoManager'
import {
    Status
} from './../src/render/SymbolCanvasRendener'

import { createModel } from './../src/model/InkModel'

describe('撤销 重做 测试', () => {
    let ctx = createUndoRedoContext(2)
    let model = createModel()
    const editData = {
        color: 'red',
        type: Status.STATUS_CIRCLE,
        center: { x: 150, y: 300 },
        radius: 50,
        isDrawC: false,
        width: 1.2,
        offset: 1,
        activeGroupName: 0
    }


    it('创建', () => {
        expect(ctx).toEqual({
            redoStack: [],
            undoStack: [],
            maxSize: 2,
            canUndo: false,
            canRedo: false
        })
    })
    it('添加进栈', () => {
        model.activeGroupStroke.push(editData)
        ctx = updateModel(ctx, {
            status: undoRedoStatus.APPEND,
            data: [ editData ]
        })
        expect(ctx.canRedo).toBe(false)
        expect(ctx.canUndo).toBe(true)
        expect(ctx.undoStack.length).toBe(1)
        expect(ctx.redoStack.length).toBe(0)
    })

    it('撤销栈 maxSize是否正确', () => {
        model.activeGroupStroke.push(editData)
        ctx = updateModel(ctx, {
            status: undoRedoStatus.APPEND,
            data: [ editData ]
        })
        model.activeGroupStroke.push(editData)
        ctx = updateModel(ctx, {
            status: undoRedoStatus.APPEND,
            data: [ editData ]
        })
        expect(ctx.undoStack.length).toBe(2)
    })

    
    it('撤销  model 和 撤销栈 是否正确', () => {
        const len = model.activeGroupStroke.length
        model = undo(ctx, model)
        expect(model.activeGroupStroke.length).toBe(len - 1)
        expect(ctx.undoStack.length).toBe(1)
        expect(ctx.redoStack.length).toBe(1)
        model = redo(ctx, model)
        expect(ctx.undoStack.length).toBe(2)
        expect(ctx.redoStack.length).toBe(0)
        expect(model.activeGroupStroke.length).toBe(len)
    })
    
    
    it('初始化 撤销', () => {
        ctx = resetUndoRedo(ctx)
        expect(ctx).toEqual(createUndoRedoContext(2))
    })
})
