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
import { TestScheduler, Throwable, Future } from "funfix"

describe("ArrayObservable", () => {
  it("should complete immediately for empty array", () => {
    let wasCompleted = false
    Observable.fromArray([]).unsafeSubscribeFn({
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

  it("can be also created using Observable.items() function", () => {
    let wasCompleted = false
    Observable.items().unsafeSubscribeFn({
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

  it("should issue all input array values and complete", () => {
    let wasCompleted = false
    let issued = []
    Observable.fromArray([1, 2, 3]).unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: number): Ack => {
        issued.push(elem)
        return Continue
      },
      onError: (e: Throwable): void => {
        throw e
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.ok(wasCompleted)
    assert.equal(JSON.stringify(issued), JSON.stringify([1, 2, 3]))
  })

  it("should not complete if got Stop ack", () => {
    let wasCompleted = false
    let issued = []
    Observable.fromArray([1]).unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: number): Ack => {
        issued.push(elem)
        return Stop
      },
      onError: (e: Throwable): void => {
        throw e
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.not(wasCompleted)
    assert.equal(JSON.stringify(issued), JSON.stringify([1]))
  })

  it("should issue elements until got Stop ack", () => {
    let wasCompleted = false
    let issued = []
    Observable.fromArray([1, 2, 3]).unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: number): Ack => {
        issued.push(elem)
        return Stop
      },
      onError: (e: Throwable): void => {
        throw e
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.not(wasCompleted)
    assert.equal(JSON.stringify(issued), JSON.stringify([1]))
  })

  it("should signal error to downstream", () => {
    const scheduler = new TestScheduler()
    let wasCompleted = false
    let gotError = false

    Observable.fromArray([1, 2, 3]).unsafeSubscribeFn({
      scheduler: new TestScheduler(),
      onNext: (elem: number): Ack => {
        return Future.raise(new Error("something went wrong"), scheduler)
      },
      onError: (e: Throwable): void => {
        gotError = true
      },
      onComplete: (): void => {
        wasCompleted = true
      }
    })

    assert.ok(gotError)
    assert.not(wasCompleted)
  })
})
