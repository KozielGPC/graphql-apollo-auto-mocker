// Schema analyzer for core mocking logic
import { buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLFieldMap, GraphQLField, isObjectType } from 'graphql';

export interface ParsedField {
  name: string;
  type: string;
}

export interface ParsedType {
  name: string;
  fields: ParsedField[];
}

export interface ParsedSchema {
  types: Record<string, ParsedType>;
}

export function analyzeSchema(schemaSDL: string): ParsedSchema {
  const schema: GraphQLSchema = buildSchema(schemaSDL);
  const typeMap = schema.getTypeMap();
  const types: Record<string, ParsedType> = {};

  Object.values(typeMap).forEach((maybeType: any) => {
    if (isObjectType(maybeType) && !maybeType.name.startsWith('__')) {
      const type = maybeType as GraphQLObjectType;
      const fields: GraphQLFieldMap<any, any> = type.getFields();
      types[type.name] = {
        name: type.name,
        fields: Object.values(fields).map((field: GraphQLField<any, any>) => ({
          name: field.name,
          type: field.type.toString(),
        })),
      };
    }
  });

  return { types };
} 