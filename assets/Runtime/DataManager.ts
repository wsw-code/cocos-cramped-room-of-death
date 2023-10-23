import { _decorator, Component, Node } from 'cc'
import { ITile } from '../Levels'
import Singleton from '../Base/Singleton'
import { TileManager } from '../Scripts/Tile/TileManager'
import { PlayerManager } from '../Scripts/Player/PlayerManager'
import { WoodenSkeletonManager } from '../Scripts/WoodenSkeleton/WoodenSkeletonManager'

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
  enemies: WoodenSkeletonManager[] = []
  reset() {
    this.mapInfo = []
    this.titleInfo = []
    this.mapRowCount = 0
    this.mapColumnCount = 0
    this.player = null
    this.enemies = []
  }
}
