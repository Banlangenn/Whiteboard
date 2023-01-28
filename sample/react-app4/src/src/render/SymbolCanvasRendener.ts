import { pointListPath } from './Symbols/StrokeComponent'

import * as draw from './Symbols/drawSymbol'
import * as bounding from './Symbols/boundingSymbol'
import * as crash from './Symbols/crashSymbol'
// 使用枚举
import { logger, point, limitValue, drawAttributeInit } from './../utils'

// 笔的状态
export enum Status {
	STATUS_PEN = 2, // 曲线
	STATUS_ARROW = 3, // 箭头
	STATUS_RUBBER = 7, // 橡皮
	STATUS_LINE = 10, // 直线
	STATUS_TRIANGLE = 11, // 三角形几何图形
	STATUS_RECTANGLE = 12, // 矩形
	STATUS_TRAPEZIUM = 13, // 梯形
	STATUS_OVAL = 14, // 椭圆
	STATUS_COORDINATE = 15, // 坐标系
	STATUS_NUMBER_AXIS = 16, // 数轴
	STATUS_DASH_LINE = 17, // 虚直线 ---------
	STATUS_CIRCLE_CENTER = 18, // 同心圆
	STATUS_COMPASSES = 19, // 圆规
	STATUS_CIRCLE = 20, // 圆
	STATUS_DASH = 21, // 点曲线 ------------
	STATUS_NO_PATH_PEN = 1000, // 消痕笔曲线
	STATUS_MOVE = 101, // 消痕笔曲线
}
//  共有属性
export interface properties extends Partial<limitValue> {
	readonly width: number
	readonly color: string
	readonly type: Status
	readonly offset: number
	readonly activeGroupName: number | string
	readonly isDash?: boolean
	path2d?: {
		path: Path2D
		end: boolean
	}
}

// case 'pen':
//   case 'disappear'
// 每一个 定义渲染器的文件
// 曲线

// points
type baseProperties = properties

// pointListPath
// export interface drawLineParams extends baseProperties {}

// 矩形
export interface drawRectParams extends baseProperties {
	points: point[]
}

export interface drawCircularParams extends baseProperties {
	// points: point[]
	center: point
	radius: number
	isDrawC: boolean
}

// 椭圆
export interface drawEllipseParams extends baseProperties {
	center: point
	minRadius: number
	maxRadius: number
}

// 橡皮
export interface drawCircularEraserParams extends baseProperties {
	center: point
	radius: number
	color: string
}

//  几何
export interface drawPolygonParams extends baseProperties {
	points: point[]
}
//

export type drawLineParams = drawPolygonParams

export interface drawLineArrowParams extends drawLineParams {
	theta?: number
	headlen?: number
}

export interface drawNumberAxisParams extends drawLineArrowParams {
	center: point
	interval?: number
	bulge?: number
	centerRadius: number
}

// vertical 垂直
// horizontal  水平

// 不同的 图形 不同的数据结构
// type

// 判断  如果 limit

export type editData =
	| pointListPath
	| drawPolygonParams
	| drawLineArrowParams
	| drawCircularEraserParams
	| drawLineParams
	| drawEllipseParams
	| drawCircularParams
	| drawRectParams
	| drawNumberAxisParams

//  怎么运行时 判断
export type editDataI = editData | (editData & limitValue)

// interface CanvasPath {
//   arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
//   arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
//   bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
//   closePath(): void;
//   ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
//   lineTo(x: number, y: number): void;
//   moveTo(x: number, y: number): void;
//   quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
//   rect(x: number, y: number, w: number, h: number): void;
// }

// -- 渲染
// 传进来的  数据  没办法统一
// symbol  有好几种

// 数据结构完全不一样

// 三大块  画   获取包围容器  碰撞检测   考虑分开文件

// drawLine
// drawLineArrow
/**
 *
 * 渲染 不同图形
 * @export
 * @param {CanvasRenderingContext2D} context
 * @param {editDataI} symbol
 */
