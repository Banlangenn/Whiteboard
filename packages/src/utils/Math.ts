// import { Point } from './types'
// import { LINE_CONFIRM_THRESHOLD } from './constants'
// import { ExcalidrawLinearElement } from './element/types'
import { point } from './../utils'
export const rotate = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	angle: number,
): [number, number] =>
	// πβ²π₯=(ππ₯βππ₯)cosπβ(ππ¦βππ¦)sinπ+ππ₯
	// πβ²π¦=(ππ₯βππ₯)sinπ+(ππ¦βππ¦)cosπ+ππ¦.
	// https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
	[
		(x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
		(x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
	]

export const rotatePoint = (
	point: point,
	center: point,
	angle: number,
): [number, number] => rotate(point.x, point.y, center.x, center.y, angle)
