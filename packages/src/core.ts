import {
	Dictionary,
	rect,
	extractPoint,
	EventHub,
	clientPoint,
	limitValue,
	point,
	rectCheckCrash,
	getRectLimitValue,
	rectContainLine,
	createImage,
	logger,
} from './utils'
import { Status } from './render/SymbolCanvasRendener'
import History, { HistoryEntry } from './model/history'

import * as renderer from './render/canvasRenderer'
import {
	ComFunc,
	CropProps,
	eventType,
	CropState,
	CropComponent,
	localTouchEvent,
} from './core.type'
import { properties, Graphics } from './render/Symbols/Shape'

function createFunc<T>(c: new (...arg: any[]) => T, ...rest: any[]): T {
	return new c(...rest)
}

// 开闭包 缓存 需要缓存的实例 比如 橡皮
function createGraphicsBase<T extends Graphics>(): (
	shape: T,
	...res: any[]
) => T {
	const shapeCache: { [key: string]: any } = {}
	return (shape, ...res) => {
		// console.log('createGraphicsBaseres缓存params：', res)
		const ShapeIns = Object.getPrototypeOf(shape).constructor
		if (ShapeIns.cache) {
			const key = ShapeIns.key
			const currentShape = shapeCache[key]
			if (currentShape) {
				// 缓存  橡皮和组 实例
				currentShape.setData(...res)
				// console.log(currentShape, 'createGraphicsBase')
				return currentShape
			} else {
				shapeCache[key] = createFunc(shape, ...res)
				return shapeCache[key]
			}
		}
		return createFunc(shape, ...res)
	}
}
// 这个函数可以传值的  是个闭包缓存
const createGraphics = createGraphicsBase<Graphics>()
// (c: new (...arg: any[]) => Graphics, p: properties, e: EventHub) => Graphics

const eventArray: string[] = [
	'dblclick',
	'mousedown',
	'mouseup',
	'mousemove',
	'mouseout',
	'touchmove',
	'touchstart',
	'touchend',
	'touchcancel',
]
const enumEvent: Dictionary<eventType> = {
	dblclick: eventType.DBLCLICK,
	touchmove: eventType.MOVE,
	touchstart: eventType.DOWN,
	touchend: eventType.UP,
	touchcancel: eventType.UP,
	// PC
	mousemove: eventType.MOVE,
	mousedown: eventType.DOWN,
	mouseup: eventType.UP,
	mouseout: eventType.UP,
}
// 类型
// 不同的类型
// 后续在加
// 线不管loading

export class Crop extends EventHub {
	private nativeEventStop: boolean
	private nativeEventPrev: boolean
	private canRender: boolean
	private el: HTMLElement
	private canDraw: boolean
	private state!: CropState
	private context: renderer.canvasContext
	private _translatePosition: undefined | point
	private _focus = true
	private _isMDown = false // 鼠标抬起来 按下去  模仿 touchstart
	private _disappearColor: undefined | string //  消失笔的颜色
	private _renderer = renderer
	// 播放器
	// private _player: playerI
	private _container: HTMLElement
	private graphicsMap!: { [key: number]: Graphics }
	private currentGraphics!: Graphics
	private events: EventHub = new EventHub()
	private currentPage: Graphics[] = []
	private _installedCom: { [key: string]: ComFunc<Crop> } = {}
	private history: InstanceType<typeof History>
	constructor(option: Required<CropProps>, ready?: (...arg: any[]) => void) {
		super([
			'data',
			'ready',
			'penColor',
			'focus',
			'blur',
			'updateModel',
			'dispose',
		])
		// let graphics: any[] = [ StrokeShape, RubberShape, ImageShape, TextShape, InnerGroupShape, RectShape ]
		let graphics: Graphics[] = []
		// // StrokeShape.key
		if (option.graphics && Array.isArray(graphics)) {
			// option.graphics[0].
			graphics.push(...option.graphics)
		}
		this.graphicsMap = graphics.reduce<{
			[key: number]: Graphics
		}>((p, n) => {
			p[n.key] = n
			return p
		}, {})

		// 可以考虑走循环
		// 判断 canRender 是否传了
		this.canRender = option.canRender
		this.nativeEventStop = option.nativeEventStop
		this.nativeEventPrev = option.nativeEventPrev
		this.canDraw = option.canDraw
		this.state = {
			penWidth: option.penWidth,
			penStatus: option.status,
			penColor: option.penColor,
		}

		// 判断 传入的 dom 是否正确
		// this._disappearColor = option.disappearColor // 默认 pen的颜色
		// this.model = option.defaultSymbols ? createModel(option.defaultSymbols.map(e => computeBounding(e))) : createModel()

		this.el = option.el as HTMLElement
		// 事件放在了 this._container
		this._container = document.createElement('div')
		this._container.classList.add('edit-container')
		this._container.style.position = 'relative'
		this._container.style.overflow = 'auto'
		this.el.appendChild(this._container)
		this.context = this._renderer.attach(this._container, 10, 10)
		this.appendCom(option.component)
		// this.handleCanvasDoubleClick = this.handleCanvasDoubleClick.bind(this)
		// logger.setLevel((option.loggerLevel || 5))
		// test 创建图片
		// 原来的屏幕-
		this.history = new History()
		// -----------------------------------------
		this.init()
		// 内部事件
		// this.EventHub
		if (ready) {
			ready(this)
		}
		this.emit('ready', this)
	}

