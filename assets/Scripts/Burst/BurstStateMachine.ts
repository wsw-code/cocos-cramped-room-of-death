import { _decorator, Animation } from 'cc'
import { PARAMS_NAME_ENUM } from '../../Enum'
import { StateMachine, getInitParamsNumber, getInitParamsTrigger } from '../../Base/StateMachine'
import State from '../../Base/State'

const IDLE_BASE_URL = 'texture/burst/idle'
const ATTACK_BASE_URL = 'texture/burst/attack'
const DEATH_BASE_URL = 'texture/burst/death'

const { ccclass } = _decorator

@ccclass('BurstStateMachine')
export class BurstStateMachine extends StateMachine {
  async init() {
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachine()

    await Promise.all(this.waitingList)
  }

  initStateMachine() {
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new State(this, IDLE_BASE_URL))
    this.stateMachines.set(PARAMS_NAME_ENUM.ATTACK, new State(this, ATTACK_BASE_URL))
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH, new State(this, DEATH_BASE_URL))
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber())
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsNumber())
  }

  run() {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
      case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
        if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        } else if (this.params.get(PARAMS_NAME_ENUM.ATTACK).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK)
        } else if (this.params.get(PARAMS_NAME_ENUM.DEATH).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH)
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
