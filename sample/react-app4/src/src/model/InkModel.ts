import {
	pointListPath,
	addPoint,
	createStrokeComponent,
	getPointByIndex,
	pointListPathItem,
} from '../render/Symbols/StrokeComponent'

import {
	editDataI,
	drawLineParams,
	drawCircularParams,
	properties,
	computeBounding,
	Status,
	drawRectParams,
} from '../render/SymbolCanvasRendener'

/**
 * Create a new model
 * @param {Configuration} [configuration] Parameters to use to populate default recognition symbols
 * @return {Model} New model
 */
// 使用枚举
import {
	logger,
	newPoint,
	getMidpoint,
	getDistance,
	getPointsLimitValue,
	getRectangularVertex,
} from '../utils'

// 有改 model 尽量都返回 把修改后的model 返回
// export interface model {
//     disappearStroke: Graphics[], // 消失笔的线
//     currentGraphics: Graphics | null; // 当前的 点
//     pageName: number | string; // 当前 group key
//     pages: pagesI; // 所有的 group
//     currentPage: Graphics[]; // 选中的  GroupStroke
//     // lastStroke: Graphics; // 当前 选中的 最后一个点
//     defaultSymbols: Graphics[]; // 默认 的 GroupStroke // 分组班没有这个
//     destroy: () => void;
// }
// export type pagesI = {
//     [key in number | string]: Graphics[];
// }

// export function createModel(defaultSymbols: Graphics[] = []): model {
//     return {
//         disappearStroke: [],
//         currentGraphics: null,
//         pageName: 0,
//         pages: {
//             0: defaultSymbols
//         },
//         defaultSymbols: [...defaultSymbols],
//         // 这也方法要用方法去获取 不能用get
//         get currentPage() {
//             return this.pages[this.pageName]
//         },
//         // get lastStroke(): editDataI {
//         //     return this.activeGroupStroke[this.activeGroupStroke.length - 1]
//         // },
//         destroy () {
//             this.disappearStroke = []
//             this.currentGraphics = null
//             this.defaultSymbols = []
//             this.pages = {}
//         }
//     }
// }
//  chrome 系能分析 -lodash 是 JSON 克隆 的10倍
// eslint-disable-next-line @typescript-eslint/no-require-imports
// const cloneDeep = require('lodash.clonedeep')

// 有改 model 尽量都返回 把修改后的model 返回
export interface model {
	disappearStroke: pointListPath[] // 消失笔的线
	currentStroke: editDataI | null // 当前的 点
	_activeGroupName: number | string // 当前 group key
	groupStroke: groupStroke // 所有的 group
	activeGroupStroke: editDataI[] // 选中的  GroupStroke
	lastStroke: editDataI // 当前 选中的 最后一个点
	defaultSymbols: editDataI[] // 默认 的 GroupStroke // 分组班没有这个
	lastStrokePoint: newPoint | null
	startPoint: newPoint // 直线什么的 要保存第一个点
	destroy: any
}
export type groupStroke = {
	[key in number | string]: editDataI[]
}

export function createModel(defaultSymbols: editDataI[] = []): model {
	// console.log(defaultSymbols)
	// see @typedef documentation on top
	return {
		disappearStroke: [],
		currentStroke: null,
		startPoint: { x: 0, y: 0, t: 0 },
		_activeGroupName: 0,
		groupStroke: {
			0: defaultSymbols,
		},
		defaultSymbols: [...defaultSymbols],
		// 这也方法要用方法去获取 不能用get
		get activeGroupStroke() {
			return this.groupStroke[this._activeGroupName]
		},
		get lastStroke(): editDataI {
			return this.activeGroupStroke[this.activeGroupStroke.length - 1]
		},
		get lastStrokePoint() {
			// 判断是不是划线
			// Status.STATUS_PEN   STATUS_NO_PATH_PEN 消失线
			if (
				this.currentStroke &&
				(this.currentStroke.type === Status.STATUS_PEN ||
					this.currentStroke.type === Status.STATUS_NO_PATH_PEN)
			) {
				const list = this.currentStroke as pointListPath
				return getPointByIndex(list, list.x.length - 1)
			}
			return null
		},
		destroy() {
			this.disappearStroke = []
			this.currentStroke = null
			this.startPoint = { x: 0, y: 0, t: 0 }
			this.defaultSymbols = []
			this.groupStroke = {
				0: [],
			}
		},
	}
}

