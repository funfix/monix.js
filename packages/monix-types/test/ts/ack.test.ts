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

import * as assert from "./asserts"
import { Future, Success } from "funfix"
import { Ack, Continue, Stop } from "../../src"

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
})
