import { _decorator, Component, Node } from 'cc'
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import Levels, { ILevel } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { DataManager } from 'db://assets/Runtime/DataManager'
import { EventManager } from '../../Runtime/EventManager'
import { EVENT_ENUM } from '../../Enum'
import { PlayerManager } from '../Player/PlayerManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'
const { ccclass } = _decorator

@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node

  protected onLoad(): void {
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
  }

  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
  }

  start() {
    this.generateStage()
    this.initLevel()
    this.generatePlayer()
    this.generateEnemies()
  }

  initLevel() {
    // const level = levels[]
    const level = Levels[`level${DataManager.Instance.levelIndex}`]

    if (level) {
      this.clearLevel()
      this.level = level
      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      this.generateTileMap()
    }
  }

  generatePlayer() {
    const player = createUINode()
    player.setParent(this.stage)
    const playerManager = player.addComponent(PlayerManager)
    playerManager.init()
  }

  generateEnemies() {
    const enemy = createUINode()
    enemy.setParent(this.stage)
    const enemyManager = enemy.addComponent(WoodenSkeletonManager)
    enemyManager.init()
  }

  clearLevel() {
    DataManager.Instance.reset()
    this.stage.removeAllChildren()
  }

  nextLevel() {
    DataManager.Instance.levelIndex++
    this.initLevel()
  }

  generateStage() {
    this.stage = createUINode()
    this.stage.setParent(this.node)
  }

  generateTileMap() {
    const tileMap = createUINode()
    tileMap.setParent(this.stage)
    const tileMapManager = tileMap.addComponent(TileMapManager)
    tileMapManager.init()
    this.adaptPos()
  }

  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = -(TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
    this.stage.setPosition(disX, disY)
  }
}
