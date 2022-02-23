import {
	points2Rect,
	getLimit2Rect,
	getRectLimitValue,
	getRectangularVertex,
	rectCheckCrashPoint,
	point,
	newPoint,
	EventHub,
} from '../../utils'
// import Edit from './../../index'
import {
	properties,
	BaseShape,
	PointerDownState,
	transformElements,
	MaybeTransformHandleType,
	dragElements,
	getResizeOffsetXY,
	rotate,
	polygonCheckCrash,
	createShapeProperties,
} from './Shape'
export interface RectShapeProperties extends properties {
	x: number
	y: number
	color: string
	radius: number
	isAuxiliary: boolean
}

// 传进来 state
// 1. 屏幕信息 宽高
// 2. 橡皮 大小 // 可以限制最大最小值
// 3.
export default class RectShape extends BaseShape<RectShapeProperties> {
	static key = 11
	name = '矩形'
	vertex!: point[] // 判断是否点到线上了
	pointerDownState!: PointerDownState
	maybeTransformHandleType: MaybeTransformHandleType = false
	rectBounding!: InstanceType<typeof RectShape>
	constructor(userOptions: RectShapeProperties) {
		super()

		const defaultOptions = {
			key: 11,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			isAuxiliary: false,
			angle: 0,
			radius: 0, // 圆角
		}
		this.data = Object.assign(
			createShapeProperties<RectShapeProperties>(defaultOptions),
			userOptions,
		)

		if (!userOptions.isAuxiliary) {
			this.rectBounding = new RectShape(
				createShapeProperties<RectShapeProperties>({
					...defaultOptions,
					x: 0,
					y: 0,
					isAuxiliary: true,
					color: '#000',
					lineWidth: 1,
					radius: 0,
					isDash: true,
				}),
			)
		}
		this.pointerDownState = this.initPointerDownState()
		this.vertex = this.getVertex()
	}

