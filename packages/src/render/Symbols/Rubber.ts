import { limitValue, point, newPoint, EventHub } from '../../utils'
// import Edit from './../../index'
import { properties, BaseShape } from './Shape'
export interface RubberShapeProperties extends properties {
	center: point
	radius: number
}

export default class RubberShape extends BaseShape<RubberShapeProperties> {
	// firstPoint!: point
	static key = 7
	static cache = true
	name = '橡皮'
	constructor(userOptions: RubberShapeProperties) {
		super()
		const defaultOptions = {
			key: 7,
			radius: 10,
			available: false,
		}
		this.data = Object.assign(defaultOptions, userOptions)
	}

	draw(ctx: CanvasRenderingContext2D, ignoreCache = false) {
		// 取走一个点 能够拿到x，y
		const { center, radius } = this.data
		ctx.save()
		try {
			ctx.beginPath()
			ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true)
			ctx.fill()
		} finally {
			ctx.restore()
		}
	}
	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 可以做一些特别判断`
		this.drawAttributeInit(ctx)
		this.appendPoint(ctx, point, events)
	}
	appendPoint(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 如果离得很近 判断
		events.emit('clearCapturingCanvas')
		this.data.center = point
		this.draw(ctx, true)
		events.emit('crashRemove', point, this.data.radius)
	}
	endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: EventHub,
	) {
		events.emit('clearCapturingCanvas')
	}
	computeOffsetPath(deviationX: number, deviationY: number) {}
	clone() {}
	computeCrash(p: point, lineDis: number) {
		return false
	}

	getSourceRect() {}
	auxiliary() {}
	computeClick(p: point) {
		return false
	}
	computeBounding() {}
	isClientVisible(lm: limitValue) {
		return true
	}
	// 是否在可视区域
	isClientArea(lm: limitValue) {
		return false
	}
}
