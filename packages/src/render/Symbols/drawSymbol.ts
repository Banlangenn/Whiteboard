import { point, logger } from './../../utils'
import { renderArc } from './QuadraticCanvasStroker'

import {
	drawPolygonParams,
	drawLineArrowParams,
	drawCircularEraserParams,
	drawLineParams,
	drawEllipseParams,
	drawCircularParams,
	drawRectParams,
	drawNumberAxisParams,
} from './../SymbolCanvasRendener'

export function drawCurveLine() {
	// drawStroke(context, stroke, savePath)
}

// 矩形
export function drawRect(
	context: CanvasRenderingContext2D,
	params: drawRectParams,
) {
	// 可以选择刷新
	if (params?.path2d?.end) {
		context.stroke(params.path2d.path)
		return
	}
	const { points } = params
	// drawAttributeInit(context, color, width, isDash)
	const startPoint = points[0]
	// 求绝对值
	const w = Math.abs(startPoint.x - points[1].x)
	const h = Math.abs(startPoint.y - points[3].y)

	const strokePathCTX = new Path2D()
	strokePathCTX.rect(startPoint.x, startPoint.y, w, h)
	context.stroke(strokePathCTX)
	params.path2d = {
		path: strokePathCTX,
		end: true,
	}
}

export function drawRectv2(
	context: CanvasRenderingContext2D,
	params: drawRectParams,
) {
	if (params?.path2d?.end) {
		context.fill(params.path2d.path)
		return
	}
	const { points } = params
	const startPoint = points[0]
	// 这个地方都是整数
	const w = Math.abs(startPoint.x - points[1].x)
	const h = Math.abs(startPoint.y - points[3].y)
	context.save()
	try {
		// drawAttributeInit(context, color, width, isDash)
		context.beginPath()
		context.rect(startPoint.x, startPoint.y, w, h)
		context.stroke()
	} finally {
		context.restore()
	}
}

// 圆形  圆心圆形 一个

export function drawCircular(
	context: CanvasRenderingContext2D,
	params: drawCircularParams,
) {
	const { center, radius, isDrawC } = params
	context.save()
	try {
		// drawAttributeInit(context, color, width)
		context.beginPath()
		context.arc(center.x, center.y, radius, 0, Math.PI * 2, true)
		context.stroke()
		if (isDrawC) {
			context.beginPath()
			context.arc(center.x, center.y, 1, 0, Math.PI * 2, true)
			context.fill() // 画实心圆
			context.stroke()
		}
	} finally {
		context.restore()
	}
}

// 数轴
// function numberAxis() {

// }

// 三角形和梯形一个
export function drawPolygon(
	context: CanvasRenderingContext2D,
	polygonParams: drawPolygonParams,
) {
	const { points } = polygonParams
	if (points.length < 1) {
		return
	}
	context.save()
	const pointsReference = [...points]
	try {
		// drawAttributeInit(context, color, width)
		context.beginPath()
		// shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
		const firstPoint = pointsReference.shift() as point
		context.moveTo(firstPoint.x, firstPoint.y)
		pointsReference.forEach((element) => {
			context.lineTo(element.x, element.y)
		})
		context.lineTo(firstPoint.x, firstPoint.y)
		context.stroke()
	} finally {
		context.restore()
	}
}

// 椭圆
export function drawEllipse(
	context: CanvasRenderingContext2D,
	ellipseParams: drawEllipseParams,
) {
	// 椭圆
	// x表示x轴坐标，y表示y轴坐标，a表示长轴，b表示短轴
	const { center, minRadius, maxRadius } = ellipseParams
	const { x, y } = center
	const ox = 0.5 * maxRadius
	const oy = 0.6 * minRadius
	context.save()
	try {
		// drawAttributeInit(context, color, width)

		context.translate(x, y)
		context.beginPath()
		// 从椭圆纵轴下端开始逆时针方向绘制
		context.moveTo(0, minRadius)
		context.bezierCurveTo(ox, minRadius, maxRadius, oy, maxRadius, 0)
		context.bezierCurveTo(maxRadius, -oy, ox, -minRadius, 0, -minRadius)
		context.bezierCurveTo(-ox, -minRadius, -maxRadius, -oy, -maxRadius, 0)
		context.bezierCurveTo(-maxRadius, oy, -ox, minRadius, 0, minRadius)
		context.closePath()
		context.stroke()
	} finally {
		context.restore()
	}
}