	public getElement(id: string): Graphics | null {
		// 维护map  海曙数组
		for (const el of this.currentPage) {
			if (el.getData().id === id) {
				return el
			}
		}
		return null
	}

	/**
	 * 整个画布 绘制
	 *
	 * @param {editDataI[]} [strokes]
	 * @memberof Crop
	 */
	// 这是必须的绘画
	public translateRender(
		data: {
			x?: number
			y?: number
		} = {},
	) {
		// 偏移量要记起来
		// shu
		const { x = 0, y = 0 } = data
		this._translatePosition = this._translatePosition || { x: 0, y: 0 }
		const { width, height, renderingCanvasContext, capturingCanvasContext } =
			this.context
		const limitVal = getRectLimitValue(
			{
				x,
				y,
			},
			width,
			height,
		)
		const lineIntersection = this.currentPage.filter((item) =>
			item.isClientVisible(limitVal),
		)
		// 计算当前的偏移量
		// y 是卷上去的高度
		const translateX = this._translatePosition.x - x
		const translateY = this._translatePosition.y - y
		renderingCanvasContext.translate(translateX, translateY)
		renderingCanvasContext.clearRect(x, y, width, height)
		if (lineIntersection.length !== 0) {
			this.drawGraphics(renderingCanvasContext, lineIntersection)
		}

		capturingCanvasContext.translate(translateX, translateY)
		capturingCanvasContext.clearRect(x, y, width, height)
		const currentGraphics = this.currentGraphics
		// 不能用cache 判断 -- 组也是缓存的
		if (currentGraphics?.isClientVisible(limitVal)) {
			currentGraphics.drawAttributeInit(capturingCanvasContext)
			currentGraphics.draw(capturingCanvasContext)
		}

		this._translatePosition = {
			x,
			y,
		}
	}
	drawCurrentGroup(strokes?: Graphics[] | Graphics) {
		if (!this.canRender) return
		const { x = 0, y = 0 } = this._translatePosition || {}
		if (strokes) {
			this.drawGraphics(this.context.renderingCanvasContext, strokes)
			// 清除上层 canvas
			// 在上层画 之后 要转移到下层 -- 如果都在会变粗
			// 有些情况是不需要的
			this.renderer.clearCapturingCanvas(this.context, x, y)
			//  为什么加这个 + 文字失去焦点会出现
			// this.drawGraphics(this.context.capturingCanvasContext, [this.currentGraphics])
			return
		} else {
			if (this._translatePosition) {
				const { width, height, renderingCanvasContext } = this.context
				const limitVal = getRectLimitValue(
					{
						x,
						y,
					},
					width,
					height,
				)
				const lineIntersection = this.currentPage.filter((item) =>
					item.isClientVisible(limitVal),
				)
				renderingCanvasContext.clearRect(x, y, width, height)
				if (lineIntersection.length !== 0) {
					this.drawGraphics(renderingCanvasContext, lineIntersection)
				}
			} else {
				this.renderer.clearRenderingCanvas(this.context, x, y)
				// 当前屏幕的笔记

				this.drawGraphics(this.context.renderingCanvasContext)
			}
		}
	}
	drawGraphics(ctx: CanvasRenderingContext2D, strokes?: Graphics | Graphics[]) {
		// console.log(`${strokes ? '增量更新' + strokes.length : ('全量更新')}----`)
		const strokesRef = strokes || this.currentPage
		if (Array.isArray(strokesRef)) {
			for (const item of strokesRef) {
				item.drawAttributeInit(ctx)
				item.draw(ctx, true)
			}
		} else {
			strokesRef.drawAttributeInit(ctx)
			strokesRef.draw(ctx, true)
		}
	}
	getSelectGraphics(point: point): Graphics | undefined | null {
		// 初始化 上来的 没有 currentGraphics
		// 不渲染 返回false
		if (!this.canRender) return undefined
		// if (!this.canRender || this.currentGraphics?.cache) return undefined
		// 报错不算
		// this.activeSelection = true // 设置true  如果走到最后没有变化  就自己变为 false了
		const currentG = this.currentGraphics
		if (currentG?.isEdit) {
			// 检查自己有没有  又被点中
			if (currentG.computeClick(point, this.events)) {
				// 当前自己
				return currentG
			} else {
				// 为啥必须放里边
				if (currentG.isEdit) {
					currentG.setEditStatus(false)
					this.events.emit('appendCurrentPage', currentG)
				}
			}
		}
		const l = this.currentPage.length
		for (let index = l - 1; index >= 0; index--) {
			const item = this.currentPage[index]
			if (!item.disabled && item.computeClick(point, this.events)) {
				// 内部会把编辑 设置为true
				item.setEditStatus(true)
				// console.log('流程2')
				return this.currentPage.splice(index, 1)[0]
			}
		}
		return undefined
	}

