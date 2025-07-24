## 🚀 Hybrid Mock + Real Apollo Client Setup

You can easily set up an Apollo Client that returns mock data for some or all queries, and falls back to your real server for others.

### 1. Install dependencies
```
npm install @apollo/client graphql @faker-js/faker
```

### 2. Usage Example

```typescript
import { createAutoMockApolloClient } from './src/providers/createAutoMockApolloClient';
import { schemaSDL } from './src/schema';

const client = createAutoMockApolloClient({
  schemaSDL,
  enabled: true, // Toggle this to enable/disable mocking
  uri: '/graphql', // Your real server endpoint
  // Optionally, only mock certain operations:
  matcher: (operation) => operation.operationName === 'getPortfolio',
});
```

- When `enabled` is `true`, matching queries are mocked, others go to the real server.
- When `enabled` is `false`, all queries go to the real server.
- Use the `matcher` function to control which operations are mocked.

### 3. Use with ApolloProvider

```tsx
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo-client';

<ApolloProvider client={client}>
  <App />
</ApolloProvider>
```

## 🎛️ Typesafe MockConfig Example

You can control mocking globally, per operation, per type, and per field using a typesafe config object:

```typescript
import type { MockConfig } from './src/core/mock-config';
import { createAutoMockApolloClient } from './src/providers/createAutoMockApolloClient';
import { schemaSDL } from './src/schema';

const mockConfig: MockConfig = {
  enabled: true,
  operations: {
    getPortfolio: { enabled: true },
    getUser: { enabled: false },
  },
  types: {
    Portfolio: {
      fields: {
        totalValue: { min: 1000, max: 10000 },
        createdAt: { minDate: '2020-01-01', maxDate: '2023-01-01' },
        transactions: { arrayMin: 2, arrayMax: 5 }
      }
    },
    Transaction: {
      fields: {
        amount: { min: 10, max: 1000 }
      }
    }
  }
};

const client = createAutoMockApolloClient({
  schemaSDL,
  mockConfig,
  uri: '/graphql',
});
```

- Control array sizes, number/date ranges, and override any field value.
- Enable/disable mocking globally or per operation.
- Use custom value generators for any field.

---
