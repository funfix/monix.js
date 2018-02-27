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

import { applyMixins } from "funfix"
import { OperatorsMixin } from "./internal/mixin"
import { ObservableBase } from "./internal/observable"
import { IObservable } from "./instance"
import { EmptyObservable } from "./internal/builders/empty"
import { NeverObservable } from "./internal/builders/never"
import { PureObservable } from "./internal/builders/pure"

/**
 * apply mixins
 */
applyMixins(ObservableBase, [OperatorsMixin])

/**
 * Observable object contains builder methods that help you create new {@link IObservable} instances
 */
export abstract class Observable {
  /**
   * Create empty observable
   */
  static empty<A>(): IObservable<A> {
    return EmptyObservable
  }

  /**
   * Create an observable which issues single given value and completes
   */
  static pure<A>(value: A): IObservable<A> {
    return new PureObservable(value)
  }

  /**
   * Creates an observable that never issues any elements, completes or fails
   */
  static never<A>(): IObservable<A> {
    return NeverObservable
  }
}
