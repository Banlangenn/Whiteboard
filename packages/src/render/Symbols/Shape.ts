import {
	getDistance,
	distanceOfPoint2Line,
	newPoint,
	EventHub,
	rectCheckCrash,
	getMidpoint,
	limitValue,
	nanoid,
	point,
	randomInteger,
} from './../../utils'

export interface pointListPath extends properties {
	xs: number[]
	ys: number[]
	t: number[]
	p: number[]
	l: number[]
}
export interface pointListPathItem extends newPoint {
	p: number
	l: number
}
type pointListI = pointListPath | point[] | [point, point]
export function getPointByIndex(
	stroke: pointListPath,
	index: number,
): pointListPathItem {
	// if (index !== undefined && index >= 0 && index < stroke.x.length) {
	return {
		x: stroke.xs[index],
		y: stroke.ys[index],
		t: stroke.t[index],
		p: stroke.p[index],
		l: stroke.l ? stroke.l[index] : 0,
	}
}

export function fnAfter(
	context: any,
	fn: (...argArray: any) => any,
	afterFn: (...argArray: any) => any,
) {
	return function (...arg: any) {
		const ret = fn.apply(context, arg)
		afterFn.apply(context, arg)
		return ret
	}
}

// function fnBefore(context: any, fn: (...argArray: any)=> any, beforeFn: (...argArray: any)=> any) {
//     return function(...arg:any) {
//         let ret
//         if (beforeFn.apply(context, arg)) {
//             ret = fn.apply(context, arg)
//         }
//         return ret
//     }
// }

// const base: Pick<T, keyof ExcalidrawElement> = {
//     type: extra.type || element.type,
//     // all elements must have version > 0 so getSceneVersion() will pick up
//     // newly added elements
//     version: element.version || 1,
//     versionNonce: element.versionNonce ?? 0,
//     isDeleted: element.isDeleted ?? false,
//     id: element.id || randomId(),
//     fillStyle: element.fillStyle || 'hachure',
//     strokeWidth: element.strokeWidth || 1,
//     strokeStyle: element.strokeStyle ?? 'solid',
//     roughness: element.roughness ?? 1,
//     opacity: element.opacity == null ? 100 : element.opacity,
//     angle: element.angle || 0,
//     x: extra.x ?? element.x ?? 0,
//     y: extra.y ?? element.y ?? 0,
//     strokeColor: element.strokeColor,
//     backgroundColor: element.backgroundColor,
//     width: element.width || 0,
//     height: element.height || 0,
//     seed: element.seed ?? 1,
//     groupIds: element.groupIds ?? [],
//     strokeSharpness:
//       element.strokeSharpness ??
//       (isLinearElementType(element.type) ? 'round' : 'sharp'),
//     boundElements: element.boundElementIds
//       ? element.boundElementIds.map((id) => ({ type: 'arrow', id }))
//       : element.boundElements ?? [],
//     updated: element.updated ?? getUpdatedTimestamp(),
//   }
export interface properties {
	version: number
	versionNonce: number
	key: number
	id: string
	lineWidth: number
	x: number
	y: number
	width: number
	height: number
	fill?: boolean
	fillColor?: string
	color?: string
	isDash?: boolean
	opacity?: number
	angle?: number
	backgroundColor?: string
	path2d?: {
		// path2d
		path: Path2D
		end: boolean
	} | null
}