	getCrashActiveLineAndRemove(
		currentPage: Graphics[],
		ePoint: point,
		radius: number,
		once = false,
	): Graphics[] {
		// 多次检查 - 延迟删除一次
		// const linePath = this.linePath
		let crashActiveLine: Graphics[] = []

		// 如果 全部检查完-- 正向 和 负向 没什么区别--
		for (let index = currentPage.length - 1; index >= 0; index--) {
			const element = currentPage[index]
			// const { pointLine } = element
			// 橡皮 的 半径
			const lineDis = (element.data.lineWidth || 2) / 2 + radius
			// const time1 = new Date().getTime()
			const { x, y } = ePoint
			if (
				!rectCheckCrash(element.limitValue, {
					maxX: x + radius,
					maxY: y + radius,
					minX: x - radius,
					minY: y - radius,
				})
			) {
				continue
			}
			// 点==在线内
			// pointLine
			logger.debug('进入到【' + element.name + '】检测区域', element)
			if (element.computeCrash(ePoint, lineDis)) {
				// console.log('---------------------------删除')
				logger.debug('橡皮与条线-- 被删除掉 --', element.name)
				currentPage.splice(index, 1)
				// 需要去掉与之前的 关系
				crashActiveLine.push(element.clone())
				// index ++
				if (once) {
					break
				}
			}
		}
		return crashActiveLine
	}
	// 获取 选中的笔记 平移和删除需要remove  复制不需要删除
	getRectCrashLine(
		currentPage: Graphics[],
		limitValue: limitValue,
		isRemove = true,
	) {
		let crashActiveLine: Graphics[] = []

		for (let index = currentPage.length - 1; index >= 0; index--) {
			const element = currentPage[index]
			// if(element.type == 16) {
			//     logger.debug('数轴---------------------------------------', rectContainLine(<limitValue>element, limitValue), element, limitValue)
			// }
			if (rectContainLine(element.limitValue, limitValue)) {
				logger.debug(element, '包含在limit内')
				if (isRemove) {
					//  是否删除
					// 要更正 --- index
					// 删除线 - index ++  index 需要修正  index -- 不用
					currentPage.splice(index, 1)
				}
				crashActiveLine.push(element)
			}
		}
		return crashActiveLine
	}

	registerEvents() {
		this.events.registerType([
			'clearCapturingCanvas',
			'clearRenderingCanvas',
			'appendCurrentPage',
			'crashRemove',
			'selectGraphics',
			'pushEntry',
		])
		// 不同的canvas 清除
		this.events.on('clearCapturingCanvas', () => {
			// console.log('clearCapturingCanvas')
			const { x = 0, y = 0 } = this._translatePosition || {}
			this.renderer.clearCapturingCanvas(this.context, x, y)
		})
		this.events.on('clearRenderingCanvas', () => {
			// console.log('clearRenderingCanvas')
			const { x = 0, y = 0 } = this._translatePosition || {}
			this.renderer.clearRenderingCanvas(this.context, x, y)
		})
		// 插入当前的 page
		this.events.on('appendCurrentPage', (graphics) => {
			const g = graphics as Graphics | Graphics[]
			if (Array.isArray(g)) {
				this.currentPage.push(...g)
			} else {
				// console.log('g.appendPointCallTimes', g.appendPointCallTimes)
				this.currentPage.push(g)
			}
			this.drawCurrentGroup(g)
		})
		this.events.on('crashRemove', (point, radius) => {
			const p = point as point
			const r = radius as number
			// 怎么把结果送达 发过来的那个人
			// 不能  因为 on的都会有返回值
			// 组内的 怎么碰撞 --- 碰撞要特殊处理
			const graphics = this.getCrashActiveLineAndRemove(this.currentPage, p, r)
			if (graphics.length) {
				this.drawCurrentGroup()
			}
		})
		this.events.on('selectGraphics', (limit) => {
			// console.log(limit)
			const limitValue = limit as limitValue
			const graphics = this.getRectCrashLine(this.currentPage, limitValue)
			if (graphics.length > 0) {
				this.drawCurrentGroup()
				// this.currentGraphics
				// 	?.setContent(graphics)
				// 	.draw(this.context.capturingCanvasContext)
			}
		})

		this.events.on('pushEntry', (g: Graphics) => {
			const data = g.getData()

			this.history.pushEntry(
				{
					name: 'xxxx',
					selectedElementIds: {
						[data.id]: true,
					},
				},
				this.currentPage.map((e) => e.getData()).concat(data),
			)
			this.emit('updateModel')
		})
	}
	// 卸载组件
	public unuse(name: string) {
		const plugin = this._installedCom[name]
		if (!plugin) return
		plugin.destroy()
		delete this._installedCom[name]
	}
	// 加载组件 异步
	public async use(option: CropComponent): Promise<ComFunc<Crop>> {
		const instance = this.createComFunc(option)

		if (instance.createEl) {
			// 传入dom
			await instance.createEl(this.context.canvasContainer, this._container)
		}
		if (instance.ready) {
			await instance.ready(this)
		}
		instance.destroy = instance.destroy ?? (() => {})
		// 保存起来 销毁用到
		this._installedCom[option.name] = instance
		return instance
	}
	/**
	 * 销毁实例
	 *
	 * @memberof Crop
	 */
	public dispose() {
		// 删除监听
		for (const key of eventArray) {
			this._container.removeEventListener(key, (this as any).onEvent, false)
		}
		// 注销 发布订阅-- 不然变量一直会被引用 可能会会内存泄露
		this.destroy()
		// 组件卸载
		for (const name in this._installedCom) {
			if (this._installedCom.hasOwnProperty(name)) {
				this.unuse(name)
			}
		}
		this._installedCom = {}
		// 组件事件解除绑定
		// delete this.cache // 删除 事件缓存
		// this._domCache = {} // 删除dom 缓存

		// 删除dom
		// 这些东西都保存这引用
		// this.canvasContainer = null
		// this._container
		// this.context = {

		// }
		this.el.innerHTML = ''
		// if (this.el.parentNode) {
		//     this.el.parentNode.removeChild(this.el)
		// }
		this.emit('dispose')
	}
	/**
	 * 禁用手写
	 */
	public closeHandWrite(): void {
		this.setCanDraw(false)
	}

