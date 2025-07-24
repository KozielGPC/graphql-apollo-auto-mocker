// Placeholder for type resolver logic
// In the future, this will handle nested types, lists, and recursion
import { ParsedSchema, ParsedType } from './schema-analyzer';

export function resolveType(typeName: string, schema: ParsedSchema): ParsedType | undefined {
  return schema.types[typeName];
} 