// 使用枚举
import {
	logger,
	rectCheckCrash,
	rectContainLine,
	limitValue,
	point,
	computeScreen,
	rect,
	Dictionary,
	cloneDeep,
} from './../utils'

import {
	editDataI,
	computeCrash,
	drawSymbol,
	// computeBounding
} from './SymbolCanvasRendener'
import { model } from '../model/InkModel'
import { Graphics } from './Symbols/Shape'

function getPixelRatio(canvas?: HTMLCanvasElement) {
	if (canvas) {
		const context = canvas.getContext('2d')
		// we are using a browser object
		// eslint-disable-next-line no-undef
		const devicePixelRatio = window.devicePixelRatio || 1
		const backingStoreRatio =
			(context as any).webkitBackingStorePixelRatio ||
			(context as any).mozBackingStorePixelRatio ||
			(context as any).msBackingStorePixelRatio ||
			(context as any).oBackingStorePixelRatio ||
			(context as any).backingStorePixelRatio ||
			1
		return devicePixelRatio / backingStoreRatio
	}
	return 1
}

function detectPixelRatio(): number {
	// we are using a browser object
	// eslint-disable-next-line no-undef
	const tempCanvas = document.createElement('canvas')
	const canvasRatio = getPixelRatio(tempCanvas)
	// document.removeChild(tempCanvas);
	return canvasRatio
}
// 用泛型  反向 对 传入的 k 做影响
function createContainerInnerDom<K extends keyof HTMLElementTagNameMap>(
	element: HTMLElement,
	tagName: K,
	className: string,
) {
	// eslint-disable-next-line no-undef
	const browserDocument = document
	const domNode = browserDocument.createElement<K>(tagName)
	domNode.classList.add(className)
	domNode.classList.add('edit-handwrit')

	// z-index: 15;
	// position: absolute;
	// left: 0;
	// top: 0;
	domNode.style.width = '100%'
	domNode.style.height = '100%'
	domNode.style.position = 'absolute'
	domNode.style.top = '0'
	domNode.style.left = '0'
	domNode.style.zIndex = '10'

	element.appendChild(domNode)
	logger.debug(tagName + 'created', domNode)
	return domNode
}

export interface canvasContext {
	canvasContainer: HTMLElement
	scale: number // 缩放比例
	filled: string | undefined // 填
	left: number
	top: number
	width: number
	height: number
	pixelRatio: number
	minHeight: number
	minWidth: number
	renderingCanvas: HTMLCanvasElement
	renderingCanvasContext: CanvasRenderingContext2D
	capturingCanvas: HTMLCanvasElement
	capturingCanvasContext: CanvasRenderingContext2D
	disappearCanvas: HTMLCanvasElement
	disappearCanvasContext: CanvasRenderingContext2D
}

// filledType 放到 originScreen 是最合适的

