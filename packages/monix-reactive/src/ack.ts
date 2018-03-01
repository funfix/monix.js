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

import { Future, Scheduler, Try, Success } from "funfix"

/**
 * Use `AckStop` to inform stream producer that it should stop sending values
 */
export type AckStop = "Stop"

/**
 * Single valid `AckStop` value, use it instead of hardcoding "Stop" strings
 */
export const Stop: AckStop = "Stop"

/**
 * Use `AckContinue` type value to inform stream producer to continue sending value
 */
export type AckContinue = "Continue"

/**
 * Single valid `Continue` value, is it instead of hardcoding "Contine" strings
 */
export const Continue: AckContinue = "Continue"

/**
 * Type alias for synchronous Ack values
 */
export type SyncAck = AckStop | AckContinue

/**
 * Type alias for asynchronous Ack values
 */
export type AsyncAck = Future<SyncAck>

/**
 * `Ack` type represents a set o values used to inform stream producer (source) about item consume status
 *
 * `SyncAck`: type alias for synchronous Ack values
 *    - `Stop`: producer should stop sending values
 *    - `Continue`: producer may continue sending values
 * `AsyncAck`: asynchronous Ack type alias
 */
export type Ack = SyncAck | AsyncAck
