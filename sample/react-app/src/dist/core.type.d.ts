import { newPoint, limitValue } from './utils';
import { Graphics } from './render/Symbols/Shape';
export interface ComFunc<T = any> {
    createEl: (el: HTMLElement, outerLayer: HTMLElement) => void;
    ready: (crop: T) => void;
    destroy: () => void;
    new (): ComFunc<T>;
}
export interface CropComponent {
    name: string;
    type: ComFunc;
    params?: any[];
}
export declare enum eventType {
    MOVE = 0,
    DOWN = 1,
    UP = 2,
    DBLCLICK = 3
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
export interface CropProps {
    nativeEventPrev?: boolean;
    nativeEventStop?: boolean;
    el: HTMLElement | string;
    status?: number;
    canDraw?: boolean;
    penColor?: string;
    penWidth?: number;
    component?: CropComponent[];
    canRender?: boolean;
    graphics?: Graphics[];
}
export interface CropState {
    penStatus: number;
    penColor: string;
    penWidth: number;
}
//# sourceMappingURL=core.type.d.ts.map