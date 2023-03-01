import {
	// pointListPathItem,
	StrokeShapeProperties,
} from './../Symbols/Stroke'
import { getPointByIndex } from './../Symbols/Shape'

/**
 * Stroker info
 * @typedef {Object} StrokerInfo
 * @property {String} type Renderer type.
 * @property {String} name Stroker name.
 * @property {String} apiVersion Supported api version.
 */

/**
 * Define how a stroke should be drawn
 * @typedef {Object} Stroker
 * @property {function(): StrokerInfo} getInfo Get some information about this stroker
 * @property {function(context: Object, stroke: Stroke)} drawStroke Render a stroke on the current context.
 */

import {
	// logger,
	point,
} from './../../utils'

export interface strokePoint extends point {
	p: number
}

/**
 *  一个点 分成两个点
 *
 * @export
 * @param {strokePoint} point
 * @param {number} angle
 * @param {number} width
 * @returns {point[]}
 */
function computeLinksPoints(
	point: strokePoint,
	angle: number,
	width: number,
): point[] {
	const radius = point.p * width
	return [
		{
			x: point.x - Math.sin(angle) * radius,
			y: point.y + Math.cos(angle) * radius,
		},
		{
			x: point.x + Math.sin(angle) * radius,
			y: point.y - Math.cos(angle) * radius,
		},
	]
}

/**
 *  计算【中间点】的 坐标和 压感
 *
 * @export
 * @param {strokePoint} point1
 * @param {strokePoint} point2
 * @returns {strokePoint}
 */
function computeMiddlePoint(
	point1: strokePoint,
	point2: strokePoint,
): strokePoint {
	return {
		x: (point2.x + point1.x) / 2,
		y: (point2.y + point1.y) / 2,
		p: (point2.p + point1.p) / 2,
	}
}

/**
 * 获取两条线 的 角度
 *
 * @export
 * @param {point} begin
 * @param {point} end
 * @returns {number}
 */
function computeAxeAngle(begin: point, end: point): number {
	return Math.atan2(end.y - begin.y, end.x - begin.x)
}

export function renderArc(
	context: Path2D | CanvasRenderingContext2D,
	center: point,
	radius: number,
): void {
	context.arc(center.x, center.y, radius, 0, Math.PI * 2, true)
}

function renderLine(
	context: Path2D | CanvasRenderingContext2D,
	begin: strokePoint,
	end: strokePoint,
	width: number,
) {
	// computeAxeAngle
	const linkPoints1 = computeLinksPoints(
		begin,
		computeAxeAngle(begin, end),
		width,
	)
	const linkPoints2 = computeLinksPoints(
		end,
		computeAxeAngle(begin, end),
		width,
	)

	context.moveTo(linkPoints1[0].x, linkPoints1[0].y)
	context.lineTo(linkPoints2[0].x, linkPoints2[0].y)
	context.lineTo(linkPoints2[1].x, linkPoints2[1].y)
	context.lineTo(linkPoints1[1].x, linkPoints1[1].y)
}

function renderFinal(
	context: Path2D | CanvasRenderingContext2D,
	begin: strokePoint,
	end: strokePoint,
	width: number,
) {
	const ARCSPLIT = 6
	const angle = computeAxeAngle(begin, end)
	const linkPoints = computeLinksPoints(end, angle, width)
	context.moveTo(linkPoints[0].x, linkPoints[0].y)
	for (let i = 1; i <= ARCSPLIT; i++) {
		const newAngle = angle - (i * Math.PI) / ARCSPLIT
		context.lineTo(
			end.x - end.p * width * Math.sin(newAngle),
			end.y + end.p * width * Math.cos(newAngle),
		)
	}
}