export function appendToCurrentGroup(model: model, newData: editDataI) {
	// 追加
	model.activeGroupStroke.push(newData)
}

export function resetModel(model: model) {
	return createModel([...model.defaultSymbols])
}

export function clearGroup(model: model) {
	const modelReference = model
	modelReference.groupStroke[modelReference._activeGroupName] = []
	return modelReference
}

function getModelGroupName(model: model, startName = 0): number {
	let name = startName
	while (model.groupStroke[name]) {
		name += 1
	}
	logger.debug('自动取名：', name)
	return name
}

// 单纯的复用代码块
function switchActiveGroup(model: model, activeGroupName?: string | number) {
	const groupName = activeGroupName || getModelGroupName(model)
	if (!model.groupStroke[groupName]) {
		logger.trace('newGroup', activeGroupName)
		model.groupStroke[groupName] = []
	}
	logger.debug('新的group名字为', groupName)
	model._activeGroupName = groupName
}

// canvasContext
// 把数据 - 切回来
/**
 * 切换 Stroke 的 组   场景  ppt 切换
 *
 * @export
 * @param {canvasContext} context
 * @param {model} model
 * @param {(string | number)} activeGroup
 */
// 可以做多个白板场景
type activeGroupNameI = string | number
export function switchGroup(
	model: model,
	activeGroupName?: activeGroupNameI,
): activeGroupNameI {
	if (model._activeGroupName === activeGroupName) return activeGroupName
	// 名字一样 你切换个锤子
	logger.trace('switchGroup', activeGroupName)
	switchActiveGroup(model, activeGroupName)
	// 把这个 - 渲染
	return model._activeGroupName
}

// 只做
/**
 * Mutate the model given in parameter by adding the new strokeToAdd.
 * @param {Model} model Current model
 * @param {Stroke} stroke Stroke to be added to pending ones
 * @return {Model} Updated model
 */

export function initPendingStroke(
	model: model,
	point: newPoint,
	properties: properties,
): model {
	//  把每个点的 在哪个一个组 给记录下来
	const propertiesRef = properties

	if (
		properties.type !== Status.STATUS_PEN &&
		properties.type !== Status.STATUS_NO_PATH_PEN
	) {
		return initDoublePoint(model, point, propertiesRef)
	}

	const modelReference = model
	logger.trace('initPendingStroke', point)
	// Setting the current stroke to an empty one
	modelReference.currentStroke = createStrokeComponent(propertiesRef)
	// 1 -笔断言是 pointListPath  内部处理过
	modelReference.currentStroke = addPoint(
		modelReference.currentStroke,
		point,
	) as pointListPath
	return modelReference
}

/**
 * Mutate the model by adding a point to the current pending stroke.
 * @param {Model} model Current model
 * @param {{x: Number, y: Number, t: Number}} point Captured point to be append to the current stroke
 * @return {Model} Updated model
 */
export function appendToPendingStroke(model: model, point: newPoint) {
	const modelReference = model
	if (modelReference.currentStroke) {
		if (
			modelReference.currentStroke.type !== Status.STATUS_PEN &&
			modelReference.currentStroke.type !== Status.STATUS_NO_PATH_PEN
		) {
			return appendToDoublePoint(model, point)
		}

		logger.trace('appendToPendingStroke', point)
		const currentStroke = addPoint(
			modelReference.currentStroke as pointListPath,
			point,
		)
		if (currentStroke) {
			modelReference.currentStroke = currentStroke
			return modelReference
		}
	}
}

/**
 *  把数据 放进哪个地方
 *  disappear false 放进主渲染屏 true 放进 消失屏
 *
 * @export
 * @param {model} model
 * @param {boolean} disappear
 */
