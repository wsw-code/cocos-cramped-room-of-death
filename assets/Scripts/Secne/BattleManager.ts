import { _decorator, Component, Node } from 'cc'
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import Levels, { ILevel } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { DataManager } from 'db://assets/Runtime/DataManager'
import { EventManager } from '../../Runtime/EventManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { PlayerManager } from '../Player/PlayerManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'
import { DoorManager } from '../Door/DoorManager'
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager'
import { BurstManager } from '../Burst/BurstManager'
import { SpikesManager } from '../Spikes/SpikesManager'
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
    this.generateEnemies()
    this.generateIronEnemies()
    this.generateBursts()
    this.generateSpikes()
    this.generatePlayer()
    this.generateDoor()
  }

  initLevel() {
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

  async generateBursts() {
    const player = createUINode()
    player.setParent(this.stage)
    const burstManager = player.addComponent(BurstManager)
    await burstManager.init({
      x: 2,
      y: 6,
      type: ENTITY_TYPE_ENUM.DOOR,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })
    DataManager.Instance.bursts.push(burstManager)
  }

  async generateDoor() {
    const player = createUINode()
    player.setParent(this.stage)
    const doorManager = player.addComponent(DoorManager)
    await doorManager.init({
      x: 7,
      y: 8,
      type: ENTITY_TYPE_ENUM.DOOR,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })
    DataManager.Instance.door = doorManager
  }

  async generateSpikes() {
    const player = createUINode()
    player.setParent(this.stage)
    const spikesManager = player.addComponent(SpikesManager)
    await spikesManager.init({
      x: 2,
      y: 3,
      type: ENTITY_TYPE_ENUM.SPIKES_FOUR,
      count: 0,
    })
    DataManager.Instance.spikes.push(spikesManager)
  }

  async generatePlayer() {
    const player = createUINode()
    player.setParent(this.stage)
    const playerManager = player.addComponent(PlayerManager)
    await playerManager.init()
    DataManager.Instance.player = playerManager
    EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true)
  }

  async generateEnemies() {
    const enemy = createUINode()
    enemy.setParent(this.stage)
    const enemyManager = enemy.addComponent(WoodenSkeletonManager)
    await enemyManager.init({
      x: 7,
      y: 5,
      type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })
    DataManager.Instance.enemies.push(enemyManager)
  }

  async generateIronEnemies() {
    const enemy = createUINode()
    enemy.setParent(this.stage)
    const ironEnemyManager = enemy.addComponent(IronSkeletonManager)
    await ironEnemyManager.init({
      x: 7,
      y: 3,
      type: ENTITY_TYPE_ENUM.SKELETON_IRON,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    })
    DataManager.Instance.enemies.push(ironEnemyManager)
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

  async generateTileMap() {
    const tileMap = createUINode()
    tileMap.setParent(this.stage)
    const tileMapManager = tileMap.addComponent(TileMapManager)
    await tileMapManager.init()
    this.adaptPos()
  }

  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = -(TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
    this.stage.setPosition(disX, disY)
  }
}
