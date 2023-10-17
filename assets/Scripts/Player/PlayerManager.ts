import { _decorator, Animation, Component, Sprite, UITransform, AnimationClip, animation, SpriteFrame } from 'cc'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { ResourceManager } from '../../Runtime/ResourceManager'
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  DIRECTION_ORDER_ENUM,
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
  PARAMS_NAME_ENUM,
} from '../../Enum'
import { EventManager } from '../../Runtime/EventManager'
import { PlayerStateMachine } from './PlayerStateMachine'
const { ccclass } = _decorator

const ANIMATION_SPEED = 1 / 8

@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x: number = 0
  y: number = 0
  targetX: number = 0
  targetY: number = 0
  private readonly speed = 1 / 10
  fsm: PlayerStateMachine = null

  private _direction: DIRECTION_ENUM
  private _state: ENTITY_STATE_ENUM

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

  async init() {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    this.direction = DIRECTION_ENUM.TOP
    this._state = ENTITY_STATE_ENUM.IDLE
    this.render()
    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
  }

  protected update(dt: number): void {
    this.updateXY()
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + 1.5 * TILE_HEIGHT)
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
      // this.fsm.setParams(PARAMS_NAME_ENUM.TURNLEFT, true)

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
    }
  }

  async render() {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    const spriteFrames = await ResourceManager.Instance.loadDir('texture/player/idle/top')

    const animationComponent = this.addComponent(Animation)

    const animationClip = new AnimationClip()

    const track = new animation.ObjectTrack() // 创建一个对象轨道

    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')

    const frames: Array<[number, SpriteFrame]> = spriteFrames.map((el, index) => [ANIMATION_SPEED * index, el])

    track.channel.curve.assignSorted(frames)

    // 最后将轨道添加到动画剪辑以应用
    animationClip.addTrack(track)
    animationClip.duration = frames.length * ANIMATION_SPEED
    animationClip.wrapMode = AnimationClip.WrapMode.Loop
    animationComponent.defaultClip = animationClip
    animationComponent.play()
  }
}
