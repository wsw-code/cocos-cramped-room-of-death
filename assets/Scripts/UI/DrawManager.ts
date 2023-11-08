import { _decorator, Color, Component, Event, Graphics, view, game, BlockInputEvents, UITransform } from 'cc'
import { EventManager } from '../../Runtime/EventManager'
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enum'
const { ccclass, property } = _decorator

const SCREEN_WIDTH = view.getVisibleSize().width
const SCREEN_HEIGHT = view.getVisibleSize().height

enum FadeStatus {
  IDLE,
  FADE_IN,
  FADE_OUT,
}

export const DEFAULT_FADE_DURATION = 200

@ccclass('DrawManager')
export class DrawManager extends Component {
  private ctx: Graphics
  fadeStatus: FadeStatus = FadeStatus.IDLE
  private oldTime: number = 0
  private duration: number = DEFAULT_FADE_DURATION
  private fadeResolve: (value: PromiseLike<null>) => void
  private block: BlockInputEvents
  init() {
    this.ctx = this.addComponent(Graphics)
    this.block = this.addComponent(BlockInputEvents)
    const transform = this.getComponent(UITransform)
    transform.setAnchorPoint(0.5, 0.5)
    transform.setContentSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    this.setAlpha(1)
  }

  setAlpha(percent: number) {
    this.ctx.clear()
    this.ctx.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    this.ctx.fillColor = new Color(0, 0, 0, 255 * percent)
    this.ctx.fill()
    this.block.enabled = percent === 1
  }

  update() {
    const percent = (game.totalTime - this.oldTime) / this.duration
    switch (this.fadeStatus) {
      case FadeStatus.FADE_IN:
        if (percent < 1) {
          this.setAlpha(percent)
        } else {
          this.setAlpha(1)
          this.fadeStatus = FadeStatus.IDLE
          this.fadeResolve(null)
        }
        break
      case FadeStatus.FADE_OUT:
        if (percent < 1) {
          this.setAlpha(1 - percent)
        } else {
          this.setAlpha(0)
          this.fadeStatus = FadeStatus.IDLE
          this.fadeResolve(null)
        }
        break
      default:
        break
    }
  }

  fadeIn(duration: number = DEFAULT_FADE_DURATION) {
    this.setAlpha(0)
    this.duration = duration
    this.oldTime = game.totalTime
    this.fadeStatus = FadeStatus.FADE_IN
    return new Promise(resolve => {
      this.fadeResolve = resolve
    })
  }
  fadeOut(duration: number = DEFAULT_FADE_DURATION) {
    this.setAlpha(1)
    this.duration = duration
    this.oldTime = game.totalTime
    this.fadeStatus = FadeStatus.FADE_OUT
    return new Promise(resolve => {
      this.fadeResolve = resolve
    })
  }
  mask() {
    this.setAlpha(1)
    return new Promise(resolve => {
      setTimeout(resolve, DEFAULT_FADE_DURATION)
    })
  }
}
