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
import {
	properties,
	BaseShape,
	createShapeProperties,
	PointerDownState,
	MaybeTransformHandleType,
	transformElements,
	dragElements,
	getResizeOffsetXY,
} from './Shape'
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
	strokeColor: string // color
	textAlign: string
	isAuxiliary: boolean
}
export default class TextShape extends BaseShape<TextProperties> {
	// firstPoint!: point
	static key = 21
	name = '文字'
	pointerDownState!: PointerDownState
	maybeTransformHandleType: MaybeTransformHandleType = false
	rectBounding!: InstanceType<typeof RectShape>
	prevText = ''
	constructor(userOptions: TextProperties) {
		const defaultOptions = {
			key: 21,
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
			Object.assign(defaultOptions, userOptions, {
				strokeColor: userOptions.color,
			}),
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
						color: '#6965db',
						lineWidth: 1,
					},
					RectShape,
				),
			)
			// this.rectBounding.threshold = 0
			this.threshold = 0
		}
	}
	draw(context: CanvasRenderingContext2D, ignoreCache = false) {
		const element = this.data

		renderText(element, context)
		this.getSourceRect()

		if (this.isEdit) {
			this.auxiliary(context)
		}
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

			this.drawAttributeInit(ctx)
			this.pointerDownState = this.initPointerDownState(point)
			events.emit('clearCapturingCanvas')
			this.draw(ctx)
			this.auxiliary(ctx)
			return
		}
		this.data = { ...this.data, ...point }

		newTextElement(
			this.data,
			translatePosition,
			({ height, width }) => {
				events.emit('clearCapturingCanvas')
				ctx.beginPath()
				const { x, y } = this.data
				ctx.rect(x, y, width, height)
				ctx.stroke()
			},
			(element) => {
				// 不能依靠这个提交
				//  依靠就会出问题
				this.data = { ...this.data, ...element }
				this.endPendingPoint(ctx, point, events)
			},
		)
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
			// 记录 当前点
			if (this.maybeTransformHandleType) {
				const _p = {
					x: point.x - this.pointerDownState.offset.x,
					y: point.y - this.pointerDownState.offset.y,
				}
				transformElements(
					this.pointerDownState,
					this,
					false,
					this.maybeTransformHandleType,
					false,
					_p,
				)
			} else {
				dragElements(this.pointerDownState, this, point)
			}
			this.getSourceRect()
		}
		events.emit('clearCapturingCanvas')
		this.draw(ctx)
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
	initPointerDownState(p = { x: 0, y: 0 }) {
		const { x, y, width, height, angle = 0 } = this.data

		// offset 定位 4个点的位置
		const p0 = this?.pointerDownState?.offset || { x: 0, y: 0 }

		// 拖动的位置  startPoint
		const limitValue = getRectLimitValue({ x, y }, width, height, 0)
		return { ...limitValue, startPoint: p, offset: p0, angle }
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
		this.rectBounding.roundRect(ctx)
		this.transformHandles = this.getTransformHandles(
			this.rectBounding.limitValue,
			0,
			{
				rotation: true,
				n: true,
				s: true,
				w: true,
				e: true,
			},
		)
		this.renderTransformHandles(ctx, this.transformHandles, 0)
	}
	computeCrash(p: point, lineDis: number) {
		console.log(this.limitValue)
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
	computeOffsetPath(deviationX: number, deviationY: number) {
		this.data.x += deviationX
		this.data.y += deviationY
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
	opacity: number
	strokeColor: string
	textAlign: string
}

const newTextElement = (
	element: textElement,
	translatePosition: { x: number; y: number } | undefined,
	onChange: (data: { height: number; width: number }) => void,
	onSubmit: (text: textElement) => void,
) => {
	let updatedElement = { ...element }
	const updateWysiwygStyle = (text = '') => {
		let metrics = measureText(text, getFontString(updatedElement))

		if (element.width !== 0) {
			// metrics.width = updatedElement.width

			const { height } = measureText(
				wrapText(text, getFontString(element), element.width),
				getFontString(updatedElement),
			)
			metrics = {
				height: Math.max(updatedElement.height, height),
				width: updatedElement.width,
			}
		}

		// 没有就用里边的
		// 1. 如果放得下- 就用外边的宽高
		// 2. 放不下 修改外边的

		updatedElement = {
			...updatedElement,
			text,
			width: metrics.width,
			height: metrics.height,
			// baseline:,
			opacity: 100,
		}
		editable.value = updatedElement.text
		// const lines = updatedElement.text.replace(/\r\n?/g, '\n').split('\n')
		const lineHeight = getApproxLineHeight(getFontString(updatedElement))
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
			color: updatedElement.strokeColor,
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
		border: `1px solid ${updatedElement.strokeColor}`,
		outline: 0,
		resize: 'none',
		background: 'transparent',
		overflow: 'hidden',
		// prevent line wrapping (`whitespace: nowrap` doesn't work on FF)
		whiteSpace: 'pre-wrap',
		// must be specified because in dark mode canvas creates a stacking context
		wordWrap: 'break-word',
		wordBreak: 'break-all',

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
	context.save()
	context.font = getFontString(element)
	context.fillStyle = element.strokeColor
	/* CanvasTextAlign */
	context.textAlign = element.textAlign as CanvasTextAlign

	// 根据节点的宽高 换行
	const text = wrapText(element.text, getFontString(element), element.width)
	// const getLines
	// Canvas does not support multiline text by default
	const lines = text.replace(/\r\n?/g, '\n').split('\n')

	const lineHeight = getApproxLineHeight(getFontString(element)) // element.height / lines.length

	const horizontalOffset =
		element.textAlign === 'center'
			? element.width / 2
			: element.textAlign === 'right'
			? element.width
			: 0
	context.textBaseline = 'bottom'
	for (let index = 0; index < lines.length; index++) {
		context.fillText(
			lines[index],
			horizontalOffset + element.x,
			(index + 1) * lineHeight + element.y,
		)
	}

	context.restore()
}
export type FontString = string & { _brand: 'fontString' }
export const getFontString = ({ fontSize }: { fontSize: number }) => {
	return `${fontSize}px hachure, Segoe UI Emoji` as FontString
}

// ------

const cacheApproxLineHeight: { [key: FontString]: number } = {}

let canvas: HTMLCanvasElement | undefined
export const charWidth = (() => {
	const cachedCharWidth: { [key: FontString]: Array<number> } = {}

	const calculate = (char: string, font: FontString) => {
		const ascii = char.charCodeAt(0)
		if (!cachedCharWidth[font]) {
			cachedCharWidth[font] = []
		}
		if (!cachedCharWidth[font][ascii]) {
			const width = getLineWidth(char, font)
			cachedCharWidth[font][ascii] = width
		}

		return cachedCharWidth[font][ascii]
	}
	const getCache = (font: FontString) => {
		return cachedCharWidth[font]
	}
	return {
		calculate,
		getCache,
	}
})()

export const getApproxLineHeight = (font: FontString) => {
	if (cacheApproxLineHeight[font]) {
		return cacheApproxLineHeight[font]
	}
	const fontSize = parseInt(font, 10)

	// Calculate line height relative to font size
	cacheApproxLineHeight[font] = fontSize * 1.2
	return cacheApproxLineHeight[font]
}

const getLineWidth = (text: string, font: FontString) => {
	if (!canvas) {
		canvas = document.createElement('canvas')
	}
	const canvas2dContext = canvas.getContext('2d')!
	canvas2dContext.font = font
	const width = canvas2dContext.measureText(text).width

	return width
}
export const getTextHeight = (text: string, font: FontString) => {
	const lines = text.replace(/\r\n?/g, '\n').split('\n')
	const lineHeight = getApproxLineHeight(font)
	return lineHeight * lines.length
}

export const getTextWidth = (text: string, font: FontString) => {
	const lines = text.replace(/\r\n?/g, '\n').split('\n')
	let width = 0
	lines.forEach((line) => {
		width = Math.max(width, getLineWidth(line, font))
	})
	return width
}
function measureText(text: string, font: FontString) {
	const _text = text
		.split('\n')
		// replace empty lines with single space because leading/trailing empty
		// lines would be stripped from computation
		.map((x) => x || ' ')
		.join('\n')

	const height = getTextHeight(_text, font)
	const width = getTextWidth(_text, font)

	return { width, height }
}
function wrapText(text: string, font: FontString, maxWidth: number) {
	const lines: Array<string> = []
	const originalLines = text.split('\n')
	const spaceWidth = getLineWidth(' ', font)

	let currentLine = ''
	let currentLineWidthTillNow = 0

	const push = (str: string) => {
		if (str.trim()) {
			lines.push(str)
		}
	}

	const resetParams = () => {
		currentLine = ''
		currentLineWidthTillNow = 0
	}
	originalLines.forEach((originalLine) => {
		const currentLineWidth = getTextWidth(originalLine, font)

		// Push the line if its <= maxWidth
		if (currentLineWidth <= maxWidth) {
			lines.push(originalLine)
			return // continue
		}
		const words = originalLine.split(' ')

		resetParams()

		let index = 0

		while (index < words.length) {
			const currentWordWidth = getLineWidth(words[index], font)

			// This will only happen when single word takes entire width
			if (currentWordWidth === maxWidth) {
				push(words[index])
				index++
			}

			// Start breaking longer words exceeding max width
			else if (currentWordWidth > maxWidth) {
				// push current line since the current word exceeds the max width
				// so will be appended in next line
				push(currentLine)

				resetParams()

				while (words[index].length > 0) {
					const currentChar = String.fromCodePoint(words[index].codePointAt(0)!)
					const width = charWidth.calculate(currentChar, font)
					currentLineWidthTillNow += width
					words[index] = words[index].slice(currentChar.length)

					if (currentLineWidthTillNow >= maxWidth) {
						push(currentLine)
						currentLine = currentChar
						currentLineWidthTillNow = width
					} else {
						currentLine += currentChar
					}
				}

				// push current line if appending space exceeds max width
				if (currentLineWidthTillNow + spaceWidth >= maxWidth) {
					push(currentLine)
					resetParams()
				} else {
					// space needs to be appended before next word
					// as currentLine contains chars which couldn't be appended
					// to previous line
					currentLine += ' '
					currentLineWidthTillNow += spaceWidth
				}
				index++
			} else {
				// Start appending words in a line till max width reached
				while (currentLineWidthTillNow < maxWidth && index < words.length) {
					const word = words[index]
					currentLineWidthTillNow = getLineWidth(currentLine + word, font)

					if (currentLineWidthTillNow > maxWidth) {
						push(currentLine)
						resetParams()

						break
					}
					index++
					currentLine += `${word} `

					// Push the word if appending space exceeds max width
					if (currentLineWidthTillNow + spaceWidth >= maxWidth) {
						const word = currentLine.slice(0, -1)
						push(word)
						resetParams()
						break
					}
				}
			}
		}
		if (currentLine.slice(-1) === ' ') {
			// only remove last trailing space which we have added when joining words
			currentLine = currentLine.slice(0, -1)
			push(currentLine)
		}
	})
	return lines.join('\n')
}