	/**
	 * 打开手写
	 */
	public openHandWrite(): void {
		this.setCanDraw(true)
	}

	/**
	 * 禁渲染
	 */
	public closeRender(): void {
		this.setCanRender(false)
	}

	/**
	 * 打开手写
	 */
	public openRender(): void {
		this.setCanRender(true)
	}

	// 开启关闭 消失屏幕
	public clearDisappear(): void {
		// 清空 - disappear
		// this.model.disappearStroke = []
	}
	/**
	 * 设置手写笔迹宽度阈值,用以控制手写笔迹的粗细.
	 *
	 */
	public setPenWidth(penWidth: number): void {
		this.state.penWidth = penWidth
	}

	/**
	 * 设置基本画笔颜色
	 *
	 * @param color 颜色信息int值
	 */
	public setPenColor(color: string): void {
		logger.debug('修改颜色：', color)
		this.state.penColor = color
		this.emit('penColor', color)
	}

	/**
	 *将手写控件切换到橡皮状态
	 *
	 * @memberof Crop
	 */
	public setToRubber(): void {
		// this._actionType = 'ACTION_ERASURE'
		this.state.penStatus = Status.STATUS_RUBBER
	}

	/**
	 *将手写控件切换到手写状态
	 *
	 * @memberof Crop
	 */
	public setToWriting(): void {
		// this._actionType = 'ACTION_WRITING'
		this.state.penStatus = Status.STATUS_PEN
	}

	// 将手写控件切换到 消失笔
	public setToDisappear(): void {
		// this._actionType = 'ACTION_WRITING'
		this.state.penStatus = Status.STATUS_NO_PATH_PEN
	}

	public setDrawStatus(value: Status) {
		this.state.penStatus = value
	}

	// // public
	// public get activeGroupName() {
	// 	return this.model._activeGroupName
	// }
	// TODO: 考虑命名统一  get xxx  也用这种 penColor  ===  penColorStatus
	// get  内部状态
	public get statusConfig(): CropState {
		// console.log('')
		return this.state
	}

	// 获取当前颜色
	public get penColor(): string {
		if (this.state.penStatus === Status.STATUS_NO_PATH_PEN) {
			return this.disappearColor
		} else {
			return this.state.penColor
		}
	}

	// 获取常规 笔颜色
	public get normalPenColor(): string {
		return this.state.penColor
	}
	// 获取当前屏幕的宽高 TODO: ppt  可能不一样
	public get width(): number {
		// this._container.clientWidth, height: wrapper.clientHeight
		return this._container.clientWidth || this.context.width // this.context.renderingCanvas.width
	}
	public get height(): number {
		return this._container.clientHeight || this.context.height
	}
	// 是否是常规笔
	public isNormalPen(): boolean {
		return this.state.penStatus === Status.STATUS_PEN
	}

	// 颜色还是需要 -- 判断
	public set disappearColor(color: string) {
		this._disappearColor = color
	}

	public get disappearColor(): string {
		return this._disappearColor || this.state.penColor
	}

	// 得到焦点
	public focus() {
		if (this._focus) return
		logger.debug('插件得到焦点focus')
		this._focus = true
		this.emit('focus')
	}
	// 失去焦点
	public blur() {
		if (!this._focus) return
		logger.debug('插件失去焦点blur')
		this._focus = false
		this.emit('blur')
	}

	public resize(screen?: rect) {
		this.context = this._renderer.resizeContent(this.context, screen)
		this.render()
		if (this.currentGraphics) {
			const context = this.context.capturingCanvasContext
			this.drawGraphics(context, this.currentGraphics)
		}
	}

	// 切换 数据源

	// switchGroup(this.context, this.model)

	// public changDataSource(name?: string): string | number {
	// 	const groupName = switchGroup(this.model, name)
	// 	// 清除上一个画布 切换去下一个换不
	// 	this.drawCurrentGroup()
	// 	return groupName
	// }

