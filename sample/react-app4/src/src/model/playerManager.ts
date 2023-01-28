/* eslint-disable */
// import Crop, { localTouchEvent, areaParams } from '../index'
//
import { Crop } from '../core'
import { editDataI } from '../render/SymbolCanvasRendener'
import { logger } from '../utils'

export interface playerI {
	originData: originDataI[]
	replayIndex: number
	AFId: number
	isPlay: boolean
	play: (cropRef: Crop) => void
	drag: (cropRef: Crop, timestamp: number) => void
	pause: () => void
	ended: (cropRef: Crop) => void
}

// value  有好几种 --
// changeStatus

// 范围复制 移动 和 删除

export interface changeStatusI {
	name: string
	value: string | number // | areaParams
}

export interface originDataI {
	t: number
	v: editDataI | changeStatusI // | localTouchEvent
}

// 播放
export default function createPlayer(originData: originDataI[] = []): playerI {
	// 我要有个电放保存一些列的状态
	return {
		originData, // 原始数据
		AFId: 0,
		replayIndex: 0,
		isPlay: false, // 拖动的时候 播放 还是暂停 canvas
		// 可以访问this
		play(cropRef: Crop) {
			this.isPlay = true
			// this  是当前对象 没问题
			const len = this.originData.length
			const originData = this.originData
			let replayIndex = this.replayIndex // 会迁入 初始化
			//  直接干到 播放的点
			let originStart = originData[replayIndex].t
			let startTime = 0
			let currentTime = 0

			// -- 有一丢丢问题-- 当前:--窗口不在焦点 =  这个玩意会暂停-
			/**
			 *
			 *  解决办法
			 *  1. 暂停播放
			 *  2. 从新获取焦点后 -- 刷新画布
			 *
			 */
			// const run = (currentTime: number) => {
			//     let data = this.originData[this.replayIndex]
			//     let time = data.t - originStart
			//     if (currentTime >= time) {
			//         // 最后一笔不画 就好了
			//         cropRef.dispatchLocalEvent(data)
			//         this.replayIndex += 1
			//         run(currentTime)
			//     }
			// }

			const step = (stepTimestamp: number) => {
				// logger.debug('流逝的时间：', stepTimestamp, '本地的时间：', Date.now())
				// logger.debug('本地的时间：', new Date(stepTimestamp))
				let data = this.originData[this.replayIndex]
				let time = data.t - originStart // canvas 时间
				// 初始化时间
				if (!startTime) startTime = stepTimestamp
				// 这个时间 走的 比 视频慢
				// 本地时间
				currentTime = stepTimestamp - startTime
				while (currentTime >= time) {
					// 最后一笔不画 就好了
					this.replayIndex += 1
					// cropRef.dispatchLocalEvent(data)
					data = this.originData[this.replayIndex]

					if (!data || !data.t) {
						// 已经结束
						window.cancelAnimationFrame(this.AFId)
						return
					}
					time = data.t - originStart
				}

				// 在试一下递归
				// run(currentTime)
				// ==下标从 0 开始 的时候就是最后一个 不能在往后走了
				if (this.replayIndex >= len - 1) {
					// this.isReplay = false
					return
				}
				this.AFId = window.requestAnimationFrame(step)
			}
			this.AFId = window.requestAnimationFrame(step)

			// 时间流逝和 -- 真正的播放器是同步的
			// 但是=|= 切换屏幕后  requestAnimationFrame  不在刷新了 -- 要用 timeout播放
		},
		pause() {
			this.isPlay = false
			window.cancelAnimationFrame(this.AFId)
		},
		ended(cropRef: Crop) {
			this.isPlay = false
			logger.debug('播放到最后了， 恢复屏幕')
			cropRef.reset()
			this.replayIndex = 0
		},
		drag(cropRef: Crop, timestamp: number) {
			// 怎么就有问题了
			// 可以优化 TODO:
			//  怎么把 渲染关闭了 -- 然后在开启
			//  必须有能够开启关闭渲染的东西-- 然后全部 跑数据 最后一次渲染出来 中间渲染是无意义的
			const originData = this.originData
			const len = originData.length
			// 不应该不存在的
			// logger.warn('this.replayIndex:', this.replayIndex)
			const j = this.replayIndex
			const index = originData[j].t <= timestamp ? j : 0
			const replayIndex = getIndexAndDraw(
				cropRef,
				originData,
				timestamp,
				len,
				index,
			)
			logger.debug(
				'拖动的index为',
				replayIndex,
				'拖动之前为:',
				this.replayIndex,
			)
			this.replayIndex = replayIndex
			window.cancelAnimationFrame(this.AFId)
			// 当前在播放就 播放 当前没有播放就不走
			if (this.isPlay) {
				this.play(cropRef)
			}
		},
	}
}
function getIndexAndDraw(
	cropRef: Crop,
	originData: originDataI[],
	timestamp: number,
	len: number,
	i: number,
): number {
	logger.debug('拖动传入的的i为', i)
	if (i === 0) {
		// 初始化 画布数据
		// cropRef.resetPicture()
		cropRef.clear()
		cropRef.setToWriting()
	}
	let replayIndex = 0
	for (let index = i; index < len; index++) {
		const el = originData[index]
		// cropRef.dispatchLocalEvent(el)
		// const time = el.t - originData[0].t
		if (el.t >= timestamp) {
			replayIndex = index
			break
		}
	}
	// 设置到笔
	// cropRef.clearDisappear() // 清空 消失
	return replayIndex
}