function renderQuadratic(
	context: Path2D | CanvasRenderingContext2D,
	begin: strokePoint,
	end: strokePoint,
	ctrl: strokePoint,
	width: number,
) {
	// 开始点
	const linkPoints1 = computeLinksPoints(
		begin,
		computeAxeAngle(begin, ctrl),
		width,
	)
	// 结束点
	const linkPoints2 = computeLinksPoints(end, computeAxeAngle(ctrl, end), width)

	// 控制点
	const linkPoints3 = computeLinksPoints(
		ctrl,
		computeAxeAngle(begin, end),
		width,
	)

	context.moveTo(linkPoints1[0].x, linkPoints1[0].y)
	// context.lineTo(linkPoints2[0].x, linkPoints2[0].y)
	context.quadraticCurveTo(
		linkPoints3[0].x,
		linkPoints3[0].y,
		linkPoints2[0].x,
		linkPoints2[0].y,
	)
	// new Path2D().quadraticCurveTo()
	//  控制点  结束点
	context.lineTo(linkPoints2[1].x, linkPoints2[1].y)
	// context.lineTo(linkPoints1[1].x, linkPoints1[1].y)
	context.quadraticCurveTo(
		linkPoints3[1].x,
		linkPoints3[1].y,
		linkPoints1[1].x,
		linkPoints1[1].y,
	)
}
//  解决一共就两个 点 出现问题
export function drawStroke(
	context: CanvasRenderingContext2D,
	stroke: StrokeShapeProperties,
	savePath: boolean,
) {
	// 只有render canvas 才需要 strokePath配置
	let strokeReference = stroke
	// const is
	if (strokeReference?.path2d?.end) {
		context.fill(strokeReference.path2d.path)
		return
	}
	const { lineWidth: width } = stroke

	// 这玩意直会跑 2次 如果改了getPointByIndex  每次都会跑一边
	if (strokeReference.xs.length < 3) {
		// if (strokeReference.xs.length < 2) {
		strokeReference = {
			...strokeReference,
			xs: [...strokeReference.xs],
			ys: [...strokeReference.ys],
			t: [...strokeReference.t],
			p: [...strokeReference.p],
		}
		// }
		const lastPoint = getPointByIndex(strokeReference, stroke.xs.length - 1)
		while (strokeReference.xs.length < 3) {
			strokeReference.xs.push(lastPoint.x)
			strokeReference.ys.push(lastPoint.y)
			strokeReference.t.push(lastPoint.t)
			strokeReference.p.push(1)
		}
	}
	const length = strokeReference.xs.length
	const firstPoint = getPointByIndex(strokeReference, 0)
	const nbquadratics = length - 2
	context.save()
	try {
		// 两个 path  一个负责 绘制-- 一个负责存起来
		const path2d = strokeReference?.path2d
		const beforePath = path2d ? new Path2D(path2d.path) : new Path2D()
		context.beginPath()
		if (nbquadratics <= 1 || !path2d) {
			renderArc(beforePath, firstPoint, width * firstPoint.p)
			renderLine(
				beforePath,
				firstPoint,
				computeMiddlePoint(firstPoint, getPointByIndex(strokeReference, 1)),
				width,
			)
		}
		const startindex = !path2d ? 0 : nbquadratics - 1
		for (let i = startindex; i < nbquadratics; i++) {
			// context, begin, end, ctrl, width
			renderQuadratic(
				beforePath,
				computeMiddlePoint(
					getPointByIndex(strokeReference, i),
					getPointByIndex(strokeReference, i + 1),
				),
				computeMiddlePoint(
					getPointByIndex(strokeReference, i + 1),
					getPointByIndex(strokeReference, i + 2),
				),
				getPointByIndex(strokeReference, i + 1),
				width,
			)
		}
		const strokePathCTX = new Path2D(beforePath)
		// nbquadraticsz
		// 这一段要不要执行
		// 每次执行 一下 + 1
		// logger.warn('nbquadratics:', nbquadratics, 'strokeReference:', strokeReference.xs.length)

		renderLine(
			strokePathCTX,
			computeMiddlePoint(
				getPointByIndex(strokeReference, length - 2),
				getPointByIndex(strokeReference, length - 1),
			),
			getPointByIndex(strokeReference, length - 1),
			width,
		)

		// 结束
		renderFinal(
			strokePathCTX,
			getPointByIndex(strokeReference, length - 2),
			getPointByIndex(strokeReference, length - 1),
			width,
		)
		strokePathCTX.closePath()

		// color !== undefined && context.fillStyle !== color
		context.fill(strokePathCTX)
		strokeReference.path2d = {
			path: savePath ? strokePathCTX : beforePath,
			end: savePath,
		}
	} finally {
		context.restore()
	}
}
/**
 * Draw a stroke on a canvas, using quadratics
 * @param {Object} context Current rendering context
 * @param {Stroke} stroke Current stroke to be drawn
 */
