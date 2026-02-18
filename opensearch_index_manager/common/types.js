"use strict";
// ============================================================
// API Response Types
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldType = void 0;
// ============================================================
// Field Types
// ============================================================
var FieldType;
(function (FieldType) {
    FieldType["STRING"] = "string";
    FieldType["NUMBER"] = "number";
    FieldType["BOOLEAN"] = "boolean";
    FieldType["NULL"] = "null";
    FieldType["ARRAY"] = "array";
    FieldType["OBJECT"] = "object";
    FieldType["DATE"] = "date";
    FieldType["GEO_POINT"] = "geo_point";
    FieldType["IP"] = "ip";
    FieldType["KEYWORD"] = "keyword";
    FieldType["TEXT"] = "text";
    FieldType["INTEGER"] = "integer";
    FieldType["LONG"] = "long";
    FieldType["FLOAT"] = "float";
    FieldType["DOUBLE"] = "double";
    FieldType["NESTED"] = "nested";
})(FieldType || (exports.FieldType = FieldType = {}));
