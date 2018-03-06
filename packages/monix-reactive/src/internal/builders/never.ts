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

import { Observable } from "../../observable"
import { Subscriber } from "../../observer"
import { Cancelable } from "funfix"

/**
 * Never issues elements, complets or fails
 * @private
 * @hidden
 */
class NeverObservableImpl extends Observable<never> {
  unsafeSubscribeFn(subscriber: Subscriber<never>): Cancelable {
    return Cancelable.empty()
  }
}

/**
 * {@link NeverObservable} never issues any elements, complets of rails
 *  NeverObservable object uses [Bottom Type](https://en.wikipedia.org/wiki/Bottom_type)
 *  for elements to match all other types
 * @private
 * @hidden
 */
export const NeverObservable: Observable<never> = new NeverObservableImpl()
