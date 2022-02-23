import {
	point,
	rectCheckCrashPoint,
	// getDistance,
	newPoint,
	EventHub,
	createImage,
	getLimit2Rect,
	getRectLimitValue,
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
	createShapeProperties,
} from './Shape'
import RectShape, { RectShapeProperties } from './Rect'
export interface ImageShapeProperties extends properties {
	imageOrUri: string | HTMLImageElement | HTMLCanvasElement
	x: number
	y: number
	width: number
	height: number
}
export function renderArc(
	context: Path2D | CanvasRenderingContext2D,
	center: point,
	radius: number,
): void {
	context.arc(center.x, center.y, radius, 0, Math.PI * 2, true)
}
export default class ImageShape extends BaseShape<ImageShapeProperties> {
	// firstPoint!: point
	static key = 8
	readonly name = '图片'
	pointerDownState!: PointerDownState
	rectBounding!: InstanceType<typeof RectShape>
	maybeTransformHandleType: MaybeTransformHandleType = false
	private image!: HTMLImageElement | HTMLCanvasElement
	constructor(userOptions: ImageShapeProperties) {
		super()

		this.data = createShapeProperties<ImageShapeProperties>({
			...userOptions,
			key: 8,
		})
		const { imageOrUri } = this.data
		const setInitData = (img: HTMLImageElement | HTMLCanvasElement) => {
			const { width, height } = img
			this.data.width = this.data.width || width
			this.data.height = this.data.height || height
			this.image = img
			this.data.imageOrUri = this.getSrc()
			this.rectBounding = new RectShape(
				createShapeProperties<RectShapeProperties>({
					key: 11,
					x: this.data.x,
					y: this.data.y,
					width: this.data.width,
					height: this.data.width,
					isAuxiliary: true,
					color: '#000',
					lineWidth: 1,
					radius: 4,
					isDash: true,
				}),
			)
			this.getSourceRect()
			this.pointerDownState = this.initPointerDownState()
		}
		if (typeof imageOrUri === 'string') {
			createImage(imageOrUri).then((e) => {
				setInitData(e)
			})
		} else {
			setInitData(imageOrUri)
		}
	}
	getSrc() {
		if (this.image) {
			if ('toDataURL' in this.image) {
				return this.image.toDataURL()
			} else {
				return this.image.src
			}
		} else {
			return ''
		}
	}

	initPointerDownState(p = { x: 0, y: 0 }) {
		const { x, y, width, height, angle = 0 } = this.data

		// offset 定位 4个点的位置
		const p0 = this?.pointerDownState?.offset || { x: 0, y: 0 }

		// 拖动的位置  startPoint
		const limitValue = getRectLimitValue({ x, y }, width, height, 0)
		return { ...limitValue, startPoint: p, offset: p0, angle }
	}

	getSourceRect() {
		const { width, height, x, y } = this.data
		this.limitValue = getRectLimitValue({ x, y }, width, height, this.threshold)
		const rect = getLimit2Rect(this.limitValue)
		this.rectBounding.setData(rect).getSourceRect()
	}
	auxiliary(ctx: CanvasRenderingContext2D) {
		this.rectBounding.drawAttributeInit(ctx)
		this.rectBounding.roundRect(ctx)
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
	draw(ctx: CanvasRenderingContext2D, ignoreCache = false) {
		// this.drawAttributeInit(ctx)
		// 取走一个点 能够拿到x，y
		// 所谓缓存都是用 canvas  再画一个放在 一个
		let img = this.image
		const { x, y, width, height } = this.data

		ctx.drawImage(img, x, y, width, height)

		if (this.isEdit) {
			this.auxiliary(ctx)
		}
	}
	initPending(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub) {
		// 可以做一些特别判断`
		// start
		if (this.isEdit) {
			this.pointerDownState = this.initPointerDownState(p)
		}
		this.draw(ctx)
	}
	appendPoint(ctx: CanvasRenderingContext2D, p: newPoint, e: EventHub) {
		// 如果离得很近 判断
		if (this.isEdit) {
			// 记录 当前点
			if (this.maybeTransformHandleType) {
				const _p = {
					x: p.x - this.pointerDownState.offset.x,
					y: p.y - this.pointerDownState.offset.y,
				}
				transformElements(
					this.pointerDownState,
					this,
					true,
					this.maybeTransformHandleType,
					false,
					_p,
				)
			} else {
				dragElements(this.pointerDownState, this, p)
			}
			this.getSourceRect()
			e.emit('clearCapturingCanvas')
		} else {
			e.emit('clearCapturingCanvas')
		}
		this.draw(ctx)
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
		this.data.x += deviationX
		this.data.y += deviationY
	}

	clone() {
		// 可能会出现 还是原来那块地址
		const o = new ImageShape({ ...this.data, imageOrUri: this.getSrc() })
		return o
	}
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		if (this.isEdit) {
			const maybeTransformHandleType = this.resizeTest(p, this.transformHandles)
			this.maybeTransformHandleType = maybeTransformHandleType
			if (maybeTransformHandleType) {
				this.pointerDownState.offset = getResizeOffsetXY(
					maybeTransformHandleType,
					this,
					p,
				)
				return true
			}
		}
		if (rectCheckCrashPoint(this.limitValue, p)) {
			return true
		}

		// 可以拆分出来一个方法 e2n
		// 点和矩形碰撞
		if (this.isEdit) {
			this.maybeTransformHandleType = false
		}
		return false
	}
	computeCrash(p: point, lineDis: number) {
		return false
	}
}
