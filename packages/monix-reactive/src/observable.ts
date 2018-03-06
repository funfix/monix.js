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

import { applyMixins, Scheduler, Cancelable, Throwable } from "funfix"
import { Ack } from "./ack"
import { Subscriber, Operator } from "./observer"
import { SafeSubscriber } from "./internal/subscribers/safe"
import { SubscriberWrap } from "./internal/subscribers/wrap"

/**
 * Fluent interface to transform and subscribe to streams
 */
export abstract class Observable<A> {
  /**
   * Subscribe to stream events (unsafe)
   * @param out stream subscriber
   * @hidden
   */
  abstract unsafeSubscribeFn(out: Subscriber<A>): Cancelable

  /**
   * Subscribe to stream events
   * @param out stream subscriber
   */
  subscribeWith(out: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(out))
  }

  /**
   * Subscribe to stream events
   *
   * @param nextFn callback for `onNext` event
   * @param errorFn callback for `onError` event
   * @param completeFn callback for `onComplete` event
   * @param scheduler custom scheduler (optional)
   */
  subscribe(nextFn?: (elem: A) => Ack, errorFn?: (e: Throwable) => void, completeFn?: () => void, scheduler?: Scheduler): Cancelable {
    return this.subscribeWith(new SubscriberWrap(nextFn, errorFn, completeFn, scheduler))
  }

  /**
   * Apply a stream transformation defined by given operator
   * @param operator stream transformation builder
   */
  pipe<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator)
  }
}

/**
 * @private
 * @hidden
 */
class LiftByOperatorObservable<A, B> extends Observable<B> {
  constructor(private readonly _self: Observable<A>,
              private readonly _operator: Operator<A, B>) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<B>): Cancelable {
    const sb = this._operator(subscriber)
    return this._self.unsafeSubscribeFn(sb)
  }
}
