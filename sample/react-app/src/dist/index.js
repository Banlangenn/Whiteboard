const noop = function (val) { };
class Logger {
    constructor() {
        this.logMethods = ['trace', 'debug', 'info', 'warn', 'error'];
        this.levels = {
            TRACE: 0,
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4,
            SILENT: 5,
        };
    }
    trace(...arg) { }
    debug(...arg) { }
    info(...arg) { }
    warn(...arg) { }
    error(...arg) { }
    enableAll() {
        this.setLevel(this.levels.TRACE);
    }
    disableAll() {
        this.setLevel(this.levels.SILENT);
    }
    setLevel(levelGrade) {
        const levels = this.levels;
        let level = levelGrade;
        if (typeof level === 'string' &&
            levels[level.toUpperCase()] !== undefined) {
            level = levels[level.toUpperCase()];
        }
        if (typeof level === 'number' && level >= 0 && level <= levels.SILENT) {
            for (let i = 0; i < this.logMethods.length; i++) {
                let methodName = this.logMethods[i];
                this[methodName] =
                    i < level ? noop : this.realMethod(methodName);
            }
            if (typeof console === undefined && level < levels.SILENT) {
                return 'No console available for logging';
            }
        }
        else {
            throw new Error('log.setLevel() called with invalid level: ' + level);
        }
    }
    realMethod(name) {
        let methodName = name;
        if (methodName === 'debug' || methodName === 'trace') {
            methodName = 'log';
        }
        if (typeof console === undefined) {
            return false;
        }
        else if (console[methodName] !== undefined) {
            return console[methodName].bind(console);
        }
        else if (console.log !== undefined) {
            return console.log.bind(console);
        }
        else {
            return noop;
        }
    }
}
var Logger$1 = Logger;

new Logger$1();
function computeMaxArea(originScreen, currentScreen, filledType = 'auto') {
    const { width: clientW, height: clientH } = currentScreen;
    const { width, height } = originScreen;
    let currentW;
    let currentH;
    let scale;
    let filled;
    const clientAspectRatio = clientH / clientW;
    const aspectRatio = height / width;
    if (filledType === 'width' ||
        (filledType === 'auto' && clientAspectRatio < aspectRatio)) {
        currentW = width;
        scale = clientW / width;
        currentH = currentW * clientAspectRatio;
        filled = 'width';
    }
    else {
        currentH = height;
        scale = clientH / height;
        currentW = currentH * (clientW / clientH);
        filled = 'height';
    }
    return {
        x: filled === 'width' ? 0 : (originScreen.width - currentW) / 2,
        y: filled === 'height' ? 0 : (originScreen.height - currentH) / 2,
        width: currentW,
        height: currentH,
        scale,
        filled,
    };
}
function computeScreen(originScreen, currentScreen, filledType = 'auto') {
    const { width: clientW, height: clientH } = currentScreen;
    const { width, height } = originScreen;
    let scale;
    let filled;
    if (filledType === 'width' ||
        (filledType === 'auto' && clientH / clientW > height / width)) {
        scale = clientW / width;
        filled = 'width';
    }
    else {
        scale = clientH / height;
        filled = 'height';
    }
    const baseProperty = {
        transform: 'scale(' + scale + ')',
        'transform-origin': '0 0',
        width: width + 'px',
        height: height + 'px',
        position: 'relative',
    };
    const styleProperty = filled === 'width'
        ? {
            ...baseProperty,
            top: '50%',
            transform: `translate(0, ${-((height * scale) / 2)}px) ${baseProperty.transform}`,
            left: 0,
        }
        : {
            ...baseProperty,
            left: '50%',
            transform: `translate(${-((width * scale) / 2)}px, 0) ${baseProperty.transform}`,
            top: 0,
        };
    return {
        styleProperty,
        scale,
        filled,
    };
}
function getInt(num) {
    let rounded;
    rounded = (0.5 + num) | 0;
    rounded = ~~(0.5 + num);
    rounded = (0.5 + num) << 0;
    if (rounded < 0) {
        rounded -= 1;
    }
    return rounded;
}
function limit(value, min, max) {
    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }
    return value;
}
function getDistance(p1, p2) {
    const x = p2.x - p1.x;
    const y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
}
function distanceOfPoint2Line(p1, p2, { x, y }) {
    const A = x - p1.x;
    const B = y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0)
        param = dot / len_sq;
    let xx;
    let yy;
    if (param < 0) {
        xx = p1.x;
        yy = p1.y;
    }
    else if (param > 1) {
        xx = p2.x;
        yy = p2.y;
    }
    else {
        xx = p1.x + param * C;
        yy = p1.y + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
function rectCheckCrashPoint(a, p) {
    if (a.maxX > p.x && a.minX < p.x && a.maxY > p.y && a.minY < p.y) {
        return true;
    }
    return false;
}
function rectCheckCrash(a, b) {
    if (a.maxX > b.minX &&
        a.minX < b.maxX &&
        a.maxY > b.minY &&
        a.minY < b.maxY) {
        return true;
    }
    return false;
}
function rectContainLine(a, b) {
    if (b.maxX > a.maxX &&
        b.maxY > a.maxY &&
        b.minX < a.minX &&
        b.minY < a.minY) {
        return true;
    }
    return false;
}
function extractPoint({ clientX, clientY }, { scale, width, height, left, top }, translatePosition, limitVal) {
    const boundary = 2;
    const limitValue = limitVal || {
        maxX: width - boundary,
        maxY: height - boundary,
        minX: boundary,
        minY: boundary,
    };
    const coordinate = {
        x: limit(getInt((clientX - left) / scale), limitValue.minX, limitValue.maxX),
        y: limit(getInt((clientY - top) / scale), limitValue.minY, limitValue.maxY),
        t: Date.now(),
    };
    if (translatePosition) {
        coordinate.x = getInt(coordinate.x + translatePosition.x);
        coordinate.y = getInt(coordinate.y + translatePosition.y);
    }
    return coordinate;
}
function getPointsLimitValue(points, threshold = 0) {
    let x = [];
    let y = [];
    if (Array.isArray(points)) {
        for (const item of points) {
            x.push(item.x);
            y.push(item.y);
        }
    }
    else {
        x = points.x;
        y = points.y;
    }
    return {
        minX: Math.min(...x) - threshold,
        minY: Math.min(...y) - threshold,
        maxX: Math.max(...x) + threshold,
        maxY: Math.max(...y) + threshold,
    };
}
function getRectLimitValue(point, width, height, threshold = 0) {
    return {
        minX: point.x - threshold,
        minY: point.y - threshold,
        maxX: point.x + width + threshold,
        maxY: point.y + height + threshold,
    };
}
function getLimit2Rect(limitVal) {
    return {
        x: limitVal.minX,
        y: limitVal.minY,
        width: limitVal.maxX - limitVal.minX,
        height: limitVal.maxY - limitVal.minY,
    };
}
function points2Rect(p1, p2) {
    return {
        x: Math.min(p1.x, p2.x),
        y: Math.min(p1.y, p2.y),
        width: Math.abs(p1.x - p2.x),
        height: Math.abs(p1.y - p2.y),
    };
}
function getRectangularVertex(limitValue) {
    return [
        { x: limitValue.minX, y: limitValue.minY },
        { x: limitValue.maxX, y: limitValue.minY },
        { x: limitValue.maxX, y: limitValue.maxY },
        { x: limitValue.minX, y: limitValue.maxY },
    ];
}
function drawAttributeInit(context, color, width, isDash = false) {
    if (context.strokeStyle !== color) {
        context.strokeStyle = color;
    }
    if (context.fillStyle !== color) {
        context.fillStyle = color;
    }
    if (context.lineWidth !== width) {
        context.lineWidth = width;
    }
    const lineDash = context.getLineDash();
    if (isDash) {
        if (lineDash.length === 0) {
            context.setLineDash([5, 10]);
        }
    }
    else {
        if (lineDash.length !== 0) {
            context.setLineDash([]);
        }
    }
}
function getMidpoint(p1, p2) {
    return { x: getInt((p1.x + p2.x) / 2), y: getInt((p1.y + p2.y) / 2) };
}
function createImage(url) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.setAttribute('crossOrigin', 'anonymous');
    return new Promise((resolve, reject) => {
        img.onload = function () {
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}
async function loadImage(url) {
    if (typeof url === 'string') {
        return createImage(url);
    }
    else {
        const newImg = url.map((u) => createImage(u));
        const result = await Promise.all(newImg);
        return result;
    }
}
class EventHub {
    constructor(type) {
        this.cache = {};
        this.eventTypes = {};
        if (type) {
            this.registerType(type);
        }
    }
    registerType(types) {
        (Array.isArray(types) ? types : [types]).forEach((type) => {
            this.eventTypes[type] = type;
        });
    }
    destroy() {
        this.cache = {};
        this.eventTypes = {};
    }
    on(eventType, fn) {
        this.hasType(eventType);
        if (!fn) {
            return;
        }
        this.cache[eventType] = this.cache[eventType] || [];
        this.cache[eventType].push(fn);
    }
    emit(eventType, ...args) {
        if (!this.cache[eventType])
            return;
        this.cache[eventType].forEach((fn) => fn.apply(this, args));
    }
    once(eventType, fn) {
        const wrapper = (...args) => {
            fn.apply(this, args);
            this.off(eventType, wrapper);
        };
        this.on(eventType, wrapper);
    }
    off(eventType, fn) {
        if (!eventType) {
            this.cache = {};
            return;
        }
        if (!fn) {
            this.hasType(eventType);
            delete this.cache[eventType];
            return;
        }
        const eventArray = [...this.cache[eventType]];
        let index = indexOf(eventArray, fn);
        if (index !== -1) {
            eventArray.splice(index, 1);
            this.cache[eventType] = eventArray;
        }
    }
    hasType(type) {
        const types = this.eventTypes;
        const isType = types[type] === type;
        if (!isType) {
            throw new TypeError(`事件没有注册: "${type}", 当前事件 [${Object.keys(types).map((_) => JSON.stringify(_))}]`);
        }
    }
}
function indexOf(array, item) {
    if (array === undefined)
        return -1;
    let index = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            index = i;
            break;
        }
    }
    return index;
}
const nanoid = (size = 21) => {
    let sizeRef = size;
    let id = '';
    let bytes = crypto.getRandomValues(new Uint8Array(size));
    while (sizeRef--) {
        let byte = bytes[sizeRef] & 63;
        if (byte < 36) {
            id += byte.toString(36);
        }
        else if (byte < 62) {
            id += (byte - 26).toString(36).toUpperCase();
        }
        else if (byte < 63) {
            id += '_';
        }
        else {
            id += '-';
        }
    }
    return id;
};
class Random {
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        if (this.seed) {
            this.seed = Math.imul(48271, this.seed);
            return ((2 ** 31 - 1) & this.seed) / 2 ** 31;
        }
        else {
            return Math.random();
        }
    }
}
let random = new Random(Date.now());
const randomInteger = () => Math.floor(random.next() * 2 ** 31);
function cloneDeep(parent) {
    const _clone = (parent) => {
        if (parent === null)
            return null;
        if (typeof parent !== 'object')
            return parent;
        let child;
        if (Array.isArray(parent)) {
            child = [];
        }
        else {
            child = {};
        }
        for (let i in parent) {
            if ({}.hasOwnProperty.call(parent, i)) {
                if (parent[i] instanceof Path2D) {
                    child[i] = new Path2D(parent[i]);
                }
                else {
                    child[i] = _clone(parent[i]);
                }
            }
        }
        return child;
    };
    return _clone(parent);
}

