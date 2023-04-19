import {
	getRectLimitValue,
	rectCheckCrashPoint,
	point,
	newPoint,
	EventHub,
	getLimit2Rect,
	rectCheckCrash,
} from '../../utils'
// import Edit from './../../index'
import { properties, BaseShape, createShapeProperties } from './Shape'
import RectShape, { RectShapeProperties } from './Rect'

export interface TextProperties extends properties {
	text: string
	fontSize: number
	x: number
	y: number
	width: number
	height: number
	baseline: number
	opacity: number
	textAlign: string
	isAuxiliary: boolean
}
export default class TextShape extends BaseShape<TextProperties> {
	// firstPoint!: point
	static key = 9
	name = '文字'
	movePoint!: point
	rectBounding!: InstanceType<typeof RectShape>
	prevText = ''
	constructor(userOptions: TextProperties) {
		const defaultOptions = {
			key: 9,
			x: 0,
			y: 0,
			text: '',
			fontSize: 24,
			width: 0,
			height: 0,
			baseline: 0,
			opacity: 100,
			textAlign: 'left',
			isAuxiliary: false,
		}
		const data = createShapeProperties<TextProperties>(
			{ ...defaultOptions, ...userOptions, fillStyle: userOptions.fillStyle },
			TextShape,
		)
		super(data)

		this.data = data

		// 没有画的情况 怎么才能拿到宽高
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
						fill: false,
						radius: 0,
					},
					RectShape,
				),
			)
		}
	}
	draw(context: CanvasRenderingContext2D, ignoreCache = false) {
		const element = this.data
		renderText(element, context)
		this.getSourceRect()
	}

	initPending(
		ctx: CanvasRenderingContext2D,
		point: newPoint,
		events: EventHub,
		translatePosition?: { x: number; y: number },
	) {
		this.prevText = this.data.text
		// 可以做一些特别判断`
		// start
		if (this.isEdit) {
			// console.log('多改动屏幕绘制开始')
			// 记录 当前点
			this.movePoint = point
			this.drawAttributeInit(ctx)
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			this.auxiliary(ctx)
			return
		}
		this.data = { ...this.data, ...point }
		newTextElement(this.data, translatePosition, (element) => {
			// 不能依靠这个提交
			//  依靠就会出问题
			this.data = { ...this.data, ...element }
			this.endPendingPoint(ctx, point, events)
		})
		// this.drawAttributeInit(ctx)
		// this.draw(ctx)
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
			events.emit('clearCapturingCanvas')
			this.drawAttributeInit(ctx)
			this.data.path2d = null
			this.draw(ctx)
			this.auxiliary(ctx)
			return
		}
	}
	endPendingPoint(
		ctx: CanvasRenderingContext2D,
		p: newPoint,
		events: EventHub,
	) {
		if (this.isEdit) return
		// 每次绘画都会 回去包围框的
		events.emit('appendCurrentPage', this)
	}
	computeOffsetPath(deviationX: number, deviationY: number) {
		this.data.x += deviationX
		this.data.y += deviationY
	}
	clone() {
		// 可能会出现 还是原来那块地址
		const o = new TextShape(this.data)
		return o
	}

	getSourceRect() {
		const { width, height, x, y } = this.data
		this.limitValue = getRectLimitValue({ x, y }, width, height, this.threshold)
		if (!this.data.isAuxiliary) {
			const rect = getLimit2Rect(this.limitValue)
			this.rectBounding.setData({ ...rect, angle: this.data.angle })
			this.rectBounding.getSourceRect()
		}
	}
	auxiliary(ctx: CanvasRenderingContext2D) {
		this.rectBounding.drawAttributeInit(ctx)
		this.rectBounding.draw(ctx)
	}
	computeCrash(p: point, lineDis: number) {
		const radius = lineDis - this.threshold
		const { x, y } = p
		if (
			rectCheckCrash(this.limitValue, {
				maxX: x + radius,
				maxY: y + radius,
				minX: x - radius,
				minY: y - radius,
			})
		) {
			return true
		}
		return false
	}
	computeClick(p: point, events: InstanceType<typeof EventHub>): boolean {
		// 点和矩形碰撞
		if (rectCheckCrashPoint(this.limitValue, p)) {
			return true
		}
		// if (this.isEdit) {
		//     // 把老的加进去
		//     console.log('把老的加进去')
		//     this.isEdit = false
		//     events.emit('appendCurrentPage', this)
		// }
		return false
	}
	computeBounding() {}
}

/**
 *
 * canvas 双击事件
 * @private
 * @memberof Crop
 */
interface textElement {
	x: number
	y: number
	text: string
	fontSize: number
	width: number
	height: number
	baseline: number
	opacity: number
	fillStyle: string
	textAlign: string
}

