/*
 * Copyright 2025 The Backstage Authors
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

import { InMemoryCatalogClient } from '@backstage/catalog-client/testUtils';
import { traverseCatalog } from './traverseCatalog';

describe('traverseCatalog', () => {
  it('works', async () => {
    const catalogApi = new InMemoryCatalogClient({ entities: [] });

    const result = await traverseCatalog({
      catalogApi,
      initial: { entityRef: 'foo' },
      follow: ctx => ctx.relations({ type: 'dependsOn' }),
      collect: ctx => ctx.toEntityArray(),
    }).toArray();

    /*
    const result = await catalogTraversal({
        catalogApi,
        initial: { entityRef: 'foo' }
      })
        .follow({ relation: 'dependsOn' })
        .toEntityArray();
    */

    /*
    const result = await catalogTraversal(catalogApi)
        .initial({ entityRef: 'foo' })
        .follow({ relation: 'dependsOn', kind: 'Component' })
        .follow({ relation: 'dependsOn' })
        .toEntityArray();
    */

    expect(result).toEqual([]);
  });
});
