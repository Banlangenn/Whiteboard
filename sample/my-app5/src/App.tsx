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
	const createEdit = async () => {
		// console.log(document.querySelector('.App'))
		const cropInstance = createApp({
			el: '.App',
			penColor: '#f80',
			penWidth: 2,
			status: 211,
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
		const container = await createEdit()
		container.use({ type: Header, name: 'Header' })

		const rectNode = new RectShape({
			width: 166.25,
			height: 163.26942231075697,
			x: 300.5625,
			y: 115.77851095617531,
			color: 'red',
		})

		const imgNode = new ImageShape({
			imageOrUri:
				'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
			width: 166.25,
			height: 163.26942231075697,
			x: 100.5625,
			y: 115.77851095617531,
		})
		const textNode = new TextTowShape({
			text: '刘继伟',
			x: 400.5625,
			lineHeight: 60,
			y: 115.77851095617531,
			color: 'red',
		})
		container.add(imgNode).add(rectNode).add(textNode)
	}

	useEffect(() => {
		init()
	}, [])

	return <div className="App"></div>
}

export default App
