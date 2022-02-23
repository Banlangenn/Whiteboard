// import _ from 'lodash'
// We need to get the url of the worker (we use min for prod)
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line import/no-webpack-loader-syntax
// import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.min.js'
// eslint-disable-next-line import/no-webpack-loader-syntax
// eslint-disable-next-line @typescript-eslint/no-require-imports
const workerSrc = require('pdfjs-dist/es5/build/pdf.worker.js')
// Use require because import doesn't work for some obscure reason. Also use `webpackChunkName` so it will not bundle this huge lib in your main code
// const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ 'pdfjs-dist')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require('pdfjs-dist/es5/build/pdf.js')


pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
export default class LoadPDFComponent {
    constructor (props) {
        // console.log(props)
        const { url, count = 5, originWidth = undefined, change = () =>{} } = props
        this.change = change
        this.PDFUrl = url
        this.MAXCOUNT = count < 0 ? 3 : count
        this.pdfDoc = null
        this.prePageIndex = 0
        this.scale = 1
        this.contentView = ''
        this.pageIndex = 0
        this.pages = []
        this.pageInfo = {}
        this.originWidth = originWidth
        // this.scrollPdf = _.throttle(this.scrollPdf, 500)
        this.scrollHandle = this.scrollHandle.bind(this)
        this.canvasDoms = [] // 闲置的 canvas
    }

    destroy() {
        // 销毁
        this.pdfContainer.removeEventListener('scroll', this.scrollHandle)
        this.pages = []

        this.canvasDoms.forEach(element => {
            element = null
        })
        this.pages.forEach(element => {
            element = null
        })
        this.canvasDoms = []
        this.pages = []
        this.loadingTask.destroy()
    }

    createEl (canvasContainer, el) {
        this.pdfContainer = el
    }
    getClientCanvas() {
        return this.pages.filter(e => e.dom).map(e => e.dom)
    }
    async ready (Edit) {
        // console.log('loadstart')
        this.crop = Edit
        // 异步 加载
        // console.log(this.PDFUrl, '文件')
        await this.showPDF(this.PDFUrl)
        // console.log('loadend')
        // this.pdfContainer.scrollTop = 200
    }

    async slide({ top = 0, page = 0 }) {
        if (page > 2) {
            top =  (page - 1) *  this.pageInfo.pdfHeight
        } else if (top) {
            const { pageIndex } = this.getPagePosition(top)
            page = pageIndex
        }
        await this.scrollPdf(page)
        this.pdfContainer.scrollTop = top
        this.scrollHandle()
    }

    async showPDF (url) {
        // 只有平移 就会
        // console.log(pdfjsLib)
        const loadingTask = this.loadingTask = pdfjsLib.getDocument(url)

        const pdf = await loadingTask.promise
        this.pdf = pdf
        this.totalPage = pdf.numPages
        this.pages = this.initPages(this.totalPage)
        await this.init(1)
        // console.log('initEnd')
    }

    initPages (totalPage) {
        const pages = []
        for (let i = 0; i < totalPage; i += 1) {
            pages.push({
                pageNo: i + 1,
                // loadStatus: pageLoadStatus.WAIT,
                pdfPage: null,
                dom: null
            })
        }
        return pages
    }

    async generatePage(startIndex, endIndex) {
        for (let i = startIndex; i < endIndex; i++) {
            const page = this.pages[i]
            if (!page) {
                continue
            }
            if (!page.pdfPage) {
                const pdfPage = await this.pdf.getPage(i + 1)
                page.pdfPage = pdfPage
            }
        }
    }

