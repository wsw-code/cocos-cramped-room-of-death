import { _decorator, Component, Layers, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc'
const { ccclass, property } = _decorator

import { createUINode, randomByRange } from '../../Utils'
import { TileManager } from './TileManager'
import { DataManager } from '../../Runtime/DataManager'
import { ResourceManager } from '../../Runtime/ResourceManager'

@ccclass('TileManager')
export class TileMapManager extends Component {
  async init() {
    const spriteFrames = await ResourceManager.Instance.loadDir('texture/tile/tile')

    const { mapInfo } = DataManager.Instance

    for (let i = 0; i < mapInfo.length; i++) {
      const column = mapInfo[i]
      for (let j = 0; j < column.length; j++) {
        const item = column[j]

        if (item.src === null || item.type === null) {
          continue
        }
        let number = item.src
        if ((number === 1 || number === 5 || number === 9) && i % 2 === 0 && j % 2 === 0) {
          number += randomByRange(0, 4)
        }
        const node = createUINode()
        const imgSrc = `tile (${number})`
        const spriteFrame = spriteFrames.find(v => v.name === imgSrc) || spriteFrames[0]
        const tileManager = node.addComponent(TileManager)
        tileManager.init(spriteFrame, i, j)
        node.setParent(this.node)
      }
    }
  }
}