// 外边会用到的
export abstract class BaseShape<T extends Partial<properties> = properties> {
	// 画当前图形
	static key: number | string
	static cache = false
	name = ''
	appendPointCallTimes = 0
	disabled = false
	data: Required<T>
	threshold = 4
	transformHandles: TransformHandles = {}
	limitValue: limitValue = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
	}
	private _isEdit = false

	constructor(userOptions: T) {
		this.data = userOptions as Required<T>
		const originAppendPoint = this.appendPoint
		this.appendPoint = fnAfter(this, originAppendPoint, () => {
			this.appendPointCallTimes += 1
		})

		this.initPending = fnAfter(this, this.initPending, () => {
			this.appendPointCallTimes = 0
		})

		this.endPendingPoint = fnAfter(
			this,
			this.endPendingPoint,
			(ctx: CanvasRenderingContext2D, p: newPoint, events: EventHub) => {
				if (
					// @ts-ignore  文字特殊处理
					(this.available && !this.data?.text) ||
					// @ts-ignore  文字特殊处理
					this.data?.text !== this.prevText
				) {
					this.data.versionNonce = randomInteger()
					this.data.version = (this.data.version ?? 0) + 1
					events.emit('pushEntry', this)
				}
			},
		)
	}
	// 当前图形是否有效
	get available(): boolean {
		return this.appendPointCallTimes > 2
	}

	get isEdit(): boolean {
		return this._isEdit
	}
	// get key() {
	//     return BaseShape.key
	// }
	// get cache() {
	//     return BaseShape.cache
	// }
	drawAttributeInit(context: CanvasRenderingContext2D) {
		const { color, lineWidth, isDash, fillColor, opacity = 1 } = this.data
		if (color && context.strokeStyle !== color) {
			context.strokeStyle = color
		}
		const FC = fillColor || color
		if (FC && context.fillStyle !== FC) {
			context.fillStyle = FC
		}
		if (lineWidth && context.lineWidth !== lineWidth) {
			context.lineWidth = lineWidth
		}
		if (context.globalAlpha !== opacity) {
			context.globalAlpha = opacity
		}

		const lineDash = context.getLineDash()
		if (isDash) {
			if (lineDash.length === 0) {
				const dashWidth = 8
				const spaceWidth = 4
				context.setLineDash([dashWidth, spaceWidth])
				// context.lineDashOffset = (dashWidth + spaceWidth)
			}
		} else {
			if (lineDash.length !== 0) {
				context.setLineDash([])
			}
		}
	}

	setEditStatus(b: boolean) {
		this._isEdit = b
	}

	// setStatus(data: {
	//     isEdit?: boolean
	//     disabled?: boolean
	//     threshold?: number
	// }) {

	// }

	setDisabledStatus(b: boolean) {
		this.disabled = b
	}
	setData(data: Partial<T>): this {
		// console.log('setData', data)
		this.data = {
			...this.data,
			...data,
		}
		return this
	}
	getData(): Required<T> {
		return this.data
	}

	initLimitValue() {
		return {
			minX: 0,
			minY: 0,
			maxX: 0,
			maxY: 0,
		}
	}
	// 是否在可视区域
	// abstract isClientArea(lm: limitValue): boolean
	isClientVisible(lm: limitValue) {
		return rectCheckCrash(this.limitValue, lm)
	}
	getTransformHandles(
		limit: limitValue,
		angle: number,
		omitSides: {
			[T in TransformHandleType]?: boolean
		} = {},
	): TransformHandles {
		// 旋转调整手柄间隙
		const ROTATION_RESIZE_HANDLE_GAP = 16
		type PointerType = 'mouse' | 'pen' | 'touch'
		const transformHandleSizes: {
			[k in PointerType]: number
		} = {
			mouse: 8,
			pen: 16,
			touch: 28,
		}

		const size = transformHandleSizes.mouse
		const zoom = {
			value: 1,
		}
		const handleWidth = size / zoom.value
		const handleHeight = size / zoom.value

		const handleMarginX = size / zoom.value
		const handleMarginY = size / zoom.value
		const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = limit
		const width = x2 - x1
		const height = y2 - y1
		const cx = (x1 + x2) / 2
		const cy = (y1 + y2) / 2

		const dashedLineMargin = 0 / zoom.value

		const centeringOffset = (size * 2) / (2 * zoom.value)

		const transformHandles: TransformHandles = {
			// nw 左上
			nw: omitSides.nw
				? undefined
				: generateTransformHandle(
						x1 - dashedLineMargin - handleMarginX + centeringOffset,
						y1 - dashedLineMargin - handleMarginY + centeringOffset,
						handleWidth,
						handleHeight,
						cx,
						cy,
						angle,
				  ),
			ne: omitSides.ne
				? undefined
				: generateTransformHandle(
						x2 + dashedLineMargin - centeringOffset,
						y1 - dashedLineMargin - handleMarginY + centeringOffset,
						handleWidth,
						handleHeight,
						cx,
						cy,
						angle,
				  ),
			sw: omitSides.sw
				? undefined
				: generateTransformHandle(
						x1 - dashedLineMargin - handleMarginX + centeringOffset,
						y2 + dashedLineMargin - centeringOffset,
						handleWidth,
						handleHeight,
						cx,
						cy,
						angle,
				  ),
			se: omitSides.se
				? undefined
				: generateTransformHandle(
						x2 + dashedLineMargin - centeringOffset,
						y2 + dashedLineMargin - centeringOffset,
						handleWidth,
						handleHeight,
						cx,
						cy,
						angle,
				  ),
			rotation: omitSides.rotation
				? undefined
				: generateTransformHandle(
						x1 + width / 2 - handleWidth / 2,
						y1 -
							dashedLineMargin -
							handleMarginY +
							centeringOffset -
							ROTATION_RESIZE_HANDLE_GAP / zoom.value,
						handleWidth,
						handleHeight,
						cx,
						cy,
						angle,
				  ),
		}

		// 小到一定程度 不再展示--中间控制点
		const minimumSizeForEightHandles =
			(5 * transformHandleSizes.mouse) / zoom.value
		if (Math.abs(width) > minimumSizeForEightHandles) {
			if (!omitSides.n) {
				transformHandles.n = generateTransformHandle(
					x1 + width / 2 - handleWidth / 2,
					y1 - dashedLineMargin - handleMarginY + centeringOffset,
					handleWidth,
					handleHeight,
					cx,
					cy,
					angle,
				)
			}
			if (!omitSides.s) {
				transformHandles.s = generateTransformHandle(
					x1 + width / 2 - handleWidth / 2,
					y2 + dashedLineMargin - centeringOffset,
					handleWidth,
					handleHeight,
					cx,
					cy,
					angle,
				)
			}
		}
		if (Math.abs(height) > minimumSizeForEightHandles) {
			if (!omitSides.w) {
				transformHandles.w = generateTransformHandle(
					x1 - dashedLineMargin - handleMarginX + centeringOffset,
					y1 + height / 2 - handleHeight / 2,
					handleWidth,
					handleHeight,
					cx,
					cy,
					angle,
				)
			}
			if (!omitSides.e) {
				transformHandles.e = generateTransformHandle(
					x2 + dashedLineMargin - centeringOffset,
					y1 + height / 2 - handleHeight / 2,
					handleWidth,
					handleHeight,
					cx,
					cy,
					angle,
				)
			}
		}

		return transformHandles
	}
	renderTransformHandles(
		context: CanvasRenderingContext2D,
		transformHandles: TransformHandles,
		angle: number,
	): void {
		context.fillStyle = '#fff'
		Object.keys(transformHandles).forEach((key) => {
			const zoomValue = 1
			// context.
			const lineDash = context.getLineDash()
			if (lineDash.length !== 0) {
				context.setLineDash([])
			}
			const transformHandle = transformHandles[key as TransformHandleType]
			if (transformHandle !== undefined) {
				const lineWidth = context.lineWidth
				context.lineWidth = 1 / zoomValue
				const { x, y, width, height } = transformHandle
				if (key === 'rotation') {
					fillCircle(context, x + width / 2, y + height / 2, width / 2)
				} else if (context.roundRect) {
					context.beginPath()
					context.roundRect(x, y, width, height, 2 / zoomValue)
					context.fill()
					context.stroke()
				} else {
					strokeRectWithRotation(
						context,
						x,
						y,
						width,
						height,
						x + width / 2,
						y + height / 2,
						angle,
						true, // fill before stroke
					)
					context.restore()
				}
				context.lineWidth = lineWidth
			}
		})
	}

	resizeTest(p: point, th: TransformHandles): MaybeTransformHandleType {
		const { rotation: rotationTransformHandle, ...transformHandles } = th
		const { x, y } = p

		if (
			rotationTransformHandle &&
			isInsideTransformHandle(rotationTransformHandle, x, y)
		) {
			return 'rotation' as TransformHandleType
		}

		const filter = Object.keys(transformHandles).find((key) => {
			const transformHandle =
				transformHandles[key as Exclude<TransformHandleType, 'rotation'>]!
			if (!transformHandle) {
				return false
			}
			return isInsideTransformHandle(transformHandle, x, y)
		})

		if (filter) {
			return filter as TransformHandleType
		}
		return false
	}

	abstract auxiliary(ctx: CanvasRenderingContext2D): void
	abstract getSourceRect(isAppend?: boolean): void
	abstract computeClick(
		p: point,
		events: InstanceType<typeof EventHub>,
	): boolean
	abstract draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): void
	// 计算当前的图形
	// 计算当前的图形
	abstract computeOffsetPath(deviationX: number, deviationY: number): void
	abstract computeCrash(p: point, lineDis: number): boolean
	abstract initPending(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: InstanceType<typeof EventHub>,
		translatePosition?: {
			x: number
			y: number
		},
	): void
	abstract appendPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: InstanceType<typeof EventHub>,
	): void
	abstract endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: InstanceType<typeof EventHub>,
	): void
	abstract clone(): any
}
// 只能这么搞一个通用 的类型 不然要或 所有子类
// type
export type Graphics = typeof BaseShape<Partial<properties>> & {
	key: number
	name: string
}
// new (...arg: any[]) => BaseShape<properties>

