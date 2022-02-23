import Logger from './../model/logger'
export const logger = new Logger()
//  日志

// logger.enableAll()
// logger.warn

// logger.disableAll()

export interface rect {
	width: number
	height: number
}

export interface point {
	x: number
	y: number
}
export interface newPoint extends point {
	t: number
	p?: number
}

export interface limitValue {
	maxX: number
	maxY: number
	minX: number
	minY: number
}
export interface Dictionary<T> {
	[key: string]: T
}

export function computeMaxArea(
	originScreen: rect,
	currentScreen: rect,
	filledType = 'auto',
) {
	const { width: clientW, height: clientH } = currentScreen // 当前
	const { width, height } = originScreen // 原始

	let currentW
	let currentH
	let scale
	let filled

	const clientAspectRatio = clientH / clientW
	const aspectRatio = height / width
	if (
		filledType === 'width' ||
		(filledType === 'auto' && clientAspectRatio < aspectRatio)
	) {
		// 把宽铺满
		currentW = width
		scale = clientW / width
		currentH = currentW * clientAspectRatio
		filled = 'width'
	} else {
		// 把高铺满
		currentH = height
		scale = clientH / height
		currentW = currentH * (clientW / clientH)
		filled = 'height'
	}

	return {
		x: filled === 'width' ? 0 : (originScreen.width - currentW) / 2,
		y: filled === 'height' ? 0 : (originScreen.height - currentH) / 2,
		width: currentW,
		height: currentH,
		scale,
		filled,
	}
}

export function computeScreen(
	originScreen: rect,
	currentScreen: rect,
	filledType = 'auto',
) {
	// 适配屏幕 转换数据
	// 根据比例
	// 当前屏幕 宽高 -- 要被 修改点
	const { width: clientW, height: clientH } = currentScreen // 当前
	const { width, height } = originScreen // 原始
	let currentW
	let currentH
	let scale
	let filled

	if (
		filledType === 'width' ||
		(filledType === 'auto' && clientH / clientW > height / width)
	) {
		// 把宽铺满
		currentW = clientW
		scale = clientW / width
		currentH = currentW * (height / width)
		filled = 'width'
	} else {
		// 把高铺满
		currentH = clientH
		scale = clientH / height
		currentW = currentH * (width / height)
		filled = 'height'
	}
	// currentW currentH //  修正后的宽高

	// scale 缩放又两种 1. 缩放笔记  2. 缩放视图

	//  缩放笔记 居中不好写 说实话 缩放笔记通用性更强一些
	const baseProperty = {
		transform: 'scale(' + scale + ')',
		'transform-origin': '0 0',
		width: width + 'px',
		height: height + 'px',
		position: 'relative',
		// background: '#ccc'
	}

	const styleProperty =
		filled === 'width'
			? {
					...baseProperty,
					top: '50%',
					transform: `translate(0, ${-((height * scale) / 2)}px) ${
						baseProperty.transform
					}`,
					left: 0,
			  }
			: {
					...baseProperty,
					left: '50%',
					transform: `translate(${-((width * scale) / 2)}px, 0) ${
						baseProperty.transform
					}`,
					top: 0,
			  }

	return {
		styleProperty,
		scale,
		filled,
	}
}
/**
 * 求整数
 *
 * @export
 * @param {number} num
 * @returns {number}
 */
export function getInt(num: number): number {
	let rounded
	rounded = (0.5 + num) | 0
	// A double bitwise not.
	rounded = ~~(0.5 + num)
	// Finally, a left bitwise shift.
	rounded = (0.5 + num) << 0
	if (rounded < 0) {
		rounded -= 1
	}
	return rounded
}

/**
 * 限制最大 最小值
 *
 * @export
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function limit(value: number, min: number, max: number): number {
	if (value > max) {
		return max
	}
	if (value < min) {
		return min
	}
	return value
}

/**
 *
 * 求两点之间的 距离
 * @export
 * @param {point} p1 点1
 * @param {point} p2 点2
 * @returns {number}
 */
export function getDistance(p1: point, p2: point): number {
	const x = p2.x - p1.x
	const y = p2.y - p1.y
	return Math.sqrt(x * x + y * y)
}

/**
 * 点到 线的 距离
 *
 * @export
 * @param {point} p1 线上的点1
 * @param {point} p2 线上的点2
 * @param {point} { x, y }
 * @returns {number}
 */
