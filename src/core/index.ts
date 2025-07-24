import { analyzeSchema, ParsedSchema, ParsedType } from './schema-analyzer';
import { resolveType } from './type-resolver';
import { generateMockData } from './data-generator';
import { MockConfig } from './mock-config';

/**
 * Generate mock data for a given operation in a GraphQL schema.
 * @param schemaSDL - The GraphQL schema as SDL string
 * @param operationType - 'Query' | 'Mutation' | 'Subscription'
 * @param operationName - The name of the operation (e.g., 'getPortfolio')
 * @param config - Optional MockConfig for fine-grained control
 * @returns Mock data for the operation's return type
 */
export function mockOperation(
  schemaSDL: string,
  operationType: 'Query' | 'Mutation' | 'Subscription',
  operationName: string,
  config?: MockConfig
): any {
  // 1. Analyze the schema
  const schema: ParsedSchema = analyzeSchema(schemaSDL);

  // 2. Resolve the operation type (e.g., Query)
  const opType = resolveType(operationType, schema);
  if (!opType) throw new Error(`Operation type ${operationType} not found`);

  // 3. Find the field for the operation
  const opField = opType.fields.find(f => f.name === operationName);
  if (!opField) throw new Error(`Operation ${operationName} not found in ${operationType}`);

  // The return type may be wrapped (e.g., Portfolio, [Portfolio], Portfolio!, etc.)
  // For MVP, strip wrappers (e.g., [Type], Type!, etc.)
  const returnTypeName = opField.type.replace(/[[\]!]/g, '');
  const returnType = resolveType(returnTypeName, schema);
  if (!returnType) throw new Error(`Return type ${opField.type} not found`);

  // 4. Generate mock data for the return type
  const isList = opField.type.trim().startsWith('[');
  if (isList) {
    // Return an array of 5 mock items
    return Array.from({ length: 5 }, () => generateMockData(returnType, config));
  } else {
    return generateMockData(returnType, config);
  }
} 