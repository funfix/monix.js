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

import { Throwable, Scheduler } from "funfix"
import { Ack, SyncAck } from "./ack"

/**
 * The Observer from the Rx pattern is the trio of callbacks that
 * get subscribed to an Observable for receiving events.
 *
 * The events received must follow the Rx grammar, which is:
 *      onNext *   (onComplete | onError)?
 *
 * That means an Observer can receive zero or multiple events, the stream
 * ending either in one or zero `onComplete` or `onError` (just one, not both),
 * and after onComplete or onError, a well behaved `Observable`
 * implementation shouldn't send any more onNext events.
 */
export interface Observer<T> {
  onNext(elem: T): Ack

  onComplete(): void

  onError(e: Throwable): void
}

/**
 * Observer subtype which accepts only SyncAck from onNext element
 *
 * Events gramar is same as for Observable
 */
export interface SyncObserver<T> extends Observer<T> {
  onNext(elem: T): SyncAck
}

/** A `Subscriber` is an `Observer` with an attached `Scheduler`.
 *
 * A `Subscriber` can be seen as an address that the data source needs
 * in order to send events, along with an execution context.
 */
export interface Subscriber<T> extends Observer<T> {
  readonly scheduler: Scheduler
}

/**
 * `SyncSubscriber` si an `SyncObserver` with an attached `Scheduler`
 */
export interface SyncSubscriber<T> extends SyncObserver<T> {
  readonly scheduler: Scheduler
}

/**
 * `Operator` type alias defines a transformation from one Subscriber to another
 */
export type Operator<I, O> = (s: Subscriber<O>) => Subscriber<I>
