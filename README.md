# 🚀 GraphQL Apollo Auto Mocker

**Intelligent GraphQL mocking framework for Apollo Client with seamless real server fallback**

[![npm version](https://badge.fury.io/js/@kozielgpc/graphql-apollo-auto-mocker.svg)](https://www.npmjs.com/package/@kozielgpc/graphql-apollo-auto-mocker)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## ✨ Features

- 🧠 **Intelligent Mock Generation** - Smart field detection using heuristics and faker.js
- 🔄 **Hybrid Mode** - Seamlessly switch between mock data and real server responses
- 🎯 **Type-Safe Configuration** - Full TypeScript support with fine-grained control
- ⚡ **Zero Setup** - Works out of the box with any GraphQL schema
- 🎛️ **Flexible Control** - Configure mocking at global, operation, type, and field levels
- 🔗 **Apollo Integration** - Drop-in replacement for your existing Apollo Client setup
- 📊 **Rich Data Types** - Built-in support for scalars, arrays, dates, and custom generators

## 📦 Installation

```bash
npm install @kozielgpc/graphql-apollo-auto-mocker @apollo/client graphql @faker-js/faker
```

```bash
yarn add @kozielgpc/graphql-apollo-auto-mocker @apollo/client graphql @faker-js/faker
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { createAutoMockApolloClient } from '@kozielgpc/graphql-apollo-auto-mocker';

const schemaSDL = `
  type Query {
    getUser(id: ID!): User
    getOrders: [Order]
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type Order {
    totalValue: Float!
    items: [Item!]!
    status: String!
    orderDate: String!
  }

  type Item {
    id: ID!
    name: String!
    quantity: Int!
    price: Float!
  }
`;

const client = createAutoMockApolloClient({
  schemaSDL,
  uri: 'https://your-graphql-server.com/graphql',
  mockConfig: {
    enabled: true, // Toggle this to enable/disable mocking
  }
});
```

### With React

```tsx
import React from 'react';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import { createAutoMockApolloClient } from '@kozielgpc/graphql-apollo-auto-mocker';

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      email
      createdAt
    }
  }
`;

function UserProfile({ userId }: { userId: string }) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.getUser.name}</h1>
      <p>Email: {data.getUser.email}</p>
      <p>Member since: {data.getUser.createdAt}</p>
    </div>
  );
}

function App() {
  const client = createAutoMockApolloClient({
    schemaSDL: yourSchemaSDL,
    uri: '/graphql',
    mockConfig: { enabled: true }
  });

  return (
    <ApolloProvider client={client}>
      <UserProfile userId="123" />
    </ApolloProvider>
  );
}
```

## 🎛️ Configuration

### Type-Safe MockConfig

Control mocking behavior with a fully typed configuration object:

```typescript
import { MockConfig } from '@kozielgpc/graphql-apollo-auto-mocker';

const mockConfig: MockConfig = {
  // Global toggle
  enabled: true,
  
  // Per-operation control
  operations: {
    getOrders: { enabled: true },
    getUser: { enabled: false }, // This will use real server
    getUserProfile: { enabled: true }
  },
  
  // Per-type and per-field control
  types: {
    Order: {
      fields: {
        totalValue: { 
          min: 50, 
          max: 5000 
        },
        items: { 
          arrayMin: 1, 
          arrayMax: 10 
        },
        status: {
          value: () => ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)]
        }
      }
    },
    Item: {
      fields: {
        quantity: { 
          min: 1, 
          max: 20 
        },
        price: { 
          min: 5, 
          max: 500 
        }
      }
    },
    User: {
      fields: {
        name: { 
          value: () => `Test User ${Math.floor(Math.random() * 1000)}` 
        },
        email: { 
          value: 'test@example.com' 
        }
      }
    }
  }
};
```

### Field Configuration Options

```typescript
interface MockFieldConfig {
  // Number constraints
  min?: number;
  max?: number;
  
  // Date constraints
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  
  // Array constraints
  arrayMin?: number;
  arrayMax?: number;
  
  // Custom values
  value?: any | (() => any);
}
```

### Advanced Setup with Custom Matcher

```typescript
const client = createAutoMockApolloClient({
  schemaSDL,
  uri: '/graphql',
  mockConfig: {
    enabled: true,
  },
  // Custom logic to determine which operations to mock
  matcher: (operation) => {
    // Only mock read operations, not mutations
    return operation.operationName?.startsWith('get') ?? false;
  }
});
```

## 🧠 Intelligent Field Generation

The auto-mocker uses smart heuristics to generate realistic data based on field names and types:

### Field Name Heuristics

- **Email fields**: `email`, `userEmail` → `john.doe@example.com`
- **Name fields**: `name`, `firstName`, `lastName`, `productName` → `John Doe` / `Premium Widget`
- **Date fields**: `createdAt`, `updatedAt`, `orderDate` → `2023-08-15T10:30:00.000Z`
- **ID fields**: `id`, `userId`, `orderId`, `itemId` → `550e8400-e29b-41d4-a716-446655440000`
- **Amount fields**: `quantity`, `price`, `totalValue` → `5` / `1234.56`
- **Phone fields**: `phone`, `phoneNumber` → `+1-555-123-4567`

### GraphQL Type Mapping

- **String** → Lorem ipsum text
- **Int** → Random integer (0-100, configurable)
- **Float** → Random decimal (0-100, configurable)
- **Boolean** → Random true/false
- **ID** → UUID string
- **Arrays** → 1-3 items by default (configurable)

## 🔄 Hybrid Mode

The auto-mocker seamlessly combines mocked and real data:

```typescript
const mockConfig: MockConfig = {
  enabled: true,
  operations: {
    // Mock these operations
    getOrders: { enabled: true },
    getUserProfile: { enabled: true },
    
    // Use real server for these
    updateUser: { enabled: false },
    processPayment: { enabled: false },
    createOrder: { enabled: false }
  }
};

