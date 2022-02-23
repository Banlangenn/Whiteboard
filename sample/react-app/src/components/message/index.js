// import './index.scss'

const headerContent = `<div  class="custom-message-wrapper animate__animated animate__backInLeft">
<p class="message__content"></p>
</div>`
function parseDom(html, msg = '') {
	let ele = document.createElement('div')
	ele.innerHTML = html
	// console.dir(ele.querySelector('.message__content'))
	ele.querySelector('.message__content').innerText = msg
	return ele.childNodes[0]
}
let instance
let instances = []
let seed = 1
export default class HeaderComponent {
	constructor(props = {}) {
		this.duration = props.duration || 5000
	}

	createEl(el) {
		this.el = el
	}
	startTimer(id) {
		if (this.duration > 0) {
			this.timer = setTimeout(() => {
				this.close(id)
			}, this.duration)
		}
	}
	ready(player) {
		// console.log('===')
		player.$message = (msg) => {
			instance = {}
			const dom = parseDom(headerContent, msg)
			let verticalOffset = 20
			instances.forEach((item) => {
				verticalOffset += item.offsetHeight + 16
			})
			instance.verticalOffset = verticalOffset
			instance.el = dom
			instance.offsetHeight = 20
			instance.id = 'message_' + seed++
			instances.push({ ...instance })
			instance.el.style.top = verticalOffset + 'px'
			this.el.appendChild(instance.el)
			this.startTimer(instance.id)
			instance = null
		}
	}
	close(id) {
		let len = instances.length
		let index = -1
		let removedHeight
		for (let i = 0; i < len; i++) {
			const instance = instances[i]
			if (id === instance.id) {
				removedHeight = instance.offsetHeight
				index = i
				instances.splice(i, 1)
				instance.el.parentNode.removeChild(instance.el)
				break
			}
		}
		if (len <= 1 || index === -1 || index > instances.length - 1) return
		for (let i = index; i < len - 1; i++) {
			let dom = instances[i].el
			dom.style['top'] =
				parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px'
		}
	}
}