// import * as draw from './Symbols/drawSymbol'
// import * as bounding from './Symbols/boundingSymbol'
// import * as crash from './Symbols/crashSymbol'
export function drawSymbol(
	context: CanvasRenderingContext2D,
	symbol: editDataI,
	savePath = false,
) {
	const symbolReference = symbol
	const type = symbol.type
	logger.trace(`attempting to draw ${type} symbol`)
	// if (type === 'pen' || type === 'disappear') {
	//     drawCurveLine(context, <pointListPath>symbol);
	// }  else if (type === 'lineArrow') {
	//     // drawLineArrow(context, symbol)
	// } else if (type === 'eraser') {
	//   drawArcEraser(context, symbol)
	// }
	const { color, width, isDash } = symbol
	drawAttributeInit(context, color, width, isDash)
	// 如果第二次执行这个就不用跑
	switch (type) {
		case Status.STATUS_PEN:
		case Status.STATUS_NO_PATH_PEN:
			// draw.drawCurveLine(context, symbolReference as pointListPath, savePath)
			break
		case Status.STATUS_RUBBER:
			draw.drawCircularEraser(
				context,
				symbolReference as drawCircularEraserParams,
			)
			break
		case Status.STATUS_CIRCLE:
		case Status.STATUS_CIRCLE_CENTER:
			draw.drawCircular(context, symbolReference as drawCircularParams)
			break
		case Status.STATUS_RECTANGLE:
			draw.drawRect(context, symbolReference as drawRectParams)
			break
		case Status.STATUS_TRIANGLE:
		case Status.STATUS_TRAPEZIUM:
			draw.drawPolygon(context, symbolReference as drawPolygonParams)
			break
		case Status.STATUS_OVAL:
			draw.drawEllipse(context, symbolReference as drawEllipseParams)
			break
		case Status.STATUS_LINE:
			draw.drawLine(context, symbolReference as drawLineParams)
			break
		case Status.STATUS_ARROW:
			draw.drawLineArrow(context, symbolReference as drawLineArrowParams)
			break
		case Status.STATUS_NUMBER_AXIS:
			draw.drawHorizontalNumberAxis(
				context,
				symbolReference as drawNumberAxisParams,
			)
			break
		case Status.STATUS_COORDINATE:
			draw.drawCoordinateAxis(context, symbolReference as drawNumberAxisParams)
			break
		default:
			logger.debug('没有实现这个类型的draw', type)
			break
	}
	// else if (TextSymbols[type]) {
	//   drawTextSymbol(context, symbol);
	// } else if (ShapeSymbols[type]) {
	//   drawShapeSymbol(context, symbol);
	// } else if (MusicSymbols[type]) {
	//   drawMusicSymbol(context, symbol);
	// } else {
	//   logger.warn(`impossible to draw ${type} symbol`);
	// }
}

/**
 * 获取不同图形的包围盒
 *
 * @export
 * @param {editDataI} symbol
 * @param {number} offset
 * @returns {editDataI}
 */

export function computeBounding(symbol: editDataI): editDataI & limitValue {
	let symbolReference = symbol
	const type = symbolReference.type
	switch (type) {
		case Status.STATUS_RUBBER:
		case Status.STATUS_CIRCLE:
			// 橡皮
			return bounding.getArcBounding(
				symbolReference as drawCircularEraserParams | drawCircularParams,
			)
		case Status.STATUS_PEN:
			return bounding.getStrokeBounding(symbolReference as pointListPath)
		// case Status.STATUS_CIRCLE_CENTER:
		// case Status.STATUS_CIRCLE:
		//     return bounding.getArcBounding(symbolReference as drawCircularParams)
		case Status.STATUS_RECTANGLE:
		case Status.STATUS_TRIANGLE:
		case Status.STATUS_TRAPEZIUM:
			return bounding.getPolygonBounding(
				symbolReference as drawPolygonParams | drawRectParams,
			)
		case Status.STATUS_OVAL:
			return bounding.getEllipseBounding(symbolReference as drawEllipseParams)
		case Status.STATUS_LINE:
		case Status.STATUS_ARROW:
		case Status.STATUS_NUMBER_AXIS:
			return bounding.getLineBounding(symbolReference as drawLineArrowParams)
		case Status.STATUS_COORDINATE:
			return bounding.getCoordinateAxisBounding(
				symbolReference as drawNumberAxisParams,
			)
		default:
			logger.debug('没有实现这个类型的获取包围盒', type)
			throw new Error('没有实现这个类型的获取包围盒')
	}
}

// 不同图形的碰撞检测

