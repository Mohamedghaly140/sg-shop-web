# Storefront — Overview

The storefront is the public-facing side of the application. It serves anonymous visitors, registered users, and (incidentally) admins/managers when they're shopping rather than managing.

## Layout

All storefront pages share `app/(storefront)/layout.tsx`:

- Top navigation: logo, category dropdown, search, cart drawer trigger, account/sign-in.
- Footer: links, legal, social.

## Route map

| Route                  | Feature component        | Description                             |
| ---------------------- | ------------------------ | --------------------------------------- |
| `/`                    | `HomeFeature`            | Hero, featured products, category grid  |
| `/products`            | `ProductsFeature`        | Full catalog, filters, sort, pagination |
| `/products/[slug]`     | `ProductDetailFeature`   | Gallery, variants, add to cart, reviews |
| `/categories/[slug]`   | `CategoryFeature`        | Category-filtered product listing       |
| `/search`              | `SearchFeature`          | Full-text search results                |
| `/cart`                | `CartFeature`            | Cart page (drawer also available)       |
| `/checkout`            | `CheckoutFeature`        | Registered + anonymous checkout         |
| `/checkout/success`    | `CheckoutSuccessFeature` | Order confirmation                      |
| `/account`             | `AccountOverviewFeature` | Profile summary                         |
| `/account/orders`      | `OrdersFeature`          | Order history list                      |
| `/account/orders/[id]` | `OrderDetailFeature`     | Order detail + status timeline          |
| `/account/addresses`   | `AddressesFeature`       | Address book CRUD                       |
| `/account/wishlist`    | `WishlistFeature`        | Saved products                          |
| `/sign-in/[[...rest]]` | Clerk hosted UI          |                                         |
| `/sign-up/[[...rest]]` | Clerk hosted UI          |                                         |

## Cross-cutting concerns

- **Cart drawer** is rendered inside the storefront layout so it's available on every page.
- **Anonymous browsing is fully supported** until the user reaches `/account/*`.
- **Cart for anonymous users** is keyed by a `sessionToken` cookie set on first cart interaction.
- **All filter/sort/pagination state** is in the URL via `nuqs`.

## Per-feature documents

| Feature             | Doc                                  |
| ------------------- | ------------------------------------ |
| Home                | `01-home.md`                         |
| Product catalog     | `02-product-catalog.md`              |
| Product detail      | `03-product-detail.md`               |
| Cart                | `04-cart.md`                         |
| Checkout            | `05-checkout.md`                     |
| Account             | `06-account.md`                      |
| Account orders      | `07-account-orders.md`               |
| Anonymous checkout  | `08-anonymous-checkout.md`           |
