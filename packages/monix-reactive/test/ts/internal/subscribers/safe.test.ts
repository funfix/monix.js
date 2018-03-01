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

import { Subscriber, Stop, Continue, Ack } from "monix-types"
import { Scheduler, Future, Throwable, TestScheduler } from "funfix"
import { SafeSubscriber } from "../../../../src/internal/subscribers/safe"
import * as assert from "../../asserts"

describe("SafeSubscriber", () => {
  class TestSubscriber implements Subscriber<Ack> {
    onNextCnt: number = 0
    onCompleteCnt: number = 0
    onErrorCnt: number = 0

    constructor(readonly scheduler: Scheduler) {
    }

    onNext(value: Ack): Ack {
      this.onNextCnt += 1
      return value
    }

    onError(e: Throwable): void {
      this.onErrorCnt += 1
    }

    onComplete(): void {
      this.onCompleteCnt += 1
    }
  }

  class ThrowingSubscriber implements Subscriber<Ack> {
    constructor(readonly throwOnNext = false,
      readonly throwOnError = false,
      readonly throwOnComplete = false,
      readonly scheduler: Scheduler) {
    }

    onNext(value: Ack): Ack {
      if (this.throwOnNext) {
        throw new Error("something went wrong onNext")
      }

      return value
    }

    onError(e: Throwable): void {
      if (this.throwOnError) {
        throw new Error("something went wrong onError")
      }
    }

    onComplete(): void {
      if (this.throwOnComplete) {
        throw new Error("something went wrong onComplete")
      }
    }
  }

  it("is tested using a viable TestSubscriber", () => {
    const ss = new TestSubscriber(new TestScheduler())
    assert.equal(ss.onNextCnt, 0)
    assert.equal(ss.onCompleteCnt, 0)
    assert.equal(ss.onErrorCnt, 0)

    ss.onNext(Continue)
    ss.onNext(Stop)
    ss.onNext(Future.pure(Stop))
    assert.equal(ss.onNextCnt, 3)
    assert.equal(ss.onCompleteCnt, 0)
    assert.equal(ss.onErrorCnt, 0)

    ss.onComplete()
    ss.onComplete()
    assert.equal(ss.onNextCnt, 3)
    assert.equal(ss.onCompleteCnt, 2)
    assert.equal(ss.onErrorCnt, 0)

    ss.onError(new Error("something went wrong"))
    ss.onError(new Error("something went wrong"))
    ss.onError(new Error("something went wrong"))
    ss.onError(new Error("something went wrong"))
    assert.equal(ss.onNextCnt, 3)
    assert.equal(ss.onCompleteCnt, 2)
    assert.equal(ss.onErrorCnt, 4)
  })

  it("is tested using a viable ThrowingSubscriber", () => {
    const ss1 = new ThrowingSubscriber(true, false, false, new TestScheduler())
    try {
      ss1.onNext(Continue)
      assert.not(true)
    } catch {
      assert.ok(true)
    }
    ss1.onError(new Error("something went wrong"))
    ss1.onComplete()

    const ss2 = new ThrowingSubscriber(false, true, false, new TestScheduler())
    try {
      ss2.onError(new Error("something went wrong"))
      assert.not(true)
    } catch {
      assert.ok(true)
    }
    ss2.onNext(Continue)
    ss2.onComplete()

    const ss3 = new ThrowingSubscriber(false, false, true, new TestScheduler())
    try {
      ss3.onComplete()
      assert.not(true)
    } catch {
      assert.ok(true)
    }
    ss3.onNext(Continue)
    ss3.onError(new Error("something went wrong"))
  })

  it("should not call onNext if previous onNext returned Stop", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 2)
    ss.onNext(Stop)
    assert.equal(ts.onNextCnt, 3)
    ss.onNext(Continue)
    ss.onNext(Future.pure(Stop))
    ss.onNext(Future.pure(Continue))
    assert.equal(ts.onNextCnt, 3)
  })

  it("should not call onNext if onComplete called", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 1)
    ss.onNext(Stop)
    assert.equal(ts.onNextCnt, 1)
  })

  it("should not call onNext if onError called", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 1)
    ss.onNext(Stop)
    assert.equal(ts.onNextCnt, 1)
  })

  it("should return Stop from onNext when stopped", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onNext(Stop) // Stop
    assert.equal(ts.onNextCnt, 2)
    assert.equal(Stop, ss.onNext(Continue))
    assert.equal(Stop, ss.onNext(Future.pure(Continue)))
    assert.equal(Stop, ss.onNext(Future.pure(Stop)))
  })

  it("should return Stop from onNext when completed", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onComplete() // Complete
    assert.equal(ts.onCompleteCnt, 1)
    assert.equal(Stop, ss.onNext(Continue))
    assert.equal(Stop, ss.onNext(Future.pure(Continue)))
    assert.equal(Stop, ss.onNext(Future.pure(Stop)))
  })

  it("should return Stop from onNext when failed", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onError(new Error("something went wrong")) // Fail
    assert.equal(ts.onErrorCnt, 1)
    assert.equal(Stop, ss.onNext(Continue))
    assert.equal(Stop, ss.onNext(Future.pure(Continue)))
    assert.equal(Stop, ss.onNext(Future.pure(Stop)))
  })

  it("should not call onComplete if onNext returned Stop", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onNext(Stop)
    assert.equal(ts.onNextCnt, 2)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 0)
  })

  it("should not call onComplete if onError called", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 1)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 0)
  })

  it("should not call onComplete more than once", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 1)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 1)
  })

  it("should not call onError if onNext returned Stop", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onNext(Stop)
    assert.equal(ts.onNextCnt, 2)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 0)
  })

  it("should not call onError if onComplete called", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onComplete()
    assert.equal(ts.onCompleteCnt, 1)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 0)
  })

  it("should not call onError more than once", () => {
    const s = new TestScheduler()
    const ts = new TestSubscriber(s)
    const ss = new SafeSubscriber(ts, s)
    ss.onNext(Continue)
    assert.equal(ts.onNextCnt, 1)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 1)
    ss.onError(new Error("something went wrong"))
    assert.equal(ts.onErrorCnt, 1)
  })

  it("should stop when downstream onNext thows an error", () => {
    const s = new TestScheduler()
    const ts = new ThrowingSubscriber(true, false, false, s)
    const ss = new SafeSubscriber(ts, s)

    assert.equal(Stop, ss.onNext(Continue))
  })

  it("should catch errors throw by downstream onComplete", () => {
    const s = new TestScheduler()
    const ts = new ThrowingSubscriber(false, true, false, s)
    const ss = new SafeSubscriber(ts, s)

    ss.onError(new Error("something went wrong"))
    assert.ok(true) // ok if doesn't fail
  })

  it("should catch errors thrown by downstream onError", () => {
    const s = new TestScheduler()
    const ts = new ThrowingSubscriber(false, false, true, s)
    const ss = new SafeSubscriber(ts, s)

    ss.onComplete()
    assert.ok(true) // ok if doesn't fail
  })
})
