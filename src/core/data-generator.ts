import { faker } from '@faker-js/faker';
import { ParsedType } from './schema-analyzer';
import { MockConfig, MockFieldConfig } from './mock-config';

function getFieldConfig(typeName: string, fieldName: string, config?: MockConfig): MockFieldConfig | undefined {
  return config?.types?.[typeName]?.fields?.[fieldName];
}

function fakeValue(fieldName: string, fieldType: string, fieldConfig?: MockFieldConfig): any {
  // Heuristics based on field name
  const lower = fieldName.toLowerCase();
  if (fieldConfig?.value !== undefined) {
    return typeof fieldConfig.value === 'function' ? fieldConfig.value() : fieldConfig.value;
  }
  if (lower.includes('email')) return faker.internet.email();
  if (lower.includes('name')) return faker.person.fullName();
  if (lower.includes('date')) {
    const min = fieldConfig?.minDate ? new Date(fieldConfig.minDate) : faker.date.past();
    const max = fieldConfig?.maxDate ? new Date(fieldConfig.maxDate) : faker.date.future();
    return faker.date.between({ from: min, to: max }).toISOString();
  }
  if (lower.includes('phone')) return faker.phone.number();
  if (lower.includes('id')) return faker.string.uuid();
  if (lower.includes('amount') || lower.includes('value') || lower.includes('price')) {
    const min = fieldConfig?.min ?? 0;
    const max = fieldConfig?.max ?? 10000;
    return faker.number.float({ min, max });
  }
  // Scalar types
  switch (fieldType) {
    case 'String': return faker.lorem.words();
    case 'Int': return faker.number.int({ min: fieldConfig?.min ?? 0, max: fieldConfig?.max ?? 100 });
    case 'Float': return faker.number.float({ min: fieldConfig?.min ?? 0, max: fieldConfig?.max ?? 100 });
    case 'Boolean': return faker.datatype.boolean();
    case 'ID': return faker.string.uuid();
    default: return null;
  }
}

/**
 * Generate mock data for a given type, using optional config for overrides and constraints.
 */
export function generateMockData(type: ParsedType, config?: MockConfig): any {
  const obj: any = {};
  for (const field of type.fields) {
    const fieldConfig = getFieldConfig(type.name, field.name, config);
    // Array support (simple heuristic: if fieldType ends with [])
    if (field.type.endsWith('[]')) {
      const baseType = field.type.replace(/\[\]$/, '');
      const min = fieldConfig?.arrayMin ?? 1;
      const max = fieldConfig?.arrayMax ?? 3;
      const len = faker.number.int({ min, max });
      obj[field.name] = Array.from({ length: len }, () => fakeValue(field.name, baseType, fieldConfig));
    } else {
      obj[field.name] = fakeValue(field.name, field.type, fieldConfig);
    }
  }
  return obj;
} 