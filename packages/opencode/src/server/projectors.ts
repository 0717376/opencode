import sessionProjectors from "../session/projectors"
import { DatabaseEvent } from "../storage/event"

export function initProjectors() {
  DatabaseEvent.init(sessionProjectors)
}