// 橡皮
export function drawCircularEraser(
	context: CanvasRenderingContext2D,
	props: drawCircularEraserParams,
) {
	// 这个怎么弄呢
	// 取走一个点 能够拿到x，y
	const { center, radius } = props
	context.save()
	try {
		// drawAttributeInit(context, color, width)
		context.beginPath()
		renderArc(context, center, radius)
		context.fill()
	} finally {
		context.restore()
	}
}

/**
 context
* @param {point} begin
* @param {point} end
*/
function renderLine(
	context: CanvasRenderingContext2D,
	begin: point,
	end: point,
) {
	context.moveTo(begin.x, begin.y)
	context.lineTo(end.x, end.y)
}

/**
 *
 *
 * @param {CanvasRenderingContext2D} context
 * @param {[point, point]} points 开始 结束
 * @param {number} theta  三角斜边一直线夹角
 * @param {number} headlen headlen：三角斜边长度
 */
function renderLineArrow(
	context: CanvasRenderingContext2D,
	points: point[],
	theta: number,
	headlen: number,
) {
	const contextReference = context
	const [{ x: fromX, y: fromY }, { x: toX, y: toY }] = points

	// 计算各角度和对应的P2,P3坐标
	const angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI // 当前 直线的角度
	const angle1 = ((angle + theta) * Math.PI) / 180 // 上角度
	const angle2 = ((angle - theta) * Math.PI) / 180 // 下斜线角度
	const topX = headlen * Math.cos(angle1) // 上下点的 坐标
	const topY = headlen * Math.sin(angle1)
	const botX = headlen * Math.cos(angle2)
	const botY = headlen * Math.sin(angle2)
	// 画直线
	contextReference.moveTo(fromX, fromY)
	contextReference.lineTo(toX, toY)
	renderLine(contextReference, { x: fromX, y: fromY }, { x: toX, y: toY })
	// 箭头线终点坐标
	const arrowX = toX + topX
	const arrowY = toY + topY
	// 画上边箭头线
	renderLine(contextReference, { x: arrowX, y: arrowY }, { x: toX, y: toY })

	const arrowX1 = toX + botX
	const arrowY1 = toY + botY
	// 画下边箭头线
	contextReference.lineTo(arrowX1, arrowY1)
}

/**
 * 画线段
 *
 * @param {CanvasRenderingContext2D} context
 * @param {point} begin
 * @param {point} end
 */

export function drawLine(
	context: CanvasRenderingContext2D,
	linePrams: drawLineParams,
) {
	const { points } = linePrams
	const [begin, end] = points
	context.save()
	try {
		// drawAttributeInit(context, color, width)
		context.beginPath()
		renderLine(context, begin, end)
		context.stroke()
	} finally {
		context.restore()
	}
}

//   箭头
// ctx：Canvas绘图环境

// Horizontal line
/**
 * 线箭头
 *
 * @param {CanvasRenderingContext2D} context
 * @param {drawLineArrowParams} lineArowParams
 */
export function drawLineArrow(
	context: CanvasRenderingContext2D,
	lineArrowParams: drawLineArrowParams,
) {
	const { points, theta = 20, headlen = 15 } = lineArrowParams
	const contextReference = context
	contextReference.save()
	try {
		// drawAttributeInit(context, color, width)
		contextReference.beginPath()
		renderLineArrow(context, points, theta, headlen)
		contextReference.fill()
		contextReference.stroke()
	} finally {
		contextReference.restore()
	}
}

// 数轴

