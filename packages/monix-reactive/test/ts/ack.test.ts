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

import { Future, Try, TestScheduler, Success } from "funfix"
import * as assert from "./asserts"
import { Continue, Stop, Ack, SyncAck, AsyncAck } from "../../src/ack"
import { syncOn, syncOnContinue, syncOnStopOrFailure, syncTryFlatten } from "../../src/internal/ack-utils"

describe("Ack", () => {
  describe("constructor", () => {
    it("is \"Continue\" string constant", () => {
      const goNext: Ack = "Continue"
      assert.equal(goNext, Continue)
    })

    it("is \"Stop\" string constant", () => {
      const stop: Ack = "Stop"
      assert.equal(stop, Stop)
    })

    it("is Future<\"Continue\">", () => {
      const goNext: Ack = Future.pure<"Continue">("Continue")
      assert.equal(goNext.value().get(), Success(Continue))
    })

    it("is Future<\"Stop\">", () => {
      const goNext: Ack = Future.pure<"Stop">("Stop")
      assert.equal(goNext.value().get(), Success(Stop))
    })
  })

  describe("syncOn", () => {
    it("should call back synchronously with Success(Continue) for Continue ack", () => {
      let result: SyncAck | null = null
      syncOn(Continue, (r: Try<SyncAck>) => {
        assert.ok(r.isSuccess())
        result = r.get()
      })
      // ensure executed synchronously
      assert.equal(result, Continue)
    })

    it("should call back synchronously with Success(Stop) for Stop ack", () => {
      let result: SyncAck | null = null
      syncOn(Stop, (r: Try<SyncAck>) => {
        assert.ok(r.isSuccess())
        result = r.get()
      })
      // ensure executed synchronously
      assert.equal(result, Stop)
    })

    it("should call back with Success(Continue) for Future<Continue>", (done) => {
      syncOn(Future.pure(Continue), (r: Try<SyncAck>) => {
        assert.ok(r.isSuccess())
        assert.equal(r.get(), Continue)
        done()
      })
    })

    it("should call back with Success(Stop) for Future<Stop>", (done) => {
      syncOn(Future.pure(Stop), (r: Try<SyncAck>) => {
        assert.ok(r.isSuccess())
        assert.equal(r.get(), Stop)
        done()
      })
    })

    it("should call back with Failure for failed AsyncAck", (done) => {
      syncOn(Future.raise(new Error("something went wrong")), (r: Try<SyncAck>) => {
        assert.ok(r.isFailure())
        done()
      })
    })

    it("returns ack argument", () => {
      assert.equal(Continue, syncOn(Continue, _ => {}))
      assert.equal(Stop, syncOn(Stop, _ => {}))
    })
  })

  describe("syncOnContinue", () => {
    it("should call back synchronously for Continue", () => {
      let executed = false
      syncOnContinue(Continue, () => {
        executed = true
      })

      assert.ok(executed)
    })

    it("should not call back for Stop", () => {
      let executed = false
      syncOnContinue(Stop, () => {
        executed = true
        assert.not(true) // fail if called
      })
      assert.not(executed)
    })

    it("should call back for Future<Continue>", (done) => {
      syncOnContinue(Future.pure(Continue), () => {
        assert.ok(true)
        done()
      })
    })

    it("should not call back for Future<Stop>", () => {
      let executed = false
      const s = new TestScheduler()
      // To test "test" works - replace Stop with Continue, or break implementation - it will fail because executed
      const ack = Future.of(() => Stop, s).delayResult(10)
      syncOnContinue(ack, () => {
        executed = true
      })
      s.tick(20)
      assert.not(executed)
    })

    it("should not call back for failed Future", () => {
      let executed = false
      const s = new TestScheduler()
      // To test "test" works - replace Stop with Continue - it will faile because executed
      const ack = Future.raise(new Error("something went wrong"), s).delayResult(10)
      syncOnContinue(ack, () => {
        executed = true
      })
      s.tick(20)
      assert.not(executed)
    })

    it("returns ack argument", () => {
      assert.equal(Continue, syncOnContinue(Continue, () => {}))
      assert.equal(Stop, syncOnContinue(Stop, () => {}))
    })
  })

  describe("syncOnStopOrFailure", () => {
    it("should call back for sync Stop", () => {
      let executed = false
      syncOnStopOrFailure(Stop, () => {
        executed = true
      })
      assert.ok(executed)
    })

    it("should call back for async Stop", () => {
      const s = new TestScheduler()
      const ack = Future.pure(Stop, s).delayResult(10)
      let executed = false
      syncOnStopOrFailure(ack, () => {
        executed = true
      })
      s.tick(20)
      assert.ok(executed)
    })

    it("should call back for failed Future", () => {
      const s = new TestScheduler()
      const ack = Future.raise(new Error("something went wrong"), s).delayResult(10)
      let executed = false
      syncOnStopOrFailure(ack, () => {
        executed = true
      })
      s.tick(20)
      assert.ok(executed)
    })

    it("should not call back for Continue", () => {
      let executed = false
      syncOnStopOrFailure(Continue, () => {
        executed = true
      })
      assert.not(executed)
    })

    it("should not call back for async Continue", () => {
      const s = new TestScheduler()
      const ack = Future.of(() => Continue, s).delayResult(10)
      let executed = false
      syncOnStopOrFailure(ack, () => {
        executed = true
      })
      s.tick(20)
      assert.not(executed)
    })

    it("returns ack argument", () => {
      assert.equal(Continue, syncOnStopOrFailure(Continue, () => {}))
      assert.equal(Stop, syncOnStopOrFailure(Stop, () => {}))
      const ack = Future.pure(Continue)
      assert.equal(ack, syncOnStopOrFailure(ack, () => {}))
    })
  })

  describe("syncTryFlatten", () => {
    it("should return ack for SyncAck", () => {
      const s = new TestScheduler()
      assert.equal(Continue, syncTryFlatten(Continue, s))
      assert.equal(Stop, syncTryFlatten(Stop, s))
    })

    it("should return SyncAck for completed AsyncAck", () => {
      const s = new TestScheduler()
      assert.equal(Continue, syncTryFlatten(Future.pure(Continue), s))
      assert.equal(Stop, syncTryFlatten(Future.pure(Stop), s))
      const ack = Future.of(() => Continue, s).delayResult(1000)
      // not completed yet, returns ack
      assert.equal(ack, syncTryFlatten(ack, s))
      // not completed yet
      assert.ok(ack.value().isEmpty())
      // time travel
      s.tick(1000)
      // completed now, returns SyncAck
      assert.ok(ack.value().nonEmpty())
      assert.equal(Continue, syncTryFlatten(Continue, s))
    })
  })
})
