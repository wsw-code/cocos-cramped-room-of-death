import { _decorator, Component, Sprite, UITransform } from 'cc'

import { ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from '../../Enum'

import { ISpikes } from '../../Levels'
const { ccclass } = _decorator
import { randomByLen } from '../../Utils'
import { StateMachine } from '../../Base/StateMachine'
import { SpikeStateMachine } from './SpikeStateMachine'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'

@ccclass('SpikesManager')
export class SpikesManager extends Component {
  x: number = 0
  y: number = 0
  id: string = randomByLen(12)
  fsm: StateMachine = null

  private _count: number
  private _totalCount: number
  private type: ENTITY_TYPE_ENUM

  get count() {
    return this._count
  }

  set count(newCount: number) {
    this._count = newCount
    this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, newCount)
  }

  get totalCount() {
    return this._totalCount
  }

  set totalCount(newCount: number) {
    this._totalCount = newCount
    this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, newCount)
  }

  async init(params: ISpikes) {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM
    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)
    this.fsm = this.addComponent(SpikeStateMachine)
    await this.fsm.init()
    this.x = params.x
    this.y = params.y
    this.totalCount = SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM[params.type]
    this.count = params.count
  }

  protected update(): void {
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + 1.5 * TILE_HEIGHT)
  }
}