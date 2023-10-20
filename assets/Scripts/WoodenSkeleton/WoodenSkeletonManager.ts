import { _decorator } from 'cc'

import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM } from '../../Enum'
import { EnityManager } from '../../Base/EnityManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'
const { ccclass } = _decorator

@ccclass('PlayerManager')
export class WoodenSkeletonManager extends EnityManager {
  async init() {
    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()

    super.init({
      x: 7,
      y: 7,
      type: ENTITY_TYPE_ENUM.PLAYER,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })
  }
}
