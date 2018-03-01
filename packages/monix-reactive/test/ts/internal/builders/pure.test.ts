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
import { Observable, Ack, Continue, Stop } from "../../../../src"
import { TestScheduler, Throwable } from "funfix"

describe("PureObservable", () => {
  it("should issue 1 element and complete", () => {
    let elementsCnt = 0
    let wasCompleted = false
    Observable.pure("hello").unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: string): Ack => {
        assert.equal(elem, "hello")
        elementsCnt += 1
        return Continue
      },
      onError: (e: Throwable): void => {
        throw e
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.ok(wasCompleted, "PureObservable succesfully completed")
    assert.ok(elementsCnt === 1, "PureObservable issued exactly 1 element")
  })

  it("should not call onComplete if stopped", () => {
    let wasCompleted = false
    Observable.pure("hello").subscribe(
      (element) => {
        return Stop
      },
      (e) => {
        throw e
      },
      () => {
        wasCompleted = true
      }
    )
    assert.not(wasCompleted, "PureObservable never completed")
  })
})