export function distanceOfPoint2Line(
	p1: point,
	p2: point,
	{ x, y }: point,
): number {
	const A = x - p1.x
	const B = y - p1.y
	const C = p2.x - p1.x
	const D = p2.y - p1.y

	const dot = A * C + B * D
	const len_sq = C * C + D * D
	let param = -1
	if (len_sq !== 0)
		// 线段长度不能为0
		param = dot / len_sq
	let xx
	let yy
	if (param < 0) {
		xx = p1.x
		yy = p1.y
	} else if (param > 1) {
		xx = p2.x
		yy = p2.y
	} else {
		xx = p1.x + param * C
		yy = p1.y + param * D
	}
	const dx = x - xx
	const dy = y - yy
	return Math.sqrt(dx * dx + dy * dy)
}

/**
 *
 * 矩形 碰撞检测
 * @export
 * @param {limitValue} a
 * @param {limitValue} b
 * @param {'rect'} [type='rect']
 * @returns {boolean}
 */
export function rectCheckCrashPoint(a: limitValue, p: point): boolean {
	// 有一个为 false  就后边的判断就不会走了  和 ||  一样的
	if (a.maxX > p.x && a.minX < p.x && a.maxY > p.y && a.minY < p.y) {
		return true
	}
	// 连个
	return false
}
/**
 *
 * 矩形 碰撞检测
 * @export
 * @param {limitValue} a
 * @param {limitValue} b
 * @param {'rect'} [type='rect']
 * @returns {boolean}
 */
export function rectCheckCrash(a: limitValue, b: limitValue): boolean {
	// 有一个为 false  就后边的判断就不会走了  和 ||  一样的
	if (
		a.maxX > b.minX &&
		a.minX < b.maxX &&
		a.maxY > b.minY &&
		a.minY < b.maxY
	) {
		return true
	}
	// 连个
	return false
}

/**
 * 包含检测  b 包含 a
 *
 * @param {limitValue} a
 * @param {limitValue} b
 * @returns
 */
export function rectContainLine(a: limitValue, b: limitValue): boolean {
	// 有一个为 false  就后边的判断就不会走了  和 ||  一样的
	if (
		b.maxX > a.maxX &&
		b.maxY > a.maxY &&
		b.minX < a.minX &&
		b.minY < a.minY
	) {
		return true
	}
	return false
}

export interface clientPoint {
	clientX: number
	clientY: number
}

interface containerLocation {
	scale: number
	width: number
	height: number
	left: number
	top: number
}

/**
 *
 * 获取 整数的 page 坐标
 * @export
 * @param {{pageX: number, pageY: number}} touch
 * @param {rect} { width, height }
 * @param {number} [boundary=2]
 * @returns {point}
 */
export function extractPoint(
	{ clientX, clientY }: clientPoint,
	{ scale, width, height, left, top }: containerLocation,
	translatePosition: undefined | point,
	limitVal?: limitValue,
): newPoint {
	const boundary = 2
	const limitValue = limitVal || {
		maxX: width - boundary,
		maxY: height - boundary,
		minX: boundary,
		minY: boundary,
	}
	const coordinate = {
		x: limit(
			getInt((clientX - left) / scale),
			limitValue.minX,
			limitValue.maxX,
		),
		y: limit(getInt((clientY - top) / scale), limitValue.minY, limitValue.maxY),
		t: Date.now(),
	}
	if (translatePosition) {
		coordinate.x = getInt(coordinate.x + translatePosition.x)
		coordinate.y = getInt(coordinate.y + translatePosition.y)
	}
	return coordinate
}
export function extractPointV2(
	{ clientX, clientY }: { clientX: number; clientY: number },
	domElement: HTMLElement,
	scale: number,
	translatePosition: null | point,
): newPoint {
	// 要算出来-- e.target.getBoundingClientRect(), 位置
	// if (e.touches.length === 0)  return { x: 0, y: 0 }
	// const touch = e.touches[0]
	const boundary = 2
	const {
		clientWidth: width,
		clientHeight: height,
		clientLeft,
		clientTop,
	} = domElement
	const rect = domElement.getBoundingClientRect() // 这不 不用每次都跑一次
	console.log({
		x: rect.left + clientLeft,
		y: rect.top + clientTop,
	})
	const coordinate = {
		x: limit(
			getInt((clientX - rect.left - clientLeft) / scale),
			boundary,
			width - boundary,
		),
		y: limit(
			getInt((clientY - rect.top - clientTop) / scale),
			boundary,
			height - boundary,
		),
		t: Date.now(),
	}
	if (translatePosition) {
		coordinate.x = getInt(coordinate.x - translatePosition.x)
		coordinate.y = getInt(coordinate.y - translatePosition.y)
	}
	return coordinate
}

