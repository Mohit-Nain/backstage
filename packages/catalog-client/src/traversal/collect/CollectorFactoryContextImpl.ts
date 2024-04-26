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

import { Entity } from '@backstage/catalog-model';
import { TraverseCatalogNode } from '../types';
import {
  TraverseCatalogCollector,
  TraverseCatalogCollectorFactoryContext,
} from './types';

/**
 * A helper for building a collector that gathers up visited nodes into a
 * collection, with no duplicates.
 */
function toCollection<TResult, TEntity extends Entity = Entity>(
  init: () => TResult,
  visit: (
    node: TraverseCatalogNode<TEntity>,
    target: TResult,
  ) => Promise<unknown>,
  options?: {
    minDepth?: number;
    maxDepth?: number;
  },
): TraverseCatalogCollector<TResult, TEntity> {
  const { minDepth = 0, maxDepth = 100 } = options ?? {};
  const result = init();
  const seenRefs = new Set<string>();
  return {
    async visitNode({ node }) {
      if (
        node.depth < minDepth ||
        node.depth > maxDepth ||
        seenRefs.has(node.entityRef)
      ) {
        return;
      }

      seenRefs.add(node.entityRef);
      await visit(node, result);
    },
    complete() {
      return result;
    },
  };
}

/**
 * Holds the implementation of all of the standard collectors that are given to
 * the collector factory.
 */
export class CollectorFactoryContextImpl
  implements TraverseCatalogCollectorFactoryContext
{
  toEntityArray<TEntity extends Entity = Entity>(options?: {
    minDepth?: number;
    maxDepth?: number;
  }) {
    return toCollection<TEntity[], TEntity>(
      () => [],
      async (node, array) => {
        const entity = await node.entity();
        if (entity) {
          array.push(entity);
        }
      },
      options,
    );
  }

  toEntitySet<TEntity extends Entity = Entity>(options?: {
    minDepth?: number;
    maxDepth?: number;
  }) {
    return toCollection<Set<TEntity>, TEntity>(
      () => new Set(),
      async (node, set) => {
        const entity = await node.entity();
        if (entity) {
          set.add(entity);
        }
      },
      options,
    );
  }

  toEntityRefArray(options?: {
    minDepth?: number;
    maxDepth?: number;
    includeMissing?: boolean;
  }) {
    const { minDepth, maxDepth, includeMissing = true } = options ?? {};
    return toCollection<string[]>(
      () => [],
      async (node, array) => {
        if (includeMissing || (await node.entity()) !== undefined) {
          array.push(node.entityRef);
        }
      },
      { minDepth, maxDepth },
    );
  }

  toEntityRefSet(options?: {
    minDepth?: number;
    maxDepth?: number;
    includeMissing?: boolean;
  }) {
    const { minDepth, maxDepth, includeMissing = true } = options ?? {};
    return toCollection<Set<string>>(
      () => new Set(),
      async (node, set) => {
        if (includeMissing || (await node.entity()) !== undefined) {
          set.add(node.entityRef);
        }
      },
      { minDepth, maxDepth },
    );
  }

  none(): TraverseCatalogCollector<void> {
    return {
      complete() {},
    };
  }
}