    async init() {
        // 渲染需要多少时间: 477.89501953125ms
        // const time = performance.now()
        await this.generatePage(0, this.MAXCOUNT)
        // const a = await this.generatePage(10)
        // this.pages = await Promise.all(a)
        // console.log('滚动函数消耗时间', performance.now() - time)

        // 获取单页高度
        const pdfWidth = this.pages[0].pdfPage.getViewport({
            scale: 1, // 缩放的比例
            rotation: 0 // 旋转的角度
        }).width

        // 变为 1200
        // this.scale = this.crop.context.width / pdfWidth
        // con
        const width = this.originWidth || this.crop.context.width
        this.scale = width / pdfWidth // * this.crop.context.scale
        const viewport = this.pages[0].pdfPage.getViewport({
            scale: this.scale, // 缩放的比例
            rotation: 0 // 旋转的角度
        })
        const pageInfo = this.pageInfo = {
            pdfWidth: viewport.width,
            pdfHeight: viewport.height,
            totalHeight: this.totalPage * viewport.height,
            totalPage: this.pdf.numPages
        }
        // 记录pdf页面高度 小于10页 就不用动态加载了
        const totalPage = pageInfo.totalPage <= this.MAXCOUNT ? pageInfo.totalPage : this.MAXCOUNT // this.totalPage
        // 为了不让内容太拥挤，我们可以加一些页面间距 PAGE_INTVERVAL
        // 创建内容绘制区，并设置大小
        const contentView = this.contentView = document.createElement('div')
        contentView.style.width = `${pageInfo.pdfWidth}px`
        contentView.style.height = `${pageInfo.pdfHeight * totalPage}px`
        contentView.style.position = 'absolute'
        contentView.style.top = '0'
        // position: absolute;
        // top: 0;

        // const pdfContainer = this.pdfContainer = document.querySelector('.edit-container')
        this.pdfContainer.appendChild(contentView)
        // console.log('创建完成----')
        await this.scrollPdf(1)
        // console.log('scrollPdfEnd')
        this.pdfContainer.addEventListener('scroll', this.scrollHandle)
        // this.pdfContainer
    }

    async scrollHandle() {
        const time = performance.now()
        const { pageIndex, scrollTop } = this.getPagePosition()
        // 大于10页 才要滚动渲染
        // pageIndex 修改了才需要重新渲染页面
        if (pageIndex !== this.prePageIndex) {
            this.crop.$message(`第  ${pageIndex} / ${ this.totalPage }  页`)
            this.change({ pageIndex, scrollTop, ...this.pageInfo})
            this.prePageIndex = pageIndex
            if (this.pageInfo.totalPage > this.MAXCOUNT) {
                try {
                    await this.scrollPdf(pageIndex)
                } catch (error) {
                    console.log(error)
                }
            }
        }
        await this.crop.translateRender({ x: 0, y: scrollTop })
      
        // console.log('滚动函数消耗时间', performance.now() - time, '毫秒.')
    }

    async scrollToPages(index) {
        let pageIndex = index
        if (pageIndex < 0) {
            pageIndex = 0
        } else if (pageIndex > this.pageInfo.totalPage) {
            pageIndex = this.pageInfo.totalPage
        }
        const pdfContainer = this.pdfContainer
        const clientHeight = pdfContainer.clientHeight
        this.pdfContainer.scrollTop = (this.pageInfo.pdfHeight * (pageIndex - 1)) //  + (clientHeight / 3)
        await this.scrollPdf(pageIndex)
    }

    getPagePosition(st) {
        const pdfContainer = this.pdfContainer
        const scrollTop = st || pdfContainer.scrollTop // 滚动距离
        const clientHeight = pdfContainer.clientHeight
        // // 根据内容可视区域中心点计算页码, 没有滚动时，指向第一页
        // console.log(scrollTop, 'scrollTopscrollTopscrollTop', scrollTopD)
        // console.log('pageIndexpageIndexpageIndexpageIndex', pageIndex)
        const currentHeightMiddle = (scrollTop + (clientHeight / 2))
        const pageIndex = scrollTop > 0
            ? Math.ceil(currentHeightMiddle / this.pageInfo.pdfHeight)
            : 1
        return {
            pageIndex,
            scrollTop,
        }
    }
    async scrollPdf(pageIndex) {
        // this.loadBefore(pageIndex);
        await this.renderPages(pageIndex)
    }

