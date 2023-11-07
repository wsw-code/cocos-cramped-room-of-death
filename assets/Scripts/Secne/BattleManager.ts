import { _decorator, Component, Node } from 'cc'
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import Levels, { ILevel } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { DataManager, IRecord } from 'db://assets/Runtime/DataManager'
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
import { ShakeManager } from '../UI/ShakeManager'
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
    EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this)
    EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this)
  }

  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkedArrived)
    EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke)
    EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record)
    EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke)
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
    this.stage.addComponent(ShakeManager)
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
    this.stage.getComponent(ShakeManager).stop()
    this.stage.setPosition(disX, disY)
  }

  record() {
    const item: IRecord = {
      player: {
        x: DataManager.Instance.player.x,
        y: DataManager.Instance.player.y,
        direction: DataManager.Instance.player.direction,
        state:
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
            ? DataManager.Instance.player.state
            : ENTITY_STATE_ENUM.IDLE,
        type: DataManager.Instance.player.type,
      },
      door: {
        x: DataManager.Instance.door.x,
        y: DataManager.Instance.door.y,
        direction: DataManager.Instance.door.direction,
        state: DataManager.Instance.door.state,
        type: DataManager.Instance.door.type,
      },
      enemies: DataManager.Instance.enemies.map(({ x, y, direction, state, type }) => ({
        x,
        y,
        direction,
        state,
        type,
      })),
      bursts: DataManager.Instance.bursts.map(({ x, y, direction, state, type }) => ({
        x,
        y,
        direction,
        state,
        type,
      })),
      spikes: DataManager.Instance.spikes.map(({ x, y, count, type }) => ({
        x,
        y,
        count,
        type,
      })),
    }

    DataManager.Instance.records.push(item)
  }

  revoke() {
    const item = DataManager.Instance.records.pop()
    if (item) {
      DataManager.Instance.player.x = DataManager.Instance.player.targetX = item.player.x
      DataManager.Instance.player.y = DataManager.Instance.player.targetY = item.player.y
      DataManager.Instance.player.direction = item.player.direction
      DataManager.Instance.player.state = item.player.state

      DataManager.Instance.door.x = item.door.x
      DataManager.Instance.door.y = item.door.y
      DataManager.Instance.door.direction = item.door.direction
      DataManager.Instance.door.state = item.door.state

      for (let index = 0; index < item.enemies.length; index++) {
        const element = item.enemies[index]

        DataManager.Instance.enemies[index].x = element.x
        DataManager.Instance.enemies[index].y = element.y
        DataManager.Instance.enemies[index].direction = element.direction
        DataManager.Instance.enemies[index].state = element.state
      }

      for (let i = 0; i < item.spikes.length; i++) {
        const spikes = item.spikes[i]
        DataManager.Instance.spikes[i].x = spikes.x
        DataManager.Instance.spikes[i].y = spikes.y
        DataManager.Instance.spikes[i].count = spikes.count
      }

      for (let i = 0; i < item.bursts.length; i++) {
        const bursts = item.bursts[i]
        DataManager.Instance.bursts[i].x = bursts.x
        DataManager.Instance.bursts[i].y = bursts.y
        DataManager.Instance.bursts[i].state = bursts.state
      }
    }
  }
}