function getPointByIndex$1(stroke, index) {
    return {
        x: stroke.xs[index],
        y: stroke.ys[index],
        t: stroke.t[index],
        p: stroke.p[index],
        l: stroke.l ? stroke.l[index] : 0,
    };
}
function fnAfter(context, fn, afterFn) {
    return function (...arg) {
        const ret = fn.apply(context, arg);
        afterFn.apply(context, arg);
        return ret;
    };
}
class BaseShape {
    constructor() {
        this.appendPointCallTimes = 0;
        this.disabled = false;
        this.threshold = 4;
        this.transformHandles = {};
        this.limitValue = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
        };
        this._isEdit = false;
        const originAppendPoint = this.appendPoint;
        this.appendPoint = fnAfter(this, originAppendPoint, () => {
            this.appendPointCallTimes += 1;
        });
        this.initPending = fnAfter(this, this.initPending, () => {
            this.appendPointCallTimes = 0;
        });
        this.endPendingPoint = fnAfter(this, this.endPendingPoint, (ctx, p, events) => {
            var _a, _b;
            if ((this.available && !((_a = this.data) === null || _a === void 0 ? void 0 : _a.text)) ||
                ((_b = this.data) === null || _b === void 0 ? void 0 : _b.text) !== this.prevText) {
                this.data.versionNonce = randomInteger();
                this.data.version += 1;
                events.emit('pushEntry', this);
            }
        });
    }
    get available() {
        return this.appendPointCallTimes > 2;
    }
    get isEdit() {
        return this._isEdit;
    }
    drawAttributeInit(context) {
        const { color, lineWidth, isDash, fillColor, opacity = 1 } = this.data;
        if (color && context.strokeStyle !== color) {
            context.strokeStyle = color;
        }
        const FC = fillColor || color;
        if (FC && context.fillStyle !== FC) {
            context.fillStyle = FC;
        }
        if (lineWidth && context.lineWidth !== lineWidth) {
            context.lineWidth = lineWidth;
        }
        if (context.globalAlpha !== opacity) {
            context.globalAlpha = opacity;
        }
        const lineDash = context.getLineDash();
        if (isDash) {
            if (lineDash.length === 0) {
                const dashWidth = 8;
                const spaceWidth = 4;
                context.setLineDash([dashWidth, spaceWidth]);
            }
        }
        else {
            if (lineDash.length !== 0) {
                context.setLineDash([]);
            }
        }
    }
    setEditStatus(b) {
        this._isEdit = b;
    }
    setDisabledStatus(b) {
        this.disabled = b;
    }
    setData(data) {
        this.data = {
            ...this.data,
            ...data,
        };
        return this;
    }
    getData() {
        return this.data;
    }
    initLimitValue() {
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
        };
    }
    isClientVisible(lm) {
        return rectCheckCrash(this.limitValue, lm);
    }
    getTransformHandles(limit, angle, omitSides = {}) {
        const ROTATION_RESIZE_HANDLE_GAP = 16;
        const transformHandleSizes = {
            mouse: 8,
            pen: 16,
            touch: 28,
        };
        const size = transformHandleSizes.mouse;
        const zoom = {
            value: 1,
        };
        const handleWidth = size / zoom.value;
        const handleHeight = size / zoom.value;
        const handleMarginX = size / zoom.value;
        const handleMarginY = size / zoom.value;
        const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = limit;
        const width = x2 - x1;
        const height = y2 - y1;
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const dashedLineMargin = 0 / zoom.value;
        const centeringOffset = (size - 8) / (2 * zoom.value);
        const transformHandles = {
            nw: omitSides.nw
                ? undefined
                : generateTransformHandle(x1 - dashedLineMargin - handleMarginX + centeringOffset, y1 - dashedLineMargin - handleMarginY + centeringOffset, handleWidth, handleHeight, cx, cy, angle),
            ne: omitSides.ne
                ? undefined
                : generateTransformHandle(x2 + dashedLineMargin - centeringOffset, y1 - dashedLineMargin - handleMarginY + centeringOffset, handleWidth, handleHeight, cx, cy, angle),
            sw: omitSides.sw
                ? undefined
                : generateTransformHandle(x1 - dashedLineMargin - handleMarginX + centeringOffset, y2 + dashedLineMargin - centeringOffset, handleWidth, handleHeight, cx, cy, angle),
            se: omitSides.se
                ? undefined
                : generateTransformHandle(x2 + dashedLineMargin - centeringOffset, y2 + dashedLineMargin - centeringOffset, handleWidth, handleHeight, cx, cy, angle),
            rotation: omitSides.rotation
                ? undefined
                : generateTransformHandle(x1 + width / 2 - handleWidth / 2, y1 -
                    dashedLineMargin -
                    handleMarginY +
                    centeringOffset -
                    ROTATION_RESIZE_HANDLE_GAP / zoom.value, handleWidth, handleHeight, cx, cy, angle),
        };
        const minimumSizeForEightHandles = (5 * transformHandleSizes.mouse) / zoom.value;
        if (Math.abs(width) > minimumSizeForEightHandles) {
            if (!omitSides.n) {
                transformHandles.n = generateTransformHandle(x1 + width / 2 - handleWidth / 2, y1 - dashedLineMargin - handleMarginY + centeringOffset, handleWidth, handleHeight, cx, cy, angle);
            }
            if (!omitSides.s) {
                transformHandles.s = generateTransformHandle(x1 + width / 2 - handleWidth / 2, y2 + dashedLineMargin - centeringOffset, handleWidth, handleHeight, cx, cy, angle);
            }
        }
        if (Math.abs(height) > minimumSizeForEightHandles) {
            if (!omitSides.w) {
                transformHandles.w = generateTransformHandle(x1 - dashedLineMargin - handleMarginX + centeringOffset, y1 + height / 2 - handleHeight / 2, handleWidth, handleHeight, cx, cy, angle);
            }
            if (!omitSides.e) {
                transformHandles.e = generateTransformHandle(x2 + dashedLineMargin - centeringOffset, y1 + height / 2 - handleHeight / 2, handleWidth, handleHeight, cx, cy, angle);
            }
        }
        return transformHandles;
    }
    renderTransformHandles(context, transformHandles, angle) {
        Object.keys(transformHandles).forEach((key) => {
            const zoomValue = 1;
            const lineDash = context.getLineDash();
            if (lineDash.length !== 0) {
                context.setLineDash([]);
            }
            const transformHandle = transformHandles[key];
            if (transformHandle !== undefined) {
                const lineWidth = context.lineWidth;
                context.lineWidth = 1 / zoomValue;
                const { x, y, width, height } = transformHandle;
                if (key === 'rotation') {
                    fillCircle(context, x + width / 2, y + height / 2, width / 2);
                }
                else {
                    strokeRectWithRotation(context, x, y, width, height, x + width / 2, y + height / 2, angle, true);
                }
                context.lineWidth = lineWidth;
            }
        });
    }
    resizeTest(p, th) {
        const { rotation: rotationTransformHandle, ...transformHandles } = th;
        const { x, y } = p;
        if (rotationTransformHandle &&
            isInsideTransformHandle(rotationTransformHandle, x, y)) {
            return 'rotation';
        }
        const filter = Object.keys(transformHandles).find((key) => {
            const transformHandle = transformHandles[key];
            if (!transformHandle) {
                return false;
            }
            return isInsideTransformHandle(transformHandle, x, y);
        });
        if (filter) {
            return filter;
        }
        return false;
    }
}
BaseShape.cache = false;
const generateTransformHandle = (x, y, width, height, cx, cy, angle) => {
    const { x: xx, y: yy } = rotate(x + width / 2, y + height / 2, cx, cy, angle);
    return {
        x: xx - width / 2,
        y: yy - height / 2,
        width,
        height,
    };
};
const rotate = (x1, y1, x2, y2, angle) => ({
    x: (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    y: (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
});
const rotatePoint = (point, center, angle) => rotate(point.x, point.y, center.x, center.y, angle);
const fillCircle = (context, cx, cy, radius) => {
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
};
const strokeRectWithRotation = (context, x, y, width, height, cx, cy, angle, fill = false) => {
    context.translate(cx, cy);
    context.rotate(angle);
    if (fill) {
        context.fillStyle = '#fff';
        context.fillRect(x - cx, y - cy, width, height);
    }
    context.strokeRect(x - cx, y - cy, width, height);
    context.rotate(-angle);
    context.translate(-cx, -cy);
};
const isInsideTransformHandle = (transformHandle, xx, yy) => {
    const { x, y, width, height } = transformHandle;
    return xx >= x && xx <= x + width && yy >= y && yy <= y + height;
};
function dragElements(pointerDownState, element, pointer) {
    const dragDistanceX = pointerDownState.startPoint.x - pointer.x;
    const dragDistanceY = pointerDownState.startPoint.y - pointer.y;
    element.setData({
        x: pointerDownState.minX - dragDistanceX,
        y: pointerDownState.minY - dragDistanceY,
    });
}
const normalizeAngle = (angle) => {
    if (angle >= 2 * Math.PI) {
        return angle - 2 * Math.PI;
    }
    return angle;
};
const SHIFT_LOCKING_ANGLE = Math.PI / 12;
const rotateSingleElement = (pointerDownState, element, pointer, isRotateWithDiscreteAngle) => {
    const { minX, minY, maxX, maxY } = pointerDownState;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    let angle = (5 * Math.PI) / 2 + Math.atan2(pointer.y - cy, pointer.x - cx);
    if (isRotateWithDiscreteAngle) {
        angle += SHIFT_LOCKING_ANGLE / 2;
        angle -= angle % SHIFT_LOCKING_ANGLE;
    }
    angle = normalizeAngle(angle);
    element.setData({
        angle,
    });
};
function transformElements(pointerDownState, element, shouldKeepSidesRatio, transformHandleType, isResizeFromCenter, pointer, isRotateWithDiscreteAngle = false) {
    if (transformHandleType === 'rotation') {
        rotateSingleElement(pointerDownState, element, pointer, isRotateWithDiscreteAngle);
    }
    else if (transformHandleType) {
        resizeShapeElement(pointerDownState, element, shouldKeepSidesRatio, transformHandleType, isResizeFromCenter, pointer);
    }
}
function resizeShapeElement(pointerDownState, element, shouldKeepSidesRatio, transformHandleDirection, isResizeFromCenter, pointer) {
    const { minX: x, minY: y, maxX, maxY, angle = 0 } = pointerDownState;
    const startTopLeft = {
        x,
        y,
    };
    const startBottomRight = {
        x: maxX,
        y: maxY,
    };
    const startCenter = getMidpoint(startTopLeft, startBottomRight);
    const width = maxX - x;
    const height = maxY - y;
    let newWidth = width;
    let newHeight = height;
    const rotatedPointer = rotatePoint(pointer, startCenter, -angle);
    if (transformHandleDirection.includes('e')) {
        newWidth = rotatedPointer.x - startTopLeft.x;
    }
    if (transformHandleDirection.includes('s')) {
        newHeight = rotatedPointer.y - startTopLeft.y;
    }
    if (transformHandleDirection.includes('w')) {
        newWidth = startBottomRight.x - rotatedPointer.x;
    }
    if (transformHandleDirection.includes('n')) {
        newHeight = startBottomRight.y - rotatedPointer.y;
    }
    if (isResizeFromCenter) {
        newWidth = 2 * newWidth - width;
        newHeight = 2 * newHeight - height;
    }
    if (shouldKeepSidesRatio) {
        const widthRatio = Math.abs(newWidth) / width;
        const heightRatio = Math.abs(newHeight) / height;
        if (transformHandleDirection.length === 1) {
            newHeight *= widthRatio;
            newWidth *= heightRatio;
        }
        if (transformHandleDirection.length === 2) {
            const ratio = Math.max(widthRatio, heightRatio);
            newWidth = width * ratio * Math.sign(newWidth);
            newHeight = height * ratio * Math.sign(newHeight);
        }
    }
    let newTopLeft = startTopLeft;
    if (['n', 'w', 'nw'].includes(transformHandleDirection)) {
        newTopLeft = {
            x: startBottomRight.x - Math.abs(newWidth),
            y: startBottomRight.y - Math.abs(newHeight),
        };
    }
    if (transformHandleDirection === 'ne') {
        const bottomLeft = {
            x: x,
            y: y + height,
        };
        newTopLeft = {
            x: bottomLeft.x,
            y: bottomLeft.y - Math.abs(newHeight),
        };
    }
    if (transformHandleDirection === 'sw') {
        const topRight = {
            x: x + width,
            y: y,
        };
        newTopLeft = {
            x: topRight.x - Math.abs(newWidth),
            y: topRight.y,
        };
    }
    if (shouldKeepSidesRatio) {
        if (['s', 'n'].includes(transformHandleDirection)) {
            newTopLeft.x = startCenter.x - newWidth / 2;
        }
        if (['e', 'w'].includes(transformHandleDirection)) {
            newTopLeft.y = startCenter.y - newHeight / 2;
        }
    }
    if (newWidth < 0) {
        if (transformHandleDirection.includes('e')) {
            newTopLeft.x -= Math.abs(newWidth);
        }
        if (transformHandleDirection.includes('w')) {
            newTopLeft.x += Math.abs(newWidth);
        }
    }
    if (newHeight < 0) {
        if (transformHandleDirection.includes('s')) {
            newTopLeft.y -= Math.abs(newHeight);
        }
        if (transformHandleDirection.includes('n')) {
            newTopLeft.y += Math.abs(newHeight);
        }
    }
    if (isResizeFromCenter) {
        newTopLeft.x = startCenter.x - Math.abs(newWidth) / 2;
        newTopLeft.y = startCenter.y - Math.abs(newHeight) / 2;
    }
    const rotatedTopLeft = rotatePoint(newTopLeft, startCenter, angle);
    const newCenter = {
        x: newTopLeft.x + Math.abs(newWidth) / 2,
        y: newTopLeft.y + Math.abs(newHeight) / 2,
    };
    const rotatedNewCenter = rotatePoint(newCenter, startCenter, angle);
    newTopLeft = rotatePoint(rotatedTopLeft, rotatedNewCenter, -angle);
    const resizedElement = {
        width: Math.abs(newWidth),
        height: Math.abs(newHeight),
        ...newTopLeft,
    };
    element.setData(resizedElement);
}
const getResizeOffsetXY = (transformHandleType, selectedElement, pointer) => {
    const { x: x1, y: y1, width, height } = selectedElement.data;
    const x2 = x1 + width;
    const y2 = y1 + height;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const angle = selectedElement.data.angle || 0;
    const { x, y } = rotate(pointer.x, pointer.y, cx, cy, -angle);
    switch (transformHandleType) {
        case 'n':
            return rotate(x - (x1 + x2) / 2, y - y1, 0, 0, angle);
        case 's':
            return rotate(x - (x1 + x2) / 2, y - y2, 0, 0, angle);
        case 'w':
            return rotate(x - x1, y - (y1 + y2) / 2, 0, 0, angle);
        case 'e':
            return rotate(x - x2, y - (y1 + y2) / 2, 0, 0, angle);
        case 'nw':
            return rotate(x - x1, y - y1, 0, 0, angle);
        case 'ne':
            return rotate(x - x2, y - y1, 0, 0, angle);
        case 'sw':
            return rotate(x - x1, y - y2, 0, 0, angle);
        case 'se':
            return rotate(x - x2, y - y2, 0, 0, angle);
        default:
            return {
                x: 0,
                y: 0,
            };
    }
};
function getAllPointByIndex$1(points, index) {
    if (Array.isArray(points)) {
        return points[index];
    }
    else {
        return getPointByIndex$1(points, index);
    }
}
function lineCheckCrash$1(ePoint, pointList, lineDis) {
    const lineLength = Array.isArray(pointList)
        ? pointList.length
        : pointList.xs.length;
    const { x, y } = ePoint;
    for (let j = 0; j < lineLength; j++) {
        const point = getAllPointByIndex$1(pointList, j);
        if (!point)
            break;
        if (Math.abs(x - point.x) < lineDis && Math.abs(y - point.y) < lineDis) {
            return true;
        }
        if (lineLength === 1 || j === lineLength - 1)
            break;
        const point2 = getAllPointByIndex$1(pointList, j + 1);
        if (!point2)
            break;
        if (getDistance(point, point2) > lineDis) {
            const dis = distanceOfPoint2Line(point, point2, ePoint);
            if (dis < lineDis) {
                return true;
            }
        }
    }
    return false;
}
function polygonCheckCrash$1(ePoint, points, lineDis) {
    const pointsReference = [...points];
    pointsReference.push(pointsReference[0]);
    return lineCheckCrash$1(ePoint, pointsReference, lineDis);
}
const createShapeProperties = (element) => {
    var _a, _b, _c, _d, _e;
    return {
        ...element,
        version: element.version || 1,
        versionNonce: (_a = element.versionNonce) !== null && _a !== void 0 ? _a : randomInteger(),
        id: element.id || nanoid(),
        fill: (_b = element.fill) !== null && _b !== void 0 ? _b : false,
        lineWidth: element.lineWidth || 1,
        opacity: (_c = element.opacity) !== null && _c !== void 0 ? _c : 100,
        angle: element.angle || 0,
        x: (_d = element.x) !== null && _d !== void 0 ? _d : 0,
        y: (_e = element.y) !== null && _e !== void 0 ? _e : 0,
        backgroundColor: element.backgroundColor,
        width: element.width || 0,
        height: element.height || 0,
    };
};

function computeLinksPoints(point, angle, width) {
    const radius = point.p * width;
    return [
        {
            x: point.x - Math.sin(angle) * radius,
            y: point.y + Math.cos(angle) * radius,
        },
        {
            x: point.x + Math.sin(angle) * radius,
            y: point.y - Math.cos(angle) * radius,
        },
    ];
}
function computeMiddlePoint(point1, point2) {
    return {
        x: (point2.x + point1.x) / 2,
        y: (point2.y + point1.y) / 2,
        p: (point2.p + point1.p) / 2,
    };
}
function computeAxeAngle(begin, end) {
    return Math.atan2(end.y - begin.y, end.x - begin.x);
}
function renderArc(context, center, radius) {
    context.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
}
function renderLine$1(context, begin, end, width) {
    const linkPoints1 = computeLinksPoints(begin, computeAxeAngle(begin, end), width);
    const linkPoints2 = computeLinksPoints(end, computeAxeAngle(begin, end), width);
    context.moveTo(linkPoints1[0].x, linkPoints1[0].y);
    context.lineTo(linkPoints2[0].x, linkPoints2[0].y);
    context.lineTo(linkPoints2[1].x, linkPoints2[1].y);
    context.lineTo(linkPoints1[1].x, linkPoints1[1].y);
}
function renderFinal(context, begin, end, width) {
    const ARCSPLIT = 6;
    const angle = computeAxeAngle(begin, end);
    const linkPoints = computeLinksPoints(end, angle, width);
    context.moveTo(linkPoints[0].x, linkPoints[0].y);
    for (let i = 1; i <= ARCSPLIT; i++) {
        const newAngle = angle - (i * Math.PI) / ARCSPLIT;
        context.lineTo(end.x - end.p * width * Math.sin(newAngle), end.y + end.p * width * Math.cos(newAngle));
    }
}
function renderQuadratic(context, begin, end, ctrl, width) {
    const linkPoints1 = computeLinksPoints(begin, computeAxeAngle(begin, ctrl), width);
    const linkPoints2 = computeLinksPoints(end, computeAxeAngle(ctrl, end), width);
    const linkPoints3 = computeLinksPoints(ctrl, computeAxeAngle(begin, end), width);
    context.moveTo(linkPoints1[0].x, linkPoints1[0].y);
    context.quadraticCurveTo(linkPoints3[0].x, linkPoints3[0].y, linkPoints2[0].x, linkPoints2[0].y);
    context.lineTo(linkPoints2[1].x, linkPoints2[1].y);
    context.quadraticCurveTo(linkPoints3[1].x, linkPoints3[1].y, linkPoints1[1].x, linkPoints1[1].y);
}
function drawStroke(context, stroke, savePath) {
    var _a;
    let strokeReference = stroke;
    if ((_a = strokeReference === null || strokeReference === void 0 ? void 0 : strokeReference.path2d) === null || _a === void 0 ? void 0 : _a.end) {
        context.fill(strokeReference.path2d.path);
        return;
    }
    const { lineWidth: width } = stroke;
    if (strokeReference.xs.length < 3) {
        strokeReference = {
            ...strokeReference,
            xs: [...strokeReference.xs],
            ys: [...strokeReference.ys],
            t: [...strokeReference.t],
            p: [...strokeReference.p],
        };
        const lastPoint = getPointByIndex$1(strokeReference, stroke.xs.length - 1);
        while (strokeReference.xs.length < 3) {
            strokeReference.xs.push(lastPoint.x);
            strokeReference.ys.push(lastPoint.y);
            strokeReference.t.push(lastPoint.t);
            strokeReference.p.push(1);
        }
    }
    const length = strokeReference.xs.length;
    const firstPoint = getPointByIndex$1(strokeReference, 0);
    const nbquadratics = length - 2;
    context.save();
    try {
        const path2d = strokeReference === null || strokeReference === void 0 ? void 0 : strokeReference.path2d;
        const beforePath = path2d ? new Path2D(path2d.path) : new Path2D();
        context.beginPath();
        if (nbquadratics <= 1 || !path2d) {
            renderArc(beforePath, firstPoint, width * firstPoint.p);
            renderLine$1(beforePath, firstPoint, computeMiddlePoint(firstPoint, getPointByIndex$1(strokeReference, 1)), width);
        }
        const startindex = !path2d ? 0 : nbquadratics - 1;
        for (let i = startindex; i < nbquadratics; i++) {
            renderQuadratic(beforePath, computeMiddlePoint(getPointByIndex$1(strokeReference, i), getPointByIndex$1(strokeReference, i + 1)), computeMiddlePoint(getPointByIndex$1(strokeReference, i + 1), getPointByIndex$1(strokeReference, i + 2)), getPointByIndex$1(strokeReference, i + 1), width);
        }
        const strokePathCTX = new Path2D(beforePath);
        renderLine$1(strokePathCTX, computeMiddlePoint(getPointByIndex$1(strokeReference, length - 2), getPointByIndex$1(strokeReference, length - 1)), getPointByIndex$1(strokeReference, length - 1), width);
        renderFinal(strokePathCTX, getPointByIndex$1(strokeReference, length - 2), getPointByIndex$1(strokeReference, length - 1), width);
        strokePathCTX.closePath();
        context.fill(strokePathCTX);
        strokeReference.path2d = {
            path: savePath ? strokePathCTX : beforePath,
            end: savePath,
        };
    }
    finally {
        context.restore();
    }
}

class RectShape extends BaseShape {
    constructor(userOptions) {
        super();
        this.name = '矩形';
        this.maybeTransformHandleType = false;
        const defaultOptions = {
            key: 11,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            isAuxiliary: false,
            angle: 0,
            radius: 0,
        };
        this.data = Object.assign(createShapeProperties(defaultOptions), userOptions);
        if (!userOptions.isAuxiliary) {
            this.rectBounding = new RectShape(createShapeProperties({
                ...defaultOptions,
                x: 0,
                y: 0,
                isAuxiliary: true,
                color: '#000',
                lineWidth: 1,
                radius: 0,
                isDash: true,
            }));
        }
        this.pointerDownState = this.initPointerDownState();
        this.vertex = this.getVertex();
    }
    roundRect(context, ignoreCache = false) {
        const { x, y, width, height, radius } = this.data;
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        if (this.data.fill) {
            context.fill();
        }
        context.stroke();
    }
    draw(ctx, ignoreCache = false) {
        const angle = this.data.angle;
        const { minY, minX, maxX, maxY } = this.limitValue;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        if (this.data.radius !== 0) {
            this.roundRect(ctx);
        }
        else {
            ctx.beginPath();
            const { x, y, width, height } = this.data;
            ctx.rect(x - cx, y - cy, width, height);
            if (this.data.fill) {
                ctx.fill();
            }
            ctx.stroke();
        }
        ctx.rotate(-angle);
        ctx.translate(-cx, -cy);
        if (!this.data.isAuxiliary && this.isEdit) {
            this.auxiliary(ctx);
            this.transformHandles = this.getTransformHandles(this.limitValue, angle, {
                rotation: true,
            });
            this.renderTransformHandles(ctx, this.transformHandles, angle);
        }
    }
    initPending(ctx, point, events) {
        this.drawAttributeInit(ctx);
        this.pointerDownState = this.initPointerDownState(point);
        if (this.isEdit) {
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            return;
        }
    }
    appendPoint(ctx, point, events) {
        if (this.isEdit) {
            if (this.maybeTransformHandleType) {
                const p = {
                    x: point.x - this.pointerDownState.offset.x,
                    y: point.y - this.pointerDownState.offset.y,
                };
                transformElements(this.pointerDownState, this, false, this.maybeTransformHandleType, false, p);
            }
            else {
                dragElements(this.pointerDownState, this, point);
            }
            this.drawAttributeInit(ctx);
        }
        else {
            const rect = points2Rect(this.pointerDownState.startPoint, point);
            this.data = {
                ...this.data,
                ...rect,
            };
        }
        if (this.available) {
            events.emit('clearCapturingCanvas');
            this.getSourceRect();
            this.draw(ctx);
        }
    }
    getSourceRect(isAppend = false) {
        const { x, y, width, height, lineWidth } = this.data;
        this.limitValue = getRectLimitValue({ x, y }, width, height, lineWidth / 2 + this.threshold);
        if (!this.data.isAuxiliary) {
            const rect = getLimit2Rect(this.limitValue);
            this.rectBounding.setData({ ...rect, angle: this.data.angle });
            this.rectBounding.getSourceRect();
        }
        if (isAppend) {
            this.vertex = this.getVertex();
            this.pointerDownState = this.initPointerDownState();
        }
    }
    getVertex() {
        const { x, y, width, height, angle = 0 } = this.data;
        const limitValue = getRectLimitValue({ x, y }, width, height, 0);
        let vertex = getRectangularVertex(limitValue);
        if (angle !== 0) {
            const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = limitValue;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            vertex = this.vertex.map((e) => rotate(e.x, e.y, cx, cy, angle));
        }
        return vertex;
    }
    endPendingPoint(ctx, p, events) {
        if (!this.available) {
            console.log('无效的图形');
            return;
        }
        this.vertex = this.getVertex();
        if (this.isEdit)
            return;
        events.emit('appendCurrentPage', this);
        this.getSourceRect();
    }
    computeOffsetPath(deviationX, deviationY) {
        this.data.x += deviationX;
        this.data.y += deviationY;
    }
    clone() {
        const o = new RectShape(this.data);
        return o;
    }
    auxiliary(ctx) {
        this.rectBounding.drawAttributeInit(ctx);
        this.rectBounding.draw(ctx);
    }
    computeCrash(p, lineDis) {
        if (polygonCheckCrash$1(p, this.vertex, 10 + this.data.lineWidth / 2)) {
            return true;
        }
        return false;
    }
    initPointerDownState(p = { x: 0, y: 0 }) {
        var _a;
        const { x, y, width, height, angle = 0 } = this.data;
        const point = ((_a = this === null || this === void 0 ? void 0 : this.pointerDownState) === null || _a === void 0 ? void 0 : _a.offset) || { x: 0, y: 0 };
        const limitValue = getRectLimitValue({ x, y }, width, height, 0);
        return { ...limitValue, startPoint: p, offset: point, angle };
    }
    computeClick(p, events) {
        if (this.isEdit) {
            const maybeTransformHandleType = this.resizeTest(p, this.transformHandles);
            this.maybeTransformHandleType = maybeTransformHandleType;
            if (maybeTransformHandleType) {
                this.pointerDownState.offset = getResizeOffsetXY(maybeTransformHandleType, this, p);
                return true;
            }
            if (rectCheckCrashPoint(this.limitValue, p)) {
                return true;
            }
            this.maybeTransformHandleType = false;
            this.setEditStatus(false);
            this.getSourceRect();
            events.emit('appendCurrentPage', this);
        }
        else {
            if (polygonCheckCrash$1(p, this.vertex, this.threshold)) {
                this.pointerDownState.startPoint = p;
                return true;
            }
        }
        return false;
    }
    computeBounding() { }
}
RectShape.key = 11;

class StrokeShape extends BaseShape {
    constructor(userOptions) {
        super();
        this.name = '笔线';
        const defaultOptions = {
            key: 2,
            xs: [],
            ys: [],
            t: [],
            p: [],
            l: [],
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            toJSON() {
                const data = { ...this };
                Reflect.deleteProperty(data, 't');
                Reflect.deleteProperty(data, 'l');
                Reflect.deleteProperty(data, 'path2d');
                return data;
            },
        };
        this.data = Object.assign(createShapeProperties(defaultOptions), userOptions);
        this.rectBounding = new RectShape(createShapeProperties({
            ...defaultOptions,
            isAuxiliary: true,
            x: 0,
            y: 0,
            color: '#000',
            lineWidth: 1,
            radius: 0,
            isDash: true,
        }));
    }
    draw(ctx, ignoreCache = false) {
        drawStroke(ctx, this.data, ignoreCache);
        if (this.isEdit) {
            this.auxiliary(ctx);
        }
    }
    initPending(ctx, point, events) {
        this.drawAttributeInit(ctx);
        if (this.isEdit) {
            this.movePoint = point;
            this.draw(ctx);
            return;
        }
    }
    addPoint(point) {
        this.data.xs.push(point.x);
        this.data.ys.push(point.y);
        this.data.t.push(point.t);
        if (point.p !== undefined) {
            this.data.p.push(point.p);
        }
        else {
            this.data.p.push(computePressure(point.x, point.y, this.data.xs, this.data.ys, this.data.l, this.data.xs.length - 1));
            this.data.l.push(computeLength(point.x, point.y, this.data.xs, this.data.ys, this.data.l, this.data.xs.length - 1));
        }
    }
    appendPoint(ctx, point, events) {
        if (this.isEdit) {
            const deviationX = point.x - this.movePoint.x;
            const deviationY = point.y - this.movePoint.y;
            this.movePoint = point;
            this.computeOffsetPath(deviationX, deviationY);
            this.getSourceRect();
            this.data.path2d = undefined;
            events.emit('clearCapturingCanvas');
            this.drawAttributeInit(ctx);
            this.draw(ctx, true);
            return;
        }
        if (filterPointByAcquisitionDelta(point.x, point.y, this.data.xs, this.data.ys, this.data.lineWidth)) {
            this.addPoint(point);
            if (this.available) {
                events.emit('clearCapturingCanvas');
                this.draw(ctx);
            }
        }
    }
    endPendingPoint(ctx, p, events) {
        if (!this.available) {
            console.log('无效的图形');
            return;
        }
        if (this.isEdit)
            return;
        events.emit('clearCapturingCanvas');
        events.emit('appendCurrentPage', this);
        this.getSourceRect();
    }
    getSourceRect() {
        this.limitValue = getPointsLimitValue({ x: this.data.xs, y: this.data.ys }, this.threshold);
        const rect = getLimit2Rect(this.limitValue);
        this.data.width = rect.width;
        this.data.height = rect.height;
        this.rectBounding.setData(rect).getSourceRect();
    }
    auxiliary(ctx) {
        this.rectBounding.drawAttributeInit(ctx);
        this.rectBounding.draw(ctx);
    }
    computeClick(p, events) {
        if (this.isEdit) {
            if (rectCheckCrashPoint(this.limitValue, p)) {
                return true;
            }
            this.setEditStatus(false);
            events.emit('appendCurrentPage', this);
        }
        return false;
    }
    computeOffsetPath(deviationX, deviationY) {
        const { xs, ys } = this.data;
        this.data.xs = xs.map((x) => x + deviationX);
        this.data.ys = ys.map((y) => y + deviationY);
    }
    clone() {
        const o = new StrokeShape(this.data);
        return o;
    }
    computeCrash(p, lineDis) {
        return lineCheckCrash$1(p, this.data, lineDis);
    }
}
StrokeShape.key = 2;
function computeDistance(x, y, xArray, yArray, lastIndexPoint) {
    const distance = Math.sqrt(Math.pow(y - yArray[lastIndexPoint - 1], 2) +
        Math.pow(x - xArray[lastIndexPoint - 1], 2));
    return isNaN(distance) ? 0 : distance;
}
function computeLength(x, y, xArray, yArray, lArray, lastIndexPoint) {
    const length = lArray[lastIndexPoint - 1] +
        computeDistance(x, y, xArray, yArray, lastIndexPoint);
    return isNaN(length) ? 0 : length;
}
function computePressure(x, y, xArray, yArray, lArray, lastIndexPoint) {
    let ratio = 1.0;
    const distance = computeDistance(x, y, xArray, yArray, lastIndexPoint);
    const length = computeLength(x, y, xArray, yArray, lArray, lastIndexPoint);
    if (length === 0) {
        ratio = 0.5;
    }
    else if (distance === length) {
        ratio = 1.0;
    }
    else if (distance < 10) {
        ratio = 0.2 + Math.pow(0.1 * distance, 0.4);
    }
    else if (distance > length - 10) {
        ratio = 0.2 + Math.pow(0.1 * (length - distance), 0.4);
    }
    const pressure = ratio * Math.max(0.1, 1.0 - 0.1 * Math.sqrt(distance));
    return isNaN(parseFloat(String(pressure)))
        ? 0.5
        : pressure < 0.3
            ? 0.3
            : pressure;
}
function filterPointByAcquisitionDelta(x, y, xArray, yArray, width) {
    const delta = 2 + width / 4;
    let ret = false;
    if (xArray.length < 3 ||
        Math.abs(xArray[xArray.length - 1] - x) >= delta ||
        Math.abs(yArray[yArray.length - 1] - y) >= delta) {
        ret = true;
    }
    return ret;
}

class RubberShape extends BaseShape {
    constructor(userOptions) {
        super();
        this.name = '橡皮';
        const defaultOptions = {
            key: 7,
            radius: 10,
            available: false,
        };
        this.data = Object.assign(defaultOptions, userOptions);
    }
    draw(ctx, ignoreCache = false) {
        const { center, radius } = this.data;
        ctx.save();
        try {
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
        finally {
            ctx.restore();
        }
    }
    initPending(ctx, point, events) {
        this.drawAttributeInit(ctx);
        this.appendPoint(ctx, point, events);
    }
    appendPoint(ctx, point, events) {
        events.emit('clearCapturingCanvas');
        this.data.center = point;
        this.draw(ctx, true);
        events.emit('crashRemove', point, this.data.radius);
    }
    endPendingPoint(ctx, p, events) {
        events.emit('clearCapturingCanvas');
    }
    computeOffsetPath(deviationX, deviationY) { }
    clone() { }
    computeCrash(p, lineDis) {
        return false;
    }
    getSourceRect() { }
    auxiliary() { }
    computeClick(p) {
        return false;
    }
    computeBounding() { }
    isClientVisible(lm) {
        return true;
    }
    isClientArea(lm) {
        return false;
    }
}
RubberShape.key = 7;
RubberShape.cache = true;

class ImageShape extends BaseShape {
    constructor(userOptions) {
        super();
        this.name = '图片';
        this.maybeTransformHandleType = false;
        this.data = createShapeProperties({
            ...userOptions,
            key: 8,
        });
        const { imageOrUri } = this.data;
        const setInitData = (img) => {
            const { width, height } = img;
            this.data.width = this.data.width || width;
            this.data.height = this.data.height || height;
            this.image = img;
            this.data.imageOrUri = this.getSrc();
            this.rectBounding = new RectShape(createShapeProperties({
                key: 11,
                x: this.data.x,
                y: this.data.y,
                width: this.data.width,
                height: this.data.width,
                isAuxiliary: true,
                color: '#000',
                lineWidth: 1,
                radius: 4,
                isDash: true,
            }));
            this.getSourceRect();
            this.pointerDownState = this.initPointerDownState();
        };
        if (typeof imageOrUri === 'string') {
            createImage(imageOrUri).then((e) => {
                setInitData(e);
            });
        }
        else {
            setInitData(imageOrUri);
        }
    }
    getSrc() {
        if (this.image) {
            if ('toDataURL' in this.image) {
                return this.image.toDataURL();
            }
            else {
                return this.image.src;
            }
        }
        else {
            return '';
        }
    }
    initPointerDownState(p = { x: 0, y: 0 }) {
        var _a;
        const { x, y, width, height, angle = 0 } = this.data;
        const p0 = ((_a = this === null || this === void 0 ? void 0 : this.pointerDownState) === null || _a === void 0 ? void 0 : _a.offset) || { x: 0, y: 0 };
        const limitValue = getRectLimitValue({ x, y }, width, height, 0);
        return { ...limitValue, startPoint: p, offset: p0, angle };
    }
    getSourceRect() {
        const { width, height, x, y } = this.data;
        this.limitValue = getRectLimitValue({ x, y }, width, height, this.threshold);
        const rect = getLimit2Rect(this.limitValue);
        this.rectBounding.setData(rect).getSourceRect();
    }
    auxiliary(ctx) {
        this.rectBounding.drawAttributeInit(ctx);
        this.rectBounding.roundRect(ctx);
        this.transformHandles = this.getTransformHandles(this.rectBounding.limitValue, 0, {
            rotation: true,
        });
        this.renderTransformHandles(ctx, this.transformHandles, 0);
    }
    draw(ctx, ignoreCache = false) {
        let img = this.image;
        const { x, y, width, height } = this.data;
        ctx.drawImage(img, x, y, width, height);
        if (this.isEdit) {
            this.auxiliary(ctx);
        }
    }
    initPending(ctx, p, e) {
        if (this.isEdit) {
            this.pointerDownState = this.initPointerDownState(p);
        }
        this.draw(ctx);
    }
    appendPoint(ctx, p, e) {
        if (this.isEdit) {
            if (this.maybeTransformHandleType) {
                const _p = {
                    x: p.x - this.pointerDownState.offset.x,
                    y: p.y - this.pointerDownState.offset.y,
                };
                transformElements(this.pointerDownState, this, true, this.maybeTransformHandleType, false, _p);
            }
            else {
                dragElements(this.pointerDownState, this, p);
            }
            this.getSourceRect();
            e.emit('clearCapturingCanvas');
        }
        else {
            e.emit('clearCapturingCanvas');
        }
        this.draw(ctx);
    }
    endPendingPoint(ctx, p, events) {
        if (this.isEdit)
            return;
        this.getSourceRect();
    }
    computeOffsetPath(deviationX, deviationY) {
        this.data.x += deviationX;
        this.data.y += deviationY;
    }
    clone() {
        const o = new ImageShape({ ...this.data, imageOrUri: this.getSrc() });
        return o;
    }
    computeClick(p, events) {
        if (this.isEdit) {
            const maybeTransformHandleType = this.resizeTest(p, this.transformHandles);
            this.maybeTransformHandleType = maybeTransformHandleType;
            if (maybeTransformHandleType) {
                this.pointerDownState.offset = getResizeOffsetXY(maybeTransformHandleType, this, p);
                return true;
            }
        }
        if (rectCheckCrashPoint(this.limitValue, p)) {
            return true;
        }
        if (this.isEdit) {
            this.maybeTransformHandleType = false;
        }
        return false;
    }
    computeCrash(p, lineDis) {
        return false;
    }
}
ImageShape.key = 8;

class TextShape extends BaseShape {
    constructor(userOptions) {
        super();
        this.name = '文字';
        this.prevText = '';
        const defaultOptions = {
            key: 9,
            x: 0,
            y: 0,
            text: '',
            fontSize: 24,
            width: 0,
            height: 0,
            baseline: 0,
            opacity: 100,
            textAlign: 'left',
            isAuxiliary: false,
        };
        this.data = Object.assign(createShapeProperties(defaultOptions), userOptions, {
            strokeColor: userOptions.color,
        });
        if (!userOptions.isAuxiliary) {
            this.rectBounding = new RectShape(createShapeProperties({
                ...defaultOptions,
                x: 0,
                y: 0,
                isAuxiliary: true,
                color: '#000',
                lineWidth: 1,
                radius: 0,
                isDash: true,
            }));
        }
    }
    draw(context, ignoreCache = false) {
        const element = this.data;
        renderText(element, context);
        this.getSourceRect();
    }
    initPending(ctx, point, events, translatePosition) {
        this.prevText = this.data.text;
        if (this.isEdit) {
            this.movePoint = point;
            this.drawAttributeInit(ctx);
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            this.auxiliary(ctx);
            return;
        }
        this.data = { ...this.data, ...point };
        newTextElement(this.data, translatePosition, (element) => {
            this.data = { ...this.data, ...element };
            this.endPendingPoint(ctx, point, events);
        });
    }
    appendPoint(ctx, point, events) {
        if (this.isEdit) {
            const deviationX = point.x - this.movePoint.x;
            const deviationY = point.y - this.movePoint.y;
            this.movePoint = point;
            this.computeOffsetPath(deviationX, deviationY);
            this.getSourceRect();
            events.emit('clearCapturingCanvas');
            this.drawAttributeInit(ctx);
            this.data.path2d = undefined;
            this.draw(ctx);
            this.auxiliary(ctx);
            return;
        }
    }
    endPendingPoint(ctx, p, events) {
        if (this.isEdit)
            return;
        events.emit('appendCurrentPage', this);
    }
    computeOffsetPath(deviationX, deviationY) {
        this.data.x += deviationX;
        this.data.y += deviationY;
    }
    clone() {
        const o = new TextShape(this.data);
        return o;
    }
    getSourceRect() {
        const { width, height, x, y } = this.data;
        this.limitValue = getRectLimitValue({ x, y }, width, height, this.threshold);
        if (!this.data.isAuxiliary) {
            const rect = getLimit2Rect(this.limitValue);
            this.rectBounding.setData({ ...rect, angle: this.data.angle });
            this.rectBounding.getSourceRect();
        }
    }
    auxiliary(ctx) {
        this.rectBounding.drawAttributeInit(ctx);
        this.rectBounding.draw(ctx);
    }
    computeCrash(p, lineDis) {
        const radius = lineDis - this.threshold;
        const { x, y } = p;
        if (rectCheckCrash(this.limitValue, {
            maxX: x + radius,
            maxY: y + radius,
            minX: x - radius,
            minY: y - radius,
        })) {
            return true;
        }
        return false;
    }
    computeClick(p, events) {
        if (rectCheckCrashPoint(this.limitValue, p)) {
            return true;
        }
        return false;
    }
    computeBounding() { }
}
TextShape.key = 9;
const newTextElement = (element, translatePosition, onSubmit) => {
    var _a;
    let updatedElement = element;
    const updateWysiwygStyle = (text = '') => {
        const metrics = measureText(text, getFontString(updatedElement));
        updatedElement = {
            ...updatedElement,
            text,
            width: metrics.width,
            height: metrics.height,
            baseline: metrics.baseline,
            opacity: 100,
        };
        editable.value = updatedElement.text;
        const lines = updatedElement.text.replace(/\r\n?/g, '\n').split('\n');
        const lineHeight = updatedElement.height / lines.length;
        const left = translatePosition
            ? updatedElement.x - translatePosition.x
            : updatedElement.x;
        const top = translatePosition
            ? updatedElement.y - translatePosition.y
            : updatedElement.y;
        Object.assign(editable.style, {
            font: getFontString(updatedElement),
            lineHeight: `${lineHeight}px`,
            width: `${updatedElement.width}px`,
            height: `${updatedElement.height}px`,
            left: `${left}px`,
            top: `${top}px`,
            textAlign: updatedElement.textAlign,
            color: updatedElement.strokeColor,
            opacity: updatedElement.opacity / 100,
            filter: 'none',
        });
    };
    const editable = document.createElement('textarea');
    editable.dir = 'auto';
    editable.tabIndex = 0;
    editable.wrap = 'off';
    Object.assign(editable.style, {
        position: 'fixed',
        display: 'inline-block',
        minHeight: '1em',
        backfaceVisibility: 'hidden',
        margin: 0,
        padding: 0,
        border: 0,
        outline: 0,
        resize: 'none',
        background: 'transparent',
        overflow: 'hidden',
        whiteSpace: 'pre',
        zIndex: '100000',
    });
    updateWysiwygStyle(element.text);
    editable.oninput = () => {
        updateWysiwygStyle(normalizeText(editable.value));
    };
    const normalizeText = (text) => {
        return (text
            .replace(/\t/g, '        ')
            .replace(/\r?\n|\r/g, '\n'));
    };
    const handleSubmit = () => {
        onSubmit(updatedElement);
        cleanup();
    };
    const cleanup = () => {
        if (isDestroyed) {
            return;
        }
        isDestroyed = true;
        editable.onblur = null;
        editable.oninput = null;
        editable.onkeydown = null;
        window.removeEventListener('wheel', stopEvent, true);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', rebindBlur);
        window.removeEventListener('blur', handleSubmit);
        editable.remove();
    };
    const stopEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    const rebindBlur = () => {
        window.removeEventListener('pointerup', rebindBlur);
        setTimeout(() => {
            editable.onblur = handleSubmit;
            editable.focus();
        });
    };
    const onPointerDown = (event) => {
        editable.onblur = null;
        window.addEventListener('pointerup', rebindBlur);
        window.addEventListener('blur', handleSubmit);
    };
    let isDestroyed = false;
    editable.onblur = handleSubmit;
    window.addEventListener('wheel', stopEvent, {
        passive: false,
        capture: true,
    });
    (_a = document.querySelector('.canvas-container')) === null || _a === void 0 ? void 0 : _a.appendChild(editable);
    editable.focus();
    editable.select();
};
const renderText = (element, context) => {
    const font = context.font;
    context.font = getFontString(element);
    const fillStyle = context.fillStyle;
    context.fillStyle = element.strokeColor;
    const textAlign = context.textAlign;
    context.textAlign = element.textAlign;
    const lines = element.text.replace(/\r\n?/g, '\n').split('\n');
    const lineHeight = element.height / lines.length;
    const verticalOffset = element.height - element.baseline;
    const horizontalOffset = element.textAlign === 'center'
        ? element.width / 2
        : element.textAlign === 'right'
            ? element.width
            : 0;
    for (let index = 0; index < lines.length; index++) {
        context.fillText(lines[index], horizontalOffset + element.x, (index + 1) * lineHeight - verticalOffset + element.y);
    }
    context.fillStyle = fillStyle;
    context.font = font;
    context.textAlign = textAlign;
};
const getFontString = ({ fontSize }) => {
    return `${fontSize}px hachure, Segoe UI Emoji`;
};
const measureText = (text, font) => {
    const line = document.createElement('div');
    const body = document.body;
    line.style.position = 'absolute';
    line.style.whiteSpace = 'pre';
    line.style.font = font;
    body.appendChild(line);
    line.innerText = text
        .split('\n')
        .map((x) => x || ' ')
        .join('\n');
    const width = line.offsetWidth;
    const height = line.offsetHeight;
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.overflow = 'hidden';
    span.style.width = '1px';
    span.style.height = '1px';
    line.appendChild(span);
    const baseline = span.offsetTop + span.offsetHeight;
    document.body.removeChild(line);
    return { width, height, baseline };
};

class GroupShape extends BaseShape {
    constructor(g = []) {
        super();
        this.name = '组';
        const defaultOptions = {
            key: 10,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            lineWidth: 0,
        };
        this.data = createShapeProperties(Object.assign(defaultOptions, { g }));
        this.rectBounding = new RectShape(createShapeProperties({
            ...defaultOptions,
            isAuxiliary: true,
            color: '#f60',
            lineWidth: 1,
            radius: 8,
            isDash: true,
        }));
    }
    getContent() {
        const g = this.data.g.splice(0, this.data.g.length);
        console.log('length', g.length, 'datalength', this.data.g.length);
        return g;
    }
    setContent(g) {
        this.data.g.push(...g);
        this.getSourceRect();
        this.setEditStatus(true);
        return this;
    }
    draw(ctx, ignoreCache = true) {
        for (const item of this.data.g) {
            item.drawAttributeInit(ctx);
            item.data.path2d = undefined;
            item.draw(ctx, ignoreCache);
        }
        if (this.rectBounding.data.width === 0) {
            this.getSourceRect();
        }
        if (this.isEdit) {
            this.auxiliary(ctx);
        }
    }
    initPending(ctx, point, events) {
        if (this.isEdit) {
            this.movePoint = point;
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            return;
        }
    }
    appendPoint(ctx, point, events) {
        if (this.isEdit) {
            const deviationX = point.x - this.movePoint.x;
            const deviationY = point.y - this.movePoint.y;
            this.movePoint = point;
            this.computeOffsetPath(deviationX, deviationY);
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            return;
        }
    }
    endPendingPoint(ctx, p, events) {
        if (this.isEdit)
            return;
        this.getSourceRect();
    }
    computeOffsetPath(deviationX, deviationY) {
        for (const item of this.data.g) {
            item.computeOffsetPath(deviationX, deviationY);
        }
        this.rectBounding.computeOffsetPath(deviationX, deviationY);
        this.rectBounding.getSourceRect();
    }
    clone() {
        const o = new GroupShape(this.data.g.map((e) => e.clone()));
        return o;
    }
    getSourceRect() {
        if (!this.data.g.length)
            return;
        const Xs = [];
        const Ys = [];
        for (const item of this.data.g) {
            item.getSourceRect();
            Xs.push(item.limitValue.minX);
            Xs.push(item.limitValue.maxX);
            Ys.push(item.limitValue.minY);
            Ys.push(item.limitValue.maxY);
        }
        this.limitValue = {
            minX: Math.min(...Xs),
            maxX: Math.max(...Xs),
            minY: Math.min(...Ys),
            maxY: Math.max(...Ys),
        };
        const rect = getLimit2Rect(this.limitValue);
        this.data = { ...this.data, ...rect };
        this.rectBounding.setData(rect).getSourceRect();
    }
    auxiliary(ctx) {
        this.rectBounding.drawAttributeInit(ctx);
        this.rectBounding.draw(ctx);
    }
    computeCrash(p, lineDis) {
        return false;
    }
    computeClick(p, events) {
        if (this.isEdit && rectCheckCrashPoint(this.rectBounding.limitValue, p)) {
            console.log('编辑被选中的');
            return true;
        }
        else {
            for (const item of this.data.g) {
                const bool = item.computeClick(p, events);
                if (bool) {
                    console.log('不是编辑你选中的');
                    return true;
                }
            }
        }
        if (this.isEdit) {
            this.setEditStatus(false);
            events.emit('appendCurrentPage', this);
        }
        return false;
    }
    computeBounding() { }
}
GroupShape.key = 10;
class InnerGroupShape extends GroupShape {
    constructor(p) {
        super();
        this.name = '内部组';
        const defaultOptions = {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            g: [],
        };
        this.data = Object.assign(defaultOptions, p);
    }
    initPending(ctx, point, events) {
        if (this.isEdit) {
            this.movePoint = point;
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            return;
        }
        this.rectBounding.limitValue = this.initLimitValue();
        this.rectBounding.initPending(ctx, point, events);
    }
    appendPoint(ctx, point, events) {
        if (this.isEdit) {
            const deviationX = point.x - this.movePoint.x;
            const deviationY = point.y - this.movePoint.y;
            this.movePoint = point;
            this.computeOffsetPath(deviationX, deviationY);
            events.emit('clearCapturingCanvas');
            this.draw(ctx);
            return;
        }
        this.rectBounding.appendPoint(ctx, point, events);
    }
    endPendingPoint(ctx, p, events) {
        const { maxX, minX, maxY, minY } = this.rectBounding.limitValue;
        if (maxX === minX || maxY === minY) {
            events.emit('clearCapturingCanvas');
            return;
        }
        if (this.isEdit) {
            this.getSourceRect();
            return;
        }
        events.emit('clearCapturingCanvas');
        events.emit('selectGraphics', this.rectBounding.limitValue);
    }
    computeClick(p, events) {
        if (this.isEdit && rectCheckCrashPoint(this.rectBounding.limitValue, p)) {
            return true;
        }
        for (const item of this.data.g) {
            const bool = item.computeClick(p, events);
            if (bool) {
                return true;
            }
        }
        if (this.isEdit) {
            this.setEditStatus(false);
            const g = this.getContent();
            events.emit('appendCurrentPage', g);
        }
        return false;
    }
}
InnerGroupShape.key = 100;
InnerGroupShape.cache = true;

function drawRect(context, params) {
    var _a;
    if ((_a = params === null || params === void 0 ? void 0 : params.path2d) === null || _a === void 0 ? void 0 : _a.end) {
        context.stroke(params.path2d.path);
        return;
    }
    const { points } = params;
    const startPoint = points[0];
    const w = Math.abs(startPoint.x - points[1].x);
    const h = Math.abs(startPoint.y - points[3].y);
    const strokePathCTX = new Path2D();
    strokePathCTX.rect(startPoint.x, startPoint.y, w, h);
    context.stroke(strokePathCTX);
    params.path2d = {
        path: strokePathCTX,
        end: true,
    };
}
function drawCircular(context, params) {
    const { center, radius, isDrawC } = params;
    context.save();
    try {
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
        context.stroke();
        if (isDrawC) {
            context.beginPath();
            context.arc(center.x, center.y, 1, 0, Math.PI * 2, true);
            context.fill();
            context.stroke();
        }
    }
    finally {
        context.restore();
    }
}
function drawPolygon(context, polygonParams) {
    const { points } = polygonParams;
    if (points.length < 1) {
        return;
    }
    context.save();
    const pointsReference = [...points];
    try {
        context.beginPath();
        const firstPoint = pointsReference.shift();
        context.moveTo(firstPoint.x, firstPoint.y);
        pointsReference.forEach((element) => {
            context.lineTo(element.x, element.y);
        });
        context.lineTo(firstPoint.x, firstPoint.y);
        context.stroke();
    }
    finally {
        context.restore();
    }
}
function drawEllipse(context, ellipseParams) {
    const { center, minRadius, maxRadius } = ellipseParams;
    const { x, y } = center;
    const ox = 0.5 * maxRadius;
    const oy = 0.6 * minRadius;
    context.save();
    try {
        context.translate(x, y);
        context.beginPath();
        context.moveTo(0, minRadius);
        context.bezierCurveTo(ox, minRadius, maxRadius, oy, maxRadius, 0);
        context.bezierCurveTo(maxRadius, -oy, ox, -minRadius, 0, -minRadius);
        context.bezierCurveTo(-ox, -minRadius, -maxRadius, -oy, -maxRadius, 0);
        context.bezierCurveTo(-maxRadius, oy, -ox, minRadius, 0, minRadius);
        context.closePath();
        context.stroke();
    }
    finally {
        context.restore();
    }
}
function drawCircularEraser(context, props) {
    const { center, radius } = props;
    context.save();
    try {
        context.beginPath();
        renderArc(context, center, radius);
        context.fill();
    }
    finally {
        context.restore();
    }
}
function renderLine(context, begin, end) {
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
}
function renderLineArrow(context, points, theta, headlen) {
    const contextReference = context;
    const [{ x: fromX, y: fromY }, { x: toX, y: toY }] = points;
    const angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI;
    const angle1 = ((angle + theta) * Math.PI) / 180;
    const angle2 = ((angle - theta) * Math.PI) / 180;
    const topX = headlen * Math.cos(angle1);
    const topY = headlen * Math.sin(angle1);
    const botX = headlen * Math.cos(angle2);
    const botY = headlen * Math.sin(angle2);
    contextReference.moveTo(fromX, fromY);
    contextReference.lineTo(toX, toY);
    renderLine(contextReference, { x: fromX, y: fromY }, { x: toX, y: toY });
    const arrowX = toX + topX;
    const arrowY = toY + topY;
    renderLine(contextReference, { x: arrowX, y: arrowY }, { x: toX, y: toY });
    const arrowX1 = toX + botX;
    const arrowY1 = toY + botY;
    contextReference.lineTo(arrowX1, arrowY1);
}
function drawLine(context, linePrams) {
    const { points } = linePrams;
    const [begin, end] = points;
    context.save();
    try {
        context.beginPath();
        renderLine(context, begin, end);
        context.stroke();
    }
    finally {
        context.restore();
    }
}
function drawLineArrow(context, lineArrowParams) {
    const { points, theta = 20, headlen = 15 } = lineArrowParams;
    const contextReference = context;
    contextReference.save();
    try {
        contextReference.beginPath();
        renderLineArrow(context, points, theta, headlen);
        contextReference.fill();
        contextReference.stroke();
    }
    finally {
        contextReference.restore();
    }
}
function drawHorizontalNumberAxis(context, numberAxisParams) {
    const { points, theta = 25, headlen = 15, center, interval = 49, bulge = 8, centerRadius = 3, } = numberAxisParams;
    const contextReference = context;
    let end;
    let begin;
    if (points.length === 4) {
        end = points[1];
        begin = points[3];
    }
    else {
        [end, begin] = points;
    }
    const offsetLeft = center.x - begin.x;
    const offsetRight = end.x - center.x;
    const leftNumber = Math.abs(Math.floor(offsetLeft / interval) + 1);
    const rightNumber = Math.abs(Math.floor(offsetRight / interval) + 1);
    contextReference.save();
    try {
        contextReference.beginPath();
        renderLineArrow(contextReference, [begin, end], theta, headlen);
        for (let index = 1; index < leftNumber; index++) {
            const startBulge = center.x - interval * index;
            const begin = { x: startBulge, y: center.y };
            const end = { x: startBulge, y: center.y - bulge };
            renderLine(contextReference, begin, end);
        }
        for (let index = 1; index < rightNumber; index++) {
            const startBulge = center.x + interval * index;
            const begin = { x: startBulge, y: center.y };
            const end = { x: startBulge, y: center.y - bulge };
            renderLine(contextReference, begin, end);
        }
        contextReference.stroke();
        contextReference.fill();
        contextReference.beginPath();
        renderArc(contextReference, center, centerRadius);
        contextReference.fill();
    }
    finally {
        contextReference.restore();
    }
}
function drawVerticalNumberAxis(context, numberAxisParams) {
    const { points, theta = 25, headlen = 15, center, interval = 49, bulge = 8, } = numberAxisParams;
    const contextReference = context;
    if (points.length !== 4) {
        return;
    }
    const begin = points[2];
    const end = points[0];
    const offsetBottom = center.y - begin.y;
    const offsetTop = end.y - center.y;
    const bottomNumber = Math.abs(Math.floor(offsetBottom / interval) + 1);
    const topNumber = Math.abs(Math.floor(offsetTop / interval) + 1);
    contextReference.save();
    try {
        contextReference.beginPath();
        renderLineArrow(contextReference, [begin, end], theta, headlen);
        for (let index = 1; index < bottomNumber; index++) {
            const startBulge = center.y + interval * index;
            const begin = { x: center.x, y: startBulge };
            const end = { x: center.x + bulge, y: startBulge };
            renderLine(contextReference, begin, end);
        }
        for (let index = 1; index < topNumber; index++) {
            const startBulge = center.y - interval * index;
            const begin = { x: center.x, y: startBulge };
            const end = { x: center.x + bulge, y: startBulge };
            renderLine(contextReference, begin, end);
        }
        contextReference.stroke();
        contextReference.fill();
    }
    finally {
        contextReference.restore();
    }
}
function drawCoordinateAxis(context, numberAxisParams) {
    const contextReference = context;
    drawHorizontalNumberAxis(contextReference, numberAxisParams);
    drawVerticalNumberAxis(contextReference, numberAxisParams);
}

function getPointByIndex(stroke, index) {
    return {
        x: stroke.x[index],
        y: stroke.y[index],
        t: stroke.t[index],
        p: stroke.p[index],
        l: stroke.l ? stroke.l[index] : undefined,
    };
}

function coordinateAxisCheckCrash(point, coordinateAxisParams, lineDis) {
    const pramsReference = coordinateAxisParams;
    const { points } = pramsReference;
    if (points.length !== 4) {
        return false;
    }
    return (lineCheckCrash(point, [points[0], points[2]], lineDis) ||
        lineCheckCrash(point, [points[1], points[3]], lineDis));
}
function arcCheckCrash(point, arcParams, lineDis) {
    const { center, radius, isDrawC } = arcParams;
    if (Math.abs(getDistance(center, point) - radius) < lineDis) {
        return true;
    }
    if (isDrawC) {
        if (Math.abs(getDistance(center, point) - 2) < lineDis) {
            return true;
        }
    }
    return false;
}
function polygonCheckCrash(ePoint, polygonParams, lineDis) {
    const pointsReference = [...polygonParams.points];
    pointsReference.push(pointsReference[0]);
    return lineCheckCrash(ePoint, pointsReference, lineDis);
}
function ellipseCheckCrash({ x, y }, ellipseParams, lineDis) {
    const { center, maxRadius, minRadius } = ellipseParams;
    const outsideMinR = minRadius + lineDis;
    const outsideMaxR = maxRadius + lineDis;
    const outsideF = ((x - center.x) * (x - center.x)) / (outsideMaxR * outsideMaxR) +
        ((y - center.y) * (y - center.y)) / (outsideMinR * outsideMinR);
    if (Math.abs(outsideF - 1) < 0.1) {
        return true;
    }
    const innerMinR = minRadius - lineDis;
    const innerMaxR = maxRadius - lineDis;
    const innerF = ((x - center.x) * (x - center.x)) / (innerMaxR * innerMaxR) +
        ((y - center.y) * (y - center.y)) / (innerMinR * innerMinR);
    if (Math.abs(innerF - 1) < 0.1) {
        return true;
    }
    return false;
}
function getAllPointByIndex(points, index) {
    if (Array.isArray(points)) {
        return points[index];
    }
    else {
        return getPointByIndex(points, index);
    }
}
function lineCheckCrash(ePoint, pointList, lineDis) {
    const lineLength = Array.isArray(pointList)
        ? pointList.length
        : pointList.x.length;
    const { x, y } = ePoint;
    for (let j = 0; j < lineLength; j++) {
        const point = getAllPointByIndex(pointList, j);
        if (!point)
            break;
        if (Math.abs(x - point.x) < lineDis && Math.abs(y - point.y) < lineDis) {
            return true;
        }
        if (lineLength === 1 || j === lineLength - 1)
            break;
        const point2 = getAllPointByIndex(pointList, j + 1);
        if (!point2)
            break;
        if (getDistance(point, point2) > lineDis) {
            const dis = distanceOfPoint2Line(point, point2, ePoint);
            if (dis < lineDis) {
                return true;
            }
        }
    }
    return false;
}

var Status;
(function (Status) {
    Status[Status["STATUS_PEN"] = 2] = "STATUS_PEN";
    Status[Status["STATUS_ARROW"] = 3] = "STATUS_ARROW";
    Status[Status["STATUS_RUBBER"] = 7] = "STATUS_RUBBER";
    Status[Status["STATUS_LINE"] = 10] = "STATUS_LINE";
    Status[Status["STATUS_TRIANGLE"] = 11] = "STATUS_TRIANGLE";
    Status[Status["STATUS_RECTANGLE"] = 12] = "STATUS_RECTANGLE";
    Status[Status["STATUS_TRAPEZIUM"] = 13] = "STATUS_TRAPEZIUM";
    Status[Status["STATUS_OVAL"] = 14] = "STATUS_OVAL";
    Status[Status["STATUS_COORDINATE"] = 15] = "STATUS_COORDINATE";
    Status[Status["STATUS_NUMBER_AXIS"] = 16] = "STATUS_NUMBER_AXIS";
    Status[Status["STATUS_DASH_LINE"] = 17] = "STATUS_DASH_LINE";
    Status[Status["STATUS_CIRCLE_CENTER"] = 18] = "STATUS_CIRCLE_CENTER";
    Status[Status["STATUS_COMPASSES"] = 19] = "STATUS_COMPASSES";
    Status[Status["STATUS_CIRCLE"] = 20] = "STATUS_CIRCLE";
    Status[Status["STATUS_DASH"] = 21] = "STATUS_DASH";
    Status[Status["STATUS_NO_PATH_PEN"] = 1000] = "STATUS_NO_PATH_PEN";
    Status[Status["STATUS_MOVE"] = 101] = "STATUS_MOVE";
})(Status || (Status = {}));
function drawSymbol(context, symbol, savePath = false) {
    const symbolReference = symbol;
    const type = symbol.type;
    const { color, width, isDash } = symbol;
    drawAttributeInit(context, color, width, isDash);
    switch (type) {
        case Status.STATUS_PEN:
        case Status.STATUS_NO_PATH_PEN:
            break;
        case Status.STATUS_RUBBER:
            drawCircularEraser(context, symbolReference);
            break;
        case Status.STATUS_CIRCLE:
        case Status.STATUS_CIRCLE_CENTER:
            drawCircular(context, symbolReference);
            break;
        case Status.STATUS_RECTANGLE:
            drawRect(context, symbolReference);
            break;
        case Status.STATUS_TRIANGLE:
        case Status.STATUS_TRAPEZIUM:
            drawPolygon(context, symbolReference);
            break;
        case Status.STATUS_OVAL:
            drawEllipse(context, symbolReference);
            break;
        case Status.STATUS_LINE:
            drawLine(context, symbolReference);
            break;
        case Status.STATUS_ARROW:
            drawLineArrow(context, symbolReference);
            break;
        case Status.STATUS_NUMBER_AXIS:
            drawHorizontalNumberAxis(context, symbolReference);
            break;
        case Status.STATUS_COORDINATE:
            drawCoordinateAxis(context, symbolReference);
            break;
    }
}
function computeCrash(ePoint, symbol, lineDis) {
    let isCrash = false;
    let symbolReference = symbol;
    const type = symbol.type;
    switch (type) {
        case Status.STATUS_PEN:
            isCrash = lineCheckCrash(ePoint, symbolReference, lineDis);
            break;
        case Status.STATUS_CIRCLE_CENTER:
        case Status.STATUS_CIRCLE:
            isCrash = arcCheckCrash(ePoint, symbolReference, lineDis);
            break;
        case Status.STATUS_TRIANGLE:
        case Status.STATUS_TRAPEZIUM:
        case Status.STATUS_RECTANGLE:
            isCrash = polygonCheckCrash(ePoint, symbolReference, lineDis);
            break;
        case Status.STATUS_OVAL:
            isCrash = ellipseCheckCrash(ePoint, symbolReference, lineDis);
            break;
        case Status.STATUS_LINE:
        case Status.STATUS_ARROW:
        case Status.STATUS_NUMBER_AXIS:
            isCrash = lineCheckCrash(ePoint, symbolReference.points, lineDis);
            break;
        case Status.STATUS_COORDINATE:
            isCrash = coordinateAxisCheckCrash(ePoint, symbolReference, lineDis);
            break;
    }
    return isCrash;
}

const clearAppStatePropertiesForHistory = (appState) => {
    return {
        selectedElementIds: appState.selectedElementIds,
        viewBackgroundColor: appState.viewBackgroundColor,
        name: appState.name,
    };
};
class History {
    constructor() {
        this.elementCache = new Map();
        this.stateHistory = [];
        this.redoStack = [];
        this.lastEntry = null;
        this.generateEntry = (appState, elements) => this.dehydrateHistoryEntry({
            appState: clearAppStatePropertiesForHistory(appState),
            elements: elements,
        });
    }
    clear() {
        this.stateHistory.length = 0;
        this.redoStack.length = 0;
        this.lastEntry = null;
        this.elementCache.clear();
    }
    get canUndo() {
        return this.stateHistory.length !== 1;
    }
    get canRedo() {
        return this.redoStack.length !== 0;
    }
    shouldCreateEntry(nextEntry) {
        const { lastEntry } = this;
        if (!lastEntry) {
            return true;
        }
        if (nextEntry.elements.length !== lastEntry.elements.length) {
            return true;
        }
        for (let i = nextEntry.elements.length - 1; i > -1; i--) {
            const prev = nextEntry.elements[i];
            const next = lastEntry.elements[i];
            if (!prev ||
                !next ||
                prev.id !== next.id ||
                prev.versionNonce !== next.versionNonce) {
                return true;
            }
        }
        return false;
    }
    pushEntry(appState, elements) {
        var _a, _b;
        console.log(JSON.stringify((_b = (_a = this.stateHistory[this.stateHistory.length - 1]) === null || _a === void 0 ? void 0 : _a.elements) === null || _b === void 0 ? void 0 : _b.map((e) => {
            var _a;
            return (_a = this.elementCache.get(e.id)) === null || _a === void 0 ? void 0 : _a.get(e.versionNonce);
        })), '\n-------分隔线--------\n');
        const newEntryDehydrated = this.generateEntry(appState, elements);
        const newEntry = this.hydrateHistoryEntry(newEntryDehydrated);
        if (newEntry) {
            if (!this.shouldCreateEntry(newEntry)) {
                return;
            }
            this.stateHistory.push(newEntryDehydrated);
            this.lastEntry = newEntry;
            this.clearRedoStack();
        }
    }
    clearRedoStack() {
        this.redoStack.splice(0, this.redoStack.length);
    }
    redoOnce() {
        if (this.redoStack.length === 0) {
            return null;
        }
        const entryToRestore = this.redoStack.pop();
        if (entryToRestore !== undefined) {
            this.stateHistory.push(entryToRestore);
            return this.hydrateHistoryEntry(entryToRestore);
        }
        return null;
    }
    undoOnce() {
        if (this.stateHistory.length === 1) {
            return null;
        }
        const currentEntry = this.stateHistory.pop();
        const entryToRestore = this.stateHistory[this.stateHistory.length - 1];
        if (currentEntry !== undefined) {
            this.redoStack.push(currentEntry);
            return this.hydrateHistoryEntry(entryToRestore);
        }
        return null;
    }
    setCurrentState(appState, elements) {
        this.lastEntry = this.hydrateHistoryEntry(this.generateEntry(appState, elements));
    }
    hydrateHistoryEntry({ appState, elements, }) {
        return {
            appState: JSON.parse(appState),
            elements: elements.map((el) => {
                var _a;
                const element = (_a = this.elementCache.get(el.id)) === null || _a === void 0 ? void 0 : _a.get(el.versionNonce);
                if (!element) {
                    throw new Error(`Element not found: ${el.id}:${el.versionNonce}`);
                }
                return element;
            }),
        };
    }
    dehydrateHistoryEntry({ appState, elements, }) {
        return {
            appState: JSON.stringify(appState),
            elements: elements.map((element) => {
                if (!this.elementCache.has(element.id)) {
                    this.elementCache.set(element.id, new Map());
                }
                const versions = this.elementCache.get(element.id);
                if (!versions.has(element.versionNonce)) {
                    versions.set(element.versionNonce, cloneDeep(element));
                }
                return {
                    id: element.id,
                    versionNonce: element.versionNonce,
                };
            }),
        };
    }
}
var History$1 = History;

function getPixelRatio(canvas) {
    if (canvas) {
        const context = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio ||
            1;
        return devicePixelRatio / backingStoreRatio;
    }
    return 1;
}
function detectPixelRatio() {
    const tempCanvas = document.createElement('canvas');
    const canvasRatio = getPixelRatio(tempCanvas);
    return canvasRatio;
}
function createContainerInnerDom(element, tagName, className) {
    const browserDocument = document;
    const domNode = browserDocument.createElement(tagName);
    domNode.classList.add(className);
    domNode.classList.add('edit-handwrit');
    domNode.style.width = '100%';
    domNode.style.height = '100%';
    domNode.style.position = 'absolute';
    domNode.style.top = '0';
    domNode.style.left = '0';
    domNode.style.zIndex = '10';
    element.appendChild(domNode);
    return domNode;
}
function resizeContent(context, originScreen) {
    const domElement = context.canvasContainer.parentNode;
    let scale = 1;
    let filled = context === null || context === void 0 ? void 0 : context.filled;
    if (originScreen) {
        const wrapper = domElement.parentNode || {
            clientWidth: 0,
            clientHeight: 0,
        };
        const domStyle = computeScreen(originScreen, {
            width: wrapper.clientWidth,
            height: wrapper.clientHeight,
        });
        scale = domStyle.scale;
        filled = domStyle.filled;
        const styleProperty = domStyle.styleProperty;
        for (let key in styleProperty) {
            if ({}.hasOwnProperty.call(styleProperty, key)) {
                domElement.style[key] = styleProperty[key];
            }
        }
    }
    else {
        domElement.style.width = '100%';
        domElement.style.height = '100%';
    }
    const elements = [
        context.renderingCanvas,
        context.capturingCanvas,
        context.disappearCanvas,
    ];
    const domWidth = domElement.clientWidth || parseInt(domElement.style.width, 10) || 0;
    const domHeight = domElement.clientHeight || parseInt(domElement.style.height, 10) || 0;
    const width = domWidth < context.minWidth ? context.minWidth : domWidth;
    const height = domHeight < context.minHeight ? context.minHeight : domHeight;
    context.width = width;
    context.height = height;
    context.scale = scale;
    context.filled = filled;
    const { clientLeft, clientTop } = domElement;
    const clientRect = domElement.getBoundingClientRect();
    context.left = clientRect.left + clientLeft;
    context.top = clientRect.top + clientTop;
    elements.forEach((canvas) => {
        canvas.width = width * context.pixelRatio;
        canvas.height = height * context.pixelRatio;
        canvas.style.zIndex = '5';
        canvas.getContext('2d').scale(context.pixelRatio, context.pixelRatio);
    });
    return context;
}
function attach(element, minHeight = 0, minWidth = 0, originScreen) {
    const pixelRatio = detectPixelRatio();
    const canvasContainer = createContainerInnerDom(element, 'div', 'canvas-container');
    canvasContainer.style.position = 'sticky';
    const renderingCanvas = createContainerInnerDom(canvasContainer, 'canvas', 'rendering-canvas');
    const capturingCanvas = createContainerInnerDom(canvasContainer, 'canvas', 'capture-canvas');
    const disappearCanvas = createContainerInnerDom(canvasContainer, 'canvas', 'disappear-canvas');
    const context = {
        canvasContainer,
        scale: 1,
        filled: undefined,
        pixelRatio,
        minHeight,
        minWidth,
        left: 0,
        top: 0,
        width: renderingCanvas.width,
        height: renderingCanvas.height,
        renderingCanvas,
        renderingCanvasContext: renderingCanvas.getContext('2d'),
        capturingCanvas,
        capturingCanvasContext: capturingCanvas.getContext('2d'),
        disappearCanvas,
        disappearCanvasContext: disappearCanvas.getContext('2d'),
    };
    return resizeContent(context, originScreen);
}
function clearCapturingCanvas(context, x = 0, y = 0) {
    context.capturingCanvasContext.clearRect(x, y, context.width, context.height);
}
function clearRenderingCanvas(context, x = 0, y = 0) {
    context.renderingCanvasContext.clearRect(x, y, context.width, context.height);
}
function translatePartialUpdate(context, model, translatePosition, rectStroke, cb) {
    if (!rectStroke)
        return;
    const renderingCanvasContext = context.renderingCanvasContext;
    renderingCanvasContext.save();
    try {
        renderingCanvasContext.translate(translatePosition.x, translatePosition.y);
        renderingCanvasContext.beginPath();
        renderingCanvasContext.rect(rectStroke.x, rectStroke.y, rectStroke.width, rectStroke.height);
        renderingCanvasContext.clearRect(rectStroke.x, rectStroke.y, rectStroke.width, rectStroke.height);
        renderingCanvasContext.clip();
        cb(rectStroke.stroke);
    }
    finally {
        renderingCanvasContext.restore();
    }
}
function translateDrawCurrentStroke(context, model, translatePosition, strokes) {
    const capturingCanvasContext = context.capturingCanvasContext;
    capturingCanvasContext.save();
    try {
        clearCapturingCanvas(context);
        capturingCanvasContext.translate(translatePosition.x, translatePosition.y);
    }
    finally {
        capturingCanvasContext.restore();
    }
}
function translateDrawModel(context, model, translatePosition, strokes) {
    const renderingCanvasContext = context.renderingCanvasContext;
    renderingCanvasContext.save();
    try {
        renderingCanvasContext.translate(translatePosition.x, translatePosition.y);
        drawModel(context, model, strokes);
    }
    finally {
        renderingCanvasContext.restore();
    }
}
function drawModel(context, model, strokesLine) {
    let symbols = strokesLine ? strokesLine : [...model.activeGroupStroke];
    if (symbols.length === 0)
        return;
    const savePath = true;
    symbols.forEach((symbol) => drawSymbol(context.renderingCanvasContext, symbol, savePath));
}
function drawCurrentStroke(context, model, stroker) {
    const { capturingCanvasContext } = context;
    if (Array.isArray(stroker)) {
        for (const element of stroker) {
            element.drawAttributeInit(capturingCanvasContext);
            element.draw(capturingCanvasContext, true);
        }
    }
    else {
        stroker.drawAttributeInit(capturingCanvasContext);
        stroker.draw(capturingCanvasContext, true);
    }
}
function clearCanvas(context) {
    clearCapturingCanvas(context);
    clearRenderingCanvas(context);
}
function getLineIntersection(line, pointList) {
    const repaintLines = [];
    for (const item of pointList) {
        if (rectCheckCrash(line, item)) {
            repaintLines.push(item);
        }
    }
    return repaintLines;
}
function getStrokeLimit(stroke) {
    let minXs = [];
    let minYs = [];
    let maxXs = [];
    let maxYs = [];
    for (const item of stroke) {
        minXs.push(item.minX);
        minYs.push(item.minY);
        maxXs.push(item.maxX);
        maxYs.push(item.maxY);
    }
    const minX = Math.min(...minXs);
    const minY = Math.min(...minYs);
    const maxX = Math.max(...maxXs);
    const maxY = Math.max(...maxYs);
    return {
        maxX,
        maxY,
        minX,
        minY,
    };
}
function getInfluenceRange(model, crashActiveLine) {
    if (crashActiveLine.length === 0)
        return;
    const strokeLimit = getStrokeLimit(crashActiveLine);
    const activeGroup = model.activeGroupStroke;
    const stroke = getLineIntersection(strokeLimit, activeGroup);
    const width = strokeLimit.maxX - strokeLimit.minX;
    const height = strokeLimit.maxY - strokeLimit.minY;
    return {
        x: strokeLimit.minX,
        y: strokeLimit.minY,
        width,
        height,
        stroke,
    };
}
function partialUpdate(context, model, rectStroke, cb) {
    if (!rectStroke)
        return;
    const renderingCanvasContext = context.renderingCanvasContext;
    renderingCanvasContext.save();
    try {
        renderingCanvasContext.beginPath();
        renderingCanvasContext.rect(rectStroke.x, rectStroke.y, rectStroke.width, rectStroke.height);
        renderingCanvasContext.clearRect(rectStroke.x, rectStroke.y, rectStroke.width, rectStroke.height);
        renderingCanvasContext.clip();
        cb(rectStroke.stroke);
    }
    finally {
        renderingCanvasContext.restore();
    }
}
function pointCheckCrash(stroke, { x, y }, radius = 0) {
    return rectCheckCrash(stroke, {
        maxX: x + radius,
        maxY: y + radius,
        minX: x - radius,
        minY: y - radius,
    });
}
function getCrashActiveLineAndRemoveV2(model, ePoint, radius, once = false) {
    let crashActiveLine = [];
    let activeGroupReference = model.activeGroupStroke;
    for (let index = activeGroupReference.length - 1; index >= 0; index--) {
        const element = activeGroupReference[index];
        const lineDis = element.width / 2 + radius;
        if (!pointCheckCrash(element, ePoint, radius)) {
            continue;
        }
        if (computeCrash(ePoint, element, lineDis)) {
            activeGroupReference.splice(index, 1);
            crashActiveLine.push(cloneDeep(element));
            if (once) {
                break;
            }
        }
    }
    return crashActiveLine;
}
function getRectCrashLine(model, limitValue, isRemove) {
    let crashActiveLine = [];
    let activeGroupReference = model.activeGroupStroke;
    for (let index = activeGroupReference.length - 1; index >= 0; index--) {
        const element = activeGroupReference[index];
        if (rectContainLine(element, limitValue)) {
            if (isRemove) {
                activeGroupReference.splice(index, 1);
            }
            crashActiveLine.push(cloneDeep(element));
        }
    }
    return crashActiveLine;
}

var renderer = /*#__PURE__*/Object.freeze({
	__proto__: null,
	resizeContent: resizeContent,
	attach: attach,
	clearCapturingCanvas: clearCapturingCanvas,
	clearRenderingCanvas: clearRenderingCanvas,
	translatePartialUpdate: translatePartialUpdate,
	translateDrawCurrentStroke: translateDrawCurrentStroke,
	translateDrawModel: translateDrawModel,
	drawModel: drawModel,
	drawCurrentStroke: drawCurrentStroke,
	clearCanvas: clearCanvas,
	getLineIntersection: getLineIntersection,
	getStrokeLimit: getStrokeLimit,
	getInfluenceRange: getInfluenceRange,
	partialUpdate: partialUpdate,
	pointCheckCrash: pointCheckCrash,
	getCrashActiveLineAndRemoveV2: getCrashActiveLineAndRemoveV2,
	getRectCrashLine: getRectCrashLine
});

var eventType;
(function (eventType) {
    eventType[eventType["MOVE"] = 0] = "MOVE";
    eventType[eventType["DOWN"] = 1] = "DOWN";
    eventType[eventType["UP"] = 2] = "UP";
    eventType[eventType["DBLCLICK"] = 3] = "DBLCLICK";
})(eventType || (eventType = {}));

function createFunc(c, ...rest) {
    return new c(...rest);
}
function createGraphicsBase() {
    const shapeCache = {};
    return (shape, ...res) => {
        const ShapeIns = Object.getPrototypeOf(shape).constructor;
        if (ShapeIns.cache) {
            const key = ShapeIns.key;
            const currentShape = shapeCache[key];
            if (currentShape) {
                currentShape.setData(...res);
                return currentShape;
            }
            else {
                shapeCache[key] = createFunc(shape, ...res);
                return shapeCache[key];
            }
        }
        return createFunc(shape, ...res);
    };
}
const createGraphics = createGraphicsBase();
const eventArray = [
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseout',
    'touchmove',
    'touchstart',
    'touchend',
    'touchcancel',
];
const enumEvent = {
    dblclick: eventType.DBLCLICK,
    touchmove: eventType.MOVE,
    touchstart: eventType.DOWN,
    touchend: eventType.UP,
    touchcancel: eventType.UP,
    mousemove: eventType.MOVE,
    mousedown: eventType.DOWN,
    mouseup: eventType.UP,
    mouseout: eventType.UP,
};
class Crop extends EventHub {
    constructor(option, ready) {
        super([
            'data',
            'ready',
            'penColor',
            'focus',
            'blur',
            'updateModel',
            'dispose',
        ]);
        this._focus = true;
        this._isMDown = false;
        this._renderer = renderer;
        this.events = new EventHub();
        this.currentPage = [];
        this._installedCom = {};
        let graphics = [];
        if (option.graphics && Array.isArray(graphics)) {
            graphics.push(...option.graphics);
        }
        this.graphicsMap = graphics.reduce((p, n) => {
            p[n.key] = n;
            return p;
        }, {});
        this.canRender = option.canRender;
        this.nativeEventStop = option.nativeEventStop;
        this.nativeEventPrev = option.nativeEventPrev;
        this.canDraw = option.canDraw;
        this.state = {
            penWidth: option.penWidth,
            penStatus: option.status,
            penColor: option.penColor,
        };
        this.el = option.el;
        this._container = document.createElement('div');
        this._container.classList.add('edit-container');
        this._container.style.position = 'relative';
        this._container.style.overflow = 'auto';
        this.el.appendChild(this._container);
        this.context = this._renderer.attach(this._container, 10, 10);
        this.appendCom(option.component);
        this.history = new History$1();
        this.init();
        if (ready) {
            ready(this);
        }
        this.emit('ready', this);
    }
    getElement(id) {
        for (const el of this.currentPage) {
            if (el.getData().id === id) {
                return el;
            }
        }
        return null;
    }
    translateRender(data = {}) {
        const { x = 0, y = 0 } = data;
        this._translatePosition = this._translatePosition || { x: 0, y: 0 };
        const { width, height, renderingCanvasContext, capturingCanvasContext } = this.context;
        const limitVal = getRectLimitValue({
            x,
            y,
        }, width, height);
        const lineIntersection = this.currentPage.filter((item) => item.isClientVisible(limitVal));
        const translateX = this._translatePosition.x - x;
        const translateY = this._translatePosition.y - y;
        renderingCanvasContext.translate(translateX, translateY);
        renderingCanvasContext.clearRect(x, y, width, height);
        if (lineIntersection.length !== 0) {
            this.drawGraphics(renderingCanvasContext, lineIntersection);
        }
        capturingCanvasContext.translate(translateX, translateY);
        capturingCanvasContext.clearRect(x, y, width, height);
        const currentGraphics = this.currentGraphics;
        if (currentGraphics === null || currentGraphics === void 0 ? void 0 : currentGraphics.isClientVisible(limitVal)) {
            currentGraphics.drawAttributeInit(capturingCanvasContext);
            currentGraphics.draw(capturingCanvasContext);
        }
        this._translatePosition = {
            x,
            y,
        };
    }
    drawCurrentGroup(strokes) {
        if (!this.canRender)
            return;
        const { x = 0, y = 0 } = this._translatePosition || {};
        if (strokes) {
            this.drawGraphics(this.context.renderingCanvasContext, strokes);
            this.renderer.clearCapturingCanvas(this.context, x, y);
            return;
        }
        else {
            if (this._translatePosition) {
                const { width, height, renderingCanvasContext } = this.context;
                const limitVal = getRectLimitValue({
                    x,
                    y,
                }, width, height);
                const lineIntersection = this.currentPage.filter((item) => item.isClientVisible(limitVal));
                renderingCanvasContext.clearRect(x, y, width, height);
                if (lineIntersection.length !== 0) {
                    this.drawGraphics(renderingCanvasContext, lineIntersection);
                }
            }
            else {
                this.renderer.clearRenderingCanvas(this.context, x, y);
                this.drawGraphics(this.context.renderingCanvasContext);
            }
        }
    }
    drawGraphics(ctx, strokes) {
        const strokesRef = strokes || this.currentPage;
        if (Array.isArray(strokesRef)) {
            for (const item of strokesRef) {
                item.drawAttributeInit(ctx);
                item.draw(ctx, true);
            }
        }
        else {
            strokesRef.drawAttributeInit(ctx);
            strokesRef.draw(ctx, true);
        }
    }
    getSelectGraphics(point) {
        if (!this.canRender)
            return undefined;
        const currentG = this.currentGraphics;
        if (currentG === null || currentG === void 0 ? void 0 : currentG.isEdit) {
            if (currentG.computeClick(point, this.events)) {
                return currentG;
            }
            else {
                if (currentG.isEdit) {
                    currentG.setEditStatus(false);
                    this.events.emit('appendCurrentPage', currentG);
                }
            }
        }
        const l = this.currentPage.length;
        for (let index = l - 1; index >= 0; index--) {
            const item = this.currentPage[index];
            if (!item.disabled && item.computeClick(point, this.events)) {
                item.setEditStatus(true);
                return this.currentPage.splice(index, 1)[0];
            }
        }
        return undefined;
    }
    getCrashActiveLineAndRemove(currentPage, ePoint, radius, once = false) {
        let crashActiveLine = [];
        for (let index = currentPage.length - 1; index >= 0; index--) {
            const element = currentPage[index];
            const lineDis = (element.data.lineWidth || 2) / 2 + radius;
            const { x, y } = ePoint;
            if (!rectCheckCrash(element.limitValue, {
                maxX: x + radius,
                maxY: y + radius,
                minX: x - radius,
                minY: y - radius,
            })) {
                continue;
            }
            if (element.computeCrash(ePoint, lineDis)) {
                currentPage.splice(index, 1);
                crashActiveLine.push(element.clone());
                if (once) {
                    break;
                }
            }
        }
        return crashActiveLine;
    }
    getRectCrashLine(currentPage, limitValue, isRemove = true) {
        let crashActiveLine = [];
        for (let index = currentPage.length - 1; index >= 0; index--) {
            const element = currentPage[index];
            if (rectContainLine(element.limitValue, limitValue)) {
                if (isRemove) {
                    currentPage.splice(index, 1);
                }
                crashActiveLine.push(element);
            }
        }
        return crashActiveLine;
    }
    registerEvents() {
        this.events.registerType([
            'clearCapturingCanvas',
            'clearRenderingCanvas',
            'appendCurrentPage',
            'crashRemove',
            'selectGraphics',
            'pushEntry',
        ]);
        this.events.on('clearCapturingCanvas', () => {
            const { x = 0, y = 0 } = this._translatePosition || {};
            this.renderer.clearCapturingCanvas(this.context, x, y);
        });
        this.events.on('clearRenderingCanvas', () => {
            const { x = 0, y = 0 } = this._translatePosition || {};
            this.renderer.clearRenderingCanvas(this.context, x, y);
        });
        this.events.on('appendCurrentPage', (graphics) => {
            const g = graphics;
            if (Array.isArray(g)) {
                this.currentPage.push(...g);
            }
            else {
                this.currentPage.push(g);
            }
            this.drawCurrentGroup(g);
        });
        this.events.on('crashRemove', (point, radius) => {
            const p = point;
            const r = radius;
            const graphics = this.getCrashActiveLineAndRemove(this.currentPage, p, r);
            if (graphics.length) {
                this.drawCurrentGroup();
            }
        });
        this.events.on('selectGraphics', (limit) => {
            const limitValue = limit;
            const graphics = this.getRectCrashLine(this.currentPage, limitValue);
            if (graphics.length > 0) {
                this.drawCurrentGroup();
            }
        });
        this.events.on('pushEntry', (g) => {
            const data = g.getData();
            this.history.pushEntry({
                name: 'xxxx',
                selectedElementIds: {
                    [data.id]: true,
                },
            }, this.currentPage.map((e) => e.getData()).concat(data));
            this.emit('updateModel');
        });
    }
    unuse(name) {
        const plugin = this._installedCom[name];
        if (!plugin)
            return;
        plugin.destroy();
        delete this._installedCom[name];
    }
    async use(option) {
        var _a;
        const instance = this.createComFunc(option);
        if (instance.createEl) {
            await instance.createEl(this.context.canvasContainer, this._container);
        }
        if (instance.ready) {
            await instance.ready(this);
        }
        instance.destroy = (_a = instance.destroy) !== null && _a !== void 0 ? _a : (() => { });
        this._installedCom[option.name] = instance;
        return instance;
    }
    dispose() {
        for (const key of eventArray) {
            this._container.removeEventListener(key, this.onEvent, false);
        }
        this.destroy();
        for (const name in this._installedCom) {
            if (this._installedCom.hasOwnProperty(name)) {
                this.unuse(name);
            }
        }
        this._installedCom = {};
        this.el.innerHTML = '';
        this.emit('dispose');
    }
    closeHandWrite() {
        this.setCanDraw(false);
    }
    openHandWrite() {
        this.setCanDraw(true);
    }
    closeRender() {
        this.setCanRender(false);
    }
    openRender() {
        this.setCanRender(true);
    }
    clearDisappear() {
    }
    setPenWidth(penWidth) {
        this.state.penWidth = penWidth;
    }
    setPenColor(color) {
        this.state.penColor = color;
        this.emit('penColor', color);
    }
    setToRubber() {
        this.state.penStatus = Status.STATUS_RUBBER;
    }
    setToWriting() {
        this.state.penStatus = Status.STATUS_PEN;
    }
    setToDisappear() {
        this.state.penStatus = Status.STATUS_NO_PATH_PEN;
    }
    setDrawStatus(value) {
        this.state.penStatus = value;
    }
    get statusConfig() {
        return this.state;
    }
    get penColor() {
        if (this.state.penStatus === Status.STATUS_NO_PATH_PEN) {
            return this.disappearColor;
        }
        else {
            return this.state.penColor;
        }
    }
    get normalPenColor() {
        return this.state.penColor;
    }
    get width() {
        return this._container.clientWidth || this.context.width;
    }
    get height() {
        return this._container.clientHeight || this.context.height;
    }
    isNormalPen() {
        return this.state.penStatus === Status.STATUS_PEN;
    }
    set disappearColor(color) {
        this._disappearColor = color;
    }
    get disappearColor() {
        return this._disappearColor || this.state.penColor;
    }
    focus() {
        if (this._focus)
            return;
        this._focus = true;
        this.emit('focus');
    }
    blur() {
        if (!this._focus)
            return;
        this._focus = false;
        this.emit('blur');
    }
    resize(screen) {
        this.context = this._renderer.resizeContent(this.context, screen);
        this.render();
        if (this.currentGraphics) {
            const context = this.context.capturingCanvasContext;
            this.drawGraphics(context, this.currentGraphics);
        }
    }
    clear() {
        this.currentPage = [];
        if (this.canRender) {
            this.renderer.clearCanvas(this.context);
        }
        this.emit('data', { v: { value: '', name: 'clear' }, t: Date.now() });
    }
    get penWidth() {
        return this.state.penWidth;
    }
    reset() {
        this.emit('updateModel');
        this.clear();
        this.drawCurrentGroup();
    }
    historyRender(data, event) {
        const graphics = [];
        this.emit('updateModel');
        for (const e of data.elements) {
            const g = this.initGraphics(this.graphicsMap[e.key], e);
            if (data.appState.selectedElementIds[e.id]) {
                g.setEditStatus(true);
                this.currentGraphics = g;
            }
            else {
                graphics.push(g);
            }
        }
        this.currentPage = graphics;
        setTimeout(() => {
            this.renderer.clearCanvas(this.context);
            if (this.currentGraphics) {
                const context = this.context.capturingCanvasContext;
                this.drawGraphics(context, this.currentGraphics);
            }
            this.drawCurrentGroup();
        }, 60);
        this.emit('data', { v: { value: '', name: event }, t: Date.now() });
    }
    get canUndo() {
        return this.history.canUndo;
    }
    undo() {
        const data = this.history.undoOnce();
        if (data) {
            this.historyRender(data, 'undo');
        }
    }
    get canRedo() {
        return this.history.canRedo;
    }
    redo() {
        const data = this.history.redoOnce();
        if (data) {
            this.historyRender(data, 'redo');
        }
    }
    onEvent(event) {
        if (!this.canDraw)
            return;
        const type = enumEvent[event.type];
        let client;
        if (/^mouse/.test(event.type)) {
            if (type !== eventType.DOWN && !this._isMDown) {
                return;
            }
            client = event;
            if (type === eventType.DOWN) {
                this._isMDown = true;
            }
            else if (type === eventType.UP) {
                this._isMDown = false;
            }
            else {
                if (!this._isMDown) {
                    return;
                }
            }
        }
        else if (/^touch/.test(event.type)) {
            let touches = event.touches;
            if (touches.length > 1) {
                return;
            }
            if (touches.length === 0) {
                this.handleTouchEvent({
                    type,
                    point: {
                        x: 0,
                        y: 0,
                        t: Date.now(),
                        p: 1,
                    },
                });
                return;
            }
            client = touches[0];
        }
        else {
            client = event;
        }
        if (type === eventType.MOVE) {
            if (!this.nativeEventPrev) {
                event.preventDefault();
            }
            if (!this.nativeEventStop) {
                event.stopPropagation();
            }
        }
        this.focus();
        let limitVal;
        const point = extractPoint(client, this.context, this._translatePosition, limitVal);
        this.handleTouchEvent({
            type,
            point,
        });
    }
    handleTouchEvent(event) {
        var _a, _b, _c, _d;
        const { type, point } = event;
        this.emit('data', { v: { ...this.state, point, type }, t: point.t });
        const context = this.context.capturingCanvasContext;
        const events = this.events;
        switch (type) {
            case eventType.DBLCLICK: {
                const graphics = this.getSelectGraphics(point);
                if (graphics) {
                    if (graphics.name === '文字' && graphics === this.currentGraphics) {
                        this.events.emit('clearCapturingCanvas');
                        graphics.setEditStatus(false);
                        const { x, y } = graphics.data;
                        this.currentGraphics.initPending(context, { x, y, t: Date.now() }, events, this._translatePosition);
                        return;
                    }
                    this.currentGraphics = graphics;
                    this.drawCurrentGroup();
                }
                else {
                    const text = this.graphicsMap[9];
                    this.currentGraphics = this.initGraphics(text);
                }
                (_a = this.currentGraphics) === null || _a === void 0 ? void 0 : _a.initPending(context, point, events, this._translatePosition);
                break;
            }
            case eventType.DOWN: {
                const graphics = this.getSelectGraphics(point);
                if (graphics) {
                    this.currentGraphics = graphics;
                    this.drawCurrentGroup();
                }
                else {
                    this.currentGraphics = this.initGraphics(this.graphicsMap[this.state.penStatus]);
                }
                (_b = this.currentGraphics) === null || _b === void 0 ? void 0 : _b.initPending(context, point, events);
                break;
            }
            case eventType.MOVE:
                (_c = this.currentGraphics) === null || _c === void 0 ? void 0 : _c.appendPoint(context, point, events);
                break;
            case eventType.UP:
                (_d = this.currentGraphics) === null || _d === void 0 ? void 0 : _d.endPendingPoint(context, point, events);
                break;
        }
    }
    appendToImage(data) {
        const G = this.graphicsMap[data.key];
        const g = createGraphics(G, data, this.events);
        g.getSourceRect(true);
        this.currentPage.push(g);
        this.history.pushEntry({
            name: 'xxxx',
            selectedElementIds: {
                [data.id]: true,
            },
        }, this.currentPage.map((e) => e.getData()));
        this.emit('updateModel');
    }
    dispatchLocalEvent(data) {
        if (Array.isArray(data)) {
            for (const item of data) {
                this.dispatchEvent(item);
            }
        }
        else {
            this.dispatchEvent(data);
        }
    }
    dispatchEvent(data) {
        if (!data)
            return;
        const info = data.v;
        if (typeof (info === null || info === void 0 ? void 0 : info.type) === 'string') {
            this.handleTouchEvent(info);
            return;
        }
        if (info.name) {
            const event = info;
            this[event.name](event.value);
            return;
        }
        if (typeof info.type === 'number') {
            return;
        }
    }
    async getDataURL(params = { type: 'Base64' }) {
        const { renderingCanvasContext, renderingCanvas, width, height, pixelRatio, } = this.context;
        const typeName = 'Base64';
        const { type, backgroundColor, backgroundImage, mimeType, area } = {
            backgroundColor: '#fff',
            type: typeName,
            ...params,
        };
        if (backgroundImage) {
            const img = await createImage(backgroundImage);
            renderingCanvasContext.drawImage(img, 0, 0, width, height);
        }
        else {
            renderingCanvasContext.fillStyle = backgroundColor;
            renderingCanvasContext.fillRect(0, 0, width, height);
        }
        const currentG = this.currentGraphics;
        if (currentG) {
            currentG.setEditStatus(false);
            this.events.emit('appendCurrentPage', currentG);
            this.currentGraphics = null;
        }
        this.drawGraphics(renderingCanvasContext);
        const types = {
            Base64(canvas, resolve, mimeType) {
                resolve(canvas.toDataURL(mimeType));
            },
            Blob(canvas, resolve, mimeType) {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, mimeType);
            },
        };
        return new Promise((resolve, reject) => {
            if (!types[type]) {
                reject(new TypeError('type = Blob || Base64'));
                return;
            }
            let canvas = renderingCanvas;
            if (area) {
                const imgCanvas = document.createElement('canvas');
                const imgContext = imgCanvas.getContext('2d');
                imgCanvas.width = area.width * pixelRatio;
                imgCanvas.height = area.height * pixelRatio;
                imgContext.scale(pixelRatio, pixelRatio);
                imgContext.drawImage(renderingCanvas, area.x * pixelRatio, area.y * pixelRatio, area.width * pixelRatio, area.height * pixelRatio, 0, 0, area.width, area.height);
                canvas = imgCanvas;
            }
            types[type](canvas, resolve, mimeType);
        });
    }
    render(strokes) {
        this.drawCurrentGroup(strokes);
    }
    capturingDrawCurrentStroke(strokes) {
        if (!this.canRender)
            return;
    }
    async createNode(type, properties) {
        if (type === 'ImageNode') {
            const g = this.initGraphics(this.graphicsMap[8], properties);
            this.add(g);
        }
        if (type === 'TextNode') {
            const g = this.initGraphics(this.graphicsMap[9], properties);
            this.currentPage.push(g);
        }
    }
    add(g) {
        if (g === null || g === void 0 ? void 0 : g.isEdit) {
            g.draw(this.context.capturingCanvasContext);
            this.currentGraphics = g;
        }
        else {
            g.draw(this.context.renderingCanvasContext);
            this.currentPage.push(g);
        }
        const data = g.getData();
        this.history.pushEntry({
            name: 'xxxx',
            selectedElementIds: {
                [data.id]: true,
            },
        }, this.currentPage.map((e) => e.getData()).concat(data));
        this.emit('updateModel');
        return this;
    }
    getActiveObject() {
        var _a;
        if ((_a = this.currentGraphics) === null || _a === void 0 ? void 0 : _a.isEdit) {
            return this.currentGraphics;
        }
        return undefined;
    }
    appendCom(c) {
        if (!c || !Array.isArray(c) || c.length === 0)
            return;
        for (const item of c) {
            this.use(item);
        }
    }
    createComFunc(option) {
        if (!option.type || typeof option.type !== 'function' || !option.name) {
            throw new Error('type, name插件的必须参数不正确');
        }
        if (this._installedCom[option.name]) {
            throw new Error(option.name + '已经注册过一次');
        }
        let args = [];
        if (option.params && Array.isArray(option.params)) {
            args = option.params;
        }
        return createFunc(option.type, ...args);
    }
    init() {
        this.onEvent = this.onEvent.bind(this);
        this.registerEvents();
        this.drawCurrentGroup();
        for (const eventName of eventArray) {
            this._container.addEventListener(eventName, this.onEvent, false);
        }
    }
    get renderer() {
        return this._renderer;
    }
    initGraphics(graphics, properties = {}) {
        if (!graphics) {
            const graphicsKey = properties.key || this.state.penStatus;
            console.error(`未找到当前.graphics：${graphicsKey}`);
            return null;
        }
        return createGraphics(graphics, {
            lineWidth: this.state.penWidth,
            color: this.penColor,
            offset: this.state.penWidth,
            ...properties,
        }, this.events);
    }
    setCanDraw(canDraw) {
        this.canDraw = canDraw;
    }
    setCanRender(canRender) {
        this.canRender = canRender;
    }
}
function createApp(option) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    let el;
    if (typeof option.el === 'string') {
        const wrapper = document.querySelectorAll(option.el);
        if (wrapper.length === 0) {
            throw new TypeError('无法获取dom节点, 请检查传入的el是否正确');
        }
        el = wrapper[0];
    }
    else if (option.el &&
        typeof option.el === 'object' &&
        option.el.nodeType === 1 &&
        typeof option.el.nodeName === 'string') {
        el = option.el;
    }
    else {
        throw new TypeError(`el必须是HTMLElement或者字符串, 不能够是${typeof option.el}`);
    }
    return new Crop({
        el,
        nativeEventPrev: (_a = option === null || option === void 0 ? void 0 : option.nativeEventPrev) !== null && _a !== void 0 ? _a : false,
        nativeEventStop: (_b = option === null || option === void 0 ? void 0 : option.nativeEventStop) !== null && _b !== void 0 ? _b : false,
        status: (_c = option === null || option === void 0 ? void 0 : option.status) !== null && _c !== void 0 ? _c : Status.STATUS_PEN,
        canDraw: (_d = option === null || option === void 0 ? void 0 : option.canDraw) !== null && _d !== void 0 ? _d : false,
        penColor: (_e = option === null || option === void 0 ? void 0 : option.penColor) !== null && _e !== void 0 ? _e : '#f60',
        penWidth: (_f = option === null || option === void 0 ? void 0 : option.penWidth) !== null && _f !== void 0 ? _f : 2,
        canRender: (_g = option === null || option === void 0 ? void 0 : option.canRender) !== null && _g !== void 0 ? _g : false,
        component: (_h = option === null || option === void 0 ? void 0 : option.component) !== null && _h !== void 0 ? _h : [],
        graphics: (_j = option === null || option === void 0 ? void 0 : option.graphics) !== null && _j !== void 0 ? _j : [],
    });
}

export { GroupShape, ImageShape, InnerGroupShape, Logger$1 as Logger, RectShape, RubberShape, StrokeShape, TextShape, computeMaxArea, createApp, createImage, loadImage };
//# sourceMappingURL=index.js.map
