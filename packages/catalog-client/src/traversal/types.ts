/*
 * Copyright 2024 The Backstage Authors
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

import { Entity, EntityRelation } from '@backstage/catalog-model';
import { EntityFilterQuery } from '../types/api';

export type TraverseCatalogInitialSet =
  | { entityRef: string }
  | { entityRefs: string[] }
  | { filter: EntityFilterQuery };

export type TraverseCatalogFollow =
  | {
      fromKind?: string;
      relation: string;
      toKind?: string;
    }
  | Array<{
      fromKind?: string;
      relation: string;
      toKind?: string;
    }>;

export type TraverseCatalogEdge = { relation: EntityRelation };

export type TraverseCatalogNode<TEntity extends Entity = Entity> = {
  depth: number;
  entityRef: string;
  entity(): Promise<TEntity | undefined>;
};
