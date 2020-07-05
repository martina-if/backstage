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

import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import knex from 'knex';
import fs from 'fs';
import { HigherOrderOperations } from '..';
import { DatabaseEntitiesCatalog } from '../catalog/DatabaseEntitiesCatalog';
import { DatabaseLocationsCatalog } from '../catalog/DatabaseLocationsCatalog';
import { DatabaseManager } from '../database/DatabaseManager';
import { createRouter } from './router';
import { LocationReaders } from '../ingestion';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'catalog-backend' });

  logger.debug('Creating application...');

  const databaseConnectionOptions = {
    client: 'pg',
    connection: {
      database: process.env.PGDATABASE,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: {
        ca: fs.readFileSync(String(process.env.PGPATH_TO_CA)),
        rejectUnauthorized: true,
      },
    },
    useNullAsDefault: true,
  }

  const database = knex(databaseConnectionOptions);
  const db = await DatabaseManager.createDatabase(database, { logger });
  const entitiesCatalog = new DatabaseEntitiesCatalog(db);
  const locationsCatalog = new DatabaseLocationsCatalog(db);
  const locationReader = new LocationReaders();
  const higherOrderOperation = new HigherOrderOperations(
    entitiesCatalog,
    locationsCatalog,
    locationReader,
    logger,
  );

  logger.debug('Starting application server...');
  const router = await createRouter({
    entitiesCatalog,
    locationsCatalog,
    higherOrderOperation,
    logger,
  });
  const service = createServiceBuilder(module)
    .enableCors({ origin: 'http://localhost:3000' })
    .addRouter('/catalog', router);
  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