// points  右边  左边
export function drawHorizontalNumberAxis(
	context: CanvasRenderingContext2D,
	numberAxisParams: drawNumberAxisParams,
) {
	const {
		points,
		theta = 25,
		headlen = 15,
		center,
		interval = 49,
		bulge = 8,
		centerRadius = 3,
	} = numberAxisParams
	const contextReference = context
	let end
	let begin
	if (points.length === 4) {
		end = points[1]
		begin = points[3]
	} else {
		;[end, begin] = points
	}

	const offsetLeft = center.x - begin.x
	const offsetRight = end.x - center.x

	const leftNumber = Math.abs(Math.floor(offsetLeft / interval) + 1)
	const rightNumber = Math.abs(Math.floor(offsetRight / interval) + 1)
	contextReference.save()
	try {
		// drawAttributeInit(contextReference, color, width)
		contextReference.beginPath()
		// ---------------
		renderLineArrow(contextReference, [begin, end], theta, headlen)
		// renderArc(contextReference, center, 3)
		// for
		for (let index = 1; index < leftNumber; index++) {
			const startBulge = center.x - interval * index
			const begin = { x: startBulge, y: center.y }
			const end = { x: startBulge, y: center.y - bulge }
			renderLine(contextReference, begin, end)
		}
		// x  y  负整数 方向轴
		for (let index = 1; index < rightNumber; index++) {
			const startBulge = center.x + interval * index
			const begin = { x: startBulge, y: center.y }
			const end = { x: startBulge, y: center.y - bulge }
			renderLine(contextReference, begin, end)
		}
		// 坐标
		contextReference.stroke()
		contextReference.fill()
		contextReference.beginPath()
		renderArc(contextReference, center, centerRadius)
		contextReference.fill()
	} finally {
		contextReference.restore()
	}
}

//  坐标轴
// points  上 右 下 左边
function drawVerticalNumberAxis(
	context: CanvasRenderingContext2D,
	numberAxisParams: drawNumberAxisParams,
) {
	const {
		points,
		theta = 25,
		headlen = 15,
		center,
		interval = 49,
		bulge = 8,
	} = numberAxisParams

	const contextReference = context

	if (points.length !== 4) {
		logger.debug('坐标轴 需要4个点', points)
		return
	}
	const begin = points[2]
	const end = points[0]

	const offsetBottom = center.y - begin.y
	const offsetTop = end.y - center.y

	const bottomNumber = Math.abs(Math.floor(offsetBottom / interval) + 1)
	const topNumber = Math.abs(Math.floor(offsetTop / interval) + 1)
	contextReference.save()
	try {
		// drawAttributeInit(contextReference, color, width)
		contextReference.beginPath()
		// ---------------
		// x  y  负整数 方向轴
		renderLineArrow(contextReference, [begin, end], theta, headlen)
		for (let index = 1; index < bottomNumber; index++) {
			const startBulge = center.y + interval * index
			const begin = { x: center.x, y: startBulge }
			const end = { x: center.x + bulge, y: startBulge }
			renderLine(contextReference, begin, end)
		}
		// x  y  正整数 方向轴
		for (let index = 1; index < topNumber; index++) {
			const startBulge = center.y - interval * index
			const begin = { x: center.x, y: startBulge }
			const end = { x: center.x + bulge, y: startBulge }
			renderLine(contextReference, begin, end)
		}
		// 坐标
		contextReference.stroke()
		contextReference.fill()
		// contextReference.beginPath()
		// renderArc(contextReference, center, centerRadius)
		// contextReference.fill()
	} finally {
		contextReference.restore()
	}
}

// vertical 垂直
// horizontal  水平

export function drawCoordinateAxis(
	context: CanvasRenderingContext2D,
	numberAxisParams: drawNumberAxisParams,
) {
	const contextReference = context
	drawHorizontalNumberAxis(contextReference, numberAxisParams)
	drawVerticalNumberAxis(contextReference, numberAxisParams)
}
