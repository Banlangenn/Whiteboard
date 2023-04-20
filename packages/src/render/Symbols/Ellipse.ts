import {
	points2Rect,
	getLimit2Rect,
	getRectLimitValue,
	getMidpoint,
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
	polygonCheckCrash,
	createShapeProperties,
	PartialPickRequired,
} from './Shape'
import RectShape, { RectShapeProperties } from './Rect'
export type EllipseShapeProperties = properties

// 传进来 state
// 1. 屏幕信息 宽高
// 2. 橡皮 大小 // 可以限制最大最小值
// 3.
export default class EllipseShape extends BaseShape<EllipseShapeProperties> {
	static key = 12
	name = '椭圆'
	vertex!: point[] // 判断是否点到线上了
	pointerDownState!: PointerDownState
	maybeTransformHandleType: MaybeTransformHandleType = false
	rectBounding!: InstanceType<typeof RectShape>
	// PartialPickRequired<ImageShapeProperties, 'imageOrUri'>
	constructor(userOptions: PartialPickRequired<EllipseShapeProperties>) {
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
		const data = createShapeProperties<EllipseShapeProperties>(
			{ ...defaultOptions, ...userOptions },
			RectShape,
		)
		super(data)

		this.data = data

		if (!userOptions.isAuxiliary) {
			this.rectBounding = new RectShape(
				createShapeProperties<RectShapeProperties>(
					{
						...defaultOptions,
						x: 0,
						y: 0,
						isAuxiliary: true,
						strokeStyle: '#6965db',
						lineWidth: 1,
						radius: 0,
					},
					RectShape,
				),
			)
		}
		this.getSourceRect()

		this.pointerDownState = this.initPointerDownState()
	}

	draw(ctx: CanvasRenderingContext2D, ignoreCache = false) {
		const { x, y, width, height, angle, fillStyle, strokeStyle } = this.data
		const { minY, minX, maxX, maxY } = this.limitValue
		const cx = (minX + maxX) / 2
		const cy = (minY + maxY) / 2
		const _x = x - cx
		const _y = y - cy
		ctx.translate(cx, cy)

		ctx.rotate(angle)
		ctx.beginPath()
		// 矩形

		// 椭圆
		ctx.ellipse(
			_x + width / 2,
			_y + height / 2,
			width / 2,
			height / 2,
			0,
			0,
			2 * Math.PI,
		)

		if (fillStyle) {
			ctx.fill()
		}
		if (strokeStyle) {
			ctx.stroke()
		}

		ctx.rotate(-angle)
		ctx.translate(-cx, -cy)
		if (!this.data.isAuxiliary && this.isEdit) {
			this.auxiliary(ctx)
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
			// events.emit('clearCapturingCanvas');
			this.draw(ctx)
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
			const { width, height, x, y } = this.data
			this.limitValue = getRectLimitValue(
				{ x, y },
				width,
				height,
				this.threshold,
			)
			const rect = getLimit2Rect(this.limitValue)
			this.rectBounding.setData(rect).getSourceRect()
		}
		if (isAppend) {
			// 是追加的  可能作废

			this.pointerDownState = this.initPointerDownState()
		}
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
		this.transformHandles = this.getTransformHandles(
			this.rectBounding.limitValue,
			0,
			{
				rotation: true,
				// n: true,
				// s: true,
				// w: true,
				// e: true,
			},
		)
		this.renderTransformHandles(ctx, this.transformHandles, 0)
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
				this.pointerDownState = {
					...(this.pointerDownState || {}),
					offset: getResizeOffsetXY(maybeTransformHandleType, this, p),
				}
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
			// 计算点到椭圆中心的距离
			const { x, y, width, height } = this.data

			const midpoint = getMidpoint({ x, y }, { x: x + width, y: y + height })
			const left = Math.pow(p.x - midpoint.x, 2) / Math.pow(width / 2, 2)
			const right = Math.pow(p.y - midpoint.y, 2) / Math.pow(height / 2, 2)

			if (this.data.fillStyle) {
				if (left + right <= 1) {
					this.pointerDownState.startPoint = p
					return true
				}
			}

			if (Math.abs(left + right - 1) < 0.1) {
				this.pointerDownState.startPoint = p
				return true
			}
		}
		return false
	}
	computeBounding() {}
}
