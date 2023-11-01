import { _decorator, Animation } from 'cc'
import { ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from '../../Enum'
import { StateMachine, getInitParamsNumber, getInitParamsTrigger } from '../../Base/StateMachine'
import SpikeOneSubStateMachine from './SpikeOneSubStateMachine'
import SpikeTwoSubStateMachine from './SpikeTwoSubStateMachine'
import SpikeThreeSubStateMachine from './SpikeThreeSubStateMachine'
import SpikeFourSubStateMachine from './SpikeFourSubStateMachine'

const { ccclass } = _decorator

@ccclass('SpikeStateMachine')
export class SpikeStateMachine extends StateMachine {
  async init() {
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachine()

    await Promise.all(this.waitingList)
  }

  initStateMachine() {
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_ONE, new SpikeOneSubStateMachine(this))
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_TWO, new SpikeTwoSubStateMachine(this))
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_THREE, new SpikeThreeSubStateMachine(this))
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_FOUR, new SpikeFourSubStateMachine(this))
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, getInitParamsNumber())
    this.params.set(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, getInitParamsNumber())
  }

  run() {
    const value = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT)
    switch (this.currentState) {
      case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE):
        if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE) {
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE)
        } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO) {
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO)
        } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE) {
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE)
        } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR) {
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR)
        } else {
          this.currentState = this.currentState
        }
        break
      default:
        this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE)
        break
    }
  }
}
