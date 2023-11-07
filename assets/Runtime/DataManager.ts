import { _decorator, Component, Node } from 'cc'
import { ILevel, ITile } from '../Levels'
import Singleton from '../Base/Singleton'
import { TileManager } from '../Scripts/Tile/TileManager'
import { PlayerManager } from '../Scripts/Player/PlayerManager'

import { DoorManager } from '../Scripts/Door/DoorManager'
import { EnemyManager } from '../Base/EnemyManager'
import { BurstManager } from '../Scripts/Burst/BurstManager'
import { SpikesManager } from '../Scripts/Spikes/SpikesManager'
import { SmokeManager } from '../Scripts/Smoke/SmokeManager'

export type IRecord = Omit<ILevel, 'mapInfo'>

export class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>()
  }
  titleInfo: Array<Array<TileManager>>
  mapInfo: Array<Array<ITile>>
  mapRowCount: number = 0
  mapColumnCount: number = 0
  levelIndex: number = 1
  player: PlayerManager
  smokes: SmokeManager[] = []
  enemies: EnemyManager[] = []
  bursts: BurstManager[] = []
  spikes: SpikesManager[] = []
  door: DoorManager
  records: IRecord[] = []
  reset() {
    this.mapRowCount = 0
    this.mapColumnCount = 0
    this.player = null
    this.enemies = []
    this.bursts = []
    this.spikes = []
    this.mapInfo = []
    this.titleInfo = []
    this.smokes = []
    this.records = []
  }
}
