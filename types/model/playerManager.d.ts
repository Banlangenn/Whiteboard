import Crop, { localTouchEvent, areaParams } from '../index';
import { editDataI } from '../render/SymbolCanvasRendener';
export interface playerI {
    originData: originDataI[];
    replayIndex: number;
    AFId: number;
    isPlay: boolean;
    play: (cropRef: Crop) => void;
    drag: (cropRef: Crop, timestamp: number) => void;
    pause: () => void;
    ended: (cropRef: Crop) => void;
}
export interface changeStatusI {
    name: string;
    value: string | number | areaParams;
}
export interface originDataI {
    t: number;
    v: editDataI | changeStatusI | localTouchEvent;
}
export default function createPlayer(originData?: originDataI[]): playerI;
