import StrokeShape from './render/Symbols/Stroke'
import RubberShape from './render/Symbols/Rubber'
import ImageShape from './render/Symbols/Image'
import TextShape from './render/Symbols/Text'
import RectShape from './render/Symbols/Rect'
import GroupShape, { InnerGroupShape } from './render/Symbols/Group'

import { createImage, loadImage, computeMaxArea } from './utils'
import Logger from './model/logger'

import { createApp } from './core'

export {
	createApp,
	Logger,
	StrokeShape,
	RubberShape,
	ImageShape,
	TextShape,
	GroupShape,
	InnerGroupShape,
	RectShape,
	createImage,
	loadImage,
	computeMaxArea,
}
