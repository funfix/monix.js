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

import { ObservableBase } from "../observable"
import { IObservable } from "../../instance"
import { Continue, Stop, AsyncAck } from "../../ack"
import { Subscriber } from "../../observer"
import { Cancelable, Scheduler, BoolCancelable, IBoolCancelable } from "funfix"

/**
 * An Observale that issues all elements of an array, with backpressure
 */
export class ArrayObservable<A> extends ObservableBase<A> {

  constructor(private readonly _arr: Array<A>,
              private readonly _scheduler: Scheduler) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    if (this._arr.length <= 0) {
      subscriber.onComplete()
      return Cancelable.empty()
    } else {
      const cancelable = BoolCancelable.empty()

      this.loop(cancelable, subscriber, 0)

      return cancelable
    }
  }

  private loop(cancelable: IBoolCancelable, downstream: Subscriber<A>, from: number): void {
    const next = this._arr[from]
    if (next !== undefined) {
      const ack = downstream.onNext(next)
      const nextFrom = from + 1

      if (ack === Stop) {
        // do nothing
      } else if (nextFrom >= this._arr.length) {
        downstream.onComplete()
      } else {
        if (ack === Continue) {
          this._scheduler.trampoline(() => {
            this.loop(cancelable, downstream, nextFrom)
          })
        } else {
          if (!cancelable.isCanceled()) {
            this.asyncBoundary(cancelable, ack, downstream, nextFrom)
          }
        }
      }
    } else {
      downstream.onComplete()
    }
  }

  private asyncBoundary(cancelable: IBoolCancelable, ack: AsyncAck, downstream: Subscriber<A>, from: number): void {
    ack.onComplete((r) => {
      r.fold((e) => {
        downstream.onError(e)
      }, (a) => {
        if (a === Continue) {
          this.loop(cancelable, downstream, from)
        } else {
          // done, got Stop signal
        }
      })
    })
  }
}
