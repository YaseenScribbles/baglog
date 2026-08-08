# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app does

BagLog tracks stock of accessories (e.g. bags, packaging items) for a textile shop. These accessories are given away free with purchases, not sold individually, and are not tracked per-customer.

Stock workflow:
1. Goods arrive via the **Receipt** module and are booked into a warehouse station named `STOCK ROOM - DELIVERY ITEMS` (in the `stations` table — a `type = 'floor'` station like any other, just conventionally the entry point).
2. Stock is moved from the stock room to shop floors via the **Delivery** module (station-to-station transfer).
3. Floors hand accessories to customers, also modeled as a **Delivery**, but to a station of `type = 'customer'`. There is no stock room ↔ customer path — customer deliveries always originate from a floor station, never the stock room.
4. Because customers aren't tracked individually, giveaways are logged as stock leaving a floor station with no corresponding "customer stock" ever being queried back — customer stations are a sink, not a real inventory location.

`stations.type` only has two values, `floor` and `customer` (see the type dropdown in `Stations.jsx`) — there is no distinct "stock room" type; it's just a floor station identified by name. `deliveries.from`/`deliveries.to` are both station IDs — the same table/model handles floor-to-floor and floor-to-customer moves.

Customer deliveries happen in bulk at month-end rather than per-transaction (staff don't log a delivery every time a customer is given an item), so the UI treats deliveries **to** a `customer`-type station differently from floor-to-floor deliveries — see "Deliveries page" below.

## Stack

- **Backend**: Laravel 10 (PHP 8.1), SQL Server (`sqlsrv` driver, see `.env`)
- **Frontend**: React 18 + Grommet UI, served through Inertia.js (`@inertiajs/react`) — no separate SPA API, controllers return Inertia responses directly
- **Build**: Vite (`laravel-vite-plugin`)

## Commands

```bash
# Install
composer install
npm install

# Run dev (Laravel server + Vite, both bound to 192.168.10.65 — see package.json)
npm run start
# or separately:
php artisan serve
npm run dev

# Build frontend for production
npm run build

# Tests (PHPUnit; tests/ currently only has framework-generated stubs)
php artisan test
php artisan test --filter=TestName
vendor/bin/phpunit

# Lint/format PHP
vendor/bin/pint

# Migrations
php artisan migrate
php artisan migrate:fresh

# Rebuild stock_logs from scratch (truncates and replays all receipts/deliveries)
php artisan app:sync-stock-logs
```

The dev scripts hardcode host `192.168.10.65` in `package.json` — adjust if running on a different machine.

## Architecture

### Stock tracking via observers, not direct writes

Stock levels are never written directly. `Receipt` and `Delivery` models are observed (`app/Observers/ReceiptObserver.php`, `app/Observers/DeliveryObserver.php`, registered in `AppServiceProvider::boot()`), and every create/update/delete on those models replays into the append-only `stock_logs` table:

- Receipt created → one `stock_logs` row per item, positive qty, at the receipt's station.
- Delivery created → **two** `stock_logs` rows per item: negative qty at `from`, positive qty at `to`.
- Update → old logs for that `source_id`/`type` are deleted, then regenerated from the current state (effectively replace-on-write).
- Delete → corresponding logs are deleted.

Both observers implement `ShouldHandleEventsAfterCommit`, so logs are only written after the DB transaction commits.

`stock_summary` (`app/Models/StockSummary.php`) is a **SQL view**, not a table (see migration `2025_06_10_112949_create_stock_summary_view.php`): `SUM(qty) GROUP BY station_id, product_id` over `stock_logs`. Current stock is always read from this view, never computed ad hoc. The model has `$incrementing = false`, no timestamps, no primary key — read-only by nature.

`php artisan app:sync-stock-logs` (`app/Console/Commands/SyncStockLogs.php`) is the escape hatch: truncates `stock_logs` and replays every Receipt and Delivery from scratch. Use it if logs and source records ever drift apart (e.g. after a manual DB fix).

When touching Receipt/Delivery create/update/delete logic, remember the observers are the single source of truth for stock — don't add parallel stock-adjustment code in controllers.

### Pricing

`PriceHistory` + `PriceService::getActivePrice($productId, $date)` resolve the price effective on a given date (`valid_from`/`valid_to` range). `ReceiptItem`/`DeliveryItem` also carry their own `price` snapshot at the time of transaction, which is what `stock_logs.price` copies — so historical stock log prices don't change if `PriceHistory` is edited later.

### Inertia + Grommet frontend

Pages live in `resources/js/Pages/*.jsx` and are resolved by name from Laravel controllers (`inertia('Products')`, etc. — no client-side router). `resources/js/app.jsx` wraps the app in a single `Grommet` provider with a custom dark theme (`themeMode="dark"`); there is no per-page theming. Shared page chrome (nav, header) lives under `Pages/Components/`.

### Deliveries page (`resources/js/Pages/Deliveries.jsx`)

Floor-to-floor deliveries use plain one-by-one entry: pick a product, see its current stock in the `Qty(currentStock)` label (via `GET /deliverystock?station_id=&product_id=`), type a qty, click Add.

Deliveries **to a `customer`-type station** work differently, because staff enter a month's worth of giveaways in one sitting instead of per-transaction:
- Selecting a `from` station while `to` is a customer station auto-populates the item grid with every product that has stock > 0 at `from`, via `GET /deliverystock/all?station_id=`. Each row shows the product, its available stock (reference only), and a blank Qty cell — staff fill in only what was actually given away; rows left at 0/blank are filtered out of the submitted payload (`data.delivery_items` is derived from non-zero rows only, not the raw `items` reducer state).
- Once rows are loaded, the `to` select locks (`selectedToStation?.type === "customer" && items.length > 0`) to prevent an accidental station change from silently reloading and wiping entered quantities. Hitting **Reset** is the only way out of the locked state — this is intentional, not a bug.
- A "Reload Stock" button re-runs the same fetch on demand (e.g. after changing `from`, or if stock changed since the form opened).
- The per-row qty input (`QtyInput`, defined above the `Deliveries` component) refuses keystrokes that would push qty past that row's `stock` value.
- `QtyInput` keeps its own local state and only dispatches into the shared `items` reducer on blur/Enter, not on every keystroke — with potentially hundreds of auto-loaded rows, syncing on every character was the direct cause of visible input lag, since it forced the whole item table to re-render each time. Follow this local-state-then-flush pattern for any other per-row-editable-field additions to this table.
- This behavior is skipped entirely while editing an existing delivery (`editId !== null`) — edit mode loads the delivery's actual saved items instead.

### Models of note

- `Station` — `type` is `'floor'` or `'customer'`; no separate tables per station kind, and no dedicated "stock room" type (see above).
- `Delivery` — `from`/`to` are both FKs to `stations` (aliased relations `from()`/`to()`), covering both floor→floor and floor→customer moves.
- `Product` — has `product_type` (differentiates product categories in dropdowns/dashboard ordering) and `per_pack` (units per pack, shown in receipts/delivery notes).