export function computeCrash(
	ePoint: point,
	symbol: editDataI,
	lineDis: number,
): boolean {
	let isCrash = false
	let symbolReference = symbol
	const type = symbol.type
	switch (type) {
		case Status.STATUS_PEN:
			isCrash = crash.lineCheckCrash(
				ePoint,
				symbolReference as pointListPath,
				lineDis,
			)
			break
		case Status.STATUS_CIRCLE_CENTER:
		case Status.STATUS_CIRCLE:
			isCrash = crash.arcCheckCrash(
				ePoint,
				symbolReference as drawCircularParams,
				lineDis,
			)
			break
		case Status.STATUS_TRIANGLE:
		case Status.STATUS_TRAPEZIUM:
		case Status.STATUS_RECTANGLE:
			isCrash = crash.polygonCheckCrash(
				ePoint,
				symbolReference as drawPolygonParams,
				lineDis,
			)
			break
		case Status.STATUS_OVAL:
			isCrash = crash.ellipseCheckCrash(
				ePoint,
				symbolReference as drawEllipseParams,
				lineDis,
			)
			break
		case Status.STATUS_LINE:
		case Status.STATUS_ARROW:
		case Status.STATUS_NUMBER_AXIS:
			isCrash = crash.lineCheckCrash(
				ePoint,
				(symbolReference as drawLineArrowParams).points,
				lineDis,
			)
			break
		case Status.STATUS_COORDINATE:
			isCrash = crash.coordinateAxisCheckCrash(
				ePoint,
				symbolReference as drawNumberAxisParams,
				lineDis,
			)
			break
		default:
			logger.debug('没有实现这个类型的碰撞检测', type)
			break
	}
	return isCrash
}

function getStrokeOffsetPath(
	symbol: pointListPath,
	offsetX: number,
	offsetY: number,
) {
	let symbolReference = symbol
	symbolReference.x = symbolReference.x.map((x) => x + offsetX)
	symbolReference.y = symbolReference.y.map((y) => y + offsetY)
	return symbolReference
}

function getArcOffsetPath<T extends { center: point }>(
	symbol: T,
	offsetX: number,
	offsetY: number,
): T {
	let symbolReference = symbol
	symbolReference.center.x = symbolReference.center.x + offsetX
	symbolReference.center.y = symbolReference.center.y + offsetY
	return symbolReference
}

function getLineOffsetPath<T extends { points: point[] }>(
	symbol: T,
	offsetX: number,
	offsetY: number,
): T {
	let symbolReference = symbol
	symbolReference.points = symbolReference.points.map((e) => ({
		x: e.x + offsetX,
		y: e.y + offsetY,
	}))
	return symbolReference
}

// 圆心 也要转移 -- drawNumberAxisParams
// 数轴计算不对
function getNumberAxisOffsetPath(
	symbol: drawNumberAxisParams,
	offsetX: number,
	offsetY: number,
) {
	let symbolReference = symbol
	symbolReference = getLineOffsetPath(symbol, offsetX, offsetY)

	symbolReference = getArcOffsetPath(symbolReference, offsetX, offsetY)
	return symbolReference
}

/**
 *
 * @param symbol 笔记数据
 * @param offsetX // 偏移x
 * @param offsetY 偏移y
 */
export function computeOffsetPath(
	symbol: editDataI,
	offsetX: number,
	offsetY: number,
): editDataI {
	let symbolReference = symbol
	// 需要重画
	symbolReference.path2d = undefined
	const type = symbolReference.type
	switch (type) {
		case Status.STATUS_PEN:
			symbolReference = getStrokeOffsetPath(
				symbolReference as pointListPath,
				offsetX,
				offsetY,
			)
			break
		case Status.STATUS_CIRCLE_CENTER:
		case Status.STATUS_CIRCLE:
			symbolReference = getArcOffsetPath(
				symbolReference as drawCircularParams,
				offsetX,
				offsetY,
			)
			break
		case Status.STATUS_RECTANGLE:
		case Status.STATUS_TRIANGLE:
		case Status.STATUS_TRAPEZIUM:
			symbolReference = getLineOffsetPath(
				symbolReference as drawPolygonParams,
				offsetX,
				offsetY,
			)
			break
		case Status.STATUS_OVAL:
			symbolReference = getArcOffsetPath(
				symbolReference as drawEllipseParams,
				offsetX,
				offsetY,
			)
			break
		case Status.STATUS_LINE:
		case Status.STATUS_ARROW:
			symbolReference = getLineOffsetPath(
				symbolReference as drawLineArrowParams,
				offsetX,
				offsetY,
			)
			break
		case Status.STATUS_NUMBER_AXIS:
		case Status.STATUS_COORDINATE:
			symbolReference = getNumberAxisOffsetPath(
				symbolReference as drawNumberAxisParams,
				offsetX,
				offsetY,
			)
			break
		default:
			logger.debug('没有实现这个类型的获取增加偏移量', type)
			break
	}
	// symbolReference = computeBounding(symbolReference)
	// 辅助线
	// if (symbolReference.isDash) {
	//     console.log(symbolReference.type)
	//     symbolReference = computeBounding(symbolReference)
	// }
	//  获取新的包围盒
	return symbolReference
}
