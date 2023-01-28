// 插入图片 --

export function createImage(
	container: HTMLElement,
	src: string,
	isShow: boolean,
	zIndex: string,
	width?: number,
	height?: number,
) {
	const imgDom = document.createElement('img')
	imgDom.src = src
	imgDom.style.position = 'absolute'
	if (width) {
		imgDom.style.width = width + 'px'
		imgDom.style.height = height + 'px'
	}
	imgDom.style.left = 10 + 'px'
	imgDom.style.top = 10 + 'px'
	imgDom.style.display = isShow ? 'block' : 'none'
	imgDom.style.zIndex = zIndex

	// 先准备-- 在渲染
	container.append(imgDom)
	return imgDom
}
export function domShow(dom: HTMLElement) {
	if (dom.style.display === 'block') return
	dom.style.display = 'block'
}

export function domHide(dom: HTMLElement) {
	if (dom.style.display === 'none') return
	dom.style.display = 'none'
}

export function domMove(dom: HTMLElement, x: number, y: number) {
	dom.style.left = x + 'px'
	dom.style.top = y + 'px'
}