export function drawStrokev5(
	context: CanvasRenderingContext2D,
	stroke: StrokeShapeProperties,
	savePath: boolean,
) {
	// 只有render canvas 才需要 strokePath配置
	let strokeReference = stroke
	// const is
	if (strokeReference?.path2d?.end) {
		context.fill(strokeReference.path2d.path)
		return
	}
	const { lineWidth: width } = stroke

	// 这玩意直会跑 2次 如果改了getPointByIndex  每次都会跑一边
	if (strokeReference.xs.length < 3) {
		// if (strokeReference.xs.length < 2) {
		strokeReference = {
			...strokeReference,
			xs: [...strokeReference.xs],
			ys: [...strokeReference.ys],
			t: [...strokeReference.t],
			p: [...strokeReference.p],
		}
		// }
		const lastPoint = getPointByIndex(strokeReference, stroke.xs.length - 1)
		while (strokeReference.xs.length < 3) {
			strokeReference.xs.push(lastPoint.x)
			strokeReference.ys.push(lastPoint.y)
			strokeReference.t.push(lastPoint.t)
			strokeReference.p.push(1)
		}
	}
	const length = strokeReference.xs.length
	const firstPoint = getPointByIndex(strokeReference, 0)
	const nbquadratics = length - 2
	context.save()
	try {
		// 两个 path  一个负责 绘制-- 一个负责存起来
		const path2d = strokeReference?.path2d
		const beforePath = path2d?.path ? new Path2D(path2d.path) : new Path2D()
		context.beginPath()
		if (nbquadratics <= 1 || !path2d) {
			renderArc(beforePath, firstPoint, width * firstPoint.p)
			renderLine(
				beforePath,
				firstPoint,
				computeMiddlePoint(firstPoint, getPointByIndex(strokeReference, 1)),
				width,
			)
		}
		const startindex = !path2d ? 0 : nbquadratics - 1
		for (let i = startindex; i < nbquadratics; i++) {
			// context, begin, end, ctrl, width
			renderQuadratic(
				beforePath,
				computeMiddlePoint(
					getPointByIndex(strokeReference, i),
					getPointByIndex(strokeReference, i + 1),
				),
				computeMiddlePoint(
					getPointByIndex(strokeReference, i + 1),
					getPointByIndex(strokeReference, i + 2),
				),
				getPointByIndex(strokeReference, i + 1),
				width,
			)
		}
		const strokePathCTX = new Path2D(beforePath)
		// nbquadraticsz
		// 这一段要不要执行
		// 每次执行 一下 + 1
		// logger.warn('nbquadratics:', nbquadratics, 'strokeReference:', strokeReference.xs.length)

		renderLine(
			strokePathCTX,
			computeMiddlePoint(
				getPointByIndex(strokeReference, length - 2),
				getPointByIndex(strokeReference, length - 1),
			),
			getPointByIndex(strokeReference, length - 1),
			width,
		)

		// 结束
		renderFinal(
			strokePathCTX,
			getPointByIndex(strokeReference, length - 2),
			getPointByIndex(strokeReference, length - 1),
			width,
		)
		strokePathCTX.closePath()

		// color !== undefined && context.fillStyle !== color
		context.fill(strokePathCTX)

		strokeReference.path2d = {
			path: savePath ? strokePathCTX : beforePath,
			end: savePath,
		}
	} finally {
		context.restore()
	}
}

