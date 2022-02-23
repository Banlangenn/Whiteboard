export function parseDom(html: string): any {
	let ele = document.createElement('div')
	ele.innerHTML = html
	return ele.childNodes[0]
}

export function addEvent(
	el: HTMLElement,
	type: string,
	fn: EventListenerOrEventListenerObject,
	capture?: AddEventListenerOptions,
) {
	el.addEventListener(type, fn, {
		passive: false,
		capture: !!capture,
	})
}

export function removeEvent(
	el: HTMLElement,
	type: string,
	fn: EventListenerOrEventListenerObject,
	capture?: EventListenerOptions,
) {
	el.removeEventListener(type, fn, {
		capture: !!capture,
	})
}
