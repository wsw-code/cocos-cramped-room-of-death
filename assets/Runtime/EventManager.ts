import { _decorator } from 'cc'
import Singleton from '../Base/Singleton'

interface IItem {
  func: Function
  ctx: unknown
}

export class EventManager extends Singleton {
  static get Instance() {
    return super.GetInstance<EventManager>()
  }

  private eventDic: Map<string, Array<IItem>> = new Map()

  on(eventName: string, func: Function, ctx: unknown) {
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).push({ func, ctx })
      return
    } else {
      this.eventDic.set(eventName, [{ func, ctx }])
    }
  }

  off(eventName: string, func: Function) {
    if (this.eventDic.has(eventName)) {
      const index = this.eventDic.get(eventName).findIndex(it => it.func === func)
      index > -1 && this.eventDic.get(eventName).splice(index, 1)
    }
  }

  emit(eventName: string, ...args: unknown[]) {
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).forEach(({ func, ctx }) => {
        ctx ? func.apply(ctx, args) : func(...args)
      })
    }
  }

  clear() {
    this.eventDic.clear()
  }
}
