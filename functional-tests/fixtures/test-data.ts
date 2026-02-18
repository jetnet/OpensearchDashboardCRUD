/**
 * Test fixtures and sample data for functional tests
 */

import { IndexMapping } from '../utils/api-client';

// ============================================================================
// Sample Documents - Simple Fields
// ============================================================================

export const simpleDocuments = [
  {
    id: 'simple-001',
    title: 'Test Document 1',
    description: 'This is a simple test document with basic fields',
    count: 42,
    price: 19.99,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    category: 'electronics',
  },
  {
    id: 'simple-002',
    title: 'Test Document 2',
    description: 'Another test document with different values',
    count: 100,
    price: 49.50,
    isActive: false,
    createdAt: '2024-02-20T14:45:00Z',
    category: 'books',
  },
  {
    id: 'simple-003',
    title: 'Third Document',
    description: 'Testing special characters: äöü € £ ¥',
    count: 0,
    price: 0.99,
    isActive: true,
    createdAt: '2024-03-10T09:00:00Z',
    category: 'software',
  },
];

export const newSimpleDocument = {
  title: 'New Simple Document',
  description: 'Created during functional tests',
  count: 25,
  price: 29.99,
  isActive: true,
  createdAt: '2024-06-01T12:00:00Z',
  category: 'test',
};

// ============================================================================
// Sample Documents - Nested Objects
// ============================================================================

export const nestedDocuments = [
  {
    id: 'nested-001',
    name: 'John Doe',
    address: {
      street: '123 Main Street',
      city: 'New York',
      country: 'USA',
      zipCode: '10001',
      coordinates: {
        lat: 40.7128,
        lon: -74.0060,
      },
    },
    contact: {
      email: 'john.doe@example.com',
      phone: '+1-555-1234',
    },
  },
  {
    id: 'nested-002',
    name: 'Jane Smith',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      country: 'USA',
      zipCode: '90001',
      coordinates: {
        lat: 34.0522,
        lon: -118.2437,
      },
    },
    contact: {
      email: 'jane.smith@example.com',
      phone: '+1-555-5678',
    },
  },
];

export const newNestedDocument = {
  name: 'Bob Johnson',
  address: {
    street: '789 Pine Road',
    city: 'Chicago',
    country: 'USA',
    zipCode: '60601',
    coordinates: {
      lat: 41.8781,
      lon: -87.6298,
    },
  },
  contact: {
    email: 'bob.johnson@example.com',
    phone: '+1-555-9012',
  },
};

// ============================================================================
// Sample Documents - Arrays and Nested Arrays
// ============================================================================

export const arrayDocuments = [
  {
    id: 'array-001',
    product: 'Laptop Pro',
    tags: ['electronics', 'computers', 'portable'],
    ratings: [5, 4, 5, 4, 5],
    variations: [
      { size: '13-inch', color: 'Silver', price: 1299.99 },
      { size: '15-inch', color: 'Space Gray', price: 1499.99 },
    ],
    reviews: [
      { author: 'Alice', rating: 5, comment: 'Excellent laptop!' },
      { author: 'Bob', rating: 4, comment: 'Great performance but pricey' },
    ],
  },
  {
    id: 'array-002',
    product: 'Wireless Mouse',
    tags: ['electronics', 'accessories'],
    ratings: [4, 4, 3, 5],
    variations: [
      { size: 'Standard', color: 'Black', price: 29.99 },
      { size: 'Ergonomic', color: 'White', price: 39.99 },
    ],
    reviews: [
      { author: 'Charlie', rating: 4, comment: 'Works well' },
    ],
  },
];

export const newArrayDocument = {
  product: 'Mechanical Keyboard',
  tags: ['electronics', 'accessories', 'gaming'],
  ratings: [5, 5, 4, 5],
  variations: [
    { size: 'Full', color: 'Black', price: 149.99 },
    { size: 'TKL', color: 'White', price: 129.99 },
  ],
  reviews: [
    { author: 'Dave', rating: 5, comment: 'Best keyboard ever!' },
    { author: 'Eve', rating: 4, comment: 'Good tactile feel' },
  ],
};

// ============================================================================
// Sample Documents - Deep Nesting (3+ levels)
// ============================================================================

export const deepNestedDocuments = [
  {
    id: 'deep-001',
    company: {
      name: 'TechCorp',
      headquarters: {
        address: {
          building: {
            name: 'Tech Tower',
            floor: 42,
            suite: 'A',
          },
          street: '100 Innovation Way',
          city: 'San Francisco',
        },
        coordinates: {
          lat: 37.7749,
          lon: -122.4194,
        },
      },
    },
  },
];

// ============================================================================
// Sample Documents - Special Characters and Edge Cases
// ============================================================================

export const specialCharacterDocuments = [
  {
    id: 'special-001',
    'field.with.dots': 'value with dots in key',
    'field with spaces': 'value with spaces in key',
    'field-with-dashes': 'value with dashes',
    'field_with_underscores': 'value with underscores',
    'field:with:colons': 'value with colons',
    'unicode-key-äöü': 'Unicode key value',
    emoji: '🚀 Test with emoji',
  },
];

