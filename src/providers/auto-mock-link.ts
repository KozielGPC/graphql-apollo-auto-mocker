import { ApolloLink, Observable, Operation, NextLink, FetchResult } from '@apollo/client';
import { mockOperation } from '../core';
import { MockConfig } from '../core/mock-config';

interface AutoMockLinkOptions {
  schemaSDL: string;
  mockConfig?: MockConfig;
  matcher?: (operation: Operation) => boolean;
}

export function createAutoMockLink({ schemaSDL, mockConfig, matcher }: AutoMockLinkOptions): ApolloLink {
  return new ApolloLink((operation: Operation, forward: NextLink) => {
    const opName = operation.operationName;
    const configEnabled = mockConfig?.enabled !== false;
    const opEnabled = mockConfig?.operations?.[opName]?.enabled !== false;
    const shouldMock = configEnabled && opEnabled && (matcher ? matcher(operation) : true);
    if (shouldMock && opName) {
      // Only mock queries for now
      if (operation.query.definitions.some(def => def.kind === 'OperationDefinition' && def.operation === 'query')) {
        return new Observable<FetchResult>(observer => {
          const data = mockOperation(schemaSDL, 'Query', opName, mockConfig);
          observer.next({ data });
          observer.complete();
        });
      }
    }
    // Fallback to real network
    return forward(operation);
  });
} 