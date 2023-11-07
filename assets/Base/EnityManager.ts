import { _decorator, Animation, Component, Sprite, UITransform, AnimationClip, animation, SpriteFrame } from 'cc'
import { TILE_HEIGHT, TILE_WIDTH } from '../Scripts/Tile/TileManager'
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  DIRECTION_ORDER_ENUM,
  ENTITY_STATE_ENUM,
  ENTITY_TYPE_ENUM,
  EVENT_ENUM,
  PARAMS_NAME_ENUM,
} from '../Enum'

import { IEntity } from '../Levels'
const { ccclass } = _decorator
import { randomByLen } from '../Utils'
import { StateMachine } from './StateMachine'

@ccclass('EnityManager')
export class EnityManager extends Component {
  x: number = 0
  y: number = 0
  id: string = randomByLen(12)
  fsm: StateMachine = null

  private _direction: DIRECTION_ENUM
  private _state: ENTITY_STATE_ENUM
  type: ENTITY_TYPE_ENUM

  get direction() {
    return this._direction
  }

  set direction(newDirection: DIRECTION_ENUM) {
    this._direction = newDirection
    this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[this._direction])
  }

  get state() {
    return this._state
  }
  set state(newState: ENTITY_STATE_ENUM) {
    this._state = newState
    this.fsm.setParams(newState, true)
  }

  async init(params: IEntity) {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    this.x = params.x
    this.y = params.y
    this.type = params.type
    this.direction = params.direction
    this.state = params.state
    // this.render()
  }

  protected update(): void {
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + 1.5 * TILE_HEIGHT)
  }
}
