import { schema, TypeOf } from '@osd/config-schema';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  maxDocumentsPerPage: schema.number({ defaultValue: 1000, min: 1, max: 10000 }),
  defaultDocumentsPerPage: schema.number({ defaultValue: 20, min: 1, max: 100 }),
  maxNestedDepth: schema.number({ defaultValue: 10, min: 1, max: 50 }),
  enableRawJsonEdit: schema.boolean({ defaultValue: true }),
  enableDeleteConfirmation: schema.boolean({ defaultValue: true }),
});

export type ConfigType = TypeOf<typeof configSchema>;