	roundRect(context: CanvasRenderingContext2D, ignoreCache = false) {
		const { x, y, width, height, radius } = this.data
		// ctx.rect(x, y, width, height)
		// ctx.stroke()
		context.beginPath()
		context.moveTo(x + radius, y)
		context.lineTo(x + width - radius, y)
		context.quadraticCurveTo(x + width, y, x + width, y + radius)
		context.lineTo(x + width, y + height - radius)
		context.quadraticCurveTo(
			x + width,
			y + height,
			x + width - radius,
			y + height,
		)
		context.lineTo(x + radius, y + height)
		context.quadraticCurveTo(x, y + height, x, y + height - radius)
		context.lineTo(x, y + radius)
		context.quadraticCurveTo(x, y, x + radius, y)
		context.closePath()
		if (this.data.fill) {
			context.fill()
		}
		context.stroke()
	}
	draw(ctx: CanvasRenderingContext2D, ignoreCache = false) {
		const angle = this.data.angle!
		const { minY, minX, maxX, maxY } = this.limitValue
		const cx = (minX + maxX) / 2
		const cy = (minY + maxY) / 2
		ctx.translate(cx, cy)
		ctx.rotate(angle)
		if (this.data.radius !== 0) {
			this.roundRect(ctx)
		} else {
			ctx.beginPath()
			const { x, y, width, height } = this.data
			//  - cx - cy
			ctx.rect(x - cx, y - cy, width, height)
			if (this.data.fill) {
				ctx.fill()
			}
			ctx.stroke()
		}

		ctx.rotate(-angle)
		ctx.translate(-cx, -cy)
		if (!this.data.isAuxiliary && this.isEdit) {
			this.auxiliary(ctx)
			// 辅助线对的
			this.transformHandles = this.getTransformHandles(this.limitValue, angle, {
				rotation: true,
				// n: true,
				// s: true,
				// w: true,
				// e: true,
			})
			this.renderTransformHandles(ctx, this.transformHandles, angle)
		}
	}
	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		this.drawAttributeInit(ctx)
		this.pointerDownState = this.initPointerDownState(point)
		if (this.isEdit) {
			// 记录 当前点
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			return
		}
	}
	appendPoint(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 如果离得很近 判断
		if (this.isEdit) {
			if (this.maybeTransformHandleType) {
				const p = {
					x: point.x - this.pointerDownState.offset.x,
					y: point.y - this.pointerDownState.offset.y,
				}
				transformElements(
					this.pointerDownState,
					this,
					false,
					this.maybeTransformHandleType,
					false,
					p,
				)
			} else {
				// this.computeOffsetPath(deviationX, deviationYW)
				dragElements(this.pointerDownState, this, point)
			}
			this.drawAttributeInit(ctx)
		} else {
			const rect = points2Rect(this.pointerDownState.startPoint, point)
			this.data = {
				...this.data,
				...rect,
			}
		}

		if (this.available) {
			events.emit('clearCapturingCanvas')
			this.getSourceRect()
			this.draw(ctx)
		}
	}
	getSourceRect(isAppend = false) {
		const { x, y, width, height, lineWidth } = this.data
		// (this.data.lineWidth + this.threshold)
		// 为什么要 放大 -- 辅助线

		this.limitValue = getRectLimitValue(
			{ x, y },
			width,
			height,
			lineWidth / 2 + this.threshold,
		)

		if (!this.data.isAuxiliary) {
			const rect = getLimit2Rect(this.limitValue)
			this.rectBounding.setData({ ...rect, angle: this.data.angle })
			this.rectBounding.getSourceRect()
		}
		if (isAppend) {
			// 是追加的  可能作废
			this.vertex = this.getVertex()
			this.pointerDownState = this.initPointerDownState()
		}
	}

	// 获取各个定点
	getVertex() {
		const { x, y, width, height, angle = 0 } = this.data
		const limitValue = getRectLimitValue({ x, y }, width, height, 0)
		let vertex = getRectangularVertex(limitValue)
		if (angle !== 0) {
			const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = limitValue
			const cx = (x1 + x2) / 2
			const cy = (y1 + y2) / 2
			// 旋转后的订单
			vertex = this.vertex.map((e) => rotate(e.x, e.y, cx, cy, angle))
		}
		return vertex
	}
	endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: EventHub,
	) {
		if (!this.available) {
			console.log('无效的图形')
			return
		}
		this.vertex = this.getVertex()
		if (this.isEdit) return
		events.emit('appendCurrentPage', this)
		this.getSourceRect()
	}
	computeOffsetPath(deviationX: number, deviationY: number) {
		this.data.x += deviationX
		this.data.y += deviationY
	}

	clone() {
		// 可能会出现 还是原来那块地址
		const o = new RectShape(this.data)
		return o
	}

	auxiliary(ctx: CanvasRenderingContext2D) {
		this.rectBounding.drawAttributeInit(ctx)
		this.rectBounding.draw(ctx)
	}
	computeCrash(p: point, lineDis: number) {
		if (polygonCheckCrash(p, this.vertex, 10 + this.data.lineWidth / 2)) {
			return true
		}
		return false
	}
	initPointerDownState(p = { x: 0, y: 0 }) {
		const { x, y, width, height, angle = 0 } = this.data
		const point = this?.pointerDownState?.offset || { x: 0, y: 0 }
		const limitValue = getRectLimitValue({ x, y }, width, height, 0)
		return { ...limitValue, startPoint: p, offset: point, angle }
	}
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		// 点和矩形碰撞
		// return this.polygonCheckCrash(p, this.vertex, 10)
		if (this.isEdit) {
			const maybeTransformHandleType = this.resizeTest(p, this.transformHandles)
			this.maybeTransformHandleType = maybeTransformHandleType
			if (maybeTransformHandleType) {
				// this.getSourceRect()
				this.pointerDownState.offset = getResizeOffsetXY(
					maybeTransformHandleType,
					this,
					p,
				)
				return true
			}
			// 在矩形内
			if (rectCheckCrashPoint(this.limitValue, p)) {
				return true
			}
			this.maybeTransformHandleType = false
			// 没有选中

			this.setEditStatus(false)
			// 计算定点 方便下次计算碰撞
			this.getSourceRect()
			events.emit('appendCurrentPage', this)
			//  需要重绘当前的图
		} else {
			if (polygonCheckCrash(p, this.vertex, this.threshold)) {
				this.pointerDownState.startPoint = p
				return true
			}
		}
		return false
	}
	computeBounding() {}
}
