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

import { Observable } from "./observable"
import { Scheduler } from "funfix"
import { EmptyObservable } from "./internal/builders/empty"
import { NeverObservable } from "./internal/builders/never"
import { PureObservable } from "./internal/builders/pure"
import { EvalAlwaysObservable, EvalOnceObservable } from "./internal/builders/eval"
import { ArrayObservable } from "./internal/builders/array"
import { LoopObservable } from "./internal/builders/loop"

/**
 * Create empty observable
 */
export function empty<A>(): Observable<A> {
  return EmptyObservable
}

/**
 * Create an observable which issues single given value and completes
 */
export function pure<A>(value: A): Observable<A> {
  return new PureObservable(value)
}

/**
 * Creates an observable that never issues any elements, completes or fails
 */
export function never<A>(): Observable<A> {
  return NeverObservable
}

/**
 * Creates an observable that issues single element from evaluating given expression (function)
 * @param fn expression to evauate and retrieve element value
 */
export function evalAlways<A>(fn: () => A): Observable<A> {
  return new EvalAlwaysObservable(fn)
}

/**
 * Creates an observable that issues single element from evaluating given expression (function)
 * After first evaluation it memoize result value (or error) and uses it for other subscribers
 * @param fn expression to evaluate and retrieve element value
 */
export function evalOnce<A>(fn: () => A): Observable<A> {
  return new EvalOnceObservable(fn)
}

/**
 * Creates an observable that issues all elements of given array with backpressure
 * @param arr array containing elements
 * @param scheduler optional scheduler
 */
export function fromArray<A>(arr: Array<A>, scheduler?: Scheduler): Observable<A> {
  return new ArrayObservable(arr, scheduler || Scheduler.global.get())
}

/**
 * Creates an observable that issues all arguments
 */
export function items<A>(...items: Array<A>): Observable<A> {
  return new ArrayObservable(items, Scheduler.global.get())
}

/**
 * Creates an observable that loops indefinitely until stopped, issues integers starting with 0 (zero)
 */
export function loop(scheduler?: Scheduler): Observable<number> {
  return new LoopObservable(scheduler || Scheduler.global.get())
}
