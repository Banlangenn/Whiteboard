import { newPoint, rect, EventHub, limitValue, point, createImage, loadImage, computeMaxArea } from './utils';
import Logger from './model/logger';
import { editDataI, Status } from './render/SymbolCanvasRendener';
import { originDataI } from './model/playerManager';
import * as renderer from './render/canvasRenderer';
import StrokeShape from './render/Symbols/Stroke';
import RubberShape from './render/Symbols/Rubber';
import ImageShape from './render/Symbols/Image';
import TextShape from './render/Symbols/Text';
import RectShape from './render/Symbols/Rect';
import GroupShape, { InnerGroupShape } from './render/Symbols/Group';
import { properties } from './render/Symbols/Shape';
export { Logger, StrokeShape, RubberShape, ImageShape, TextShape, GroupShape, InnerGroupShape, RectShape, createImage, loadImage, computeMaxArea, };
import { Graphics } from './render/Symbols/Shape';
interface ComFunc {
    createEl: (el: HTMLElement, outerLayer: HTMLElement) => void;
    ready: (crop: Crop) => void;
    destroy: () => void;
    new (): ComFunc;
}
interface CropComponent {
    name: string;
    type: ComFunc;
    params?: any[];
}
export interface areaParams {
    limitValue: limitValue;
    offsetX?: number;
    offsetY?: number;
    src?: string;
    id?: string;
}
export interface localTouchEvent {
    point: newPoint;
    type: eventType;
}
declare enum eventType {
    MOVE = 0,
    DOWN = 1,
    UP = 2,
    DBLCLICK = 3
}
interface props {
    nativeEventPrev?: boolean;
    nativeEventStop?: boolean;
    el: HTMLElement | string;
    status?: Status;
    canDraw?: boolean;
    penColor?: string;
    penWidth?: number;
    component?: CropComponent[];
    canRender?: boolean;
    graphics?: Graphics[];
}
interface cropState {
    penStatus: Status;
    penColor: string;
    penWidth: number;
}
export default class Crop extends EventHub {
    private model;
    private undoRedoContext;
    private nativeEventStop;
    private nativeEventPrev;
    private canRender;
    private el;
    private canDraw;
    private state;
    private context;
    private _translatePosition;
    private _focus;
    private _isMDown;
    private _disappearColor;
    private _renderer;
    private _container;
    private graphicsMap;
    private currentGraphics;
    private events;
    private currentPage;
    private _installedCom;
    constructor(option: Required<props>, ready?: (...arg: any[]) => void);
    translateRender(data?: {
        x?: number;
        y?: number;
    }): void;
    drawCurrentGroup(strokes?: Graphics[] | Graphics): void;
    drawGraphics(ctx: CanvasRenderingContext2D, strokes?: Graphics[]): void;
    getSelectGraphics(point: point): Graphics | undefined | null;
    getCrashActiveLineAndRemove(currentPage: Graphics[], ePoint: point, radius: number, once?: boolean): Graphics[];
    getRectCrashLine(currentPage: Graphics[], limitValue: limitValue, isRemove?: boolean): Graphics[];
    registerEvents(): void;
    unuse(name: string): void;
    use(option: CropComponent): Promise<ComFunc>;
    dispose(): void;
    closeHandWrite(): void;
    openHandWrite(): void;
    closeRender(): void;
    openRender(): void;
    clearDisappear(): void;
    setPenWidth(penWidth: number): void;
    setPenColor(color: string): void;
    setToRubber(): void;
    setToWriting(): void;
    setToDisappear(): void;
    setDrawStatus(value: Status): void;
    get activeGroupName(): string | number;
    get statusConfig(): cropState;
    get penColor(): string;
    get normalPenColor(): string;
    get width(): number;
    get height(): number;
    isNormalPen(): boolean;
    set disappearColor(color: string);
    get disappearColor(): string;
    focus(): void;
    blur(): void;
    resize(screen?: rect): void;
    changDataSource(name?: string): string | number;
    clear(): void;
    get penWidth(): number;
    reset(): void;
    get canUndo(): boolean;
    undo(): void;
    get canRedo(): boolean;
    getModel(): import("./model/InkModel").groupStroke;
    redo(): void;
    onEvent(event: TouchEvent | MouseEvent): void;
    handleTouchEvent(event: localTouchEvent): void;
    appendToImage(data: properties): void;
    dispatchLocalEvent(data: originDataI | originDataI[]): void;
    dispatchEvent(data: originDataI): void;
    areaRemove({ limitValue }: areaParams): void;
    areaCopy({ limitValue, offsetY, offsetX }: areaParams): void;
    areaMove({ deviationX, deviationY }: {
        deviationX: number;
        deviationY: number;
    }, crashActiveLine: editDataI[]): void;
    areaMoveV2({ limitValue, offsetY, offsetX }: areaParams, crashActiveLine?: editDataI[]): void;
    getDataURL(params?: {
        type?: 'Base64' | 'Blob';
        backgroundColor?: string;
        mimeType?: string;
        backgroundImage?: string;
        area?: {
            x: number;
            y: number;
            height: number;
            width: number;
        };
    }): Promise<unknown>;
    render(strokes?: Graphics[]): void;
    capturingDrawCurrentStroke(strokes: editDataI | editDataI[]): void;
    createNode(type: 'TextNode' | 'ImageNode' | 'PathNode', properties: {
        imageOrUri?: string | HTMLImageElement;
        x?: number;
        y?: number;
        text?: string;
        lineHeight?: number;
    }): Promise<void>;
    add(g: Graphics): this;
    getActiveObject(): Graphics | undefined;
    private appendCom;
    private createComFunc;
    private init;
    get renderer(): typeof renderer;
    private initGraphics;
    private setCanDraw;
    private setCanRender;
}
export declare function createApp(option: props): Crop;
export declare type FontString = string & {
    _brand: 'fontString';
};
export declare const getFontString: ({ fontSize }: {
    fontSize: number;
}) => FontString;
export declare const measureText: (text: string, font: FontString) => {
    width: number;
    height: number;
    baseline: number;
};