export function getPointsLimitValue(
	points: point[] | { x: number[]; y: number[] },
	threshold = 0,
): limitValue {
	let x = []
	let y = []

	// 兼容--线
	if (Array.isArray(points)) {
		for (const item of points) {
			x.push(item.x)
			y.push(item.y)
		}
	} else {
		x = points.x
		y = points.y
	}
	return {
		minX: Math.min(...x) - threshold,
		minY: Math.min(...y) - threshold,
		maxX: Math.max(...x) + threshold,
		maxY: Math.max(...y) + threshold,
	}
}

export function getRectLimitValue(
	point: point,
	width: number,
	height: number,
	threshold = 0,
): limitValue {
	return {
		minX: point.x - threshold,
		minY: point.y - threshold,
		maxX: point.x + width + threshold,
		maxY: point.y + height + threshold,
	}
}

export function getLimit2Rect(limitVal: limitValue) {
	return {
		x: limitVal.minX,
		y: limitVal.minY,
		width: limitVal.maxX - limitVal.minX,
		height: limitVal.maxY - limitVal.minY,
	}
}

export function points2Rect(p1: point, p2: point) {
	return {
		x: Math.min(p1.x, p2.x),
		y: Math.min(p1.y, p2.y),
		width: Math.abs(p1.x - p2.x),
		height: Math.abs(p1.y - p2.y),
	}
}

// 获取矩形顶点
export function getRectangularVertex(limitValue: limitValue): point[] {
	// 左上  右上  左下 右下
	return [
		{ x: limitValue.minX, y: limitValue.minY },
		{ x: limitValue.maxX, y: limitValue.minY },
		{ x: limitValue.maxX, y: limitValue.maxY },
		{ x: limitValue.minX, y: limitValue.maxY },
	]
}

export function drawAttributeInit(
	context: CanvasRenderingContext2D,
	color: string,
	width: number,
	isDash = false,
) {
	// 初始赋值
	if (context.strokeStyle !== color) {
		context.strokeStyle = color
	}
	if (context.fillStyle !== color) {
		context.fillStyle = color
	}
	if (context.lineWidth !== width) {
		context.lineWidth = width
	}

	const lineDash = context.getLineDash()

	if (isDash) {
		if (lineDash.length === 0) {
			context.setLineDash([5, 10])
		}
	} else {
		if (lineDash.length !== 0) {
			context.setLineDash([])
		}
	}
	// ---------------------------------------------
	// if (isDash && lineDash.length === 0) {
	//     context.setLineDash([5, 10])
	// } else  if (!isDash && lineDash.length !== 0) {
	//     context.setLineDash([])
	// }
}

export function getMidpoint(p1: point, p2: point): point {
	return { x: getInt((p1.x + p2.x) / 2), y: getInt((p1.y + p2.y) / 2) }
}

// 获取Image dom
export function createImage(url: string): Promise<HTMLImageElement> {
	const img = new Image()
	img.crossOrigin = 'Anonymous'
	img.setAttribute('crossOrigin', 'anonymous')
	return new Promise((resolve, reject) => {
		img.onload = function () {
			resolve(img)
		}
		img.onerror = reject
		img.src = url
	})
}

export async function loadImage<T extends string | string[] = string>(
	url: T,
): Promise<T extends string ? HTMLImageElement : HTMLImageElement[]> {
	if (typeof url === 'string') {
		return createImage(url) as any
	} else {
		const newImg = url.map((u) => createImage(u))
		const result = await Promise.all(newImg)
		return result as any
	}
}

// 发布订阅

type Event = (...args: any[]) => void
/**
 * 发布订阅 类
 *
 * @export
 * @class EventHub
 */
export class EventHub {
	// static on: any
	// static emit: any
	// static off: any
	private cache: { [key: string]: Array<Event> } // 缓存订阅的事件
	private eventTypes: { [type: string]: string }
	constructor(type?: string[]) {
		this.cache = {}
		this.eventTypes = {}
		if (type) {
			this.registerType(type)
		}
	}
	// {
	//     'xxx事件': [fn1, fn2, fn3]
	// }s
	registerType(types: string | string[]) {
		;(Array.isArray(types) ? types : [types]).forEach((type: string) => {
			this.eventTypes[type] = type
		})
	}

