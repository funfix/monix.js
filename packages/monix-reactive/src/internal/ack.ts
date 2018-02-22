/*!
 * Copyright (c) 2018 by The Monix.js Project Developers.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Ack, Continue, Stop, SyncAck } from "monix-types"
import { Try, Success, Scheduler } from "funfix"

/**
 * @private
 */
export function syncOn(ack: Ack, callback: (t: Try<SyncAck>) => void): Ack {
  if (ack === Continue || ack === Stop) {
    callback(Success(ack))
  } else {
    ack.onComplete((result) => {
      callback(result)
    })
  }

  return ack
}

/**
 * @private
 */
export function syncOnContinue(ack: Ack, callback: () => void): Ack {
  if (ack === Continue) {
    callback()
  } else if (ack !== Stop) {
    ack.onComplete((result) => {
      if (result.isSuccess() && result.get() === Continue) {
        callback()
      }
    })
  }

  return ack
}

/**
 * @private
 */
export function syncOnStopOrFailure(ack: Ack, callback: () => void): Ack {
  if (ack === Stop) {
    callback()
  } else if (ack !== Continue) {
    ack.onComplete((result) => {
      if (result.isFailure() || result.get() === Stop) {
        callback()
      }
    })
  }

  return ack
}

/**
 * @private
 */
export function syncTryFlatten(ack: Ack, scheduler: Scheduler): Ack {
  if (ack === Continue || ack === Stop) {
    return ack
  } else {
    const v = ack.value()
    if (v.isEmpty()) {
      return ack
    } else {
      const t = v.get()
      if (t.isSuccess()) {
        return t.get()
      } else {
        scheduler.reportFailure(t.failed().get())
        return Stop
      }
    }
  }
}