// // 兼容 canvas
// export function drawStrokeV2(context: CanvasRenderingContext2D, stroke: pointListPath, savePath: boolean) {

//     // 只有render canvas 才需要 strokePath配置
//     let strokeReference = stroke
//     // const is
//     if (strokeReference?.path2d?.end) {
//         drawPath(context, strokeReference.color, strokeReference.path2d.path)
//         return
//     }
//     let strokePathCTX: Path2D | CanvasRenderingContext2D = Path2D ? new Path2D() : context

//     // 如果支持Path2D 可以只画新的
//     // 但是需要实现  中途 半截逻辑 比较麻烦
//     //  可以优化成 a b 提出来一点方法

//     // if (strokeReference.path2d) {
//     //     strokePath.

//     // }

//     // 这玩意直会跑 2次 如果改了getPointByIndex  每次都会跑一边
//     if (strokeReference.x.length < 3) {
//         // if (strokeReference.x.length < 2) {
//         strokeReference = { ...strokeReference,
//             x: [...strokeReference.x],
//             y: [...strokeReference.y],
//             t: [...strokeReference.t],
//             p: [...strokeReference.p]
//         }
//         // }
//         const lastPoint = getPointByIndex(strokeReference, stroke.x.length - 1)
//         while (strokeReference.x.length < 3) {
//             strokeReference.x.push(lastPoint.x)
//             strokeReference.y.push(lastPoint.y)
//             strokeReference.t.push(lastPoint.t)
//             strokeReference.p.push(1)
//         }
//     }
//     const contextReference = context
//     const length = strokeReference.x.length
//     const width = strokeReference.width > 0 ? strokeReference.width : contextReference.lineWidth
//     const color = strokeReference.color ? strokeReference.color : contextReference.strokeStyle
//     const firstPoint = getPointByIndex(strokeReference, 0)
//     const nbquadratics = length - 2
//     // function _renderLine(context: CanvasRenderingContext2D, begin: point, end: point) {
//     //     context.moveTo(begin.x, begin.y)
//     //     context.lineTo(end.x, end.y)
//     // }
//     context.save()
//     try {
//         context.beginPath()
//         renderArc(strokePathCTX, firstPoint, width * firstPoint.p)
//         renderLine(strokePathCTX, firstPoint, computeMiddlePoint(firstPoint, getPointByIndex(strokeReference, 1)), width)
//         for (let i = 0; i < nbquadratics; i++) {
//             // context, begin, end, ctrl, width
//             renderQuadratic(
//                 strokePathCTX,
//                 computeMiddlePoint(
//                     getPointByIndex(strokeReference, i),
//                     getPointByIndex(strokeReference, i + 1)
//                 ),
//                 computeMiddlePoint(
//                     getPointByIndex(strokeReference, i + 1),
//                     getPointByIndex(strokeReference, i + 2)
//                 ),
//                 getPointByIndex(strokeReference, i + 1),
//                 width
//             )
//         }

//         renderLine(strokePathCTX, computeMiddlePoint(getPointByIndex(strokeReference, length - 2),
//             getPointByIndex(strokeReference, length - 1)), getPointByIndex(strokeReference, length - 1), width)

//         // 结束
//         renderFinal(strokePathCTX, getPointByIndex(strokeReference, length - 2),
//             getPointByIndex(strokeReference, length - 1), width)
//         strokePathCTX.closePath()

//         // color !== undefined && context.fillStyle !== color
//         if (context.fillStyle !== color) {
//             context.fillStyle = color
//         }
//         if (strokePathCTX instanceof Path2D) {
//             // strokeReference.path = strokePath
//             strokeReference.path2d = {
//                 path: strokePathCTX,
//                 end: savePath
//             }
//             // strokePath.fill()
//             // context.stroke(strokePathCTX as Path2D)
//             context.fill(strokePathCTX as Path2D)
//         } else {
//             context.fill()
//         }
//     } finally {
//         context.restore()
//     }
// }
// /**
//  * Draw a stroke on a canvas, using quadratics
//  * @param {Object} context Current rendering context
//  * @param {Stroke} stroke Current stroke to be drawn
//  */

