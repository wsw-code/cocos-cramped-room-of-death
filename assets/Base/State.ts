/**
 * 需要知道animationClip
 * 需要有播放动画的能力
 */

import { AnimationClip, Sprite, SpriteFrame, animation } from 'cc'
import { ResourceManager } from '../Runtime/ResourceManager'
import { StateMachine } from './StateMachine'
export const ANIMATION_SPEED = 1 / 8

const getNumberFromString = (a: string) => {
  let num = Number(a.replace(/[^0-9]/gi, ''))
  return num ? num : 0
}

export default class State {
  private animationClip: AnimationClip = null
  constructor(
    private fsm: StateMachine,
    private path: string,
    private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal,
    private speed: number = ANIMATION_SPEED,
  ) {
    this.init()
  }

  async init() {
    const promise = ResourceManager.Instance.loadDir(this.path)
    this.fsm.waitingList.push(promise)
    const spriteFrames = await promise

    this.animationClip = new AnimationClip()

    const track = new animation.ObjectTrack() // 创建一个对象轨道

    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')

    /**
     * 使用sort 确保动画播放顺序
     */
    const frames: Array<[number, SpriteFrame]> = spriteFrames
      .sort((a, b) => getNumberFromString(a.name) - getNumberFromString(b.name))
      .map((el, index) => [this.speed * index, el])

    track.channel.curve.assignSorted(frames)

    // 最后将轨道添加到动画剪辑以应用
    this.animationClip.addTrack(track)
    this.animationClip.name = this.path
    this.animationClip.duration = frames.length * this.speed
    this.animationClip.wrapMode = this.wrapMode
  }

  run() {
    if (this.fsm?.animationComponent?.defaultClip === this.animationClip) {
      return
    }
    this.fsm.animationComponent.defaultClip = this.animationClip
    this.fsm.animationComponent.play()
  }
}
