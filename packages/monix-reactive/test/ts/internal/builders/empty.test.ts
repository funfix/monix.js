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

import * as assert from "../../asserts"
import { Observable } from "../../../../src"
import { Ack } from "monix-types"
import { TestScheduler, Throwable } from "funfix"

describe("EmptyObservable", () => {
  it("should complete immediately", () => {
    let wasCompleted = false
    Observable.empty().unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: any): Ack => {
        throw new Error("Illegal state")
      },
      onError: (e: Throwable): void => {
        throw e
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.ok(wasCompleted, "Observable succesfully completed")
  })
})