// //  解决一共就两个 点 出现问题
// export function drawStroke(context: CanvasRenderingContext2D, stroke: StrokeShapeProperties, ignoreCache = false) {

//     const contextReference = context
//     const length = stroke.x.length
//     const width = stroke.lineWidth > 0 ? stroke.lineWidth : contextReference.lineWidth
//     const color = stroke.color ? stroke.color : contextReference.strokeStyle
//     const firstPoint = getPointByIndex(stroke, 0)
//     const nbquadratics = length - 2
//     // function _renderLine(context: CanvasRenderingContext2D, begin: point, end: point) {
//     //     context.moveTo(begin.x, begin.y)
//     //     context.lineTo(end.x, end.y)
//     // }

//     contextReference.save()
//     try {
//         contextReference.beginPath()
//         // if (length < 3) {
//         //     renderArc(contextReference, firstPoint, width * 0.6)
//         // } else {
//         //     renderArc(contextReference, firstPoint, width * firstPoint.p)
//         //     renderLine(contextReference, firstPoint, computeMiddlePoint(firstPoint, getPointByIndex(stroke, 1)), width)
//         // 一级
//         if (length === 1) {
//             renderArc(contextReference, firstPoint, width * 0.5)
//         } else if (length === 2) {
//             renderArc(contextReference, firstPoint, width * 0.5)
//             // _renderLine(contextReference, firstPoint, getPointByIndex(stroke, 1))
//             renderLine(contextReference, firstPoint, getPointByIndex(stroke, 1), width)
//             renderArc(contextReference, getPointByIndex(stroke, 1), width * 0.5)
//         } else {
//             renderArc(contextReference, firstPoint, width * firstPoint.p)
//             renderLine(contextReference, firstPoint, computeMiddlePoint(firstPoint, getPointByIndex(stroke, 1)), width)
//             // _renderLine(contextReference, firstPoint, getPointByIndex(stroke, 1))

//             // if (length < 3) {
//             //     renderArc(contextReference, firstPoint, width * 0.6)
//             // } else {
//             //     renderArc(contextReference, firstPoint, width * firstPoint.p)
//             //     renderLine(contextReference, firstPoint, computeMiddlePoint(firstPoint, getPointByIndex(stroke, 1)), width)

//             // Possibility to try this (the start looks better when the ink is large)
//             // var first = computeMiddlePoint(stroke[0], stroke[1]);
//             // contextReference.arc(first.x, first.y, width * first.p, 0, Math.PI * 2, true);

//             // nbquadratics  length - 2
//             for (let i = 0; i < nbquadratics; i++) {
//                 // context, begin, end, ctrl, width
//                 renderQuadratic(
//                     contextReference,
//                     computeMiddlePoint(
//                         getPointByIndex(stroke, i),
//                         getPointByIndex(stroke, i + 1)
//                     ),
//                     computeMiddlePoint(
//                         getPointByIndex(stroke, i + 1),
//                         getPointByIndex(stroke, i + 2)
//                     ),
//                     getPointByIndex(stroke, i + 1),
//                     width
//                 )
//             }

//             renderLine(contextReference, computeMiddlePoint(getPointByIndex(stroke, length - 2),
//                 getPointByIndex(stroke, length - 1)), getPointByIndex(stroke, length - 1), width)

//             // 结束
//             renderFinal(contextReference, getPointByIndex(stroke, length - 2),
//                 getPointByIndex(stroke, length - 1), width)
//         }
//         contextReference.closePath()
//         if (color !== undefined) {
//             if (contextReference.fillStyle !== color) {
//                 contextReference.fillStyle = color
//             }
//             contextReference.fill()
//         }
//     } finally {
//         contextReference.restore()
//     }
// }
