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

import { Ack, Continue, Stop, Subscriber, SyncAck } from "monix-types"
import { Scheduler, Try, FutureMaker, Throwable } from "funfix"
import * as AckUtils from "../ack"

/**
 * A safe subscriber safe guards subscriber implementations, such that:
 *
 *  - the `onComplete` and `onError` signals are back-pressured
 *  - errors triggered by downstream observers are caught and logged,
 *    while the upstream gets an `Ack.Stop`, to stop sending events
 *  - once an `onError` or `onComplete` was emitted, the observer no longer accepts
 *    `onNext` events, ensuring that the grammar is respected
 *  - if downstream signals a `Stop`, the observer no longer accepts any events,
 *    ensuring that the grammar is respected
 */
export class SafeSubscriber<T> implements Subscriber<T> {
  private _isDone: boolean = false
  private _ack: Ack = Continue

  constructor(private readonly _subscriber: Subscriber<T>,
              readonly scheduler: Scheduler = _subscriber.scheduler) {
  }

  /**
   * Passes value to downstream observer but only if not completed
   * @param elem stream element to be consumed
   */
  onNext(elem: T): Ack {
    if (!this._isDone) {
      try {
        this._ack = this.flattenAndCatchFailures(this._subscriber.onNext(elem))
      } catch (e) {
        this.onError(e)
        this._ack = Stop
      }

      return this._ack
    } else {
      return Stop
    }
  }

  /**
   * Signals completion to downstream observer, but only if not stopped
   */
  onComplete(): void {
    AckUtils.syncOnContinue(this._ack, () => {
      if (!this._isDone) {
        this._isDone = true

        try {
          this._subscriber.onComplete()
        } catch (e) {
          this.scheduler.reportFailure(e)
        }
      }
    })
  }

  /**
   * Sinals error to downstream observer, but only if not stopped
   * @param e error to signal
   */
  onError(e: Throwable): void {
    AckUtils.syncOnContinue(this._ack, () => this.signalError(e))
  }

  private flattenAndCatchFailures(ack: Ack): Ack {
    // Fast path.
    if (ack === Continue) {
      return Continue
    } else if (ack === Stop) {
      this._isDone = true
      return Stop
    } else {
      return ack.value().fold(
        (): Ack => {
          const p = FutureMaker.empty<SyncAck>()

          ack.onComplete((result: Try<SyncAck>) => {
            p.success(this.handleFailure(result))
          })

          return p.future()
        },
        (result): Ack => this.handleFailure(result)
      )
    }
  }

  private signalError(ex: Throwable): void {
    if (!this._isDone) {
      this._isDone = true

      try {
        this._subscriber.onError(ex)
      } catch (e) {
        this.scheduler.reportFailure(e)
      }
    }
  }

  private handleFailure(value: Try<SyncAck>): SyncAck {
    try {
      const ack = value.get()
      if (ack === Stop) {
        this._isDone = true
      }

      return ack
    } catch (e) {
      this.signalError(value.failed().get())

      return Stop
    }
  }
}
