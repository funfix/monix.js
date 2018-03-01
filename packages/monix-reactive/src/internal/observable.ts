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

import { Ack } from "../ack"
import { Subscriber, Operator } from "../observer"
import { Cancelable, Scheduler, Throwable } from "funfix"
import { IObservable } from "../instance"
import { SafeSubscriber } from "./subscribers/safe"
import { SubscriberWrap } from "./subscribers/wrap"

/**
 * {@link ObservableBase} partially implements {@link IObservable} and extended internnaly by most
 *   of {@link IObservable} implementations
 */
export abstract class ObservableBase<A> implements IObservable<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable

  subscribeWith(out: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(out))
  }

  subscribe(nextFn?: (elem: A) => Ack, errorFn?: (e: Throwable) => void, completeFn?: () => void, scheduler?: Scheduler): Cancelable {
    return this.subscribeWith(new SubscriberWrap(nextFn, errorFn, completeFn, scheduler))
  }

  pipe!: <B>(operator: Operator<A, B>) => IObservable<B>
}