// 怎么把 dom 给去掉  不依赖dom
export function resizeContent(
	context: canvasContext,
	originScreen?: rect,
): canvasContext {
	const domElement = context.canvasContainer.parentNode as HTMLElement
	// 把 外围计算一下
	// overflow: hidden;
	let scale = 1 // 缩放比例
	let filled: string | undefined = context?.filled // 填充满的属性
	if (originScreen) {
		const wrapper = (domElement.parentNode as HTMLElement) || {
			clientWidth: 0,
			clientHeight: 0,
		}
		// wrapper.style.overflow = 'hidden' // 修复滑动bug
		// 计算新宽高
		const domStyle = computeScreen(originScreen, {
			width: wrapper.clientWidth,
			height: wrapper.clientHeight,
		})
		scale = domStyle.scale
		filled = domStyle.filled
		const styleProperty: Dictionary<string | number> = domStyle.styleProperty
		for (let key in styleProperty) {
			if ({}.hasOwnProperty.call(styleProperty, key)) {
				;(domElement.style as any)[key] = styleProperty[key]
			}
		}
	} else {
		domElement.style.width = '100%'
		domElement.style.height = '100%'
	}

	// 计算
	const elements = [
		context.renderingCanvas,
		context.capturingCanvas,
		context.disappearCanvas,
	]
	// 怎么适配 屏幕
	//  第一次自己初始化的时候跑一遍    resize 都会跑一遍
	const domWidth =
		domElement.clientWidth || parseInt(domElement.style.width, 10) || 0
	const domHeight =
		domElement.clientHeight || parseInt(domElement.style.height, 10) || 0
	const width = domWidth < context.minWidth ? context.minWidth : domWidth
	const height = domHeight < context.minHeight ? context.minHeight : domHeight
	// canvasDom  的宽高  自定义属性
	context.width = width
	context.height = height
	context.scale = scale
	context.filled = filled
	const { clientLeft, clientTop } = domElement
	const clientRect = domElement.getBoundingClientRect() // 这不 不用每次都跑一次
	context.left = clientRect.left + clientLeft
	context.top = clientRect.top + clientTop
	// context.styleProperty = styleProperty
	elements.forEach((canvas) => {
		// clientWidth  隐藏 为 0
		canvas.width = width * context.pixelRatio
		canvas.height = height * context.pixelRatio
		canvas.style.zIndex = '5'
		;(canvas.getContext('2d') as CanvasRenderingContext2D).scale(
			context.pixelRatio,
			context.pixelRatio,
		)
		logger.debug('canvas size changed', canvas)
	})

	return context
}

// disappear
// 消失的canvas
export function attach(
	element: HTMLElement,
	minHeight = 0,
	minWidth = 0,
	originScreen?: rect,
): canvasContext {
	// 适配屏幕
	logger.debug('attach renderer', element)
	const pixelRatio = detectPixelRatio()

	const canvasContainer = createContainerInnerDom(
		element,
		'div',
		'canvas-container',
	)
	canvasContainer.style.position = 'sticky'
	const renderingCanvas = createContainerInnerDom(
		canvasContainer,
		'canvas',
		'rendering-canvas',
	)
	const capturingCanvas = createContainerInnerDom(
		canvasContainer,
		'canvas',
		'capture-canvas',
	)
	const disappearCanvas = createContainerInnerDom(
		canvasContainer,
		'canvas',
		'disappear-canvas',
	)
	const context: canvasContext = {
		canvasContainer,
		scale: 1,
		filled: undefined,
		pixelRatio,
		minHeight,
		minWidth,
		// 为甚回放到这里边  因为每次 resize 会变化的这个玩意
		left: 0,
		top: 0,
		width: renderingCanvas.width,
		height: renderingCanvas.height,
		// 主体canvas
		renderingCanvas,
		renderingCanvasContext: renderingCanvas.getContext(
			'2d',
		) as CanvasRenderingContext2D,
		// 不断变化的canvas
		capturingCanvas,
		capturingCanvasContext: capturingCanvas.getContext(
			'2d',
		) as CanvasRenderingContext2D,

		// 消失笔
		disappearCanvas,
		disappearCanvasContext: disappearCanvas.getContext(
			'2d',
		) as CanvasRenderingContext2D,
	}
	return resizeContent(context, originScreen)
}

//  function partialUpdate(context: canvasContext, model: model, stroker: editDataI) {
//   let strokerReference
//   if (stroker.type == Status.STATUS_RUBBER) {
//     if (model.prevRubberPoint) {
//       strokerReference = computeBounding(prevRubberPoint)
//     } else {
//       model.prevRubberPoint = strokerReference
//     }
//   } else {
//     strokerReference =  <limitValue>computeBounding(stroker)
//   }

//    const w = strokerReference.maxX - strokerReference.minX
//   const h = strokerReference.maxY - strokerReference.minY
//   context.capturingCanvasContext.clearRect(strokerReference.minX, strokerReference.minY, w, h );
// }

/**
 * Draw all symbols contained into the model
 * @param {Object} context Current rendering context
 * @param {Model} model Current model
 * @param {Stroker} stroker Current stroker
 * @return {Model}
 */

/**
 * 清除 临时画布
 *
 * @export
 * @param {canvasContext} context
 */
