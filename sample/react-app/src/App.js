import './App.css'

import { useEffect, useRef } from 'react'
import {
	createApp,
	ImageShape,
	TextShape,
	StrokeShape,
	loadImage,
	computeMaxArea,
	RubberShape,
	RectShape,
} from './../../../dist'
import { Header, Loading, Message } from './components/index'
import JSONData from './data.json'
function App() {
	// const editRef = useRef()

	const creatEdit = async () => {
		// const dom = document.('div')
		// console.log(document.querySelector('.App'))
		const cropInstance = createApp({
			el: '.App',
			penColor: '#f80',
			penWidth: 2,
			canDraw: true,
			canRender: true,
			nativeEventStop: false,
			nativeEventPrev: false,

			graphics: [ImageShape, RubberShape, RectShape, TextShape, StrokeShape],
		})

		cropInstance.use({
			type: Loading,
			name: 'Loading',
			params: [{ show: true }],
		})
		cropInstance.use({
			type: Message,
			params: { duration: 5000 },
			name: 'Message',
		})

		cropInstance.use({
			type: Header,
			name: 'Header',
		})

		return cropInstance
	}

	const init = async () => {
		const container = await creatEdit()

		JSONData.forEach((element) => {
			container.appendToImage(element)
		})

		const img = await loadImage(
			'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
		)
		const area = computeMaxArea(container, img)
		const data = {
			imageOrUri: img,
			width: area.width / 4,
			height: area.height / 4,
			x: area.x + area.width / 4 / 4,
			y: area.y + area.height / 4 / 4,
		}
		const imgNode = new ImageShape(data)

		// const rectNode = new RectShape({
		// 	width: area.width / 4,
		// 	height: area.height / 4,
		// 	x: area.x + area.width / 4,
		// 	y: area.y + area.height / 4 + 100,
		// 	color: 'lightseagreen',
		// })

		container.add(imgNode).render()
		container.hideLoading()
	}

	useEffect(() => {
		init()
	}, [])

	return <div className="App"></div>
}

export default App
