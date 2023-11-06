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
import { SmokeManager } from '../Smoke/SmokeManager'
import { FaderManager } from '../../Runtime/FaderManager'
const { ccclass } = _decorator

@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node
  smokeLayer: Node

  protected onLoad(): void {
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkedArrived, this)
    EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this)
  }

  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkedArrived)
    EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke)
  }

  checkedArrived() {
    const { x: playX, y: playY, state } = DataManager.Instance.player
    const { x: doorX, y: doorY } = DataManager.Instance.door
    if (playX === doorX && playY === doorY && state !== ENTITY_STATE_ENUM.DEATH) {
      EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL)
    }
  }

  start() {
    this.generateStage()
    this.initLevel()
  }

  async initLevel() {
    const level = Levels[`level${DataManager.Instance.levelIndex}`]
    if (level) {
      await FaderManager.Instance.fadeIn()
      this.clearLevel()
      this.level = level
      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      this.generateTileMap()

      await Promise.all([
        this.generateTileMap(),
        this.generateBursts(),
        this.generateSpikes(),
        this.generateSmokeLayer(),
        this.generateDoor(),
        this.generateEnemies(),
        this.generatePlayer(),
      ])

      await FaderManager.Instance.fadeOut()
    }
  }

  generateSmokeLayer() {
    this.smokeLayer = createUINode()
    this.smokeLayer.setParent(this.stage)
  }

  async generateBursts() {
    const promise = []
    for (let index = 0; index < this.level.bursts.length; index++) {
      const bursts = this.level.bursts[index]
      const node = createUINode()
      node.setParent(this.stage)
      const burstManager = node.addComponent(BurstManager)
      promise.push(burstManager.init(bursts))
      DataManager.Instance.bursts.push(burstManager)
    }
    await Promise.all(promise)
  }

  async generateSmoke(x: number, y: number, direction: DIRECTION_ENUM) {
    // const item = DataManager.Instance.smokes.find(el => el.state === ENTITY_STATE_ENUM.DEATH)

    // if (item) {
    //   item.x = x
    //   item.y = y
    //   item.direction = direction
    //   item.state = ENTITY_STATE_ENUM.IDLE
    //   item.node.setPosition(x * TILE_WIDTH - TILE_WIDTH * 1.5, -y * TILE_HEIGHT + 1.5 * TILE_HEIGHT)
    // } else {

    // }

    const node = createUINode()
    node.setParent(this.smokeLayer)
    const smokeManager = node.addComponent(SmokeManager)
    await smokeManager.init({
      x,
      y,
      direction,
      state: ENTITY_STATE_ENUM.IDLE,
      type: ENTITY_TYPE_ENUM.SMOKE,
    })
    DataManager.Instance.smokes.push(smokeManager)
    // EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true)
  }

  async generateDoor() {
    const player = createUINode()
    player.setParent(this.stage)
    const doorManager = player.addComponent(DoorManager)
    await doorManager.init(this.level.door)
    DataManager.Instance.door = doorManager
  }

  async generateSpikes() {
    const promise = []
    for (let index = 0; index < this.level.bursts.length; index++) {
      const spike = this.level.spikes[index]
      const node = createUINode()
      node.setParent(this.stage)

      const spikesManager = node.addComponent(SpikesManager)
      promise.push(spikesManager.init(spike))
      DataManager.Instance.spikes.push(spikesManager)
    }
    await Promise.all(promise)
  }

  async generatePlayer() {
    const node = createUINode()
    node.setParent(this.stage)
    const playerManager = node.addComponent(PlayerManager)
    await playerManager.init(this.level.player)
    DataManager.Instance.player = playerManager
    EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true)
  }

  async generateEnemies() {
    const promise = []
    for (let index = 0; index < this.level.enemies.length; index++) {
      const enemy = this.level.enemies[index]
      const node = createUINode()
      node.setParent(this.stage)
      const Manager = enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN ? WoodenSkeletonManager : IronSkeletonManager
      const manager = node.addComponent(Manager)
      promise.push(manager.init(enemy))
      DataManager.Instance.enemies.push(manager)
    }
    await Promise.all(promise)
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
