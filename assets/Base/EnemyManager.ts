import { _decorator } from 'cc'

import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../Enum'
import { EnityManager } from './EnityManager'
import { EventManager } from '../Runtime/EventManager'
import { DataManager } from '../Runtime/DataManager'
import { IEntity } from '../Levels'
const { ccclass } = _decorator

@ccclass('EnemyManager')
export class EnemyManager extends EnityManager {
  init(params: IEntity) {
    super.init(params)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this)
    this.onChangeDirection(true)
  }
  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection)
    EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead)
  }
  onDead(id: string) {
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return
    }

    if (this.id === id) {
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }

  onChangeDirection(isInit: boolean = false) {
    if (this.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN) {
      console.log(this.id)
    }

    if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player) {
      return
    }
    const { x: playerX, y: playerY } = DataManager.Instance.player
    const disX = Math.abs(this.x - playerX)
    const disY = Math.abs(this.y - playerY)

    if (disX === disY && !isInit) {
      return
    }

    if (playerX >= this.x && this.y >= playerY) {
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.RIGHT
    } else if (playerX <= this.x && playerY <= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.LEFT
    } else if (playerX <= this.x && playerY >= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.LEFT
    } else if (playerX >= this.x && playerY >= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.RIGHT
    }
  }
}
