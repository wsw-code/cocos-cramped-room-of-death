import { _decorator, Component, Node, RenderRoot2D, game, director } from 'cc'

import Singleton from '../Base/Singleton'
import { DEFAULT_FADE_DURATION, DrawManager } from '../Scripts/UI/DrawManager'
import { createUINode } from '../Utils'

export class FaderManager extends Singleton {
  static get Instance() {
    return super.GetInstance<FaderManager>()
  }

  private _fader: DrawManager = null

  get fader() {
    if (this._fader !== null) {
      return this._fader
    }

    const root = createUINode()
    root.addComponent(RenderRoot2D)
    const fadeNode = createUINode()
    fadeNode.setParent(root)
    this._fader = fadeNode.addComponent(DrawManager)
    this._fader.init()
    director.addPersistRootNode(root)
    return this._fader
  }

  fadeIn(duration: number = DEFAULT_FADE_DURATION) {
    return this.fader.fadeIn(duration)
  }
  fadeOut(duration: number = DEFAULT_FADE_DURATION) {
    return this.fader.fadeOut(duration)
  }
}
