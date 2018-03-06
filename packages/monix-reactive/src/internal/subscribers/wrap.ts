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

import { Ack, Continue } from "../../ack"
import { Subscriber } from "../../observer"
import { Scheduler, Throwable } from "funfix"

/**
 * Wraps functions to Subscriber interface
 * @private
 * @hidden
 */
export class SubscriberWrap<A> implements Subscriber<A> {
  readonly scheduler: Scheduler

  constructor(private readonly nextFn?: (elem: A) => Ack,
              private readonly errorFn?: (e: Throwable) => void,
              private readonly completeFn?: () => void,
              scheduler?: Scheduler) {
    this.scheduler = scheduler || Scheduler.global.get()
  }

  onNext(elem: A): Ack {
    if (this.nextFn) {
      return this.nextFn(elem)
    }

    return Continue
  }

  onComplete(): void {
    if (this.completeFn) {
      this.completeFn()
    }
  }

  onError(e: Throwable): void {
    if (this.errorFn) {
      this.errorFn(e)
    }
  }
}
