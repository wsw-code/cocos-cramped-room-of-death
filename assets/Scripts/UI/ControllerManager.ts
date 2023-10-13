import { _decorator, Component, Event } from 'cc'
import { EventManager } from '../../Runtime/EventManager'
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enum'
const { ccclass, property } = _decorator

@ccclass('ControllerManager')
export class ControllerManager extends Component {
  hanledCtrl(evt: Event, type: string) {
    console.log(type)
    EventManager.Instance.emit(EVENT_ENUM.PLAYER_CTRL, type as CONTROLLER_ENUM)
  }
}
