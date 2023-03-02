import { drawStroke } from './QuadraticCanvasStroker'
import {
	point,
	newPoint,
	EventHub,
	rectCheckCrashPoint,
	getPointsLimitValue,
	getLimit2Rect,
} from '../../utils'
// import Edit from './../../index'
import {
	properties,
	BaseShape,
	lineCheckCrash,
	createShapeProperties,
} from './Shape'
import RectShape, { RectShapeProperties } from './Rect'

export interface StrokeShapeProperties extends properties, pointListPath {
	readonly lineWidth: number // 笔宽度
	readonly color: string // 颜色
	readonly offset: number // 偏移
	readonly activeGroupName: number | string // 组
	readonly isDash?: boolean // 是不是虚线
	xs: number[]
	ys: number[]
	t: number[]
	p: number[]
	l: number[]
}

export default class StrokeShape extends BaseShape<StrokeShapeProperties> {
	// firstPoint!: point
	static key = 2
	name = '笔线'
	movePoint!: point
	rectBounding!: InstanceType<typeof RectShape>
	constructor(userOptions: StrokeShapeProperties) {
		const defaultOptions = {
			key: 2,
			xs: [],
			ys: [],
			t: [],
			p: [],
			l: [],
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			toJSON() {
				const data = { ...this }
				Reflect.deleteProperty(data, 't')
				Reflect.deleteProperty(data, 'l')
				Reflect.deleteProperty(data, 'path2d')
				return data
			},
		}
		const data = createShapeProperties<StrokeShapeProperties>(
			Object.assign(defaultOptions, userOptions),
			StrokeShape,
		)
		super(data)

		this.data = data
		this.rectBounding = new RectShape(
			createShapeProperties<RectShapeProperties>(
				{
					...defaultOptions,
					isAuxiliary: true,
					x: 0,
					y: 0,
					color: '#6965db',
					lineWidth: 1,
				},
				RectShape,
			),
		)

		// this.limitValue = this.getPointsLimitValue()
		// this.
	}
	draw(ctx: CanvasRenderingContext2D, ignoreCache = false) {
		drawStroke(ctx, this.data, ignoreCache)
		if (this.isEdit) {
			this.auxiliary(ctx)
		}
	}
	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 可以做一些特别判断`
		this.drawAttributeInit(ctx)
		if (this.isEdit) {
			// 记录 当前点
			this.movePoint = point
			this.draw(ctx)
			return
		}
	}
	addPoint(point: newPoint) {
		this.data.xs.push(point.x)
		this.data.ys.push(point.y)
		this.data.t.push(point.t)
		// 传过来的会有压感
		// logger.trace(point)
		if (point.p !== undefined) {
			this.data.p.push(point.p)
		} else {
			this.data.p.push(
				computePressure(
					point.x,
					point.y,
					this.data.xs,
					this.data.ys,
					this.data.l,
					this.data.xs.length - 1,
				),
			)
			this.data.l.push(
				computeLength(
					point.x,
					point.y,
					this.data.xs,
					this.data.ys,
					this.data.l,
					this.data.xs.length - 1,
				),
			)
		}
	}
	appendPoint(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 如果离得很近 判断
		if (this.isEdit) {
			const deviationX = point.x - this.movePoint.x
			const deviationY = point.y - this.movePoint.y
			this.movePoint = point
			this.computeOffsetPath(deviationX, deviationY)
			this.getSourceRect()
			this.data.path2d = null
			events.emit('clearCapturingCanvas')
			this.drawAttributeInit(ctx)
			this.draw(ctx, true)
			return
		}
		if (
			filterPointByAcquisitionDelta(
				point.x,
				point.y,
				this.data.xs,
				this.data.ys,
				this.data.lineWidth,
			)
		) {
			this.addPoint(point)
			if (this.available) {
				events.emit('clearCapturingCanvas')
				this.draw(ctx)
			}
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
		// this.addPoint(p)
		// 不用判断是否drawAttributeInit
		events.emit('clearCapturingCanvas')
		// this.draw(ctx, true)
		events.emit('appendCurrentPage', this)
		this.getSourceRect()
	}
	getSourceRect() {
		// const { width, height, x, y } = this.data
		this.limitValue = getPointsLimitValue(
			{ x: this.data.xs, y: this.data.ys },
			this.threshold,
		)
		const rect = getLimit2Rect(this.limitValue)
		this.data.width = rect.width
		this.data.height = rect.height
		this.rectBounding.setData(rect).getSourceRect()
	}
	auxiliary(ctx: CanvasRenderingContext2D) {
		this.rectBounding.drawAttributeInit(ctx)
		this.rectBounding.draw(ctx)
	}
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		if (this.isEdit) {
			if (rectCheckCrashPoint(this.limitValue, p)) {
				return true
			}
			// 没有选中
			this.setEditStatus(false)
			events.emit('appendCurrentPage', this)
		} else {
			// 开启选中， 误触非常厉害  所以把笔记的点击拖动关了
			// if (this.lineCheckCrash(p, this.data, (this.data.lineWidth + this.threshold))) {
			//     this.isEdit = true
			//     return true
			// }
		}

		return false
	}
	computeOffsetPath(deviationX: number, deviationY: number) {
		const { xs, ys } = this.data
		this.data.xs = xs.map((x) => x + deviationX)
		this.data.ys = ys.map((y) => y + deviationY)
	}
	clone() {
		// 可能会出现 还是原来那块地址
		const o = new StrokeShape(this.data)
		return o
	}

	computeCrash(p: point, lineDis: number) {
		return lineCheckCrash(p, this.data, lineDis)
	}
}

interface pointListPath extends properties {
	xs: number[]
	ys: number[]
	t: number[]
	p: number[]
	l: number[]
}

function computeDistance(
	x: number,
	y: number,
	xArray: number[],
	yArray: number[],
	lastIndexPoint: number,
): number {
	const distance = Math.sqrt(
		Math.pow(y - yArray[lastIndexPoint - 1], 2) +
			Math.pow(x - xArray[lastIndexPoint - 1], 2),
	)
	return isNaN(distance) ? 0 : distance
}

function computeLength(
	x: number,
	y: number,
	xArray: number[],
	yArray: number[],
	lArray: number[],
	lastIndexPoint: number,
) {
	const length =
		lArray[lastIndexPoint - 1] +
		computeDistance(x, y, xArray, yArray, lastIndexPoint)
	return isNaN(length) ? 0 : length
}

function computePressure(
	x: number,
	y: number,
	xArray: number[],
	yArray: number[],
	lArray: number[],
	lastIndexPoint: number,
) {
	let ratio = 1.0
	const distance = computeDistance(x, y, xArray, yArray, lastIndexPoint)
	const length = computeLength(x, y, xArray, yArray, lArray, lastIndexPoint)

	if (length === 0) {
		ratio = 0.5
	} else if (distance === length) {
		ratio = 1.0
	} else if (distance < 10) {
		ratio = 0.2 + Math.pow(0.1 * distance, 0.4)
	} else if (distance > length - 10) {
		ratio = 0.2 + Math.pow(0.1 * (length - distance), 0.4)
	}
	// 要控制 最小值
	const pressure = ratio * Math.max(0.1, 1.0 - 0.1 * Math.sqrt(distance))
	//  0.5 是开始那个圆的半径
	return isNaN(parseFloat(String(pressure)))
		? 0.5
		: pressure < 0.3
		? 0.3
		: pressure
}

function filterPointByAcquisitionDelta(
	x: number,
	y: number,
	xArray: number[],
	yArray: number[],
	width: number,
): boolean {
	const delta = 2 + width / 4
	let ret = false
	if (
		xArray.length < 3 ||
		Math.abs(xArray[xArray.length - 1] - x) >= delta ||
		Math.abs(yArray[yArray.length - 1] - y) >= delta
	) {
		ret = true
	}
	return ret
}

// 合并
// export const extend = <T extends object, U extends object>(
//     target: T,
//     source: U
// ): T & U => {
//     for (const key in source) {
//         if ({}.hasOwnProperty.call(source, key)) {
//             ;(target as any)[key] = source[key]
//         }
//     }
//     return target as T & U
// }

// between  在怎么之间
// https://xhfs4.ztytech.com/CA201003/1581f29048664c66a0598b9ddf1e3950.pdf
// https://xhfs1.ztytech.com/SB103007/842ca689d514451ab24deff368e76da0.pdf
