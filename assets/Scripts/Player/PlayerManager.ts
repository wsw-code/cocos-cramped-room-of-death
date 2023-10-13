import { _decorator, Animation, Component, Node, Sprite, UITransform, AnimationClip, animation, SpriteFrame } from 'cc'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { ResourceManager } from '../../Runtime/ResourceManager'
import { CONTROLLER_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import { EventManager } from '../../Runtime/EventManager'
import { PlayerStateMachine } from './PlayerStateMachine'
const { ccclass, property } = _decorator

const ANIMATION_SPEED = 1 / 8

@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x: number = 0
  y: number = 0
  targetX: number = 0
  targetY: number = 0
  private readonly speed = 1 / 10
  fsm: PlayerStateMachine = null

  async init() {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    this.fsm.setParams(PARAMS_NAME_ENUM.IDLE, true)
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
      this.fsm.setParams(PARAMS_NAME_ENUM.TURNLEFT, true)
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
