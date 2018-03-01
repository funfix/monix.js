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
import { Cancelable } from "funfix"

/**
 * An {@link IObservable} that issues single element
 *
 * Source: [Monix NowObservable](https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/internal/builders/NowObservable.scala)
 */
export class PureObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _value: A) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    // No need to back-pressure for onComplete
    subscriber.onNext(this._value)
    // not checking Ack result, onComplete call will be cut by SafeSubscriber
    subscriber.onComplete()

    return Cancelable.empty()
  }
}