const newTextElement = (
	element: textElement,
	translatePosition: { x: number; y: number } | undefined,
	onSubmit: (text: textElement) => void,
) => {
	let updatedElement = element
	const updateWysiwygStyle = (text = '') => {
		const metrics = measureText(text, getFontString(updatedElement))
		updatedElement = {
			...updatedElement,
			text,
			width: metrics.width,
			height: metrics.height,
			baseline: metrics.baseline,
			opacity: 100,
		}
		editable.value = updatedElement.text
		const lines = updatedElement.text.replace(/\r\n?/g, '\n').split('\n')
		const lineHeight = updatedElement.height / lines.length
		const left = translatePosition
			? updatedElement.x - translatePosition.x
			: updatedElement.x
		const top = translatePosition
			? updatedElement.y - translatePosition.y
			: updatedElement.y
		Object.assign(editable.style, {
			font: getFontString(updatedElement),
			// must be defined *after* font ¯\_(ツ)_/¯
			lineHeight: `${lineHeight}px`,
			width: `${updatedElement.width}px`,
			height: `${updatedElement.height}px`,
			left: `${left}px`,
			top: `${top}px`,
			textAlign: updatedElement.textAlign,
			color: updatedElement.fillStyle,
			opacity: updatedElement.opacity / 100,
			filter: 'none',
		})
	}
	const editable = document.createElement('textarea')
	editable.dir = 'auto'
	editable.tabIndex = 0
	// editable.dataset.type = 'wysiwyg'
	// prevent line wrapping on Safari
	editable.wrap = 'off'

	Object.assign(editable.style, {
		position: 'fixed',
		display: 'inline-block',
		minHeight: '1em',
		backfaceVisibility: 'hidden',
		margin: 0,
		padding: 0,
		border: 0,
		outline: 0,
		resize: 'none',
		background: 'transparent',
		overflow: 'hidden',
		// prevent line wrapping (`whitespace: nowrap` doesn't work on FF)
		whiteSpace: 'pre',
		// must be specified because in dark mode canvas creates a stacking context
		zIndex: '100000',
	})
	updateWysiwygStyle(element.text)
	editable.oninput = () => {
		updateWysiwygStyle(normalizeText(editable.value))
	}
	const normalizeText = (text: string) => {
		return (
			text
				// replace tabs with spaces so they render and measure correctly
				.replace(/\t/g, '        ')
				// normalize newlines
				.replace(/\r?\n|\r/g, '\n')
		)
	}
	const handleSubmit = () => {
		// onSubmit(normalizeText(editable.value))
		// console.log('handleSubmit', normalizeText(editable.value), isDestroyed)
		onSubmit(updatedElement)
		cleanup()
	}

	const cleanup = () => {
		if (isDestroyed) {
			return
		}
		isDestroyed = true
		// remove events to ensure they don't late-fire
		editable.onblur = null
		editable.oninput = null
		editable.onkeydown = null
		window.removeEventListener('wheel', stopEvent, true)
		window.removeEventListener('pointerdown', onPointerDown)
		window.removeEventListener('pointerup', rebindBlur)
		window.removeEventListener('blur', handleSubmit)
		editable.remove()
	}

	const stopEvent = (event: Event) => {
		event.preventDefault()
		event.stopPropagation()
	}
	const rebindBlur = () => {
		window.removeEventListener('pointerup', rebindBlur)
		// deferred to guard against focus traps on various UIs that steal focus
		// upon pointerUp
		setTimeout(() => {
			editable.onblur = handleSubmit
			// case: clicking on the same property → no change → no update → no focus
			editable.focus()
		})
	}

	// prevent blur when changing properties from the menu
	const onPointerDown = (event: MouseEvent) => {
		// console.log('点到别的地方了')
		editable.onblur = null
		window.addEventListener('pointerup', rebindBlur)
		// handle edge-case where pointerup doesn't fire e.g. due to user
		// alt-tabbing away
		window.addEventListener('blur', handleSubmit)
	}

	let isDestroyed = false

	editable.onblur = handleSubmit

	// window.addEventListener('pointerdown', onPointerDown)
	window.addEventListener('wheel', stopEvent, {
		passive: false,
		capture: true,
	})

	document.querySelector('.canvas-container')?.appendChild(editable)
	editable.focus()
	editable.select()
}

const renderText = (
	element: textElement,
	context: CanvasRenderingContext2D,
) => {
	const font = context.font
	context.font = getFontString(element)
	const fillStyle = context.fillStyle
	const textAlign = context.textAlign
	/* CanvasTextAlign */
	context.textAlign = element.textAlign as CanvasTextAlign

	// Canvas does not support multiline text by default
	const lines = element.text.replace(/\r\n?/g, '\n').split('\n')
	const lineHeight = element.height / lines.length
	const verticalOffset = element.height - element.baseline
	const horizontalOffset =
		element.textAlign === 'center'
			? element.width / 2
			: element.textAlign === 'right'
			? element.width
			: 0
	for (let index = 0; index < lines.length; index++) {
		context.fillText(
			lines[index],
			horizontalOffset + element.x,
			(index + 1) * lineHeight - verticalOffset + element.y,
		)
	}
	context.fillStyle = fillStyle
	context.font = font
	context.textAlign = textAlign
}
export type FontString = string & { _brand: 'fontString' }
export const getFontString = ({ fontSize }: { fontSize: number }) => {
	return `${fontSize}px hachure, Segoe UI Emoji` as FontString
}

export const measureText = (text: string, font: FontString) => {
	const line = document.createElement('div')
	const body = document.body
	line.style.position = 'absolute'
	line.style.whiteSpace = 'pre'
	line.style.font = font
	body.appendChild(line)
	line.innerText = text
		.split('\n')
		// replace empty lines with single space because leading/trailing empty
		// lines would be stripped from computation
		.map((x) => x || ' ')
		.join('\n')
	const width = line.offsetWidth
	const height = line.offsetHeight
	// Now creating 1px sized item that will be aligned to baseline
	// to calculate baseline shift
	const span = document.createElement('span')
	span.style.display = 'inline-block'
	span.style.overflow = 'hidden'
	span.style.width = '1px'
	span.style.height = '1px'
	line.appendChild(span)
	// Baseline is important for positioning text on canvas
	const baseline = span.offsetTop + span.offsetHeight
	document.body.removeChild(line)

	return { width, height, baseline }
}
