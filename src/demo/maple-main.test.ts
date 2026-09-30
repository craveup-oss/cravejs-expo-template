import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorefrontClient } from '@craveup/storefront-sdk';
import {
  createMapleMainFetch,
  DEMO_API_ORIGIN,
  DEMO_LOCATION,
  DEMO_MERCHANT,
  isMapleMainDemo,
} from './maple-main.ts';
const images = {
  burger: 'https://images.example/burger.jpg',
  chicken: 'https://images.example/chicken.jpg',
};

test('the published SDK can browse the complete demo catalog and customize a burger', async () => {
  const client = createStorefrontClient({
    baseUrl: DEMO_API_ORIGIN,
    fetch: createMapleMainFetch(images),
  });
  const merchant = await client.merchant.getBySlug(DEMO_MERCHANT);
  assert.equal(merchant.name, 'Maple & Main');
  const menus = await client.menus.list(DEMO_LOCATION, { menuOnly: true });
  assert.equal(menus.menus[0]?.categories[0]?.products.length, 2);
  const product = await client.products.get(
    DEMO_LOCATION,
    'double-smash-burger',
  );
  assert.equal(product.images[0], images.burger);
  assert.equal(product.modifiers[0]?.items[1]?.name, 'Add smoked bacon');
  assert.equal(product.modifiers[0]?.items[1]?.price, '2.00');
});

test('demo transport rejects other tenants, origins, unknown products, and every mutation', async () => {
  const transport = createMapleMainFetch(images);
  for (const [url, method, expected] of [
    ['https://live.example/api/v1/storefront/merchant/maple-main', 'GET', 403],
    [
      `${DEMO_API_ORIGIN}/api/v1/storefront/merchant/another-restaurant`,
      'GET',
      404,
    ],
    [
      `${DEMO_API_ORIGIN}/api/v1/storefront/locations/${DEMO_LOCATION}/products/unknown`,
      'GET',
      404,
    ],
    [`${DEMO_API_ORIGIN}/api/v1/storefront/cart`, 'POST', 403],
    [`${DEMO_API_ORIGIN}/api/v1/storefront/customer/login`, 'POST', 403],
  ] as const)
    assert.equal((await transport(url, { method })).status, expected);
  assert.equal(
    isMapleMainDemo({
      apiOrigin: DEMO_API_ORIGIN,
      merchantSlug: DEMO_MERCHANT,
      locationId: DEMO_LOCATION,
    }),
    true,
  );
  assert.equal(
    isMapleMainDemo({
      apiOrigin: 'https://live.example',
      merchantSlug: DEMO_MERCHANT,
      locationId: DEMO_LOCATION,
    }),
    false,
  );
});