	/**
	 * 清空手写控件所有笔迹信息
	 * @memberof Crop
	 */
	public clear(): void {
		//  清除当前屏幕的 所有笔记
		this.currentPage = []
		// switchGroup(this.context, this.model, name)
		// this.model = clearGroup(this.model)
		// 清除画布 // 需要渲染的时候在 清除
		if (this.canRender) {
			this.renderer.clearCanvas(this.context)
		}
		this.emit('data', { v: { value: '', name: 'clear' }, t: Date.now() })
	}
	// 只带有 get不带有 set的存取器自动被推断为 readonly

	/**
	 * 获取笔的 粗细
	 *
	 * @readonly
	 * @type {number}
	 * @memberof Crop
	 */
	public get penWidth(): number {
		return this.state.penWidth
	}

	// 初始化编辑器
	/**
	 * reset
	 */
	public reset() {
		this.emit('updateModel')
		this.clear()
		// 画初始化笔记
		// 初始化值
		this.drawCurrentGroup()
	}

	historyRender(data: HistoryEntry, event: 'undo' | 'redo') {
		const graphics = []
		this.emit('updateModel')
		for (const e of data.elements) {
			const g = this.initGraphics(this.graphicsMap[e.key], e)

			if (data.appState.selectedElementIds[e.id]) {
				g.setEditStatus(true)
				this.currentGraphics = g
			} else {
				graphics.push(g)
			}
		}
		this.currentPage = graphics

		setTimeout(() => {
			this.renderer.clearCanvas(this.context)
			if (this.currentGraphics) {
				const context = this.context.capturingCanvasContext
				this.drawGraphics(context, this.currentGraphics)
			}
			this.drawCurrentGroup()
		}, 60)

		this.emit('data', { v: { value: '', name: event }, t: Date.now() })
	}

	/**
	 * True if can undo, false otherwise.
	 * @return {Boolean}
	 */
	public get canUndo() {
		return this.history.canUndo
	}

	/**
	 * Undo the last action.
	 */
	public undo() {
		logger.debug('左边撤回')
		const data = this.history.undoOnce()

		if (data) {
			this.historyRender(data, 'undo')
		}
	}

	/**
	 * True if can redo, false otherwise.
	 * @return {Boolean}
	 */
	public get canRedo() {
		return this.history.canRedo
	}

	public redo() {
		logger.debug('右边撤回')
		const data = this.history.redoOnce()
		if (data) {
			this.historyRender(data, 'redo')
		}
	}

	/**
	 * 系统的
	 *
	 * @param {TouchEvent} event // 这玩意要放在 event中 -- 所有必须这样子写  this 才不会出问题
	 * @memberof Crop
	 */
	// 考虑 以第一个为标准  后面有其他的  不让执行  这个还是分开试一下 pointer事件
	public onEvent(event: TouchEvent | MouseEvent) {
		// 这里通过标志位来控制是否禁止手写
		if (!this.canDraw) return
		// 这个可以放外边
		const type = enumEvent[event.type]
		let client: clientPoint
		if (/^mouse/.test(event.type)) {
			// 无用的移动  可以拦截掉
			if (type !== eventType.DOWN && !this._isMDown) {
				return
			}
			client = event as MouseEvent
			// PC
			if (type === eventType.DOWN) {
				this._isMDown = true
			} else if (type === eventType.UP) {
				this._isMDown = false
			} else {
				// move
				if (!this._isMDown) {
					return
				}
			}
		} else if (/^touch/.test(event.type)) {
			// 移动端
			let touches = (event as TouchEvent).touches
			if (touches.length > 1) {
				return
			}
			if (touches.length === 0) {
				// touchend  用不上
				this.handleTouchEvent({
					type,
					point: {
						x: 0,
						y: 0,
						t: Date.now(),
						p: 1,
					},
				})
				return
			}
			client = touches[0]
		} else {
			client = event as MouseEvent
		}
		// event.preventDefault()
		// event.stopPropagation()
		// 为啥不放在最开始？？ 可以打开可以关闭 通过api
		if (type === eventType.MOVE) {
			if (!this.nativeEventPrev) {
				event.preventDefault()
			}
			if (!this.nativeEventStop) {
				event.stopPropagation()
			}
		}

		this.focus()
		// 获取
		let limitVal: undefined | limitValue
		const point = extractPoint(
			client,
			this.context,
			this._translatePosition,
			limitVal,
		)
		this.handleTouchEvent({
			type,
			point,
		})
	}
	/**
	 * 处理手写控件触摸事件
	 * @param {localTouchEvent} event 本地重写的事件
	 * @memberof Crop
	 */
	//  初始化 没办法初始化加速了  不画 只是获取数据格式
	public handleTouchEvent(event: localTouchEvent) {
		// 这里有问题
		const { type, point } = event
		this.emit('data', { v: { ...this.state, point, type }, t: point.t })
		const context = this.context.capturingCanvasContext
		const events = this.events
		switch (type) {
			case eventType.DBLCLICK: {
				// 判断是否点到 当前的字体上了
				// 1. 获取当前的所有在可视区域的图形
				// 2. 遍历 是否点中某一个
				// 3. 取出来 转入编辑模式
				// 4. 怎么复用以前逻辑
				const graphics = this.getSelectGraphics(point)
				if (graphics) {
					// 没有变化
					if (graphics.name === '文字' && graphics === this.currentGraphics) {
						this.events.emit('clearCapturingCanvas')
						// 双击自己
						graphics.setEditStatus(false)
						const { x, y } = graphics.data
						this.currentGraphics.initPending(
							context,
							{ x, y, t: Date.now() },
							events,
							this._translatePosition,
						)
						return
					}
					this.currentGraphics = graphics
					// 绘制老图
					this.drawCurrentGroup()
				} else {
					const text = this.graphicsMap[9]
					this.currentGraphics = this.initGraphics(text)
				}
				// 绘图
				this.currentGraphics?.initPending(
					context,
					point,
					events,
					this._translatePosition,
				)
				break
			}
			case eventType.DOWN: {
				// console.log('this._penStatus', this._penStatus)
				const graphics = this.getSelectGraphics(point)
				if (graphics) {
					// 没有变化
					this.currentGraphics = graphics
					// 绘制当前的-
					// 把老的绘制一下
					this.drawCurrentGroup()
				} else {
					this.currentGraphics = this.initGraphics(
						this.graphicsMap[this.state.penStatus],
					)
				}
				// 不返回了 动态计算当前的偏移量
				// 绘图 当前的
				// console.log('刚点中的是：graphics, 即将绘制', this.currentGraphics)
				this.currentGraphics?.initPending(context, point, events)

				// 有延迟 导致内部先move  后 init  出bug
				// setTimeout(() => {
				//     //  保证自己是在  上一个去掉
				//     this.currentGraphics.initPending(context, point, events)
				// })
				// console.log('type:',eventType[type],point )
				break
			}
			case eventType.MOVE:
				this.currentGraphics?.appendPoint(context, point, events)
				// 如果没有出发move
				break
			case eventType.UP:
				this.currentGraphics?.endPendingPoint(context, point, events)
				break
			default:
				logger.warn(`type,没有实现  ${type}`)
				break
		}
	}

