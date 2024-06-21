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
import { never, Observable, Ack } from "../../../../src"
import { TestScheduler, Throwable } from "funfix"

describe("NeverObservable", () => {
  it("should never complete", () => {
    const s = new TestScheduler()
    never().unsafeSubscribeFn({
      scheduler: s,
      onNext: (elem: any): Ack => {
        throw new Error("Illegal state: onNext should never be called")
      },
      onError: (e: Throwable): void => {
        throw new Error("Illegal state: onError should never be called")
      },
      onComplete: (): void => {
        throw new Error("Illegal state: onComplete should never be called")
      }
    })

    s.tick(10000000) // time travel a bit, dunno, maybe something happens
  })
})
