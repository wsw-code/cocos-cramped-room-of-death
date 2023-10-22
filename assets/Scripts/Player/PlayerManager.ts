import { _decorator } from 'cc'

import { CONTROLLER_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { EventManager } from '../../Runtime/EventManager'
import { PlayerStateMachine } from './PlayerStateMachine'
import { EnityManager } from '../../Base/EnityManager'
import { DataManager } from '../../Runtime/DataManager'
const { ccclass } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends EnityManager {
  targetX: number = 0
  targetY: number = 0
  private readonly speed = 1 / 10

  async init() {
    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    this.x = 2
    this.y = 8
    this.targetX = this.x
    this.targetY = this.y
    super.init({
      x: this.x,
      y: this.y,
      type: ENTITY_TYPE_ENUM.PLAYER,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputHandle, this)
  }

  protected update(): void {
    this.updateXY()
    super.update()
  }

  updateXY() {
    if (this.targetX < this.x) {
      this.x -= this.speed
    } else if (this.targetX > this.x) {
      this.x += this.speed
    }

    if (this.targetY < this.y) {
      this.y -= this.speed
    } else if (this.targetY > this.y) {
      this.y += this.speed
    }

    if (Math.abs(this.targetX - this.x) <= 0.1 && Math.abs(this.targetY - this.y) <= 0.1) {
      this.x = this.targetX
      this.y = this.targetY
    }
  }

  inputHandle(inputDirection: CONTROLLER_ENUM) {
    if (this.willBlock(inputDirection)) {
      return
    }

    this.move(inputDirection)
  }

  move(inputDirection: CONTROLLER_ENUM) {
    if (inputDirection === CONTROLLER_ENUM.TOP) {
      this.targetY -= 1
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
      this.targetX += 1
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      if (this.direction === DIRECTION_ENUM.TOP) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.TOP
      }
      this.state = ENTITY_STATE_ENUM.TURNLEFT
    } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
      if (this.direction === DIRECTION_ENUM.TOP) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.TOP
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      }
      this.state = ENTITY_STATE_ENUM.TURNRIGHT
    }
  }
  willBlock(inputDirection: CONTROLLER_ENUM) {
    const { targetX: x, targetY: y, direction } = this
    const { titleInfo } = DataManager.Instance

    if (inputDirection === CONTROLLER_ENUM.TOP) {
      const playerNextY = y - 1
      if (direction === DIRECTION_ENUM.TOP) {
        const weaponNextY = y - 2
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        const playerTile = titleInfo[x]?.[playerNextY]
        const weaponTile = titleInfo[x]?.[weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      }
      if (direction === DIRECTION_ENUM.LEFT) {
        const playerNextX = x
        const weaponNextX = x - 1
        const weaponNextY = y - 1
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      }
      if (direction === DIRECTION_ENUM.BOTTOM) {
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        const playerTile = titleInfo[x]?.[playerNextY]
        if (playerTile && playerTile.moveable) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      }
      if (direction === DIRECTION_ENUM.RIGHT) {
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        const playerNextX = x
        const weaponNextX = x - 1
        const weaponNextY = y - 1
        const playerTile = titleInfo[playerNextX]?.[playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      const playerNextY = y + 1

      if (direction === DIRECTION_ENUM.TOP) {
        const playerNextX = x
        const weaponNextX = x
        const weaponNextY = y

        const playerTile = titleInfo[playerNextX]?.[playerNextY]
        const weaponTile = titleInfo[weaponNextX]?.[weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      }
      if (direction === DIRECTION_ENUM.LEFT) {
        const playerNextX = x
        const weaponNextX = x - 1
        const weaponNextY = y + 1
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      }
      if (direction === DIRECTION_ENUM.BOTTOM) {
        const playerNextX = x
        const weaponNextX = x
        const weaponNextY = y + 2

        const playerTile = titleInfo[playerNextX]?.[playerNextY]
        const weaponTile = titleInfo[weaponNextX]?.[weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      }
      if (direction === DIRECTION_ENUM.RIGHT) {
        const playerNextX = x
        const weaponNextX = x + 1
        const weaponNextY = y + 1
        const playerTile = titleInfo[playerNextX]?.[playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      const playerNextX = x - 1
      if (direction === DIRECTION_ENUM.TOP) {
        const playerNextY = y
        const weaponNextX = x - 1
        const weaponNextY = y - 1
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT

          return true
        }
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        const playerNextY = y
        const weaponNextX = x - 1
        const weaponNextY = y + 1
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      } else if (direction === DIRECTION_ENUM.LEFT) {
        const playerNextY = y
        const weaponNextX = x - 2
        const weaponNextY = y
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        const playerNextY = y
        const weaponNextX = x - 1
        const weaponNextY = y
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
      const playerNextX = x + 1
      if (direction === DIRECTION_ENUM.TOP) {
        const playerNextY = y
        const weaponNextX = x + 1
        const weaponNextY = y - 1
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT

          return true
        }
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        const playerNextY = y
        const weaponNextX = x + 1
        const weaponNextY = y + 1
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      } else if (direction === DIRECTION_ENUM.LEFT) {
        const playerNextY = y
        const weaponNextX = x + 1
        const weaponNextY = y
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        const playerNextY = y
        const weaponNextX = x + 2
        const weaponNextY = y
        const playerTile = titleInfo[playerNextX][playerNextY]
        const weaponTile = titleInfo[weaponNextX][weaponNextY]
        if (playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)) {
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      let nextX
      let nextY
      if (direction === DIRECTION_ENUM.TOP) {
        nextX = x - 1
        nextY = y - 1
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextX = x + 1
        nextY = y + 1
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextX = x - 1
        nextY = y + 1
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextX = x + 1
        nextY = y - 1
      }

      if (
        (!titleInfo[x][nextY] || titleInfo[x][nextY].turnable) &&
        (!titleInfo[nextX][y] || titleInfo[nextX][y].turnable) &&
        (!titleInfo[nextX][nextY] || titleInfo[nextX][nextY].turnable)
      ) {
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT
        return true
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
      let nextX
      let nextY
      if (direction === DIRECTION_ENUM.TOP) {
        nextX = x + 1
        nextY = y - 1
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextX = x - 1
        nextY = y + 1
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextX = x - 1
        nextY = y - 1
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextX = x + 1
        nextY = y + 1
      }

      if (
        (!titleInfo[x][nextY] || titleInfo[x][nextY].turnable) &&
        (!titleInfo[nextX][y] || titleInfo[nextX][y].turnable) &&
        (!titleInfo[nextX][nextY] || titleInfo[nextX][nextY].turnable)
      ) {
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT
        return true
      }
    }

    return false
  }
}