	// 直接把相关图形一步划进去
	public appendToImage(data: properties & { key: number }): void {
		const G = this.graphicsMap[data.key]
		const g = createGraphics(G, data, this.events)
		g.getSourceRect(true)
		this.currentPage.push(g)

		// 历史记录
		this.history.pushEntry(
			{
				name: 'xxxx',
				selectedElementIds: {
					[data.id]: true,
				},
			},
			this.currentPage.map((e) => e.getData()),
		)
		this.emit('updateModel')
	}

	// 我需要当前实例-- 只能够俄罗斯套娃--
	// public play() {
	//     this._player.play(this)
	// }

	// // 拖拽
	// public drag(timestamp: number) {
	//     this._player.drag(this, timestamp)
	// }

	// // 暂停
	// public pause() {
	//     // 要保存这个  stoptime  时间 下次在这里进入
	//     this._player.pause()
	// }

	// 结束
	// public ended() {
	//     this._player.ended(this)
	// }

	// 触发 本地事件
	public dispatchLocalEvent(data: any[]) {
		if (Array.isArray(data)) {
			for (const item of data) {
				this.dispatchEvent(item)
			}
		} else {
			this.dispatchEvent(data)
		}
	}

	// 触发本地 事件 内部处理事件 区别
	// type Event = editDataI  | {

	// }
	public dispatchEvent(data: any) {
		if (!data) return
		const info = data.v

		// 执行方法
		if (typeof info?.type === 'string') {
			// 笔记 比几何要更常见
			// 笔记
			// point: newPoint;
			// type: string;
			this.handleTouchEvent(info as localTouchEvent)
			return
		}
		// 修改属性
		if (info.name) {
			const event = info // 必须分号
			;(this as any)[event.name](event.value)
			return
		}
		// 可不可以 直接在这里换
		// 这是个特殊现象 --只有 视频会有
		if (typeof info.type === 'number') {
			// 几何直接上
			// 几何
			// this.appendToImage(info as editDataI)
			return
		}
	}

	// 这几个能不能放进 draw
	// ---------------
	// 要知道原来的值  然后计算最新的值
	// public areaRemove({ limitValue }: areaParams) {
	// 	logger.debug('开始区域删除')
	// 	const crashActiveLine = this.renderer.getRectCrashLine(
	// 		this.model,
	// 		limitValue,
	// 		true,
	// 	)
	// 	// this.renderer.clearCanvas(this.context)
	// 	if (crashActiveLine.length !== 0) {
	// 		this.drawCurrentGroup()
	// 	}
	// }

	// public areaCopy({ limitValue, offsetY, offsetX }: areaParams) {
	// 	logger.debug('开始区域复制')
	// 	const crashActiveLine = this.renderer.getRectCrashLine(
	// 		this.model,
	// 		limitValue,
	// 		false,
	// 	)
	// 	// 改点 ---
	// 	if (offsetY && offsetX) {
	// 		const newCrashActiveLine = crashActiveLine.map((e) =>
	// 			computeOffsetPath(e, offsetX, offsetY),
	// 		)
	// 		// 引用会 全部改到一起
	// 		this.model.activeGroupStroke.push(...newCrashActiveLine)
	// 		// this.drawCurrentGroup(newCrashActiveLine)
	// 	} else {
	// 		logger.error('areaCopy 必须有offsetY, offsetX')
	// 	}
	// }