export function clearCapturingCanvas(context: canvasContext, x = 0, y = 0) {
	context.capturingCanvasContext.clearRect(x, y, context.width, context.height)
}

/**
 * 清除 主体画布
 *
 * @export
 * @param {canvasContext} context
 */
export function clearRenderingCanvas(context: canvasContext, x = 0, y = 0) {
	context.renderingCanvasContext.clearRect(x, y, context.width, context.height)
}

export function translatePartialUpdate(
	context: canvasContext,
	model: model,
	translatePosition: point,
	rectStroke: drawClipAndStroke | undefined,
	cb: (stroke: editDataI[]) => void,
) {
	if (!rectStroke) return
	const renderingCanvasContext = context.renderingCanvasContext
	renderingCanvasContext.save()
	try {
		// 平移过来
		renderingCanvasContext.translate(translatePosition.x, translatePosition.y)
		renderingCanvasContext.beginPath()
		renderingCanvasContext.rect(
			rectStroke.x,
			rectStroke.y,
			rectStroke.width,
			rectStroke.height,
		)
		renderingCanvasContext.clearRect(
			rectStroke.x,
			rectStroke.y,
			rectStroke.width,
			rectStroke.height,
		)
		renderingCanvasContext.clip()
		// 如果没有相交的
		//  碰撞 影响的 多跟线条
		// 为什么会有空线条--------------------------------
		// rectStroke.stroke
		cb(rectStroke.stroke)
	} finally {
		renderingCanvasContext.restore()
	}
}
export function translateDrawCurrentStroke(
	context: canvasContext,
	model: model,
	translatePosition: point,
	strokes: Graphics | Graphics[],
) {
	const capturingCanvasContext = context.capturingCanvasContext
	capturingCanvasContext.save()
	try {
		// 因为 clearCapturingCanvas canvasContext 要宽高
		clearCapturingCanvas(context)
		capturingCanvasContext.translate(translatePosition.x, translatePosition.y)
		// drawSymbol(capturingCanvasContext, strokes)
		// 暂时用不上----
		// if (Array.isArray(strokes)) {
		// 	strokes.forEach((symbol) => drawSymbol(capturingCanvasContext, symbol))
		// } else {
		// 	drawSymbol(capturingCanvasContext, strokes)
		// }
		// drawModel(context, model, strokes)
		// 这个是必须渲染的
	} finally {
		capturingCanvasContext.restore()
	}
}

// canvasContext 统一入参
export function translateDrawModel(
	context: canvasContext,
	model: model,
	translatePosition: point,
	strokes?: editDataI[],
) {
	const renderingCanvasContext = context.renderingCanvasContext
	renderingCanvasContext.save()
	try {
		// 清掉 -- 为什么要在这清掉 Canvas  因为不清他会把之前画的也绘制上来
		// 具体原因是 内部清除canvas  0, 0 开始的 不是清掉整个canvas
		// 两总方式 1. +偏移量清除 2. 偏移之前清
		// if (!strokes) {
		//     // drawCurrentGroup 没有strokes 场景 需要清除原来画布
		//     clearRenderingCanvas(context)
		// }
		renderingCanvasContext.translate(translatePosition.x, translatePosition.y)
		drawModel(context, model, strokes)
		// 这个是必须渲染的
	} finally {
		renderingCanvasContext.restore()
	}
}

// 为什么需要canvasContext 不是CanvasRenderingContext2D  因为需要 宽高
export function drawModel(
	context: canvasContext,
	model: model,
	strokesLine?: editDataI[],
) {
	let symbols = strokesLine ? strokesLine : [...model.activeGroupStroke]
	// if (strokesLine) {
	//     // 增量画---
	//     symbols = strokesLines
	// }
	if (symbols.length === 0) return
	// 每一个 都去找自己的渲染器
	//  渲染器 不同的类型-- 走不同的渲染器--
	//  碰撞检测器 可以参考这个来
	// 橡皮也可以在这里下
	// end 是才需要 savePath
	const savePath = true
	symbols.forEach((symbol) =>
		drawSymbol(context.renderingCanvasContext, symbol, savePath),
	)
}

