import React, { useEffect } from 'react'

import './App.css'

import {
	createApp,
	ImageShape,
	TextShape,
	StrokeShape,
	loadImage,
	computeMaxArea,
	GroupShape,
	RubberShape,
	RectShape,
	TextTowShape,
} from './../../../packages/src/index'
import JSONData from './../../data/framework.json'
import { Header, Loading, Message } from './../../components/index'
function App() {
	const creatEdit = async () => {
		// console.log(document.querySelector('.App'))
		const cropInstance = createApp({
			el: '.App',
			penColor: '#f80',
			penWidth: 2,
			status: 299,
			canDraw: true,
			canRender: true,
			nativeEventStop: false,
			nativeEventPrev: false,
			graphics: [
				GroupShape,
				ImageShape,
				RubberShape,
				RectShape,
				TextShape,
				StrokeShape,
				TextTowShape,
			],
		})

		return cropInstance
	}

	const init = async () => {
		const container = await creatEdit()

		const imgNode = new ImageShape({
			imageOrUri:
				'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
			width: 166.25,
			height: 163.26942231075697,
			x: 100.5625,
			y: 115.77851095617531,
		})
		container.add(imgNode)
	}

	useEffect(() => {
		init()
	}, [])

	return <div className="App"></div>
}

export default App
