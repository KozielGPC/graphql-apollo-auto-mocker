import { ApolloClient, InMemoryCache, HttpLink, ApolloCache, NormalizedCacheObject } from '@apollo/client';
import { createAutoMockLink } from './auto-mock-link';
import { MockConfig } from '../core/mock-config';

/**
 * Create an ApolloClient that uses auto-mocking for queries (when enabled) and falls back to the real server otherwise.
 * @param options.schemaSDL - GraphQL schema SDL string
 * @param options.mockConfig - MockConfig for fine-grained mocking control
 * @param options.uri - URI of the real GraphQL server
 * @param options.cacheOptions - Optional cache instance or options
 */
export function createAutoMockApolloClient({
  schemaSDL,
  mockConfig,
  uri,
  cacheOptions,
}: {
  schemaSDL: string;
  mockConfig?: MockConfig;
  uri: string;
  cacheOptions?: ApolloCache<NormalizedCacheObject> | object;
}) {
  const mockLink = createAutoMockLink({ schemaSDL, mockConfig });
  const httpLink = new HttpLink({ uri });
  const cache = cacheOptions instanceof InMemoryCache || cacheOptions instanceof ApolloCache
    ? cacheOptions
    : new InMemoryCache(cacheOptions);
  return new ApolloClient({
    link: mockLink.concat(httpLink),
    cache,
  });
} 