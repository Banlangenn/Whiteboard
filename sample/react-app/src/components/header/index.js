import './index.scss'

// import headerContent from './index.html'
const headerContent = `<div class="draw-action-bar">
<div class="draw-icon-wrap">
    <div class="draw-icon-list">
        <svg
            class="draw-icon pen"
            t="1573031834722"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4617" width="128" height="128"><path d="M79.36 916.48h343.04v51.2H79.36z" fill="" p-id="4618"></path><path d="M550.4 916.48h376.32v51.2H550.4z" fill="" p-id="4619"></path><path d="M629.76 158.72l215.04 215.04L373.76 844.8l-215.04-215.04L629.76 158.72z m0 0" fill="" p-id="4620"></path><path d="M716.8 74.24l215.04 215.04-64 64-215.04-215.04L716.8 74.24z m0 0" p-id="4621"></path><path d="M138.24 652.8l215.04 215.04L51.2 952.32l87.04-299.52z m0 0"  p-id="4622"></path><path  d="M798.72 71.68L931.84 204.8c23.04 23.04 20.48 58.88-2.56 81.92-23.04 23.04-61.44 25.6-81.92 2.56l-133.12-133.12c-23.04-20.48-23.04-58.88 2.56-81.92 23.04-23.04 58.88-25.6 81.92-2.56z m0 0"  p-id="4623"></path></svg>
        
        <svg
            class="draw-icon rubber"
            t="1573032058097"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5340" width="128" height="128"><path d="M604.536246 736.222443l288.794439-282.693148-287.777557-270.999007-270.999007 283.201589z m-72.70705 71.181728L264.389275 539.455809 145.922542 660.973188l164.734856 164.734856a50.844091 50.844091 0 0 0 36.099305 14.744786h107.789474a101.688183 101.688183 0 0 0 71.181728-28.981132z m109.314796 35.082423h254.220457a50.844091 50.844091 0 0 1 0 101.688183H346.248262a152.532274 152.532274 0 0 1-107.789474-44.742801l-164.734856-164.734856a101.688183 101.688183 0 0 1 0-142.363456l457.596823-480.476663a101.688183 101.688183 0 0 1 143.380337-3.559086l287.269117 270.999007a101.688183 101.688183 0 0 1 4.067527 143.888778l-3.050646 3.050646z" p-id="5341"></path></svg>                        
    
        <svg 
            class="draw-icon clear"
            t="1586764437169" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1151" width="128" height="128"><path d="M328.078222 811.747556c12.174222 6.940444 24.519111 13.596444 37.091556 19.911111 57.059556-7.566222 129.137778-36.010667 216.234666-85.276445a12.060444 12.060444 0 0 1 17.066667 15.36c-26.510222 60.586667-50.232889 104.277333-71.111111 131.015111 27.818667 7.395556 56.035556 13.425778 84.423111 18.033778 64.170667-66.161778 99.555556-147.342222 147.512889-308.053333a45.340444 45.340444 0 0 1 86.869333 25.941333c-56.149333 188.017778-98.133333 279.722667-187.847111 363.463111a45.340444 45.340444 0 0 1-37.148444 11.776c-222.151111-30.72-437.248-137.045333-574.407111-318.862222a45.340444 45.340444 0 0 1 33.962666-72.590222c158.492444-7.736889 298.154667-66.56 403.740445-182.044445a45.340444 45.340444 0 0 1 66.901333 61.212445c-102.343111 111.957333-232.220444 178.062222-377.628444 202.069333 14.051556 14.279111 28.728889 27.875556 44.032 40.903111 48.924444 0.398222 114.631111-13.880889 196.949333-42.894222a12.060444 12.060444 0 0 1 13.425778 19.057778c-39.025778 47.729778-72.362667 81.351111-100.124445 100.977778zM951.694222 43.747556c28.956444 16.725333 38.855111 53.646222 22.186667 82.602666l-136.021333 235.52-104.675556-60.416 135.964444-235.52a60.472889 60.472889 0 0 1 82.545778-22.186666zM546.531556 360.96l15.132444-26.168889a60.472889 60.472889 0 0 1 82.545778-22.186667l209.408 120.945778c28.899556 16.668444 38.798222 53.646222 22.129778 82.545778l-15.132445 26.168889a30.208 30.208 0 0 1-41.244444 11.093333L557.624889 402.204444a30.208 30.208 0 0 1-11.093333-41.244444z" p-id="1152"></path></svg>
        
			<svg
				aria-hidden="true"
				height="16"
				viewBox="0 0 16 16"
				version="1.1"
				width="16"
				data-view-component="true"
				class="draw-icon  github"
			>
				<path
					fill-rule="evenodd"
					d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
				></path>
			</svg>
            <svg 
            t="1612517763583" 
            class="draw-icon rect" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3510" width="128" height="128"><path d="M824.8 174.3H199.2c-13.7 0-24.9 11.2-24.9 24.9v625.5c0 13.7 11.2 24.9 24.9 24.9h625.5c13.7 0 24.9-11.2 24.9-24.9V199.2c0.1-13.7-11.1-24.9-24.8-24.9z m-25 625.5H224.2V224.2h575.7v575.6z" p-id="3511" ></path></svg>
			<svg
				 class="draw-icon undo"
				 viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1146" width="128" height="128"><path d="M596.676923 248.123077c204.8 0 372.184615 165.415385 372.184615 372.184615s-167.384615 372.184615-372.184615 372.184616h-161.476923c-15.753846 0-25.6-11.815385-25.6-27.569231v-63.015385c0-15.753846 11.815385-29.538462 27.569231-29.538461h159.507692c139.815385 0 252.061538-112.246154 252.061539-252.061539s-112.246154-252.061538-252.061539-252.061538H322.953846s-15.753846 0-21.661538 1.969231c-15.753846 7.876923-11.815385 19.692308 1.96923 33.476923l96.492308 96.492307c11.815385 11.815385 9.846154 29.538462-1.969231 41.353847L354.461538 584.861538c-11.815385 11.815385-25.6 11.815385-37.415384 1.969231l-256-256c-9.846154-9.846154-9.846154-25.6 0-35.446154L315.076923 41.353846c11.815385-11.815385 31.507692-11.815385 41.353846 0l41.353846 41.353846c11.815385 11.815385 11.815385 31.507692 0 41.353846l-96.492307 96.492308c-11.815385 11.815385-11.815385 25.6 7.876923 25.6h13.784615l273.723077 1.969231z" p-id="1147"></path></svg>
			
			 <svg
				 class="draw-icon redo"
				 viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1882" width="128" height="128"><path d="M699.076923 246.153846h13.784615c19.692308 0 19.692308-13.784615 7.876924-25.6l-96.492308-96.492308c-11.815385-9.846154-11.815385-29.538462 0-41.353846l41.353846-41.353846c9.846154-11.815385 29.538462-11.815385 41.353846 0L960.984615 295.384615c9.846154 9.846154 9.846154 25.6 0 35.446154l-256 256c-11.815385 9.846154-25.6 9.846154-37.415384-1.969231l-43.323077-43.323076c-11.815385-11.815385-13.784615-29.538462-1.969231-41.353847l96.492308-96.492307c13.784615-13.784615 17.723077-25.6 1.969231-33.476923-5.907692-1.969231-21.661538-1.969231-21.661539-1.969231H425.353846c-139.815385 0-252.061538 112.246154-252.061538 252.061538s112.246154 252.061538 252.061538 252.061539h159.507692c15.753846 0 27.569231 13.784615 27.569231 29.538461V964.923077c0 15.753846-9.846154 27.569231-25.6 27.569231h-161.476923C220.553846 992.492308 53.169231 827.076923 53.169231 620.307692s167.384615-372.184615 372.184615-372.184615l273.723077-1.969231z" p-id="1883"></path></svg>
            </div>
            </div>
            
         

	 `