export const edgeCaseDocuments = [
  {
    id: 'edge-001',
    emptyString: '',
    nullValue: null,
    zeroValue: 0,
    falseValue: false,
    emptyArray: [],
    emptyObject: {},
    veryLongString: 'a'.repeat(1000),
    negativeNumber: -999.99,
    largeNumber: 9999999999,
    scientificNotation: 1.5e10,
  },
];

// ============================================================================
// Index Configurations
// ============================================================================

export const simpleIndexMapping: IndexMapping = {
  properties: {
    title: { type: 'text' },
    description: { type: 'text' },
    count: { type: 'integer' },
    price: { type: 'float' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'date' },
    category: { type: 'keyword' },
  },
};

export const nestedIndexMapping: IndexMapping = {
  properties: {
    name: { type: 'text' },
    address: {
      properties: {
        street: { type: 'text' },
        city: { type: 'keyword' },
        country: { type: 'keyword' },
        zipCode: { type: 'keyword' },
        coordinates: {
          properties: {
            lat: { type: 'float' },
            lon: { type: 'float' },
          },
        },
      },
    },
    contact: {
      properties: {
        email: { type: 'keyword' },
        phone: { type: 'keyword' },
      },
    },
  },
};

export const arrayIndexMapping: IndexMapping = {
  properties: {
    product: { type: 'text' },
    tags: { type: 'keyword' },
    ratings: { type: 'integer' },
    variations: {
      type: 'nested',
      properties: {
        size: { type: 'keyword' },
        color: { type: 'keyword' },
        price: { type: 'float' },
      },
    },
    reviews: {
      type: 'nested',
      properties: {
        author: { type: 'text' },
        rating: { type: 'integer' },
        comment: { type: 'text' },
      },
    },
  },
};

export const deepNestedMapping: IndexMapping = {
  properties: {
    company: {
      properties: {
        name: { type: 'text' },
        headquarters: {
          properties: {
            address: {
              properties: {
                building: {
                  properties: {
                    name: { type: 'text' },
                    floor: { type: 'integer' },
                    suite: { type: 'keyword' },
                  },
                },
                street: { type: 'text' },
                city: { type: 'keyword' },
              },
            },
            coordinates: {
              properties: {
                lat: { type: 'float' },
                lon: { type: 'float' },
              },
            },
          },
        },
      },
    },
  },
};

// ============================================================================
// Test Index Names
// ============================================================================

export const testIndices = {
  simple: 'test-simple',
  nested: 'test-nested',
  arrays: 'test-arrays',
  deep: 'test-deep-nested',
  empty: 'test-empty',
  special: 'test-special',
} as const;

// ============================================================================
// Expected Field Types for Mapping Tests
// ============================================================================

export const expectedFieldTypes = {
  'simple': [
    { path: 'title', type: 'text' },
    { path: 'description', type: 'text' },
    { path: 'count', type: 'integer' },
    { path: 'price', type: 'float' },
    { path: 'isActive', type: 'boolean' },
    { path: 'createdAt', type: 'date' },
    { path: 'category', type: 'keyword' },
  ],
  'nested': [
    { path: 'name', type: 'text' },
    { path: 'address.street', type: 'text' },
    { path: 'address.city', type: 'keyword' },
    { path: 'address.coordinates.lat', type: 'float' },
    { path: 'contact.email', type: 'keyword' },
  ],
};

// ============================================================================
// Sample Search Queries
// ============================================================================

export const searchQueries = {
  matchAll: { query: { match_all: {} } },
  matchTitle: { query: { match: { title: 'test' } } },
  termCategory: { query: { term: { category: 'electronics' } } },
  rangeCount: { query: { range: { count: { gte: 10, lte: 50 } } } },
  boolQuery: {
    query: {
      bool: {
        must: [
          { term: { isActive: true } },
          { range: { price: { lt: 100 } } },
        ],
      },
    },
  },
};

// ============================================================================
// Test Scenarios
// ============================================================================

export const testScenarios = {
  pagination: {
    totalDocuments: 25,
    pageSize: 10,
    expectedPages: 3,
  },
  sorting: {
    fields: ['title', 'count', 'price', 'createdAt'],
  },
  validation: {
    requiredField: 'title',
    invalidTypes: {
      stringInNumber: 'not-a-number',
      invalidDate: 'not-a-date',
      invalidBoolean: 'not-a-boolean',
    },
  },
};

export default {
  simpleDocuments,
  newSimpleDocument,
  nestedDocuments,
  newNestedDocument,
  arrayDocuments,
  newArrayDocument,
  deepNestedDocuments,
  specialCharacterDocuments,
  edgeCaseDocuments,
  simpleIndexMapping,
  nestedIndexMapping,
  arrayIndexMapping,
  deepNestedMapping,
  testIndices,
  expectedFieldTypes,
  searchQueries,
  testScenarios,
};