export function endPendingStroke(model: model) {
	// 要分 不同的type
	const modelReference = model
	if (modelReference.currentStroke) {
		let currentStroke = modelReference.currentStroke
		// Mutating pending strokes
		// 箭头 直线 只保留 开始 结束两点
		// 保存的点 需要自定义
		addStroke(modelReference, currentStroke)
		// Resetting the current stroke to an undefined one
		modelReference.currentStroke = null
	}
}

// 4.20  新增 解决箭头 直线 橡皮问题
export function initDoublePoint(
	model: model,
	point: newPoint,
	properties: properties,
): model {
	const modelReference = model
	logger.trace('initDoublePoint', point)
	modelReference.startPoint = point
	// 四边形
	switch (properties.type) {
		case Status.STATUS_ARROW:
		case Status.STATUS_LINE:
			modelReference.currentStroke = {
				...properties,
				points: [point, point],
			}
			break
		case Status.STATUS_CIRCLE:
			modelReference.currentStroke = {
				...properties,
				center: point,
				radius: 1,
			}
			break
		case Status.STATUS_RECTANGLE:
			{
				// 矩形'
				const limitValue = getPointsLimitValue([point, point])
				modelReference.currentStroke = {
					...properties,
					points: getRectangularVertex(limitValue),
					activeGroupName: 1,
					isDash: true,
				}
			}
			break
		default:
			break
	}
	return modelReference
}

export function appendToDoublePoint(model: model, point: newPoint) {
	const modelReference = model
	if (modelReference.currentStroke) {
		switch (!model.currentStroke || model.currentStroke.type) {
			case Status.STATUS_ARROW:
			case Status.STATUS_LINE:
				logger.trace('appendToPendingStroke', point)
				if ((modelReference.currentStroke as drawLineParams).points) {
					;(modelReference.currentStroke as drawLineParams).points[1] = point
				}
				break
			case Status.STATUS_CIRCLE:
				;(modelReference.currentStroke as drawCircularParams).center =
					getMidpoint(point, modelReference.startPoint) // 拷贝有问题
				;(modelReference.currentStroke as drawCircularParams).radius =
					getDistance(point, modelReference.startPoint) / 2
				break
			case Status.STATUS_RECTANGLE:
				{
					// 矩形'
					const limitValue = getPointsLimitValue([
						modelReference.startPoint,
						point,
					])
					;(modelReference.currentStroke as drawRectParams).points =
						getRectangularVertex(limitValue)
				}
				break
			default:
				logger.error('model.currentStroke数据', model.currentStroke)
				break
		}
	}
	return modelReference
}

// export function cloneModel(model: model): model {
//     let clonedModel = cloneDeep(model)
//     Object.defineProperty(clonedModel, 'activeGroupStroke', {
//         get: function() {
//             return this.groupStroke[this._activeGroupName]
//         }
//     })

//     Object.defineProperty(clonedModel, 'lastStroke', {
//         get: function() {
//             return this.activeGroupStroke[this.activeGroupStroke.length - 1]
//         }
//     })
//     return <model>clonedModel
// }

/**
 *  获取 不同几何图形的点
 *
 * @param {string} type
 * @param {pointListPath} currentStroke
 * @returns {pointListPath[]}
 */

//  内聚掉
function addStroke(model: model, stroke: editDataI): void {
	// We use a reference to the model. The purpose here is to update the pending stroke only.
	const modelReference = model
	// modelReference.rawStrokes.
	// ,disappear: boolean
	if (stroke.type === Status.STATUS_NO_PATH_PEN) {
		logger.debug('消失笔-----', stroke)
		const strokeReference = stroke as pointListPath
		// 修改时间-- 然后 消失定时器用
		strokeReference.t[strokeReference.t.length - 1] = Date.now()

		modelReference.disappearStroke.push(strokeReference)
		return
	}
	// 向外 扩散三1像素
	const strokeReference = computeBounding(stroke)
	logger.debug('addStroke', strokeReference)
	modelReference.activeGroupStroke.push(strokeReference)
}

export function getDisappearFirstPointTime(model: model): number {
	const tempStroke = model.disappearStroke[0]
	const lastPoint = getPointByIndex(
		tempStroke,
		tempStroke.x.length - 1,
	) as pointListPathItem
	return lastPoint.t
}

//  2020-4-13 碰撞检测--- 橡皮与 点
