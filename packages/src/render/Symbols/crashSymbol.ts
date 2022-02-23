import { pointListPath, getPointByIndex } from './StrokeComponent'

import { point, logger, getDistance, distanceOfPoint2Line } from './../../utils'
import {
	drawPolygonParams,
	drawEllipseParams,
	drawCircularParams,
	// drawRectParams,
	drawNumberAxisParams,
} from './../SymbolCanvasRendener'

export function coordinateAxisCheckCrash(
	point: point,
	coordinateAxisParams: drawNumberAxisParams,
	lineDis: number,
): boolean {
	const pramsReference = coordinateAxisParams
	const { points } = pramsReference
	// console.log('points================================================', points)
	// 要有顺序没法两个包围圈
	if (points.length !== 4) {
		logger.error('points必须为4个点', points.length)
		return false
	}
	// 上右 下左
	return (
		lineCheckCrash(point, [points[0], points[2]], lineDis) ||
		lineCheckCrash(point, [points[1], points[3]], lineDis)
	)
}

// 园与橡皮 碰撞
export function arcCheckCrash(
	point: point,
	arcParams: drawCircularParams,
	lineDis: number,
): boolean {
	const { center, radius, isDrawC } = arcParams

	if (Math.abs(getDistance(center, point) - radius) < lineDis) {
		return true
	}
	if (isDrawC) {
		if (Math.abs(getDistance(center, point) - 2) < lineDis) {
			return true
		}
	}
	return false
}

/**
 *  三角形 和 梯形 碰撞
 *
 * @param {point} ePoint
 * @param {drawPolygonParams} polygonParams
 * @param {number} lineDis
 * @returns
 */
export function polygonCheckCrash(
	ePoint: point,
	polygonParams: drawPolygonParams,
	lineDis: number,
): boolean {
	const pointsReference = [...polygonParams.points]
	pointsReference.push(pointsReference[0])
	return lineCheckCrash(ePoint, pointsReference, lineDis)
}

/**
 * 椭圆碰撞检测
 *
 * @export
 * @param {point} { x, y }
 * @param {ellipse} ellipse
 * @returns
 */
export function ellipseCheckCrash(
	{ x, y }: point,
	ellipseParams: drawEllipseParams,
	lineDis: number,
): boolean {
	const { center, maxRadius, minRadius } = ellipseParams
	// x表示x轴坐标，y表示y轴坐标，a表示长轴，b表示短轴
	// 点在椭圆的 外测
	const outsideMinR = minRadius + lineDis
	const outsideMaxR = maxRadius + lineDis
	const outsideF =
		((x - center.x) * (x - center.x)) / (outsideMaxR * outsideMaxR) +
		((y - center.y) * (y - center.y)) / (outsideMinR * outsideMinR)
	if (Math.abs(outsideF - 1) < 0.1) {
		return true
	}
	// 内测
	const innerMinR = minRadius - lineDis
	const innerMaxR = maxRadius - lineDis
	const innerF =
		((x - center.x) * (x - center.x)) / (innerMaxR * innerMaxR) +
		((y - center.y) * (y - center.y)) / (innerMinR * innerMinR)
	if (Math.abs(innerF - 1) < 0.1) {
		return true
	}
	return false
}

// 合并两种 获取item
function getAllPointByIndex(
	points: pointListPath | point[],
	index: number,
): point {
	if (Array.isArray(points)) {
		return points[index]
	} else {
		return getPointByIndex(points, index)
	}
}
/**
 * 线与pointLis  碰撞检测
 *
 * @param {newPoint} ePoint
 * @param {pointListPath} pointListPath
 * @param {number} lineDis
 * @returns {boolean}
 */
// 还是不对
type pointListI = pointListPath | point[] | [point, point]
export function lineCheckCrash(
	ePoint: point,
	pointList: pointListI,
	lineDis: number,
): boolean {
	const lineLength = Array.isArray(pointList)
		? pointList.length
		: pointList.x.length
	const { x, y } = ePoint

	// TODO: 这个计算  橡皮跑很快会有问题

	for (let j = 0; j < lineLength; j++) {
		// 点
		// const pointPath = pointListPath[j]
		// 首先用点检测
		const point = getAllPointByIndex(pointList, j)
		if (!point) break
		// { x: pointListPath.x[j], y: pointListPath.y[j]}
		if (Math.abs(x - point.x) < lineDis && Math.abs(y - point.y) < lineDis) {
			return true
		}
		// 判断线 不是最后一个
		if (lineLength === 1 || j === lineLength - 1) break
		// pointLine[j + 1]
		const point2 = getAllPointByIndex(pointList, j + 1)
		if (!point2) break
		// logger.debug('zou-------------------检测', point)

		// 如果 离上一个点差的很远 ---  用线 检测
		if (getDistance(point, point2) > lineDis) {
			// this.log('差的很远的的一条线 橡皮离这个线的距离')
			const dis = distanceOfPoint2Line(point, point2, ePoint)
			// logger.debug('点到线的距离为： ' , dis)
			// logger.debug(lineDis)

			if (dis < lineDis) {
				return true
				// 删除 这根线
			}
		}
	}
	return false
}
