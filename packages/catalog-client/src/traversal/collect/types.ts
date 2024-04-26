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
import { TraverseCatalogEdge, TraverseCatalogNode } from '../types';

/**
 * A collector that receives all nodes and edges visited during a traversal.
 * This implementation is typically responsible for gathering up the results
 * into a useful result value, e.g. an array.
 *
 * @remarks
 *
 * See {@link TraverseCatalogCollectorFactoryContext} for a set of standard
 * collectors. Most users will want to use one of those, instead of implementing
 * this interface directly.
 */
export interface TraverseCatalogCollector<
  TResult,
  TEntity extends Entity = Entity,
> {
  /**
   * Is called each time that an edge is traversed. Note that the same "current"
   * node may be visited many times, if several nodes have edges to it.
   */
  visitEdge?(options: {
    fromNode: TraverseCatalogNode<TEntity>;
    toNode: TraverseCatalogNode<TEntity>;
    edge: TraverseCatalogEdge;
  }): Promise<void> | void;

  /**
   * Is called each time that a new node is visited. Each distinct node is only
   * visited once, even if there are multiple edges to it.
   */
  visitNode?(options: {
    node: TraverseCatalogNode<TEntity>;
  }): Promise<void> | void;

  /**
   * Is called when the traversal is complete, and should return the final
   * result value.
   */
  complete(): TResult;
}

/**
 * The set of standard collectors given to the
 * {@link TraverseCatalogCollectorFactory}.
 */
export interface TraverseCatalogCollectorFactoryContext {
  /**
   * Collects all entities into an array, with no duplicates.
   *
   * @remarks
   *
   * Note that this collector only keeps entities that actually exist, which
   * means that if your model for example contains relations to entities that do
   * not exist in the catalog, they will not be included in the result set. If
   * you want a complete set of entity refs, use the `toEntityRefArray`
   * collector instead, and follow up with a separate query to the catalog to
   * resolve the refs.
   */
  toEntityArray<TEntity extends Entity = Entity>(options?: {
    /**
     * The minimum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 0
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 0, which means that the collector will receive the initial
     * nodes as well. You can for example set this value to 1 to skip the
     * initial nodes from the result set.
     */
    minDepth?: number;
    /**
     * The maximum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 100
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 100, as a safety measure to avoid infinite loops. You can set
     * this to a lower value if you want to only traverse through a small
     * neighborhoud around the initial nodes.
     */
    maxDepth?: number;
  }): TraverseCatalogCollector<TEntity[], TEntity>;

  /**
   * Collects all entities into a set.
   *
   * @remarks
   *
   * Note that this collector only keeps entities that actually exist, which
   * means that if your model for example contains relations to entities that do
   * not exist in the catalog, they will not be included in the result set. If
   * you want a complete set of entity refs, use the `toEntityRefSet` collector
   * instead, and follow up with a separate query to the catalog to resolve the
   * refs.
   */
  toEntitySet<TEntity extends Entity = Entity>(options?: {
    /**
     * The minimum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 0
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 0, which means that the collector will receive the initial
     * nodes as well. You can for example set this value to 1 to skip the
     * initial nodes from the result set.
     */
    minDepth?: number;
    /**
     * The maximum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 100
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 100, as a safety measure to avoid infinite loops. You can set
     * this to a lower value if you want to only traverse through a small
     * neighborhoud around the initial nodes.
     */
    maxDepth?: number;
  }): TraverseCatalogCollector<Set<TEntity>, TEntity>;

  /**
   * Collects all entity refs into an array, with no duplicates.
   */
  toEntityRefArray(options?: {
    /**
     * The minimum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 0
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 0, which means that the collector will receive the initial
     * nodes as well. You can for example set this value to 1 to skip the
     * initial nodes from the result set.
     */
    minDepth?: number;
    /**
     * The maximum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 100
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 100, as a safety measure to avoid infinite loops. You can set
     * this to a lower value if you want to only traverse through a small
     * neighborhoud around the initial nodes.
     */
    maxDepth?: number;
    /**
     * Whether to include entity refs that do not have a corresponding entity in
     * the catalog.
     *
     * @remarks
     *
     * The default value is true, which means that entity refs that do not have
     * a corresponding entity in the catalog will be included in the result set
     * anyway. If you set this to false, only entity refs that have a
     * corresponding entity in the catalog will be included.
     */
    includeMissing?: boolean;
  }): TraverseCatalogCollector<string[]>;

  /**
   * Collects all entity refs into a set.
   */
  toEntityRefSet(options?: {
    /**
     * The minimum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 0
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 0, which means that the collector will receive the initial
     * nodes as well. You can for example set this value to 1 to skip the
     * initial nodes from the result set.
     */
    minDepth?: number;
    /**
     * The maximum depth (distance from the initial nodes) of the nodes to
     * collect.
     *
     * @defaultValue 100
     * @remarks
     *
     * The initial nodes themselves are defined as distance 0. This value
     * defaults to 100, as a safety measure to avoid infinite loops. You can set
     * this to a lower value if you want to only traverse through a small
     * neighborhoud around the initial nodes.
     */
    maxDepth?: number;
    /**
     * Whether to include entity refs that do not have a corresponding entity in
     * the catalog.
     *
     * @remarks
     *
     * The default value is true, which means that entity refs that do not have
     * a corresponding entity in the catalog will be included in the result set
     * anyway. If you set this to false, only entity refs that have a
     * corresponding entity in the catalog will be included.
     */
    includeMissing?: boolean;
  }): TraverseCatalogCollector<Set<string>>;

  /**
   * Does no collection of items.
   */
  none(): TraverseCatalogCollector<void>;
}

/**
 * A factory function that returns a collector. The context contains helpers for
 * easily constructing common collectors.
 */
export type TraverseCatalogCollectorFactory<
  TResult,
  TEntity extends Entity = Entity,
> = (
  context: TraverseCatalogCollectorFactoryContext,
) => TraverseCatalogCollector<TResult, TEntity>;
