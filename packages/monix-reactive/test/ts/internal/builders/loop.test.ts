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
import { Observable, IObservable, Ack, Continue, Stop } from "../../../../src"
import { TestScheduler, Throwable, Scheduler, Future } from "funfix"
import { LoopObservable } from "../../../../src/internal/builders/loop"

describe("LoopObservable", () => {
  it("can be created using Observable.loop()", () => {
    const o: IObservable<number> = Observable.loop()
  })

  it("should start with 0, increment by 1 and Stop", () => {
    let lastItem = -1
    const scheduler = new TestScheduler()
    const loop = new LoopObservable(scheduler)
    loop.unsafeSubscribeFn({
      scheduler: scheduler,
      onNext: (n) => {
        assert.equal(n, lastItem + 1)
        lastItem = n

        if (n >= 3) {
          return Stop
        } else {
          return Continue
        }
      },
      onError: (e) => {
        throw new Error("Invalid state: onError should never be executed")
      },
      onComplete: () => {
        throw new Error("Invalid state: onComplete should never be executed")
      }
    })

    assert.equal(lastItem, 3)
  })

  it("should wait for AsynkAck", () => {
    let lastItem = -1
    const scheduler = new TestScheduler()
    const loop = new LoopObservable(scheduler)
    loop.unsafeSubscribeFn({
      scheduler: scheduler,
      onNext: (n) => {
        assert.equal(n, lastItem + 1)
        lastItem = n

        if (n >= 5) {
          return Stop
        } else {
          return Future.pure(Continue, scheduler).delayResult(1000)
        }
      },
      onError: (e) => {
        throw new Error("Invalid state: onError should never be executed")
      },
      onComplete: () => {
        throw new Error("Invalid state: onComplete should never be executed")
      }
    })

    assert.equal(lastItem, 0)
    scheduler.tick(500) // 0.5 seconds later
    assert.equal(lastItem, 0) // still zero
    scheduler.tick(500) // 1 second later
    assert.equal(lastItem, 1)
    scheduler.tick(1000) // 2 second later
    assert.equal(lastItem, 2)
    scheduler.tick(3000) // 5 second later
    assert.equal(lastItem, 5)
    scheduler.tick(1000) // 6 second later
    assert.equal(lastItem, 5) // it stopped at 5
  })

  it("should stop if cancelled", () => {
    let lastItem = -1
    const scheduler = new TestScheduler()
    const loop = new LoopObservable(scheduler)
    const c = loop.unsafeSubscribeFn({
      scheduler: scheduler,
      onNext: (n) => {
        assert.equal(n, lastItem + 1)
        lastItem = n

        if (n >= 5) {
          return Stop
        } else {
          return Future.pure(Continue, scheduler).delayResult(1000)
        }
      },
      onError: (e) => {
        throw new Error("Invalid state: onError should never be executed")
      },
      onComplete: () => {
        throw new Error("Invalid state: onComplete should never be executed")
      }
    })

    assert.equal(lastItem, 0)
    scheduler.tick(500) // 0.5 seconds later
    assert.equal(lastItem, 0) // still zero
    scheduler.tick(500) // 1 second later
    assert.equal(lastItem, 1)
    c.cancel()
    assert.equal(lastItem, 1)
    scheduler.tick(1000) // 2 seconds later
    assert.equal(lastItem, 1)
    scheduler.tick(1000) // 3 seconds later
    assert.equal(lastItem, 1)
  })
})
