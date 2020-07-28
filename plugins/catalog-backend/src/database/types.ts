/*
 * Copyright 2020 Spotify AB
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

import type { Entity, Location } from '@backstage/catalog-model';

export type DbEntitiesRow = {
  id: string;
  location_id: string | null;
  api_version: string;
  kind: string;
  name: string | null;
  namespace: string | null;
  etag: string;
  generation: number;
  metadata: string;
  spec: string | null;
};

export type DbEntityRequest = {
  locationId?: string;
  entity: Entity;
};

export type DbEntityResponse = {
  locationId?: string;
  entity: Entity;
};

export type DbEntitiesSearchRow = {
  entity_id: string;
  key: string;
  value: string | null;
};

export type DbLocationsRow = {
  id: string;
  type: string;
  target: string;
};

export type DbLocationsRowWithStatus = DbLocationsRow & {
  status: string | null;
  timestamp: string | null;
  message: string | null;
};

export enum DatabaseLocationUpdateLogStatus {
  FAIL = 'fail',
  SUCCESS = 'success',
}

export type DatabaseLocationUpdateLogEvent = {
  id: string;
  status: DatabaseLocationUpdateLogStatus;
  location_id: string;
  entity_name: string;
  created_at?: string;
  message?: string;
};

export type EntityFilter = {
  key: string;
  values: (string | null)[];
};
export type EntityFilters = EntityFilter[];

/**
 * An abstraction on top of the underlying database, wrapping the basic CRUD
 * needs.
 */
export type Database = {
  /**
   * Runs a transaction.
   *
   * The callback is expected to make calls back into this class. When it
   * completes, the transaction is closed.
   *
   * @param fn The callback that implements the transaction
   */
  transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;

  /**
   * Adds a new entity to the catalog.
   *
   * @param tx An ongoing transaction
   * @param request The entity being added
   * @returns The added entity, with uid, etag and generation set
   */
  addEntity(
    tenantId: string,
    tx: unknown,
    request: DbEntityRequest,
  ): Promise<DbEntityResponse>;

  /**
   * Updates an existing entity in the catalog.
   *
   * The given entity must contain an uid to identify an already stored entity
   * in the catalog. If it is missing or if no matching entity is found, the
   * operation fails.
   *
   * If matchingEtag or matchingGeneration are given, they are taken into
   * account. Attempts to update a matching entity, but where the etag and/or
   * generation are not equal to the passed values, will fail.
   *
   * @param tx An ongoing transaction
   * @param request The entity being updated
   * @param matchingEtag If specified, reject with ConflictError if not
   *                     matching the entry in the database
   * @param matchingGeneration If specified, reject with ConflictError if not
   *                           matching the entry in the database
   * @returns The updated entity
   */
  updateEntity(
    tenantId: string,
    tx: unknown,
    request: DbEntityRequest,
    matchingEtag?: string,
    matchingGeneration?: number,
  ): Promise<DbEntityResponse>;

  entities(
    tenantId: string,
    tx: unknown,
    filters?: EntityFilters,
  ): Promise<DbEntityResponse[]>;

  entity(
    tenantId: string,
    tx: unknown,
    kind: string,
    name: string,
    namespace?: string,
  ): Promise<DbEntityResponse | undefined>;

  entityByUid(
    tenantId: string,
    tx: unknown,
    uid: string,
  ): Promise<DbEntityResponse | undefined>;

  removeEntity(tenantId: string, tx: unknown, uid: string): Promise<void>;

  addLocation(tenantId: string, location: Location): Promise<DbLocationsRow>;

  removeLocation(tenantId: string, tx: unknown, id: string): Promise<void>;

  location(tenantId: string, id: string): Promise<DbLocationsRowWithStatus>;

  locations(tenantId: string): Promise<DbLocationsRowWithStatus[]>;

  locationHistory(
    tenantId: string,
    id: string,
  ): Promise<DatabaseLocationUpdateLogEvent[]>;

  addLocationUpdateLogEvent(
    tenantId: string,
    locationId: string,
    status: DatabaseLocationUpdateLogStatus,
    entityName?: string,
    message?: string,
  ): Promise<void>;
};
