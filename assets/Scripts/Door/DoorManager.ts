import { _decorator } from 'cc'

import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { EnityManager } from '../../Base/EnityManager'
import { EventManager } from '../../Runtime/EventManager'
import { DataManager } from '../../Runtime/DataManager'
import { DoorStateMachine } from './DoorStateMachine'
import { IEntity } from '../../Levels'
const { ccclass } = _decorator

@ccclass('DoorManager')
export class DoorManager extends EnityManager {
  async init(params: IEntity) {
    this.fsm = this.addComponent(DoorStateMachine)
    await this.fsm.init()
    super.init(params)
    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this)
  }
  protected onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen)
  }
  onOpen() {
    if (
      DataManager.Instance.enemies.every(el => el.state === ENTITY_STATE_ENUM.DEATH) &&
      this.state !== ENTITY_STATE_ENUM.DEATH
    ) {
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }
}
