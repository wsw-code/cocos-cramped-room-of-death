import { _decorator, Component, director, Node } from 'cc'
import { FaderManager } from '../../Runtime/FaderManager'
import { SCENE_ENUM } from '../../Enum'

const { ccclass } = _decorator

@ccclass('StartManager')
export class StartManager extends Component {
  onLoad() {
    FaderManager.Instance.fadeOut(1000)
    this.node.once(Node.EventType.TOUCH_END, this.handleStart, this)
  }

  async handleStart() {
    await FaderManager.Instance.fadeIn(300)
    director.loadScene(SCENE_ENUM.Battle)
  }
}
