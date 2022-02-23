import Edit from './../src'
const container = document.createElement('div')
const option = {
    el: container,
    penColor: '#f60',
    penWidthStatus: 2,
    canDraw: true
}
// eslint-disable-next-line no-new
const edit = new Edit(option)


describe('enent 发布订阅 测试', () => {
    
    it('回调函数是否正确执行', () => {
        const on = jest.fn()
        edit.on('event', on)
        edit.emit('event', '123')
        edit.emit('event', '123')
        expect(on).toHaveBeenCalledTimes(2)
    })
    it('off 函数是否有用', () => {
        const on = jest.fn()
        edit.on('event', on)
    
        edit.emit('event', '123')
        edit.off('event', on)
        edit.emit('event', '456')
        expect(on).toHaveBeenCalledTimes(1)
    })

    it('once 函数是否有用', () => {
        let params = 0
        const on = jest.fn((arg) => {
            params = arg
        })
        edit.once('event', on)
        edit.emit('event', '123')
        edit.emit('event', '123')
        expect(params).toBe('123')
        expect(on).toHaveBeenCalledTimes(1)
    })

    it('一个事件多个订阅触发和 3种注销订阅', () => {
        const on1 = jest.fn()
        const on2 = jest.fn()
        const on3 = jest.fn()
        edit.on('event', on1)
        edit.on('event', on2)
        edit.on('event', on3)

        edit.on('event2', on1)
        edit.on('event2', on2)


        edit.off('event', on3) // 精确注销
        edit.emit('event', '123')
        edit.off('event') // 注销所有 event 订阅
        edit.emit('event', '456')
        expect(on1).toHaveBeenCalledTimes(1)
        expect(on2).toHaveBeenCalledTimes(1)
        expect(on3).toHaveBeenCalledTimes(0)


        edit.emit('event2', '456')
        expect(on1).toHaveBeenCalledTimes(2)
        expect(on2).toHaveBeenCalledTimes(2)
        edit.off() // 注销所有订阅
        edit.emit('event2', '456')
        expect(on1).toHaveBeenCalledTimes(2)
        expect(on2).toHaveBeenCalledTimes(2)
    })

})