    createCanvas(pageSize, pageNo) {
        // 创建渲染的dom
        if (this.canvasDoms.length !== 0) {
            const canvas = this.canvasDoms.pop()
            canvas.style.webkitTransform = `translate3d(0, ${((pageNo - 1) * (pageSize.height))}px, 0)`
            return canvas
        }
        const canvas = document.createElement('canvas')
        canvas.height = pageSize.height
        canvas.width = pageSize.width
        canvas.style.position = 'absolute'
        canvas.style.left = '0'
        canvas.style.webkitTransform = `translate3d(0, ${((pageNo - 1) * (pageSize.height))}px, 0)`
        canvas.style.width = `${pageSize.width}px`
        canvas.style.height = `${pageSize.height}px`
        const { pixelRatio } = this.crop.context
        canvas.width = pageSize.width * pixelRatio
        canvas.height = pageSize.height * pixelRatio
        canvas.getContext('2d').scale(pixelRatio, pixelRatio)
        // logger.debug('canvas size changed', canvas)
        return canvas
    }
    renderPageContent (page) {
        const scale = this.scale
        const rotation = 0
        // const pageSize = this.pageSize
        const { pdfPage, pageNo, dom } = page
        // dom 元素已存在，无须重新渲染，直接返回
        if (dom) {
            return
        }
        const viewport = pdfPage.getViewport({
            scale: scale,
            rotation: rotation
        })
        const canvas = this.createCanvas({
            height: this.pageInfo.pdfHeight,
            width: this.pageInfo.pdfWidth
        }, pageNo)
        // console.log('createCanvasEnd')
        const context = canvas.getContext('2d')
        // 渲染内容
        pdfPage.render({
            canvasContext: context,
            viewport
        })
        page.dom = canvas
        this.contentView.appendChild(canvas)
    }
    // 首先我们获取到需要渲染的范围
    // 根据当前的可视范围内的页码，我们前后只保留 10 页
    getRenderScope (pageIndex) {
        const pagesToRender = []
        let i = pageIndex - 1
        let j = pageIndex + 1
        const COUNT = this.MAXCOUNT
        pagesToRender.push(this.pages[pageIndex - 1])
        // console.log(pageIndex, 'pageIndexpageIndex')
        while (pagesToRender.length < COUNT && pagesToRender.length < this.pages.length) {
            if (i > 0) {
                // console.log('i' ,  i - 1)
                pagesToRender.push(this.pages[i - 1])
                i -= 1
            }
            if (pagesToRender.length >= COUNT) {
                break
            }
            if (j <= this.pages.length) {
                pagesToRender.push(this.pages[j - 1])
                j += 1
            }
        }
        return {
            pageIndex,
            pagesToRender,
            min: i,
            max: j
        }
        // 直接把当前的index 发进去
        // for (let index = 0; index < 5; index++) {
        //     const element = this.pages[pageIndex + index]
        //     pagesToRender.push(element)
        // }
        // return pagesToRender
    }
    // 渲染需要展示的页面，不需展示的页码将其清除
    async renderPages (pageIndex) {
        // 可以直接把当前的加进去
        const {
            pagesToRender,
            min,
            max
        } = this.getRenderScope(pageIndex)
        await this.generatePage(min, max)
        // console.log('generatePageEnd')
        for (const i of this.pages) {
            if (pagesToRender.includes(i)) {
                this.renderPageContent(i)
                // i.loadStatus === pageLoadStatus.LOADED ?
                //     this.renderPageContent(i) :
                //     this.renderPageLoading(i);
            } else {
                this.clearPage(i)
            }
        }
    }
    // 清除页面 dom
    clearPage (page) {
        // console.log(this.pages)
        if (page.dom) {
            const canvasDom = this.contentView.removeChild(page.dom)
            page.pdfPage = null
            page.dom = null
            //  建一个dom池  可以复用dom设置偏移量
            this.canvasDoms.unshift(canvasDom)
        }
    }
}
