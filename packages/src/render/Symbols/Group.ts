import {
	getLimit2Rect,
	rectCheckCrashPoint,
	point,
	newPoint,
	EventHub,
} from '../../utils'
// import Edit from './../../index'
import {
	properties,
	BaseShape,
	GraphicsIns,
	createShapeProperties,
} from './Shape'
import RectShape, { RectShapeProperties } from './Rect'
export interface GroupProperties extends properties {
	g: GraphicsIns[]
}

export default class GroupShape extends BaseShape<GroupProperties> {
	// firstPoint!: point
	static key = 10
	name = '组'
	movePoint!: point
	rectBounding!: InstanceType<typeof RectShape>
	constructor(userOptions: GroupProperties) {
		const defaultOptions = {
			key: 10,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			lineWidth: 0,
		}
		const data = createShapeProperties<GroupProperties>(
			{...defaultOptions, ...userOptions},
			GroupShape,
		)
		super(data)

		this.data = data

		this.rectBounding = new RectShape(
			createShapeProperties<RectShapeProperties>(
				{
					...defaultOptions,
					isAuxiliary: true,
					strokeStyle: '#f60',
	
					lineWidth: 1,
					radius: 8,
					isDash: true,
					fill: false,
				},
				RectShape,
			),
		)
	}

	getContent() {
		const g = this.data.g.splice(0, this.data.g.length)
		return g
	}
	setContent(g: GraphicsIns[]) {
		this.data.g.push(...g)
		// console.log('setContent修改isEdit为true')
		this.getSourceRect()

		this.setEditStatus(true)
		return this
	}
	draw(ctx: CanvasRenderingContext2D, ignoreCache = true) {
		// console.log('画', this.data.g, this.isEdit)

		for (const item of this.data.g) {
			item.drawAttributeInit(ctx)
			item.data.path2d = null
			item.draw(ctx, ignoreCache)
		}
		// hack 文字
		if (this.rectBounding.data.width === 0) {
			this.getSourceRect()
		}
		if (this.isEdit) {
			// 如果宽高为0 就重置一下
			this.auxiliary(ctx)
		}
	}
	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 可以做一些特别判断`
		// start
		if (this.isEdit) {
			// 记录 当前点
			this.movePoint = point
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
			const deviationX = point.x - this.movePoint.x
			const deviationY = point.y - this.movePoint.y
			this.movePoint = point
			this.computeOffsetPath(deviationX, deviationY)
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			// console.log(this.rectBounding, 'rectBounding draw')
			return
		}
	}
	endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: EventHub,
	) {
		if (this.isEdit) return
		// events.emit('appendCurrentPage', this)
		this.getSourceRect()
	}
	computeOffsetPath(deviationX: number, deviationY: number) {
		for (const item of this.data.g) {
			item.computeOffsetPath(deviationX, deviationY)
		}
		this.rectBounding.computeOffsetPath(deviationX, deviationY)
		this.rectBounding.getSourceRect()
	}

	clone() {
		// 可能会出现 还是原来那块地址

		const o = new GroupShape({ ...this.data, g: [...this.data.g] })
		return o
	}

	getSourceRect() {
		if (!this.data.g.length) return
		// const { width, height, x, y } = this.data
		const Xs = []
		const Ys = []

		for (const item of this.data.g) {
			// 把正确的 limitValue 的算出来
			item.getSourceRect()
			Xs.push(item.limitValue.minX)
			Xs.push(item.limitValue.maxX)
			Ys.push(item.limitValue.minY)
			Ys.push(item.limitValue.maxY)
		}
		// console.log(this.data.g)
		this.limitValue = {
			minX: Math.min(...Xs),
			maxX: Math.max(...Xs),
			minY: Math.min(...Ys),
			maxY: Math.max(...Ys),
		}
		const rect = getLimit2Rect(this.limitValue)
		this.data = { ...this.data, ...rect }
		this.rectBounding.setData(rect).getSourceRect()
	}
	auxiliary(ctx: CanvasRenderingContext2D) {
		this.rectBounding.drawAttributeInit(ctx)
		this.rectBounding.draw(ctx)
	}
	computeCrash(p: point, lineDis: number) {
		return false
	}
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		// 点和矩形碰撞
		if (this.isEdit && rectCheckCrashPoint(this.rectBounding.limitValue, p)) {
			console.log('编辑被选中的')
			return true
		} else {
			for (const item of this.data.g) {
				const bool = item.computeClick(p, events)
				if (bool) {
					console.log('不是编辑你选中的')
					return true
				}
			}
		}

		if (this.isEdit) {
			this.setEditStatus(false)
			events.emit('appendCurrentPage', this)
		}
		return false
	}
	computeBounding() {}
}

export class InnerGroupShape extends GroupShape {
	static key = 100
	static cache = true
	name = '内部组'
	constructor(p: GroupProperties) {
		const defaultOptions = {
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			g: [],
		}
		const data = createShapeProperties<GroupProperties>(
			Object.assign(defaultOptions, p),
			InnerGroupShape,
		)
		super(data)

		this.data = data
	}
	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// 可以做一些特别判断`
		// start
		// console.log('initPending', '我应该走呀', this.isEdit)
		if (this.isEdit) {
			// 记录 当前点
			this.movePoint = point
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			return
		}
		// 宽高都为0
		this.rectBounding.limitValue = this.initLimitValue()
		this.rectBounding.initPending(ctx, point, events)
	}
	appendPoint(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
	) {
		// console.log('appendPointappendPointappendPoint', this.isEdit)
		// 如果离得很近 判断
		if (this.isEdit) {
			const deviationX = point.x - this.movePoint.x
			const deviationY = point.y - this.movePoint.y
			this.movePoint = point
			this.computeOffsetPath(deviationX, deviationY)
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			return
		}
		// console.log('appendPoint', 'appendPoint')
		this.rectBounding.appendPoint(ctx, point, events)
	}
	endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: EventHub,
	) {
		const { maxX, minX, maxY, minY } = this.rectBounding.limitValue
		if (maxX === minX || maxY === minY) {
			events.emit('clearCapturingCanvas')
			return
		}
		if (this.isEdit) {
			this.getSourceRect()
			return
		}
		events.emit('clearCapturingCanvas')
		// 把编辑模式的清掉
		events.emit('selectGraphics', this.rectBounding.limitValue)
		// this.getSourceRect()
		// this.rect.appendPoint(ctx, point, events)
	}
	// isEdit 为啥在外边true  在里边false
	// 在外： 组会掉 自己g的computeClick  点中是不希望改为 true的
	// 在内  appendCurrentPage 会触发页面刷新 必须要先设置false 再画
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		// 点和矩形碰撞
		if (this.isEdit && rectCheckCrashPoint(this.rectBounding.limitValue, p)) {
			// console.log('编辑被选中的')
			return true
		}
		for (const item of this.data.g) {
			const bool = item.computeClick(p, events)
			if (bool) {
				// console.log(item, '不是编辑你选中的')
				// this.isEdit = true
				return true
			}
		}

		if (this.isEdit) {
			// console.log('===把编辑改为 false')
			this.setEditStatus(false)
			const g = this.getContent()

			events.emit('appendCurrentPage', g)
		}
		// events.emit('appendCurrentPage', this)
		return false
	}
}