	// 移动
	// public areaMove(
	// 	{ deviationX, deviationY }: { deviationX: number; deviationY: number },
	// 	crashActiveLine: any[],
	// ) {
	// 	logger.debug('开始区域移动')
	// 	const newCrashActiveLine = crashActiveLine.map((e) =>
	// 		computeOffsetPath(e, deviationX, deviationY),
	// 	)
	// 	this.capturingDrawCurrentStroke(newCrashActiveLine)
	// }

	getCurrentPageData() {
		const currentG = this.currentGraphics
		if (currentG) {
			currentG.setEditStatus(false)
			this.events.emit('appendCurrentPage', currentG)
			this.currentGraphics = null as any
		}

		return this.currentPage.map((e) => e.getData())
	}

	async getDataURL(
		params: {
			type?: 'Base64' | 'Blob'
			backgroundColor?: string
			mimeType?: string
			backgroundImage?: string
			area?: {
				x: number
				y: number
				height: number
				width: number
			}
		} = { type: 'Base64' },
	) {
		const {
			renderingCanvasContext,
			renderingCanvas,
			width,
			height,
			pixelRatio,
		} = this.context
		const typeName: 'Base64' = 'Base64'
		const { type, backgroundColor, backgroundImage, mimeType, area } = {
			backgroundColor: '#fff',
			type: typeName,
			...params,
		}
		if (backgroundImage) {
			const img = await createImage(backgroundImage)
			renderingCanvasContext.drawImage(img, 0, 0, width, height)
		} else {
			renderingCanvasContext.fillStyle = backgroundColor
			renderingCanvasContext.fillRect(0, 0, width, height)
		}
		const currentG = this.currentGraphics
		if (currentG) {
			currentG.setEditStatus(false)
			this.events.emit('appendCurrentPage', currentG)
			this.currentGraphics = null as any
		}

		this.drawGraphics(renderingCanvasContext)

		type ResolveFunc = (value?: unknown) => void
		const types = {
			Base64(
				canvas: HTMLCanvasElement,
				resolve: ResolveFunc,
				mimeType?: string,
			) {
				resolve(canvas.toDataURL(mimeType))
			},
			Blob(canvas: HTMLCanvasElement, resolve: ResolveFunc, mimeType?: string) {
				canvas.toBlob((blob) => {
					resolve(blob)
				}, mimeType)
			},
		}

		return new Promise((resolve, reject) => {
			if (!types[type]) {
				reject(new TypeError('type = Blob || Base64'))
				return
			}
			let canvas = renderingCanvas
			if (area) {
				const imgCanvas = document.createElement('canvas')
				const imgContext = imgCanvas.getContext(
					'2d',
				) as CanvasRenderingContext2D
				imgCanvas.width = area.width * pixelRatio
				imgCanvas.height = area.height * pixelRatio
				imgContext.scale(pixelRatio, pixelRatio)
				imgContext.drawImage(
					renderingCanvas,
					area.x * pixelRatio,
					area.y * pixelRatio,
					area.width * pixelRatio,
					area.height * pixelRatio,
					0,
					0,
					area.width,
					area.height,
				)
				canvas = imgCanvas
			}
			types[type](canvas, resolve, mimeType)
		})
	}
	/**
	 *  渲染画布
	 * @param strokes
	 */
	// 是否是增量
	// increment:bool = false
	// 1. 全量渲染
	// 2. 增量
	// 3. 不需要清画布
	// 4.
	public render(strokes?: Graphics[]) {
		this.drawCurrentGroup(strokes)
		// this.renderer.drawModel(this.context, this.model, strokes)
	}

	// 把 清屏和 画布-- 集中到一起 然后好出来 是否画画
	/**
	 *  绘制临时画布的 内容
	 *
	 * @param {editDataI} strokes
	 * @memberof Crop
	 */

	public capturingDrawCurrentStroke(strokes: any) {
		if (!this.canRender) return
		// 有偏移量 走偏移量的
		// if (this._translatePosition) {
		// 	this.renderer.translateDrawCurrentStroke(
		// 		this.context,
		// 		this.model,
		// 		this._translatePosition,
		// 		strokes,
		// 	)
		// } else {
		// 	this.renderer.drawCurrentStroke(this.context, this.model, strokes)
		// }
	}
	// 创建标签
	// PathNode 必须是一个数组  例如 刘  可能就是三笔才能填进来
	// TODO: 要知道他 原来的的 宽高 好算现在的宽高  保持一致大小
	public async createNode(
		type: 'TextNode' | 'ImageNode' | 'PathNode',
		properties: {
			imageOrUri?: string | HTMLImageElement
			x?: number
			y?: number
			text?: string
			lineHeight?: number
		},
	) {
		// 算出来中间位置
		if (type === 'ImageNode') {
			const g = this.initGraphics(this.graphicsMap[8], properties)
			this.add(g)
			// this.emit
		}
		if (type === 'TextNode') {
			const g = this.initGraphics(this.graphicsMap[9], properties)
			this.currentPage.push(g)
		}
		//   Image  可以传url 也可以传dom
		// 获取最大 最小值
		//
	}
	public add(g: Graphics) {
		if (g?.isEdit) {
			g.draw(this.context.capturingCanvasContext)
			this.currentGraphics = g
		} else {
			g.draw(this.context.renderingCanvasContext)
			this.currentPage.push(g)
		}

		const data = g.getData()
		this.history.pushEntry(
			{
				name: 'xxxx',
				selectedElementIds: {
					[data.id]: true,
				},
			},
			this.currentPage.map((e) => e.getData()).concat(data),
		)
		this.emit('updateModel')
		return this
	}

