import { _decorator, Animation } from 'cc'
import { PARAMS_NAME_ENUM } from '../../Enum'
import { StateMachine, getInitParamsNumber, getInitParamsTrigger } from '../../Base/StateMachine'
import IdleSubStateMachine from './IdleSubStateMachine'
import TurnLeftSubStateMachine from './TurnLeftSubStateMachine'
const { ccclass } = _decorator

@ccclass('PlayerStateMachine')
export class PlayerStateMachine extends StateMachine {
  async init() {
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachine()
    this.initAnimationEvent()
    await Promise.all(this.waitingList)
  }

  initStateMachine() {
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this))

    this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT, new TurnLeftSubStateMachine(this))
  }

  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      const name = this.animationComponent.defaultClip.name
      const whiteList = ['turn']
      console.log('name = ', name)
      if (whiteList.some(v => name.includes(v))) {
        this.setParams(PARAMS_NAME_ENUM.IDLE, true)
      }
    })
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber())
  }

  run() {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT)
        } else if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        } else {
          this.currentState = this.currentState
        }
        break
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        break
    }
  }
}
