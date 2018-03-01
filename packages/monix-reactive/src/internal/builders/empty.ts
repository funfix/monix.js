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
 * Completes immediately on subscribe without issueing any items
 */
class EmptyObservableImpl extends ObservableInstance<never> {
  unsafeSubscribeFn(subscriber: Subscriber<never>): Cancelable {
    subscriber.onComplete()

    return Cancelable.empty()
  }
}

/**
 * {@link EmptyObservable} completes immediately on subscribe without issueing any values.
 *  EmptyObservable object uses [Bottom Type](https://en.wikipedia.org/wiki/Bottom_type)
 *  for elements to match all other types
 */
export const EmptyObservable: ObservableInstance<never> = new EmptyObservableImpl()
