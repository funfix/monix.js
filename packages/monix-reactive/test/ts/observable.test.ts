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

import { id } from "funfix"
import { Observable } from "../../src"
import * as assert from "./asserts"
import { EmptyObservable } from "../../src/internal/builders/empty"

describe("Observable", () => {
  describe(".empty()", () => {
    it("creates new observable instance", () => {
      const o1: Observable<number> = Observable.empty()
      const o2: Observable<string> = Observable.empty()
    })

    it("returns singleton observable instance", () => {
      assert.equal(Observable.empty(), EmptyObservable)
    })
  })

  describe(".pure()", () => {
    it("creates new observable instance", () => {
      const o: Observable<string> = Observable.pure("Hello")
    })
  })
})
