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

import { Future, Try, TestScheduler } from "funfix"
import * as assert from "../asserts"
import { Continue, Stop, Ack, SyncAck, AsyncAck } from "monix-types"
import { syncOn, syncOnContinue } from "../../../src/internal/ack"

describe("Ack", () => {
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
  })

  describe("syncTryFlatten", () => {
  })
})