	// 获取编辑状态的对象
	public getActiveObject() {
		if (this.currentGraphics?.isEdit) {
			return this.currentGraphics
		}
		return undefined
	}

	/**
	 *添加组件
	 *
	 * @private
	 * @param {CropComponent[]} [c] 组件的构造函数
	 * @memberof Crop
	 */
	private appendCom(c?: CropComponent[]): void {
		if (!c || !Array.isArray(c) || c.length === 0) return
		for (const item of c) {
			// 会自己推断出 CropComponent 接口
			this.use(item)
		}
	}

	/**
	 * 检查参数 并且实例化传入的class
	 *
	 * @private
	 * @param {CropComponent} option
	 * @returns 传入的class 实例化
	 * @memberof Crop
	 */
	private createComFunc(option: CropComponent) {
		if (!option.type || typeof option.type !== 'function' || !option.name) {
			throw new Error('type, name插件的必须参数不正确')
		}
		// 同一个插件只能注册一次
		// const type = item.type
		if (this._installedCom[option.name]) {
			// 可以链式 use
			throw new Error(option.name + '已经注册过一次')
		}
		let args: any[] = []
		// ---
		// console.log(option.)
		if (option.params && Array.isArray(option.params)) {
			args = option.params
		}

		// 参数是 这个calss  和 构造函数 参数
		return createFunc(option.type, ...args)
	}
	/**
	 * 初始化
	 *
	 * @memberof Crop
	 */
	private init() {
		this.onEvent = this.onEvent.bind(this)
		// ---
		// -----------------------------------------
		this.registerEvents()
		// 初始化值
		this.drawCurrentGroup()
		//  会报错吗
		// 设置 log
		// 适配电脑
		// 后期 remove 要用这个列表
		for (const eventName of eventArray) {
			this._container.addEventListener(eventName, (this as any).onEvent, false)
		}
	}
	//  获取渲染 模块
	get renderer() {
		return this._renderer
	}
	// 初始化 Graphics
	private initGraphics<T extends Graphics>(
		graphics: T,
		properties = {},
	): Graphics {
		// 如果当前 currentGraphics 没有触发 --push  就还是缓存以前
		// if (this.currentGraphics) {
		//     // 什么时候 应该把橡皮给重合掉
		//     return this.currentGraphics
		// }
		if (!graphics) {
			const graphicsKey = (properties as any).key || this.state.penStatus
			console.error(`未找到当前.graphics：${graphicsKey}`)
			return null as any
		}

		return createGraphics(
			graphics,
			{
				lineWidth: this.state.penWidth,
				color: this.penColor, //  用get 计算属性  会自动给出 哪个颜色
				offset: this.state.penWidth,
				// activeGroupName: this.activeGroupName,
				...properties,
			},
			this.events,
		)
	}

	/**
	 *
	 *  设置 是否相应事件
	 * @private
	 * @param {boolean} draw
	 * @memberof Crop
	 */
	private setCanDraw(canDraw: boolean) {
		this.canDraw = canDraw
	}

	private setCanRender(canRender: boolean) {
		this.canRender = canRender
	}
}

/**
 *
 * new crop 实例
 * @export
 * @param {props} option
 * @returns
 */
export function createApp(option: CropProps) {
	let el: HTMLElement
	if (typeof option.el === 'string') {
		const wrapper = document.querySelectorAll(option.el)
		if (wrapper.length === 0) {
			throw new TypeError('无法获取dom节点, 请检查传入的el是否正确')
		}
		el = wrapper[0] as HTMLElement
	} else if (
		option.el &&
		typeof option.el === 'object' &&
		option.el.nodeType === 1 &&
		typeof option.el.nodeName === 'string'
	) {
		el = option.el
	} else {
		throw new TypeError(
			`el必须是HTMLElement或者字符串, 不能够是${typeof option.el}`,
		)
	}
	return new Crop({
		el,
		nativeEventPrev: option?.nativeEventPrev ?? false,
		nativeEventStop: option?.nativeEventStop ?? false,
		status: option?.status ?? Status.STATUS_PEN,
		canDraw: option?.canDraw ?? false,
		penColor: option?.penColor ?? '#f60',
		penWidth: option?.penWidth ?? 2,
		canRender: option?.canRender ?? false,
		component: option?.component ?? [],
		graphics: option?.graphics ?? [],
	})
}
