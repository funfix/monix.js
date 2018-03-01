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

import { Subscriber, Operator } from "./observer"
import { Ack } from "./ack"
import { Cancelable, Scheduler, Throwable } from "funfix"

/**
 * Observable public interface, to keep ObservableInstance and OperatorsMixin in sync
 */
export interface IObservable<A> {
  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable

  subscribeWith(out: Subscriber<A>): Cancelable

  subscribe(nextFn?: (elem: A) => Ack, errorFn?: (e: Throwable) => void, completeFn?: () => void, scheduler?: Scheduler): Cancelable

  pipe<B>(operator: Operator<A, B>): IObservable<B>
}