/**
 *  在上层-绘制当前的笔记
 * @param {Object} context Current rendering context
 * @param {Model} model Current model
 * @param {Stroker} stroker Current stroker
 * @return {Model}
 */

//  TODO:   可以优化----
export function drawCurrentStroke(
	context: canvasContext,
	model: model,
	stroker: Graphics | Graphics[],
) {
	// console.log('==============================|||||||||||||||||||')
	// 谁调用了我
	// fixBug
	// 计算出来 需要 刷新的 位置
	const { capturingCanvasContext } = context

	if (Array.isArray(stroker)) {
		// 这不是在自己的身上
		for (const element of stroker) {
			element.drawAttributeInit(capturingCanvasContext)
			element.draw(capturingCanvasContext, true)
		}
	} else {
		stroker.drawAttributeInit(capturingCanvasContext)
		stroker.draw(capturingCanvasContext, true)
		// drawSymbol(capturingCanvasContext, stroker)
	}
}

//  2020- 4 -30 橡皮

export function clearCanvas(context: canvasContext) {
	clearCapturingCanvas(context)
	clearRenderingCanvas(context)
}

/**
 * 获取矩形相交的 线点
 *
 * @param {limitValue} line
 * @param {pointListPath[]} pointList
 * @returns {pointListPath[]}
 */

export function getLineIntersection(
	line: limitValue,
	pointList: editDataI[],
): editDataI[] {
	const repaintLines: editDataI[] = []
	for (const item of pointList) {
		if (rectCheckCrash(line, item as limitValue)) {
			// 这个线有交点
			repaintLines.push(item)
		}
	}
	// console.log('要重写:' + repaintLines.length + '线条')
	return repaintLines
}

export interface drawClipAndStroke extends point, rect {
	stroke: editDataI[]
}

export function getStrokeLimit(stroke: editDataI[]): limitValue {
	let minXs: number[] = []
	let minYs: number[] = []
	let maxXs: number[] = []
	let maxYs: number[] = []
	for (const item of stroke as limitValue[]) {
		// 合并矩形
		minXs.push(item.minX)
		minYs.push(item.minY)
		maxXs.push(item.maxX)
		maxYs.push(item.maxY)
	}
	const minX = Math.min(...minXs)
	const minY = Math.min(...minYs)
	const maxX = Math.max(...maxXs)
	const maxY = Math.max(...maxYs)
	return {
		maxX,
		maxY,
		minX,
		minY,
	}
}
// 获取要删除的线 与 影响的线和影响范围
export function getInfluenceRange(
	model: model,
	crashActiveLine: editDataI[],
): drawClipAndStroke | undefined {
	if (crashActiveLine.length === 0) return
	const strokeLimit = getStrokeLimit(crashActiveLine)
	// console.log('minX:', minX, 'minXs:', minXs, 'crashActiveLine:', crashActiveLine)
	// maxX: 667
	// maxY: 2073
	// minX: 286
	// minY: 1998
	// const renderingCanvasContext = context.renderingCanvasContext
	const activeGroup = model.activeGroupStroke
	const stroke = getLineIntersection(strokeLimit, activeGroup)
	const width = strokeLimit.maxX - strokeLimit.minX
	const height = strokeLimit.maxY - strokeLimit.minY
	return {
		x: strokeLimit.minX,
		y: strokeLimit.minY,
		width,
		height,
		stroke,
	}
}

// getLineIntersection 获取矩形相交的 线点

//  1. 获取相交的线点  ---- 滚动
//  2. 清除当前屏幕
//  3. 重绘相交的点