function parseDom(html) {
	let ele = document.createElement('div')
	ele.innerHTML = html
	return ele.childNodes[0]
}
export default class HeaderComponent {
	constructor(props) {
		this.socketInstance = props
		this.html = parseDom(headerContent)
	}

	createEl(el) {
		// console.log()
		el.appendChild(this.html)
	}

	destroy() {
		// console.log('销毁', this.html)
	}

	ready(player) {
		let disappear = this.html.querySelector('.disappear')
		let pen = this.html.querySelector('.pen')
		let rubber = this.html.querySelector('.rubber')
		let clear = this.html.querySelector('.clear')

		let rect = this.html.querySelector('.rect')
		// 撤销
		let undo = this.html.querySelector('.undo')
		let redo = this.html.querySelector('.redo')
		let github = this.html.querySelector('.github')
		github.onclick = () => {
			window.open('https://github.com/Banlangenn/Whiteboard')
		}

		const changeColor = (icon) => {
			const color = player.penColor
			const obj = {
				11: rect,
				2: pen,
				7: rubber,
			}
			Object.values(obj).forEach((e) => {
				e.style.fill = null
			})
			obj[icon].style.fill = color
			console.log(color)
		}

		// let writeIn = this.html.querySelector('.writeIn')

		// const writeInHandle = (e) => {
		//     this.socketInstance.write({ data: 'dataStr', event: 'writeIn' })
		// }

		const setHighlight = (dom, isH) => {
			if (isH) {
				dom.style.fill = player.penColor
				return
			}
			dom.style.fill = null
		}

		// 如果走发布订阅 --  会出现重复- 设置
		const checkHighlight = () => {
			if (player.canUndo) {
				setHighlight(undo, true)
			} else {
				setHighlight(undo, false)
			}

			if (player.canRedo) {
				setHighlight(redo, true)
			} else {
				setHighlight(redo, false)
			}
		}
		player.on('updateModel', () => {
			// 判断现在处于什么状态
			checkHighlight()
		})
		const undoHandle = (e) => {
			// if (!player.canUndo) return
			e.stopPropagation()
			player.focus()
			player.undo()
			checkHighlight()
		}

		const redoHandle = (e) => {
			// if (!player.canRedo) return
			e.stopPropagation()
			player.focus()

			player.redo()
			checkHighlight()
		}

		// console

		//  可以用 空心和实心来 表明能够 清空
		let color = this.html.querySelector('.color')
		let drawList = this.html.querySelector('.draw-icon-list')

		player.on('penColor', (c) => {
			// 判断现在处于什么状态
			if (player.isNormalPen()) {
				pen.style.fill = c
			}
			color.style.fill = c
		})

		pen.style.fill = player.penColor
		// color.style.fill = player.penColor

		// 要把颜色变化-- 通知过来
		const colorHandle = (e) => {
			e.stopPropagation()
			console.log('colorPickerChange 触发', e.type)
			// 手动失去焦点
			player.emit('colorPickerChange')
		}

		//

		const drawStatusHandle = (value) => {
			player.setDrawStatus(value)
			player.focus()
			changeColor(value)
		}

		const clearHandle = (e) => {
			player.focus()
			e.stopPropagation()
			player.clear()
		}

		const stopHandle = (e) => {
			e.stopPropagation()
			e.preventDefault()
		}
		drawList.onmousedown = stopHandle
		drawList.ontouchmove = stopHandle
		drawList.onmouseup = stopHandle
		drawList.onmouseout = stopHandle
		drawList.ontouchend = stopHandle
		drawList.ontouchstart = stopHandle
		drawList.ontouchmove = stopHandle
		drawList.ondblclick = stopHandle
		drawList.onclick = stopHandle

		// DBLCLICK

		//  用pen  会跑两遍 就很离谱
		const isPC = !navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)
		if (isPC) {
			pen.onmousedown = () => {
				drawStatusHandle(2)
			}
			rubber.onmousedown = () => {
				drawStatusHandle(7)
			}
			rect.onmousedown = () => {
				drawStatusHandle(11)
			}
			// disappear.onmousedown = disappearHandle
			color.onmousedown = colorHandle
			clear.onmousedown = clearHandle

			undo.onmousedown = undoHandle
			redo.onmousedown = redoHandle
			return
		}

		pen.ontouchend = () => {
			drawStatusHandle(2)
		}
		rubber.ontouchend = () => {
			drawStatusHandle(7)
		}
		rect.ontouchend = () => {
			drawStatusHandle(11)
		}
		// disappear.ontouchend = disappearHandle
		color.ontouchend = colorHandle
		clear.ontouchend = clearHandle

		undo.ontouchend = undoHandle
		redo.ontouchend = redoHandle

		// // writeIn.ontouchend = writeInHandle
	}
}
