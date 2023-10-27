import { _decorator } from 'cc'

import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { EnityManager } from '../../Base/EnityManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'
import { EventManager } from '../../Runtime/EventManager'
import { DataManager } from '../../Runtime/DataManager'
const { ccclass } = _decorator

@ccclass('PlayerManager')
export class WoodenSkeletonManager extends EnityManager {
  async init() {
    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()

    super.init({
      x: 1,
      y: 7,
      type: ENTITY_TYPE_ENUM.PLAYER,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
    this.onChangeDirection(true)
  }
  onChangeDirection(isInit: boolean = false) {
    if (!DataManager.Instance.player) {
      return
    }

    const { x: playerX, y: playerY } = DataManager.Instance.player

    const disX = Math.abs(this.x - playerX)
    const disY = Math.abs(this.y - playerY)

    if (disX === disY && !isInit) {
      return
    }

    if (playerX >= this.x && playerY <= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.RIGHT
    } else if (playerX <= this.x && playerY <= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.LEFT
    } else if (playerX <= this.x && playerY >= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.LEFT
    } else if (playerX >= this.x && playerY >= this.y) {
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.RIGHT
    }
    // console.log(this.direction, this.x, playerX, this.y, playerX)
  }

  onAttack() {
    if (!DataManager.Instance.player) {
      return
    }

    const { x: playerX, y: playerY, state: playerState } = DataManager.Instance.player

    if (
      ((this.x === playerX && Math.abs(this.y - playerY) <= 1) ||
        (this.y === playerY && Math.abs(this.x - playerX) <= 1)) &&
      playerState !== ENTITY_STATE_ENUM.DEATH &&
      playerState !== ENTITY_STATE_ENUM.AIRDEATH
    ) {
      this.state = ENTITY_STATE_ENUM.ATTACK
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
    } else {
      this.state = ENTITY_STATE_ENUM.IDLE
    }
  }
}