// 1. 获取相交的线点  getLineIntersection--- 橡皮更新
// 2. 获取这些点位置矩形 （滚动的画就不用 2 了）
// 3. 这个框内的重绘
// 挪出来的意义 在于 可以替换 partialUpdate
export function partialUpdate(
	context: canvasContext,
	model: model,
	rectStroke: drawClipAndStroke | undefined,
	cb: (stroke: editDataI[]) => void,
) {
	if (!rectStroke) return
	const renderingCanvasContext = context.renderingCanvasContext
	renderingCanvasContext.save()
	try {
		// 平移过来
		renderingCanvasContext.beginPath()
		renderingCanvasContext.rect(
			rectStroke.x,
			rectStroke.y,
			rectStroke.width,
			rectStroke.height,
		)
		renderingCanvasContext.clearRect(
			rectStroke.x,
			rectStroke.y,
			rectStroke.width,
			rectStroke.height,
		)
		renderingCanvasContext.clip()
		// 如果没有相交的
		//  碰撞 影响的 多跟线条
		// 为什么会有空线条--------------------------------
		// rectStroke.stroke
		cb(rectStroke.stroke)
	} finally {
		renderingCanvasContext.restore()
	}
}

export function pointCheckCrash(
	stroke: editDataI,
	{ x, y }: point,
	radius = 0,
) {
	return rectCheckCrash(stroke as limitValue, {
		maxX: x + radius,
		maxY: y + radius,
		minX: x - radius,
		minY: y - radius,
	})
}
// function getCrashActiveLine
/**
 * 获取橡皮和线的碰撞检测  会把碰撞的线  删除掉
 *  //  可能会有多根
 * @export
 * @param {model} model
 * @param {canvasContext} context
 * @param {point} ePoint
 * @param {number} radius
 */

export function getCrashActiveLineAndRemoveV2(
	model: model,
	ePoint: point,
	radius: number,
	once = false,
): editDataI[] {
	// 多次检查 - 延迟删除一次
	// const linePath = this.linePath
	let crashActiveLine: editDataI[] = []
	// const { x, y } = ePoint
	let activeGroupReference = model.activeGroupStroke
	// 把默认的加进来
	// activeGroupReference.push(...model.defaultSymbols)
	// 如果 全部检查完-- 正向 和 负向 没什么区别--
	for (let index = activeGroupReference.length - 1; index >= 0; index--) {
		const element = activeGroupReference[index]
		// const { pointLine } = element
		// 橡皮 的 半径
		const lineDis = element.width / 2 + radius
		// const time1 = new Date().getTime()
		if (!pointCheckCrash(element, ePoint, radius)) {
			continue
		}
		// if (!rectCheckCrash(element as limitValue, { maxX: x + radius, maxY: y + radius, minX: x - radius, minY: y - radius })) {
		//     continue
		// }
		// 点==在线内
		// pointLine
		logger.debug('进入到【' + element.type + '】检测区域', element)
		if (computeCrash(ePoint, element, lineDis)) {
			logger.trace('橡皮与条线-- 被删除掉 --', element.type)
			activeGroupReference.splice(index, 1)
			// 需要去掉与之前的 关系
			crashActiveLine.push(cloneDeep(element))
			// index ++
			if (once) {
				break
			}
		}
	}
	return crashActiveLine
}

// 获取 选中的笔记 平移和删除需要remove  复制不需要删除
export function getRectCrashLine(
	model: model,
	limitValue: limitValue,
	isRemove: boolean,
) {
	let crashActiveLine: editDataI[] = []

	let activeGroupReference = model.activeGroupStroke
	// 把默认的加进来
	// activeGroupReference.push(...model.defaultSymbols)
	// 范围移动
	for (let index = activeGroupReference.length - 1; index >= 0; index--) {
		const element = activeGroupReference[index]
		// if(element.type == 16) {
		//     logger.debug('数轴---------------------------------------', rectContainLine(<limitValue>element, limitValue), element, limitValue)
		// }
		if (rectContainLine(element as limitValue, limitValue)) {
			logger.debug(element, '包含在limit内')
			if (isRemove) {
				//  是否删除
				// 要更正 --- index
				// 删除线 - index ++  index 需要修正  index -- 不用
				activeGroupReference.splice(index, 1)
			}
			crashActiveLine.push(cloneDeep(element))
		}
	}
	return crashActiveLine
}

// 复制 就是删除和 移动的 结合体

//  复制选中笔记
// 我需要原来的原点  计算出现在的原点
