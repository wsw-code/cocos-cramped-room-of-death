import { _decorator } from 'cc'
import { EnemyManager } from '../../Base/EnemyManager'
import { IEntity } from '../../Levels'
import { SmokeStateMachine } from './SmokeStateMachine'
const { ccclass } = _decorator

@ccclass('SmokeManager')
export class SmokeManager extends EnemyManager {
  async init(params: IEntity) {
    this.fsm = this.addComponent(SmokeStateMachine)
    await this.fsm.init()
    super.init(params)
    this.onChangeDirection(true)
  }
  onDestroy(): void {
    super.onDestroy()
  }
}
