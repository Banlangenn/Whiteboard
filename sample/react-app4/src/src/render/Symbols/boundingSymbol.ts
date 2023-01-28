import { getPointsLimitValue, limitValue } from './../../utils'

import { pointListPath } from './StrokeComponent'

import {
	// drawPolygonParams,
	drawLineArrowParams,
	drawEllipseParams,
	// drawCircularParams,
	drawCircularEraserParams,
	drawRectParams,
	drawNumberAxisParams,
} from './../SymbolCanvasRendener'

/**
 * 笔的 获取包围盒
 *
 * @param {pointListPath} stroke
 * @param {number} offset
 * @returns {pointListPath}
 */
export function getStrokeBounding(
	stroke: pointListPath,
): pointListPath & limitValue {
	const strokeReference = stroke
	const { x, y, offset } = strokeReference
	const minX = Math.min(...x) - offset
	const minY = Math.min(...y) - offset
	const maxX = Math.max(...x) + offset
	const maxY = Math.max(...y) + offset
	// const newList = Object.assign({}, stroke, { minX, minY, maxY, maxX })
	const limitValue = {
		minX,
		minY,
		maxX,
		maxY,
	}
	// logger.trace('获取边框值', { minX, minY, maxY, maxX })
	return Object.assign(strokeReference, limitValue)
}

/**
 *圆 获取包围盒
 *
 * @param {drawCircularParams} arcParams
 * @param {number} offset
 * @returns {drawCircularParams}
 */
export function getArcBounding<T extends drawCircularEraserParams>(
	circularParams: T,
): T & limitValue {
	const circularParamsReference = circularParams
	const { center, radius, offset } = circularParamsReference
	const limitValue = {
		minX: center.x - radius - offset,
		minY: center.y - radius - offset,
		maxX: center.x + radius + offset,
		maxY: center.y + radius + offset,
	}
	return Object.assign(circularParamsReference, limitValue)
}

// 获取多边形包装盒
export function getPolygonBounding<T extends drawRectParams>(
	pointsMaxMinParams: T,
): T & limitValue {
	const paramsReference = pointsMaxMinParams
	// 计算 最大最小值
	const { points, offset } = paramsReference
	// if (points.length === 0) return pramsReference
	const limitValue = getPointsLimitValue(points, offset)
	return Object.assign(paramsReference, limitValue)
}

// 获取线的 包围盒
export function getLineBounding(
	lineParams: drawLineArrowParams,
): drawLineArrowParams & limitValue {
	const pramsReference = lineParams
	const { points, offset } = pramsReference
	// 多了一个属性 points
	const limitValue = getPointsLimitValue(points, offset)
	return Object.assign(pramsReference, limitValue)
}
// 获取椭圆 包围盒
// drawEllipseParams
export function getEllipseBounding<T extends drawEllipseParams>(
	params: T,
): T & limitValue {
	const paramsReference = params
	// 计算 最大最小值
	const { maxRadius, minRadius, center, offset } = paramsReference

	// 4.点 自己取判断
	const points = [
		{ x: center.x + maxRadius + offset, y: center.y + minRadius + offset },
		{ x: center.x - maxRadius - offset, y: center.y - minRadius - offset },
		{ x: center.x + maxRadius + offset, y: center.y - minRadius - offset },
		{ x: center.x - maxRadius - offset, y: center.y + minRadius + offset },
	]

	// 多了一个属性 points
	const limitValue = getPointsLimitValue(points, offset)
	return Object.assign(paramsReference, limitValue)
}

export function getCoordinateAxisBounding(
	coordinateAxisParams: drawNumberAxisParams,
): drawNumberAxisParams & limitValue {
	const paramsReference = coordinateAxisParams
	const { points, offset } = paramsReference
	// 要有顺序没法两个包围圈
	if (points.length !== 4) {
		throw new TypeError('CoordinateAxis, points必须为4个点')
	}
	// 上右边下左边
	const LimitPoints = [points[0], points[1], points[2], points[3]]

	const limitValue = getPointsLimitValue(LimitPoints, offset)
	return Object.assign(paramsReference, limitValue)
}

// /**
//  * 获取 矩形包装盒
//  *
//  * @param {drawRectParams} rectParams
//  * @returns {drawRectParams}
//  */
// export function getRectBounding(rectParams: drawRectParams): drawRectParams {
//   const rectParamsReference = rectParams
//   const { points, offset } = rectParamsReference
//   rectParamsReference.minX = point.x - offset
//   rectParamsReference.minY = point.y - offset
//   rectParamsReference.maxX = point.x + w + offset
//   rectParamsReference.maxY = point.y + h + offset
//   return rectParamsReference
// }
