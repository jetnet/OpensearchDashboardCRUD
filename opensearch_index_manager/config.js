"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = void 0;
const config_schema_1 = require("@osd/config-schema");
exports.configSchema = config_schema_1.schema.object({
  enabled: config_schema_1.schema.boolean({ defaultValue: true }),
  maxDocumentsPerPage: config_schema_1.schema.number({
    defaultValue: 1000,
    min: 1,
    max: 10000,
  }),
  defaultDocumentsPerPage: config_schema_1.schema.number({
    defaultValue: 20,
    min: 1,
    max: 100,
  }),
  maxNestedDepth: config_schema_1.schema.number({
    defaultValue: 10,
    min: 1,
    max: 50,
  }),
  enableRawJsonEdit: config_schema_1.schema.boolean({ defaultValue: true }),
  enableDeleteConfirmation: config_schema_1.schema.boolean({
    defaultValue: true,
  }),
});
