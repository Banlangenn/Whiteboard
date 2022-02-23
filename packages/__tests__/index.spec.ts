import Edit from './../src'

describe('dom 测试', () => {
    it('是否创建了dom', () => {
        const container = document.createElement('div')
        const option = {
            el: container,
            penColor: '#f60',
            penWidthStatus: 2,
            canDraw: true
        }
        // eslint-disable-next-line no-new
        new Edit(option)
        expect(container.getElementsByClassName('crop-container').length).toBe(1)
        expect(container.getElementsByTagName('canvas').length).toBe(3)
    })
})


describe('常用方法测试 测试', () => {
    it('传入的ready 是否运行', () => {
        const container = document.createElement('div')
        const ready = jest.fn()
        const option = {
            el: container,
            penColor: '#f60',
            penWidthStatus: 2,
            canDraw: true
        }
        // eslint-disable-next-line no-new
        new Edit(option, ready)
        expect(ready).toHaveBeenCalled()
    })

    // 测试public的 方法
})


it('传入的el   dom 不合法', () => {
    // const ready = jest.fn()
    const option = {
        el: 'hellow',
        penColor: '#f60',
        penWidthStatus: 2,
        canDraw: true
    }
    // eslint-disable-next-line no-new
    // new Edit(option, ready)
    expect(() => new Edit(option)).toThrow('无法获取dom节点, 请检查传入的el是否正确')
})

describe('public 方法测试 测试', () => {
    const container = document.createElement('div')
    const option = {
        el: container,
        penColor: '#f60',
        penWidthStatus: 2,
        canDraw: true
    }
    // eslint-disable-next-line no-new
    const edit = new Edit(option)

    it('props pencolor 是否正确', () => {
        expect(edit.penColor).toBe('#f60')
    })

    // 测试public的 方法
})

/**
 *
 // 测试画笔取消-- 我先把屏幕 铺满 然后 ctx.getImageData(0,0,c.width,c.height)
 获取  几像素 看看是不是对应颜色
 */