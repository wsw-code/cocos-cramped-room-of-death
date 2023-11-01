import { _decorator, UITransform } from 'cc'

import { CONTROLLER_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { BurstStateMachine } from './BurstStateMachine'
import { EnityManager } from '../../Base/EnityManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { IEntity } from '../../Levels'
import { EventManager } from '../../Runtime/EventManager'
import { DataManager } from '../../Runtime/DataManager'

const { ccclass } = _decorator

@ccclass('BurstManager')
export class BurstManager extends EnityManager {
  targetX: number = 0
  targetY: number = 0

  async init(params: IEntity) {
    this.fsm = this.addComponent(BurstStateMachine)
    await this.fsm.init()
    this.x = 2
    this.y = 7
    this.targetX = this.x
    this.targetY = this.y
    super.init(params)
    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this)
  }
  protected update(): void {
    this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT)
  }

  protected onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst)
  }

  onBurst() {
    if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player) {
      return
    }

    const { x: playerX, y: playerY } = DataManager.Instance.player

    if (this.x === playerX && this.y === playerY && this.state == ENTITY_STATE_ENUM.IDLE) {
      this.state = ENTITY_STATE_ENUM.ATTACK
    } else if (this.state === ENTITY_STATE_ENUM.ATTACK) {
      this.state = ENTITY_STATE_ENUM.DEATH

      if (this.x === playerX && this.y === playerY) {
        EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.AIRDEATH)
      }
    }
  }
}
