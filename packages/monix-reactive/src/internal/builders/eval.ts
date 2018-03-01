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

import { ObservableInstance } from "../observable"
import { Subscriber } from "../../observer"
import { Cancelable, Throwable } from "funfix"

/**
 * An observable that evaluates the given function argument and emits its result.
 */
export class EvalAlwaysObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _fn: () => A) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    try {
      subscriber.onNext(this._fn())
      // No need to do back-pressure
      subscriber.onComplete()
    } catch (e) {
      try {
        subscriber.onError(e)
      } catch (e2) {
        const scheduler = subscriber.scheduler
        scheduler.reportFailure(e)
        scheduler.reportFailure(e2)
      }
    }

    return Cancelable.empty()
  }
}

/**
 * An observable that evaluates once the given function argument and emits its result.
 */
export class EvalOnceObservable<A> extends ObservableInstance<A> {
  private _result!: A
  private _errorThrown: Throwable | null = null
  private _hasResult: boolean = false

  constructor(private readonly _eval: () => A) {
    super()
  }

  private signalResult(out: Subscriber<A>, value: A, ex: Throwable | null): void {
    if (ex !== null) {
      try {
        out.onError(ex)
      } catch (e) {
        out.scheduler.reportFailure(e)
        out.scheduler.reportFailure(ex)
      }
    } else {
      try {
        out.onNext(value)
        out.onComplete()
      } catch (e) {
        out.scheduler.reportFailure(e)
      }
    }
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    if (!this._hasResult) {
      try {
        this._result = this._eval()
      } catch (e) {
        this._errorThrown = e
      }
      this._hasResult = true
    }

    this.signalResult(subscriber, this._result, this._errorThrown)

    return Cancelable.empty()
  }
}