	destroy() {
		this.cache = {}
		this.eventTypes = {}
	}
	// 把fn 推进this.cache[eventType]数组里
	on(eventType: string, fn: Event) {
		logger.debug('监听' + eventType + '的事件派发')
		this.hasType(eventType)
		// 如果订阅的事件缓存里不存在任何处理函数，则初始化订阅事件名为一个空数组
		if (!fn) {
			return
		}
		this.cache[eventType] = this.cache[eventType] || []
		this.cache[eventType].push(fn)
	}

	// 依次执行this.cache[eventType]数组里的函数
	emit(eventType: string, ...args: unknown[]) {
		if (!this.cache[eventType]) return
		this.cache[eventType].forEach((fn) => fn.apply(this, args))
	}

	once(eventType: string, fn: Event) {
		const wrapper = (...args: unknown[]) => {
			fn.apply(this, args)
			this.off(eventType, wrapper)
		}
		this.on(eventType, wrapper)
	}

	// 取消订阅的事件
	off(eventType?: string, fn?: Event) {
		// 检查需要取消的事件是否存在, 如果存在则把该事件从this.cache[eventType]数组里面移除
		if (!eventType) {
			this.cache = {}
			return
		}
		if (!fn) {
			this.hasType(eventType)
			delete this.cache[eventType]
			return
		}
		const eventArray = [...this.cache[eventType]]
		let index = indexOf(eventArray, fn)
		if (index !== -1) {
			eventArray.splice(index, 1)
			this.cache[eventType] = eventArray
		}
	}
	private hasType(type: string) {
		const types = this.eventTypes
		const isType = types[type] === type
		if (!isType) {
			throw new TypeError(
				`事件没有注册: "${type}", 当前事件 [${Object.keys(types).map((_) =>
					JSON.stringify(_),
				)}]`,
			)
		}
	}
}

/**
 * 帮助函数
 * @param array
 * @param item
 */
function indexOf(array: Array<Event> | undefined, item: unknown) {
	if (array === undefined) return -1
	let index = -1
	for (let i = 0; i < array.length; i++) {
		if (array[i] === item) {
			index = i
			break
		}
	}
	return index
}
// https://github.com/ai/nanoid
export const nanoid = (size = 21) => {
	let sizeRef = size
	let id = ''
	let bytes = crypto.getRandomValues(new Uint8Array(size))

	// A compact alternative for `for (var i = 0; i < step; i++)`.
	while (sizeRef--) {
		// It is incorrect to use bytes exceeding the alphabet size.
		// The following mask reduces the random byte in the 0-255 value
		// range to the 0-63 value range. Therefore, adding hacks, such
		// as empty string fallback or magic numbers, is unneccessary because
		// the bitmask trims bytes down to the alphabet size.
		let byte = bytes[sizeRef] & 63
		if (byte < 36) {
			// `0-9a-z`
			id += byte.toString(36)
		} else if (byte < 62) {
			// `A-Z`
			id += (byte - 26).toString(36).toUpperCase()
		} else if (byte < 63) {
			id += '_'
		} else {
			id += '-'
		}
	}
	return id
}

export class Random {
	seed: number
	constructor(seed: number) {
		this.seed = seed
	}
	next() {
		if (this.seed) {
			this.seed = Math.imul(48271, this.seed)
			return ((2 ** 31 - 1) & this.seed) / 2 ** 31
		} else {
			return Math.random()
		}
	}
}

let random = new Random(Date.now())

export const randomInteger = () => Math.floor(random.next() * 2 ** 31)

export function cloneDeep<T>(parent: T): T {
	// 维护两个储存循环引用的数组
	// const parents: any[] = []
	// const children: any[] = []
	// 要考虑 Path2D
	const _clone = (parent: any) => {
		if (parent === null) return null
		// 基础数据类型
		if (typeof parent !== 'object') return parent
		let child: any
		// 数组和对象处理
		if (Array.isArray(parent)) {
			// 对数组做特殊处理
			child = []
		} else {
			child = {}
		}
		// 处理循环引用
		// const index = parents.indexOf(parent)

		// if (index !== -1) {
		//     // 如果父数组存在本对象,说明之前已经被引用过,直接返回此对象
		//     return children[index]
		// }
		// parents.push(parent)
		// children.push(child)
		for (let i in parent) {
			// 递归
			if ({}.hasOwnProperty.call(parent, i)) {
				if (parent[i] instanceof Path2D) {
					child[i] = new Path2D(parent[i])
				} else {
					child[i] = _clone(parent[i])
				}
			}
		}
		return child
	}
	return _clone(parent)
}

// function createFunc<T>(c: new (...arg: any[]) => T, ...rest: any[]): T {
// 	return new c(...rest)
// }
