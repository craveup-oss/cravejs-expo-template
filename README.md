# Crave.js Expo Storefront

A branded mobile ordering app for restaurants, built on Expo and the public Crave Storefront API.

Menus, nested modifiers, an authoritative cart, pickup and delivery, customer accounts, order history
and capability-gated loyalty — as a parameterised Expo template you generate a project from, rather
than a repository you clone and rename.

**One commerce core. Typed brand configuration. Generated projects with real provenance.**

Expo SDK 57 · React Native 0.86 · React 19.2 · expo-router · TypeScript · MIT

> [!IMPORTANT]
> This repository contains the public template and an included restaurant demo. The template, the fixture
> runtime and `template:materialize` work today; the public `crave` CLI generator has not shipped yet.
> Clone it to read, run and adapt the template — a clone is not a generated project.

## What you get

- **Browse and decide:** location bootstrap, timed menus, categories, search, product detail,
  availability and nested modifiers.
- **Build and recover a cart:** server-authoritative totals, revision preconditions, idempotent
  mutations, and explicit customer retry after a conflict.
- **Choose how to order:** pickup now or later, plus delivery where the merchant enables it.
- **Complete the handoff:** `checkout.prepare` returns an opaque URL that is validated against the
  environment's exact HTTPS hosted-checkout origin and opened in the system browser. The app embeds
  no payment UI and holds no provider secrets.
- **Come back recognised:** OTP account entry, profile, addresses, order history and gated loyalty.
- **Ship it as your own:** typed brand configuration generates names, scheme, bundle identifiers,
  icons, theme and fonts.

## Requirements

- Node.js 24 (see [`.nvmrc`](.nvmrc))
- Expo tooling resolved through the project (`npx expo`)
- Xcode for iOS, Android Studio for Android

## Try Maple & Main

The developer-site screenshots show **Maple & Main**, a fictional American neighborhood grill.
The same menu, burger customization and original AI-generated food photography ship here.
No credentials or backend are needed (food photos load over HTTPS from this repository):

```bash
npm ci
npm run demo -- --web
# Or: npm run demo -- --ios / --android
```

This is a **menu-browsing demo**: browse, search, view food photos and customize the burger.
The banner identifies demo mode; adding to the bag is disabled. Sign-in, payment and all network
mutations are rejected locally. It never creates orders or contacts a real merchant.
Native appearance can differ from the website's Expo web screenshots.

The demo uses the existing Storefront SDK's fetch seam with an exact reserved `.example` origin,
merchant and location. It never intercepts another profile or falls back from a failed live request.
`npm run ios`, `npm run android` and `npm run web` continue to use your configured live environment.
See `src/demo/maple-main.ts` and `assets/demo/` to change this sample menu and its photography.

## Run it with your restaurant

```bash
git clone https://github.com/craveup-oss/cravejs-expo-template.git
cd cravejs-expo-template
npm ci
npm run verify
npm run ios
```

`npm run verify` runs lint, typecheck and the demo SDK/boundary tests. `npm run ios`, `npm run android` and `npm run web` start the
app on each target.

Copy [`.env.example`](.env.example) to `.env` and fill in the values for your environment. Everything
prefixed `EXPO_PUBLIC_` is embedded in the app bundle and is public: the API origin, merchant and
location identifiers, the exact HTTPS hosted-checkout origin, and platform-restricted map keys. Never
add a Crave API key, a payment-provider secret, a customer token, or a cart or receipt capability.

## Make it your brand

Brand identity is data, not scattered literals. [`template/mobile-template.manifest.json`](template/mobile-template.manifest.json)
declares the display and legal names, slug, URL scheme, iOS bundle identifier, Android package, copy,
icons, colour and font profiles, legal and support links, namespaces and capability flags.

From that manifest the generator writes `src/config/brand.config.ts`, `src/config/brand-assets.ts`,
`src/theme/brand-theme.ts` and `src/theme/brand-fonts.ts`. Colour and font profile names are validated
against profiles the generator can actually materialise, so a project only ever receives a palette,
font bindings and font packages that exist.

```bash
npm run template:materialize
```

That is the canonical path to a complete customer project. It validates the pinned template, API and
SDK release tuple, stages output atomically, writes `.crave/mobile-template.json` provenance with
owned-file digests, and fails closed on a conflict, a symlinked target, or a destination inside the
immutable template source. Its `--dry-run` reports every file action, the normalised native identity,
the selected public environment keys, and the lifecycle and rollback commands.

[`docs/contracts/GENERATED-MOBILE-STARTER.md`](docs/contracts/GENERATED-MOBILE-STARTER.md) is
normative for registry identity, provenance, generation, upgrade and conflict handling, and rollback.

### Placeholder artwork

This public template ships neutral, repository-owned placeholder icons, splash images and a brand
mark instead of licensed artwork. Every shipped asset is recorded with its SHA-256 digest in
[`distribution/asset-ownership.json`](distribution/asset-ownership.json), and the release gate rejects
any image whose rights are not confirmed. Replace them with your own.

## Architecture

- **The app calls the public Storefront API directly.** There is no BFF and no Expo API-route layer.
  Every remote operation goes through `@craveup/storefront-sdk` behind one shared client; components
  never call `fetch`.
- **Routes compose, components render, domain logic stays pure.** Cart maths, modifier validation and
  fulfilment rules are typed modules testable without React or the network.
- **Money is never computed client-side as truth.** Prices, taxes, fees, discounts and totals come
  from the server; the UI renders what the API returns.
- **Sessions are environment-scoped.** The cart session and customer JWT live in `expo-secure-store`
  under keys namespaced by the validated API origin, merchant and location, so staging and production
  can never share records.
- **Conflicts refresh, they do not replay.** A revision conflict fetches authoritative state and
  requires explicit customer retry.
- **Secrets are never `EXPO_PUBLIC_*`.** Anything with that prefix is public by construction.

## Provenance

The commerce foundation was imported from a reviewed engineering snapshot; [`.crave/source.json`](.crave/source.json) records that baseline source repository and commit. The Maple & Main demo is maintained here.
Release tags are created only from a commit on `main` after an approval-gated workflow reverifies the
tree, so a published release names the precise bytes it was built from.

Send code and documentation changes here as pull requests; maintainers reconcile commerce-core changes with the
engineering source. Future snapshot syncs must preserve the public demo and its tests.

## Security

Report suspected vulnerabilities privately — see [SECURITY.md](SECURITY.md). Never include
credentials, customer data, cart capabilities or payment details in a public issue.

## License

[MIT](LICENSE) © Crave Up, Inc.