export type GraphicsIns = InstanceType<typeof BaseShape<properties>>

// South East  West North
// 东南西北
// 上北下南，左西右东
export type TransformHandleDirection =
	| 'n'
	| 's'
	| 'w'
	| 'e'
	| 'nw'
	| 'ne'
	| 'sw'
	| 'se'
export type MaybeTransformHandleType = TransformHandleType | false

export type TransformHandleType = TransformHandleDirection | 'rotation'
export interface TransformHandle {
	x: number
	y: number
	width: number
	height: number
}
export type TransformHandles = Partial<{
	[T in TransformHandleType]: TransformHandle
}>
const generateTransformHandle = (
	x: number,
	y: number,
	width: number,
	height: number,
	cx: number,
	cy: number,
	angle: number,
): TransformHandle => {
	const { x: xx, y: yy } = rotate(x + width / 2, y + height / 2, cx, cy, angle)
	return {
		x: xx - width / 2,
		y: yy - height / 2,
		width,
		height,
	}
}

export const rotate = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	angle: number,
): point =>
	// 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
	// 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
	// https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
	({
		x: (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
		y: (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
	})

export const rotatePoint = (
	point: point,
	center: point,
	angle: number,
): point => rotate(point.x, point.y, center.x, center.y, angle)

const fillCircle = (
	context: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
) => {
	context.beginPath()
	context.arc(cx, cy, radius, 0, Math.PI * 2)
	context.fill()
	context.stroke()
}

const strokeRectWithRotation = (
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	cx: number,
	cy: number,
	angle: number,
	fill = false,
) => {
	context.translate(cx, cy)
	context.rotate(angle)
	if (fill) {
		context.fillStyle = '#fff'
		context.fillRect(x - cx, y - cy, width, height)
	}
	context.strokeRect(x - cx, y - cy, width, height)

	context.rotate(-angle)
	context.translate(-cx, -cy)
}
const isInsideTransformHandle = (
	transformHandle: TransformHandle,
	xx: number,
	yy: number,
) => {
	const { x, y, width, height } = transformHandle
	return xx >= x && xx <= x + width && yy >= y && yy <= y + height
}

export function dragElements(
	pointerDownState: PointerDownState,
	element: BaseShape<properties>,
	pointer: point,
) {
	const dragDistanceX = pointerDownState.startPoint.x - pointer.x
	const dragDistanceY = pointerDownState.startPoint.y - pointer.y
	element.setData({
		x: pointerDownState.minX - dragDistanceX,
		y: pointerDownState.minY - dragDistanceY,
	})
}

export interface PointerDownState extends limitValue {
	startPoint: point
	offset: point
	angle: number
}
const normalizeAngle = (angle: number): number => {
	if (angle >= 2 * Math.PI) {
		return angle - 2 * Math.PI
	}
	return angle
}
const SHIFT_LOCKING_ANGLE = Math.PI / 12
const rotateSingleElement = (
	pointerDownState: PointerDownState,
	element: BaseShape<properties>,
	pointer: point,
	isRotateWithDiscreteAngle: boolean,
) => {
	const { minX, minY, maxX, maxY } = pointerDownState
	const cx = (minX + maxX) / 2
	const cy = (minY + maxY) / 2
	let angle = (5 * Math.PI) / 2 + Math.atan2(pointer.y - cy, pointer.x - cx)
	if (isRotateWithDiscreteAngle) {
		angle += SHIFT_LOCKING_ANGLE / 2
		angle -= angle % SHIFT_LOCKING_ANGLE
	}
	angle = normalizeAngle(angle)
	element.setData({
		angle,
	})
}

export function transformElements(
	pointerDownState: PointerDownState,
	element: BaseShape<properties>,
	shouldKeepSidesRatio: boolean,
	// element: NonDeletedExcalidrawElement,
	transformHandleType: MaybeTransformHandleType,
	isResizeFromCenter: boolean,
	pointer: point,
	isRotateWithDiscreteAngle = false,
) {
	if (transformHandleType === 'rotation') {
		rotateSingleElement(
			pointerDownState,
			element,
			pointer,
			isRotateWithDiscreteAngle,
		)
	} else if (transformHandleType) {
		resizeShapeElement(
			pointerDownState,
			element,
			shouldKeepSidesRatio,
			transformHandleType,
			isResizeFromCenter,
			pointer,
		)
	}
}

// eslint-disable-next-line complexity
export function resizeShapeElement(
	pointerDownState: PointerDownState,
	element: BaseShape<properties>,
	shouldKeepSidesRatio: boolean,
	// element: NonDeletedExcalidrawElement,
	transformHandleDirection: TransformHandleDirection,
	isResizeFromCenter: boolean,
	pointer: point,
) {
	// console.log('找到了', transformHandleDirection,  stateAtResizeStart)
	// const [x1, y1, x2, y2] = getElementAbsoluteCoords(stateAtResizeStart)
	const { minX: x, minY: y, maxX, maxY, angle = 0 } = pointerDownState
	const startTopLeft: point = {
		x,
		y,
	}
	const startBottomRight: point = {
		x: maxX,
		y: maxY,
	}
	const startCenter: point = getMidpoint(startTopLeft, startBottomRight)

	// Calculate new dimensions based on cursor position
	// const angle = 0
	const width = maxX - x
	const height = maxY - y
	// const x = minX
	// const y = minY
	// let angle = 0
	// const angle = stateAtResizeStart.angle
	let newWidth = width
	let newHeight = height

	const rotatedPointer = rotatePoint(pointer, startCenter, -angle)
	if (transformHandleDirection.includes('e')) {
		newWidth = rotatedPointer.x - startTopLeft.x
	}
	if (transformHandleDirection.includes('s')) {
		newHeight = rotatedPointer.y - startTopLeft.y
	}
	if (transformHandleDirection.includes('w')) {
		newWidth = startBottomRight.x - rotatedPointer.x
	}
	if (transformHandleDirection.includes('n')) {
		newHeight = startBottomRight.y - rotatedPointer.y
	}
	// adjust dimensions for resizing from center
	if (isResizeFromCenter) {
		newWidth = 2 * newWidth - width
		newHeight = 2 * newHeight - height
	}

	// adjust dimensions to keep sides ratio

	if (shouldKeepSidesRatio) {
		const widthRatio = Math.abs(newWidth) / width
		const heightRatio = Math.abs(newHeight) / height
		if (transformHandleDirection.length === 1) {
			newHeight *= widthRatio
			newWidth *= heightRatio
		}
		if (transformHandleDirection.length === 2) {
			const ratio = Math.max(widthRatio, heightRatio)
			newWidth = width * ratio * Math.sign(newWidth)
			newHeight = height * ratio * Math.sign(newHeight)
		}
	}

	// Calculate new topLeft based on fixed corner during resize
	let newTopLeft = startTopLeft
	// console.log('newTopLeft--开始位置', { x: newTopLeft.x, y: newTopLeft.y })
	if (['n', 'w', 'nw'].includes(transformHandleDirection)) {
		newTopLeft = {
			x: startBottomRight.x - Math.abs(newWidth),
			y: startBottomRight.y - Math.abs(newHeight),
		}
	}
	if (transformHandleDirection === 'ne') {
		const bottomLeft = {
			x: x,
			y: y + height,
		}
		newTopLeft = {
			x: bottomLeft.x,
			y: bottomLeft.y - Math.abs(newHeight),
		}
	}
	if (transformHandleDirection === 'sw') {
		const topRight = {
			x: x + width,
			y: y,
		}
		newTopLeft = {
			x: topRight.x - Math.abs(newWidth),
			y: topRight.y,
		}
	}

	// Keeps opposite handle fixed during resize
	if (shouldKeepSidesRatio) {
		if (['s', 'n'].includes(transformHandleDirection)) {
			newTopLeft.x = startCenter.x - newWidth / 2
		}
		if (['e', 'w'].includes(transformHandleDirection)) {
			newTopLeft.y = startCenter.y - newHeight / 2
		}
	}

	// Flip horizontally
	if (newWidth < 0) {
		if (transformHandleDirection.includes('e')) {
			newTopLeft.x -= Math.abs(newWidth)
		}
		if (transformHandleDirection.includes('w')) {
			newTopLeft.x += Math.abs(newWidth)
		}
	}
	// Flip vertically
	if (newHeight < 0) {
		if (transformHandleDirection.includes('s')) {
			newTopLeft.y -= Math.abs(newHeight)
		}
		if (transformHandleDirection.includes('n')) {
			newTopLeft.y += Math.abs(newHeight)
		}
	}

	if (isResizeFromCenter) {
		newTopLeft.x = startCenter.x - Math.abs(newWidth) / 2
		newTopLeft.y = startCenter.y - Math.abs(newHeight) / 2
	}
	// console.log('newTopLeft前：', JSON.stringify(newTopLeft))
	// adjust topLeft to new rotation point
	const rotatedTopLeft = rotatePoint(newTopLeft, startCenter, angle)
	const newCenter: point = {
		x: newTopLeft.x + Math.abs(newWidth) / 2,
		y: newTopLeft.y + Math.abs(newHeight) / 2,
	}
	const rotatedNewCenter = rotatePoint(newCenter, startCenter, angle)
	newTopLeft = rotatePoint(rotatedTopLeft, rotatedNewCenter, -angle)
	const resizedElement = {
		width: Math.abs(newWidth),
		height: Math.abs(newHeight),
		...newTopLeft,
	}
	element.setData(resizedElement)
	// console.log('new', resizedElement)
	// updateBoundElements(element, {
	//     newSize: { width: resizedElement.width, height: resizedElement.height }
	// })
	// mutateElement(element, resizedElement)
}

export const getResizeOffsetXY = (
	transformHandleType: MaybeTransformHandleType,
	selectedElement: BaseShape<properties>,
	pointer: point,
): point => {
	const { x: x1, y: y1, width, height } = selectedElement.data
	const x2 = x1 + width
	const y2 = y1 + height
	const cx = (x1 + x2) / 2
	const cy = (y1 + y2) / 2
	const angle = selectedElement.data.angle || 0
	const { x, y } = rotate(pointer.x, pointer.y, cx, cy, -angle)
	switch (transformHandleType) {
		case 'n':
			return rotate(x - (x1 + x2) / 2, y - y1, 0, 0, angle)
		case 's':
			return rotate(x - (x1 + x2) / 2, y - y2, 0, 0, angle)
		case 'w':
			return rotate(x - x1, y - (y1 + y2) / 2, 0, 0, angle)
		case 'e':
			return rotate(x - x2, y - (y1 + y2) / 2, 0, 0, angle)
		case 'nw':
			// console.log(1, rotate(x - x1, y - y1, 0, 0, angle))
			return rotate(x - x1, y - y1, 0, 0, angle)
		case 'ne':
			return rotate(x - x2, y - y1, 0, 0, angle)
		case 'sw':
			return rotate(x - x1, y - y2, 0, 0, angle)
		case 'se':
			return rotate(x - x2, y - y2, 0, 0, angle)
		default:
			return {
				x: 0,
				y: 0,
			}
	}
}

export function getAllPointByIndex(
	points: pointListPath | point[],
	index: number,
): point {
	if (Array.isArray(points)) {
		return points[index]
	} else {
		return getPointByIndex(points, index)
	}
}

export function lineCheckCrash(
	ePoint: point,
	pointList: pointListI,
	lineDis: number,
): boolean {
	const lineLength = Array.isArray(pointList)
		? pointList.length
		: pointList.xs.length
	const { x, y } = ePoint

	// TODO: 这个计算  橡皮跑很快会有问题

	for (let j = 0; j < lineLength; j++) {
		// 点
		// const pointPath = pointListPath[j]
		// 首先用点检测
		const point = getAllPointByIndex(pointList, j)
		if (!point) break
		// { x: pointListPath.x[j], y: pointListPath.y[j]}
		if (Math.abs(x - point.x) < lineDis && Math.abs(y - point.y) < lineDis) {
			return true
		}
		// 判断线 不是最后一个
		if (lineLength === 1 || j === lineLength - 1) break
		// pointLine[j + 1]
		const point2 = getAllPointByIndex(pointList, j + 1)
		if (!point2) break
		// logger.debug('zou-------------------检测', point)

		// 如果 离上一个点差的很远 ---  用线 检测
		if (getDistance(point, point2) > lineDis) {
			// this.log('差的很远的的一条线 橡皮离这个线的距离')
			const dis = distanceOfPoint2Line(point, point2, ePoint)
			// logger.debug('点到线的距离为： ' , dis)
			// logger.debug(lineDis)

			if (dis < lineDis) {
				return true
				// 删除 这根线
			}
		}
	}
	return false
}
export function polygonCheckCrash(
	ePoint: point,
	points: point[],
	lineDis: number,
): boolean {
	const pointsReference = [...points]
	pointsReference.push(pointsReference[0])
	return lineCheckCrash(ePoint, pointsReference, lineDis)
}

// export interface properties {
// 	version: number
// 	versionNonce: number
// 	id: string
// 	x: number
// 	y: number
// 	fill?: boolean
// 	fillColor?: string
// 	color?: string
// 	isDash?: boolean
// 	opacity?: number
// 	angle?: number
// 	width: number
// 	height: number
// 	lineWidth: number
// 	backgroundColor?: string
// 	key: number
// 	path2d?: {
// 		// path2d
// 		path: Path2D
// 		end: boolean
// 	}
// }

export type PartialPickRequired<
	O extends Record<any, any>,
	P extends keyof O = {},
> = Partial<O> & Pick<O, P>

export const createShapeProperties = <T extends properties>(
	element: Partial<T>,
	Shape: { key: number },
) => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {
		...element,
		key: Shape.key,
		version: element.version ?? 1,
		versionNonce: element.versionNonce ?? randomInteger(),
		id: element.id || nanoid(),
		fill: element.fill ?? false,
		lineWidth: element.lineWidth || 1,
		opacity: element.opacity ?? 100,
		angle: element.angle || 0,
		x: element.x ?? 0,
		y: element.y ?? 0,
		backgroundColor: element.backgroundColor,
		width: element.width || 0,
		height: element.height || 0,
	} as Required<T>
}
