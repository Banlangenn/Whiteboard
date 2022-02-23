import './index.scss'

const headerContent = `<div style="display: none;" class="custom-loading-wrapper  edit-com-loading">
<div class="custom-loading">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
</div>
</div>`
function parseDom(html) {
	let ele = document.createElement('div')
	ele.innerHTML = html
	return ele.childNodes[0]
}
export default class HeaderComponent {
	constructor(props) {
		this.props = props
		this.html = parseDom(headerContent)
	}

	createEl(el) {
		el.appendChild(this.html)
	}
	ready(edit) {
		edit.showLoading = () => {
			this.html.style.display = 'flex'
		}
		edit.hideLoading = () => {
			this.html.style.display = 'none'
		}

		if (this.props.show) {
			edit.showLoading()
		}
		const stopHandle = (e) => {
			e.stopPropagation()
		}
		const dom = document.querySelector('.edit-com-loading')

		dom.onmousedown = stopHandle
		dom.ontouchmove = stopHandle
		dom.onmouseup = stopHandle
		dom.onmouseout = stopHandle
		dom.ontouchend = stopHandle
		dom.ontouchstart = stopHandle
		dom.ontouchmove = stopHandle
	}
}
