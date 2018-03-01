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
import { SubscriberWrap } from "../../../../src/internal/subscribers/wrap"
import { Ack, Continue, Stop } from "../../../../src"
import { TestScheduler, Throwable } from "funfix"

describe("SubscriberWrap", () => {
  it("proxies method calls to arguments lambdas", () => {
    let onNextCnt = 0
    let onErrorCnt = 0
    let onCompleteCnt = 0
    const s = new SubscriberWrap<string>(
      (element) => {
        onNextCnt += 1
        return Continue
      },
      (e) => {
        onErrorCnt += 1
      },
      () => {
        onCompleteCnt += 1
      }
    )

    s.onNext("first")
    assert.ok(onNextCnt === 1, "onNext lambda called once")
    assert.ok(onErrorCnt === 0, "onError lambda not called")
    assert.ok(onCompleteCnt === 0, "onComplete lambda not called")

    s.onNext("second")
    assert.ok(onNextCnt === 2, "onNext lambda called once again")
    assert.ok(onErrorCnt === 0, "onError lambda not called")
    assert.ok(onCompleteCnt === 0, "onComplete lambda not called")

    s.onError(new Error("Not goood"))
    assert.ok(onNextCnt === 2, "onNext lambda not called")
    assert.ok(onErrorCnt === 1, "onError lambda called once")
    assert.ok(onCompleteCnt === 0, "onComplete lambda not called")

    s.onComplete()
    assert.ok(onNextCnt === 2, "onNext lambda not called")
    assert.ok(onErrorCnt === 1, "onError lambda not called")
    assert.ok(onCompleteCnt === 1, "onComplete lambda called once")

    s.onNext("third")
    s.onError(new Error("One more error"))
    s.onComplete()
    assert.ok(onNextCnt === 3, "onNext called, SubscriberWrap doesn't care about completion rules")
    assert.ok(onErrorCnt === 2, "onError called, SubscriberWrap doesn't care about completion rules")
    assert.ok(onCompleteCnt === 2, "onComplete called, SubscriberWrap doesn't care about completion rules")
  })
})
