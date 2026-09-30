import type { Product, MenuProduct } from '@craveup/storefront-sdk';
import { parsePublicStorefrontScope } from '../config/public-env.ts';
import { createCanonicalStorefrontFixture } from '../fixtures/storefront-fixtures.ts';

export const DEMO_API_ORIGIN = 'https://demo.maple-main.example';
export const DEMO_MERCHANT = 'maple-main';
export const DEMO_LOCATION = '0123456789abcdef01234567';

export function isMapleMainDemo(environment: {
  apiOrigin: string;
  merchantSlug: string;
  locationId: string;
}): boolean {
  return (
    environment.apiOrigin === DEMO_API_ORIGIN &&
    environment.merchantSlug === DEMO_MERCHANT &&
    environment.locationId === DEMO_LOCATION
  );
}

/** Fictional restaurant data; shared by the runnable demo and its screenshots. */
export function createMapleMainDemo(images: {
  burger: string;
  chicken: string;
}) {
  const fixture = createCanonicalStorefrontFixture();
  const products: Product[] = [
    {
      availability: 'AVAILABLE',
      currency: 'usd',
      id: 'double-smash-burger',
      name: 'Double Smash Burger',
      price: '14.00',
      displayPrice: '$14.00',
      description:
        'Two smashed beef patties, American cheese, pickles, shredded lettuce and house sauce on a toasted potato bun. Served with crinkle-cut fries.',
      locationId: DEMO_LOCATION,
      images: [images.burger],
      modifierIds: ['burger-finish'],
      modifiers: [
        {
          id: 'burger-finish',
          name: 'Make it yours',
          rule: { min: 1, max: 1 },
          items: [
            {
              id: 'classic',
              name: 'Keep it classic',
              price: '0.00',
              maxQuantity: 1,
            },
            {
              id: 'bacon',
              name: 'Add smoked bacon',
              price: '2.00',
              maxQuantity: 1,
            },
          ],
        },
      ],
    },
    {
      availability: 'AVAILABLE',
      currency: 'usd',
      id: 'crispy-chicken',
      name: 'Crispy Chicken Sandwich',
      price: '13.00',
      displayPrice: '$13.00',
      description:
        'Buttermilk-fried chicken, dill pickles, crisp lettuce and honey-pepper mayo on a toasted potato bun.',
      locationId: DEMO_LOCATION,
      images: [images.chicken],
      modifierIds: [],
      modifiers: [],
    },
  ];
  const bio =
    'Your neighborhood American grill. Smash burgers, crispy chicken and the good stuff.';
  fixture.scope = parsePublicStorefrontScope({
    EXPO_PUBLIC_CRAVEUP_API_URL: DEMO_API_ORIGIN,
    EXPO_PUBLIC_CRAVEUP_MERCHANT_SLUG: DEMO_MERCHANT,
    EXPO_PUBLIC_CRAVEUP_LOCATION_ID: DEMO_LOCATION,
  });
  fixture.location = {
    ...fixture.location,
    restaurantSlug: DEMO_MERCHANT,
    restaurantDisplayName: 'Maple & Main',
    restaurantBio: bio,
    coverPhoto: images.burger,
    addressString: '100 Main Street · Demo location',
  };
  fixture.merchant = {
    ...fixture.merchant,
    name: 'Maple & Main',
    bio,
    cover: images.burger,
    locations: fixture.merchant.locations.map((location) => ({
      ...location,
      restaurantDisplayName: 'Maple & Main',
      restaurantBio: bio,
      coverPhoto: images.burger,
      addressString: '100 Main Street · Demo location',
    })),
  };
  fixture.products = products;
  fixture.menus = [
    {
      id: 'all-day',
      name: 'All day',
      time: 'All day',
      isActive: true,
      categories: [
        {
          id: 'house-favorites',
          name: 'House favorites',
          products: products.map(
            ({
              modifiers: _modifiers,
              locationId: _locationId,
              ...product
            }): MenuProduct => product,
          ),
        },
      ],
    },
  ];
  return fixture;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** SDK fetch seam: closed local catalog, never forwards requests to a network. */
export function createMapleMainFetch(images: {
  burger: string;
  chicken: string;
}): typeof fetch {
  const fixture = createMapleMainDemo(images);
  return async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const locationPath = `/api/v1/storefront/locations/${DEMO_LOCATION}`;
    let data: unknown;
    if (url.origin !== DEMO_API_ORIGIN || request.method !== 'GET') {
      return jsonResponse(
        {
          error:
            'This demo supports menu browsing only. Orders and sign-in are unavailable.',
        },
        403,
      );
    }
    if (url.pathname === `/api/v1/storefront/merchant/${DEMO_MERCHANT}`)
      data = fixture.merchant;
    else if (url.pathname === locationPath) data = fixture.location;
    else if (url.pathname === `${locationPath}/menus`)
      data = { menus: fixture.menus, popularProducts: [] };
    else if (url.pathname === `${locationPath}/time-intervals`)
      data = fixture.orderTimes;
    else if (url.pathname === `${locationPath}/ordering-readiness`)
      data = {
        ready: true,
        fulfillmentMethod: 'takeout',
        pickupType: 'ASAP',
        orderDate: '2099-01-01',
        orderTime: '10:30 AM - 10:45 AM',
      };
    else if (url.pathname.startsWith(`${locationPath}/products/`)) {
      data = fixture.products.find(
        (product) => url.pathname === `${locationPath}/products/${product.id}`,
      );
    }
    return data
      ? jsonResponse(data)
      : jsonResponse({ error: 'Not available in this menu demo.' }, 404);
  };
}
