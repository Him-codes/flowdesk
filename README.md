# FlowDesk

Business-operations SaaS dashboard. A frontend portfolio project: all data is simulated demo data, and there is no real authentication, payment processing or email.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
```

Stack: React 18, TypeScript, Vite, React Router 6, CSS Modules, lucide-react.

## Demo data and error states

All data comes from `src/data` through a simulated async API (`src/data/api.ts`) with random latency.
Open any page with `?simulateError` (for example `/dashboard?simulateError`) to make the first request for each
section fail once, then use **Try again** to see the retry path.

## Customers and Transactions

- Both lists search, filter, sort (column headers on wide screens, a **Sort by** control everywhere) and paginate in memory; rows open detail dialogs.
- **Add customer** validates in the browser and again in the simulated API (duplicate emails are rejected). New customers live in memory for the session and are cleared on refresh.
- **Export CSV** downloads the filtered, sorted transactions. It contains demo data only.

## Tasks and Notifications

- **Tasks** are local-first: every add, edit, status change and delete is saved to `localStorage` immediately and survives a refresh. Search, priority and assignee filters combine with status tabs. Completing a task also appears in the dashboard activity feed and in Notifications.
- **Notifications** come from the simulated API, grouped into Today and Earlier. Which ones you have read is stored in the browser, so the unread counts in the sidebar, top bar and page stay in sync after a refresh.
- Stored data is versioned and validated on load; corrupt or outdated data falls back to the starter data instead of breaking the app. To reset, clear the `flowdesk:*` keys in your browser's storage.

## Analytics and Settings

- **Analytics** has four independent widgets (revenue with previous-period overlay, customer growth, conversion rate, revenue by category). Each loads, fails and retries on its own and follows the shared 7D / 30D / 90D / 12M selector, which is remembered. Revenue by category is illustrative: a transaction's category is derived from its ID.
- **Settings** has Profile, Appearance, Notifications and Security. Profile, theme and notification preferences are saved to `localStorage`; the saved name, email and photo appear in the sidebar and top bar. Turning a notification type off hides it in Notifications and in the unread counts.
- **Security is a UI demo only.** No password is stored or sent, and two-factor authentication is not enforced. The interface says so wherever it appears.

## Persistence and cross-app behaviour

**What is saved in the browser** (all versioned `{v, data}`, all keys registered in `src/utils/storage.ts`):

| Key | Contents |
| --- | --- |
| `flowdesk:theme` | `dark` / `light` |
| `flowdesk:preferences` | profile (name, email, company, photo), notification preferences, the demo two-factor switch |
| `flowdesk:tasks` | the task list |
| `flowdesk:notifications-read` | IDs of notifications you've read (capped at 300) |

Temporary UI state is deliberately **not** saved: open dialogs, search text, filters, sorting, pagination, tabs, chart date ranges, toasts and loading state. Customers you add live in memory for the session (the form says so).

Saved data is read defensively: corrupt JSON, a different schema version or the wrong shape never crashes the app. Where it can, it recovers field by field (a damaged notifications section keeps your profile; invalid tasks are dropped and the rest kept); otherwise it falls back to the defaults. Changes in one browser tab are picked up by other open tabs.

**One source of truth per thing**

- Tasks: `TasksProvider`. The dashboard's "Task completed" events and the task notifications are derived from it on the spot (no simulated delay for browser-local data).
- Notifications: one feed (server feed + task notifications, filtered by your preferences, minus what you've read) shared by the sidebar badge, top-bar bell and Notifications page.
- Customers, transactions, KPIs, analytics: derived from the same generated data; adding a customer refetches the feeds that depend on it.
- The signed-in user is defined once (`src/data/user.ts`); the profile you save overrides it everywhere, including the name shown on tasks assigned to you.

**Deep links** (`src/routes.ts`): `/customers?customer=<id>` opens that customer; `/transactions?q=<text>` pre-fills the search. Notifications, dashboard activity, customer details and transaction details use them.
