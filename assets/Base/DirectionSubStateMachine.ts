import { DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM } from '../Enum'
import { SubStateMachine } from './SubStateMachine'

export default class DirectionSubStateMachine extends SubStateMachine {
  run() {
    const value = this.fsm.getParams(PARAMS_NAME_ENUM.DIRECTION)
    console.log('currentState', this.currentState, value, DIRECTION_ORDER_ENUM[value as number])
    this.currentState = this.stateMachines.get(DIRECTION_ORDER_ENUM[value as number])
  }
}
