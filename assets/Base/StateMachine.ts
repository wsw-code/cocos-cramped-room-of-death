import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from 'cc'
import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from '../Enum'
import State from './State'
const { ccclass, property } = _decorator

type ParamsValueType = boolean | number

export interface IParamsValue {
  type: FSM_PARAM_TYPE_ENUM
  value: ParamsValueType
}

export const getInitParamsTrigger = () => {
  return {
    type: FSM_PARAM_TYPE_ENUM.TRIGGER,
    value: false,
  }
}

@ccclass('StateMachine')
export abstract class StateMachine extends Component {
  private _currentState: State = null
  params: Map<string, IParamsValue> = new Map()
  stateMachines: Map<string, State> = new Map()
  animationComponent: Animation = null
  waitingList: Array<Promise<SpriteFrame[]>> = []
  get currentState() {
    return this._currentState
  }

  set currentState(newState: State) {
    this._currentState = newState
    this._currentState.run()
  }

  getParams(paramsName: string) {
    if (this.params.has(paramsName)) {
      return this.params.get(paramsName).value
    }
  }

  setParams(paramsName: string, value: ParamsValueType) {
    console.log(this.params.get(paramsName).value, value)
    this.params.get(paramsName).value = value
    this.run()
    this.resetTrigger()
  }

  resetTrigger() {
    for (const [_, value] of this.params) {
      if (value.type === FSM_PARAM_TYPE_ENUM.TRIGGER) {
        value.value = false
      }
    }
  }

  abstract init(): void

  abstract run(): void
}