// Queries will be mocked, mutations will hit the real server
const client = createAutoMockApolloClient({
  schemaSDL,
  uri: 'https://api.yourapp.com/graphql',
  mockConfig
});
```

## 🎯 Use Cases

### Development & Testing

```typescript
// Development environment
const isDevelopment = process.env.NODE_ENV === 'development';

const client = createAutoMockApolloClient({
  schemaSDL,
  uri: '/graphql',
  mockConfig: {
    enabled: isDevelopment, // Auto-enable in dev
    types: {
      User: {
        fields: {
          // Use consistent test data in development
          name: { value: 'Test User' },
          email: { value: 'test@dev.com' }
        }
      }
    }
  }
});
```

### Feature Flagged Mocking

```typescript
const client = createAutoMockApolloClient({
  schemaSDL,
  uri: '/graphql',
  mockConfig: {
    enabled: true
  },
  matcher: (operation) => {
    // Mock operations based on feature flags
    return window.featureFlags?.mockGraphQL === true;
  }
});
```

### Storybook Integration

```typescript
// .storybook/apollo-client.js
import { createAutoMockApolloClient } from '@kozielgpc/graphql-apollo-auto-mocker';

export const mockClient = createAutoMockApolloClient({
  schemaSDL: storybookSchema,
  uri: '', // Not used in Storybook
  mockConfig: {
    enabled: true,
    types: {
      User: {
        fields: {
          avatar: { value: 'https://via.placeholder.com/150' }
        }
      }
    }
  }
});
```

## 📚 API Reference

### `createAutoMockApolloClient(options)`

Creates an Apollo Client with auto-mocking capabilities.

**Parameters:**
- `schemaSDL` (string): GraphQL schema definition
- `uri` (string): Real GraphQL server endpoint
- `mockConfig?` (MockConfig): Configuration object
- `cacheOptions?` (ApolloCache | object): Cache configuration

**Returns:** ApolloClient instance

### `createAutoMockLink(options)`

Creates an Apollo Link for advanced use cases.

**Parameters:**
- `schemaSDL` (string): GraphQL schema definition
- `mockConfig?` (MockConfig): Configuration object
- `matcher?` (function): Custom operation matcher

### `mockOperation(schemaSDL, operationType, operationName, config?)`

Low-level function to generate mock data for a specific operation.

## 🔧 Advanced Examples

### Custom Cache Configuration

```typescript
import { InMemoryCache } from '@apollo/client';

const client = createAutoMockApolloClient({
  schemaSDL,
  uri: '/graphql',
  mockConfig: { enabled: true },
  cacheOptions: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          orders: {
            merge: false // Replace instead of merging arrays
          }
        }
      }
    }
  })
});
```

### Complex Field Generators

```typescript
const mockConfig: MockConfig = {
  enabled: true,
  types: {
    Order: {
      fields: {
        shippingInfo: {
          value: () => ({
            estimatedDays: Math.floor(Math.random() * 7) + 1, // 1-7 days
            carrier: ['FedEx', 'UPS', 'USPS', 'DHL'][Math.floor(Math.random() * 4)],
            trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          })
        },
        priority: {
          value: () => ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)]
        }
      }
    },
    Item: {
      fields: {
        category: {
          value: () => ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'][Math.floor(Math.random() * 5)]
        }
      }
    }
  }
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Faker.js](https://fakerjs.dev/) - For realistic mock data generation
- [Apollo Client](https://www.apollographql.com/docs/react/) - For the excellent GraphQL client
- [GraphQL](https://graphql.org/) - For the amazing query language

---

<div align="center">
  <p>Made with ❤️ by developers, for developers</p>
  <p>
    <a href="https://github.com/kozielgpc/graphql-apollo-auto-mocker">⭐ Star us on GitHub</a> •
    <a href="https://www.npmjs.com/package/@kozielgpc/graphql-apollo-auto-mocker">📦 NPM Package</a> •
    <a href="https://github.com/KozielGPC/graphql-apollo-auto-mocker/issues">🐛 Report Bug</a> •
    <a href="https://github.com/KozielGPC/graphql-apollo-auto-mocker/issues">💡 Request Feature</a>
  </p>
</div>
