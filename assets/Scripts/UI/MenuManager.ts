import { _decorator, Component, Event } from 'cc'
import { EventManager } from '../../Runtime/EventManager'
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enum'
const { ccclass, property } = _decorator

@ccclass('MenuManager')
export class MenuManager extends Component {
  hanledUndo() {
    EventManager.Instance.emit(EVENT_ENUM.REVOKE_STEP)
  }
}
