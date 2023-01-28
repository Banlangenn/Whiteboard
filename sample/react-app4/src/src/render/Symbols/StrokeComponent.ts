// 使用枚举
import { logger, newPoint } from './../../utils'
import { properties } from './../SymbolCanvasRendener'

export interface pointListPathItem extends newPoint {
	p: number
	l?: number
}

// 如果是橡皮 --     radius?: number; l  不用计算  max等 也不用计算

export interface pointListPath extends properties {
	x: number[]
	y: number[]
	t: number[]
	p: number[]
	l?: number[]
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
		: pressure < 0.1
		? 0.1
		: pressure
	// return isNaN(parseFloat(String(pressure))) ? 0.5 : pressure
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

/**
 * Create a new stroke
 * @param {Object} properties Properties to be applied to the stroke.
 * @return {Stroke} New stroke with properties for quadratics draw
 */
export function createStrokeComponent(properties: properties): pointListPath {
	const defaultStroke = {
		type: 'stroke',
		x: [],
		y: [],
		t: [],
		p: [],
		width: 1,
		maxX: 0,
		maxY: 0,
		minX: 0,
		minY: 0,
		offset: 1,
	}
	return { ...defaultStroke, ...properties }
}

/**
 * Get a JSON copy of a stroke by filtering its properties
 * @param {Stroke} stroke Current stroke
 * @return {{type: String, x: Array<Number>, y: Array<Number>, t: Array<Number>}} Simplified stroke object
 */
// export function toJSON(stroke) {
//     return { type: stroke.type, x: stroke.x, y: stroke.y, t: stroke.t }
// }

/**
 * Get a JSON copy of a stroke by filtering its properties
 * @param {Stroke} stroke Current stroke
 * @return {{x: Array<Number>, y: Array<Number>, t: Array<Number>}} Simplified stroke object
 */
// export function toJSONV4(stroke) {
//     return { x: stroke.x, y: stroke.y, t: stroke.t }
// }

/**
 * Mutate a stroke by adding a point to it.
 * @param {Stroke} stroke Current stroke
 * @param {{x: Number, y: Number, t: Number}} point Point to add
 * @return {Stroke} Updated stroke
 */
export function addPoint(
	stroke: pointListPath,
	point: newPoint,
): pointListPath | undefined {
	const strokeReference = stroke
	if (
		filterPointByAcquisitionDelta(
			point.x,
			point.y,
			strokeReference.x,
			strokeReference.y,
			strokeReference.width,
		)
	) {
		strokeReference.x.push(point.x)
		strokeReference.y.push(point.y)
		strokeReference.t.push(point.t)
		// 传过来的会有压感
		// logger.trace(point)
		if (point.p !== undefined) {
			strokeReference.p.push(point.p)
		} else {
			if (!strokeReference.l) {
				logger.trace('需要自己计算p 压感')
				strokeReference.l = []
			}
			strokeReference.p.push(
				computePressure(
					point.x,
					point.y,
					strokeReference.x,
					strokeReference.y,
					strokeReference.l,
					strokeReference.x.length - 1,
				),
			)
			strokeReference.l.push(
				computeLength(
					point.x,
					point.y,
					strokeReference.x,
					strokeReference.y,
					strokeReference.l,
					strokeReference.x.length - 1,
				),
			)
		}
		return strokeReference
	} else {
		logger.trace('ignore filtered point', point)
	}
}

/**
 * Slice a stroke and return the sliced part of it
 * @param {Stroke} stroke Current stroke
 * @param {Number} [start=0] Zero-based index at which to begin extraction
 * @param {Number} [end=length] Zero-based index at which to end extraction
 * @return {Stroke} Sliced stroke
 */
// export function slice(stroke: pointListPath, start = 0, end = stroke.x.length) {
//     const slicedStroke = createStrokeComponent({ color: stroke.color, width: stroke.width })
//     for (let i = start; i < end; i++) {
//         addPoint(slicedStroke, {
//             x: stroke.x[i],
//             y: stroke.y[i],
//             t: stroke.t[i]
//         })
//     }
//     return slicedStroke
// }

/**
 * Extract point by index
 * @param {Stroke} stroke Current stroke
 * @param {Number} index Zero-based index
 * @return {{x: Number, y: Number, t: Number, p: Number, l: Number}} Point with properties for quadratics draw
 */
export function getPointByIndexV2(
	stroke: pointListPath,
	index: number,
): pointListPathItem {
	let pointListPathItem: pointListPathItem | undefined
	if (index !== undefined && index >= 0 && index < stroke.x.length) {
		pointListPathItem = {
			x: stroke.x[index],
			y: stroke.y[index],
			t: stroke.t[index],
			p: stroke.p[index],
		}
		if (stroke.l) {
			pointListPathItem.l = stroke.l[index]
		}
	}
	return pointListPathItem as pointListPathItem
}

export function getPointByIndex(
	stroke: pointListPath,
	index: number,
): pointListPathItem {
	// if (index !== undefined && index >= 0 && index < stroke.x.length) {
	return {
		x: stroke.x[index],
		y: stroke.y[index],
		t: stroke.t[index],
		p: stroke.p[index],
		l: stroke.l ? stroke.l[index] : undefined,
	}
}
