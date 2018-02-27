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
import { Ack, Continue } from "monix-types"
import { TestScheduler, Throwable } from "funfix"
import { SubscriberWrap } from "../../../../src/internal/subscribers/wrap";

describe("EvalAlwaysObservable", () => {
  it("should not eval it's value source if not subscribed", () => {
    let executed = false
    Observable.eval(() => {
      executed = true
      return 0
    })

    assert.not(executed)
  })

  it("should eval it's value source on every subscription", () => {
    let executedCnt = 0
    let issuedCnt = 0
    let completedCnt = 0
    const o = Observable.eval(() => {
      executedCnt += 1
      return executedCnt
    })
    assert.equal(executedCnt, 0)
    // subscribe once
    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => {}, () => { completedCnt += 1 })
    assert.equal(executedCnt, 1)
    assert.equal(issuedCnt, 1)
    assert.equal(completedCnt, 1)
    // subscribe one more time
    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => {}, () => { completedCnt += 1 })
    assert.equal(executedCnt, 2)
    assert.equal(issuedCnt, 2)
    assert.equal(completedCnt, 2)
  })

  it("should propagate error value source failed", () => {
    let issuedCnt = 0
    let completedCnt = 0
    let failedCnt = 0
    const o = Observable.eval(() => {
      throw new Error("something went wrong")
    })

    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => { failedCnt += 1 }, () => { completedCnt += 1 })
    assert.equal(issuedCnt, 0)
    assert.equal(completedCnt, 0)
    assert.equal(failedCnt, 1)
  })
})

describe("EvalOnceObservable", () => {
  it("should not eval it's value source if not subscribed", () => {
    let executed = false
    Observable.evalOnce(() => {
      executed = true
      return 0
    })

    assert.not(executed)
  })

  it("should eval it's value source only once", () => {
    let executedCnt = 0
    let issuedCnt = 0
    let completedCnt = 0
    const o = Observable.evalOnce(() => {
      executedCnt += 1
      return executedCnt
    })
    assert.equal(executedCnt, 0)
    // subscribe once
    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => {}, () => { completedCnt += 1 })
    assert.equal(executedCnt, 1)
    assert.equal(issuedCnt, 1)
    assert.equal(completedCnt, 1)
    // subscribe one more time
    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => {}, () => { completedCnt += 1 })
    assert.equal(executedCnt, 1)
    assert.equal(issuedCnt, 2)
    assert.equal(completedCnt, 2)

  })

  it("should propagate error value source failed", () => {
    let issuedCnt = 0
    let completedCnt = 0
    let failedCnt = 0
    const o = Observable.evalOnce(() => {
      throw new Error("something went wrong")
    })
    o.subscribe(_ => { issuedCnt += 1; return Continue }, e => { failedCnt += 1 }, () => { completedCnt += 1 })
    assert.equal(issuedCnt, 0)
    assert.equal(completedCnt, 0)
    assert.equal(failedCnt, 1)
    console.log()
  })

  it("reports downstream failures", () => {
    const scheduler = new TestScheduler()
    const o = Observable.evalOnce(() => "hello")

    assert.equal(scheduler.triggeredFailures().length, 0)
    o.unsafeSubscribeFn(new SubscriberWrap(
      _ => { throw new Error("Failed to process onNext") },
      e => {},
      () => {},
      scheduler
    ))

    // one failure reported
    assert.equal(scheduler.triggeredFailures().length, 1)

    o.unsafeSubscribeFn(new SubscriberWrap(
      _ => Continue,
      e => { },
      () => { throw new Error("Faield to process onComplete") },
      scheduler
    ))

    // one more failure reported (total: 2)
    assert.equal(scheduler.triggeredFailures().length, 2)

    Observable.evalOnce(() => { throw new Error("something went wrong") }).unsafeSubscribeFn(new SubscriberWrap(
      _ => Continue,
      e => { throw new Error("Faield to process onComplete") },
      () => { },
      scheduler
    ))

    // 2 more failures reported, 1 from eval, 1 while triggering onError
    assert.equal(scheduler.triggeredFailures().length, 4)
  })
})
