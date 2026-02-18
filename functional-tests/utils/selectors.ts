/**
 * Centralized CSS/XPath selectors for plugin UI elements
 * These selectors are used across all test files for consistency
 */

export const Selectors = {
  // Navigation and Plugin
  plugin: {
    navLink: '[data-test-subj="navItem opensearchIndexManager"], a[href*="opensearchIndexManager"]',
    appContainer: '[data-test-subj="opensearchIndexManager-app"]',
    pageTitle: '[data-test-subj="pageTitle"]',
    heading: 'h1',
    loadingIndicator: '[data-test-subj="loadingSpinner"], .euiLoadingSpinner',
    errorMessage: '[data-test-subj="errorMessage"], .euiCallOut--danger',
  },

  // Index Selector Component
  indexSelector: {
    container: '[data-test-subj="indexSelector"]',
    dropdown: '[data-test-subj="indexSelectorDropdown"], select[data-test-subj*="index"]',
    dropdownButton: '[data-test-subj="indexSelectorDropdown"] button, [data-test-subj*="comboBoxToggleListButton"]',
    searchInput: '[data-test-subj="indexSelectorSearch"], input[data-test-subj*="comboBoxSearchInput"]',
    option: '[data-test-subj^="indexSelectorOption"], .euiComboBoxOptionsList__rowWrap',
    optionText: '.euiComboBoxOption__content',
    selectedValue: '[data-test-subj="indexSelectorValue"], .euiComboBoxPill',
    refreshButton: '[data-test-subj="refreshIndicesButton"], button[aria-label*="refresh"]',
    noIndicesMessage: '[data-test-subj="noIndicesMessage"], .euiEmptyPrompt',
    clearButton: '[data-test-subj="comboBoxClearButton"]',
  },

  // Document List Component
  documentList: {
    container: '[data-test-subj="documentList"]',
    table: '[data-test-subj="documentListTable"], table',
    tableRow: '[data-test-subj^="documentRow"], tbody tr',
    tableHeader: 'thead th, [data-test-subj="tableHeaderCell"]',
    documentId: '[data-test-subj="documentId"]',
    documentSource: '[data-test-subj="documentSource"]',
    editButton: '[data-test-subj="editDocumentButton"], button[aria-label*="edit"]',
    deleteButton: '[data-test-subj="deleteDocumentButton"], button[aria-label*="delete"]',
    viewButton: '[data-test-subj="viewDocumentButton"], button[aria-label*="view"]',
    emptyState: '[data-test-subj="emptyDocumentList"], .euiEmptyPrompt',
    loadingState: '[data-test-subj="loadingDocuments"], .euiLoadingContent',
    errorState: '[data-test-subj="documentListError"]',
  },

  // Pagination
  pagination: {
    container: '[data-test-subj="pagination"], .euiPagination',
    previousButton: '[data-test-subj="paginationButtonPrevious"], button[aria-label*="previous"]',
    nextButton: '[data-test-subj="paginationButtonNext"], button[aria-label*="next"]',
    pageButton: '[data-test-subj^="pagination-button"], .euiPagination__button',
    pageSizeSelector: '[data-test-subj="tablePaginationPopoverButton"], select[data-test-subj*="pageSize"]',
    pageSizeOption: '[data-test-subj^="tablePagination-"], .euiContextMenuItem',
  },

  // Search and Filter
  search: {
    searchBox: '[data-test-subj="documentSearchBox"], input[data-test-subj*="search"]',
    searchButton: '[data-test-subj="searchButton"], button[aria-label*="search"]',
    clearSearchButton: '[data-test-subj="clearSearch"], button[aria-label*="clear"]',
    filterDropdown: '[data-test-subj="filterDropdown"]',
    filterField: '[data-test-subj="filterField"]',
    filterValue: '[data-test-subj="filterValue"]',
    applyFilterButton: '[data-test-subj="applyFilter"]',
    removeFilterButton: '[data-test-subj="removeFilter"], button[aria-label*="remove"]',
    activeFilters: '[data-test-subj="activeFilters"]',
  },

  // Document Editor Component
  documentEditor: {
    container: '[data-test-subj="documentEditor"]',
    modal: '[data-test-subj="documentEditorModal"], .euiModal',
    form: '[data-test-subj="documentForm"]',
    idField: '[data-test-subj="documentIdField"]',
    idInput: 'input[data-test-subj="documentIdInput"], input[name="id"]',
    
    // Field Editor
    fieldContainer: '[data-test-subj="fieldEditor"]',
    fieldLabel: '[data-test-subj="fieldLabel"]',
    fieldInput: '[data-test-subj="fieldInput"], input[data-test-subj*="field"]',
    fieldTextArea: '[data-test-subj="fieldTextArea"], textarea',
    fieldSelect: '[data-test-subj="fieldSelect"], select',
    fieldCheckbox: '[data-test-subj="fieldCheckbox"], input[type="checkbox"]',
    fieldDatePicker: '[data-test-subj="fieldDatePicker"]',
    
    // Nested Fields
    nestedObject: '[data-test-subj="nestedObject"]',
    nestedField: '[data-test-subj="nestedField"]',
    nestedToggle: '[data-test-subj="nestedToggle"], button[aria-label*="toggle"]',
    nestedAddButton: '[data-test-subj="addNestedField"], button[aria-label*="add"]',
    nestedRemoveButton: '[data-test-subj="removeNestedField"], button[aria-label*="remove"]',
    nestedLevel: (level: number) => `[data-test-subj="nestedLevel-${level}"]`,
    
    // Arrays
    arrayContainer: '[data-test-subj="arrayField"]',
    arrayItem: '[data-test-subj="arrayItem"]',
    arrayAddButton: '[data-test-subj="addArrayItem"], button[aria-label*="add item"]',
    arrayRemoveButton: '[data-test-subj="removeArrayItem"], button[aria-label*="remove item"]',
    arrayMoveUpButton: '[data-test-subj="moveArrayItemUp"]',
    arrayMoveDownButton: '[data-test-subj="moveArrayItemDown"]',
    
    // JSON Editor
    jsonEditor: '[data-test-subj="jsonEditor"]',
    jsonEditorTextArea: '[data-test-subj="jsonEditorTextArea"], textarea',
    jsonEditorModeButton: '[data-test-subj="jsonEditorMode"]',
    formEditorModeButton: '[data-test-subj="formEditorMode"]',
    
    // Actions
    saveButton: '[data-test-subj="saveDocumentButton"], button[type="submit"]',
    cancelButton: '[data-test-subj="cancelButton"], button[aria-label*="cancel"]',
    deleteButton: '[data-test-subj="deleteDocumentButton"]',
    createButton: '[data-test-subj="createDocumentButton"], button[aria-label*="create"]',
    
    // Validation
    validationError: '[data-test-subj="validationError"], .euiFormErrorText',
    requiredFieldIndicator: '.euiFormRow__label [data-test-subj="required"]',
  },

  // Mapping Viewer Component
  mappingViewer: {
    container: '[data-test-subj="mappingViewer"]',
    treeView: '[data-test-subj="mappingTreeView"]',
    jsonView: '[data-test-subj="mappingJsonView"]',
    treeToggle: '[data-test-subj="treeToggle"], button[aria-label*="toggle"]',
    fieldNode: '[data-test-subj="mappingFieldNode"]',
    fieldName: '[data-test-subj="fieldName"]',
    fieldType: '[data-test-subj="fieldType"]',
    fieldTypeIndicator: '[data-test-subj="fieldTypeIndicator"]',
    typeText: '[data-type="text"]',
    typeKeyword: '[data-type="keyword"]',
    typeInteger: '[data-type="integer"]',
    typeLong: '[data-type="long"]',
    typeFloat: '[data-type="float"]',
    typeDouble: '[data-type="double"]',
    typeBoolean: '[data-type="boolean"]',
    typeDate: '[data-type="date"]',
    typeObject: '[data-type="object"]',
    typeNested: '[data-type="nested"]',
    expandButton: '[data-test-subj="expandMappingField"], button[aria-label*="expand"]',
    collapseButton: '[data-test-subj="collapseMappingField"], button[aria-label*="collapse"]',
    jsonContent: '[data-test-subj="mappingJsonContent"] pre, code',
  },

  // OSD Common Components
  osd: {
    // Login
    loginForm: '[data-test-subj="loginForm"]',
    usernameInput: 'input[name="username"], input[data-test-subj="user-name"]',
    passwordInput: 'input[name="password"], input[data-test-subj="password"]',
    loginButton: 'button[type="submit"], button[data-test-subj="login-button"]',
    
    // Common UI
    toastSuccess: '.euiToast--success, [data-test-subj="toast-success"]',
    toastError: '.euiToast--danger, [data-test-subj="toast-danger"]',
    toastWarning: '.euiToast--warning, [data-test-subj="toast-warning"]',
    toastInfo: '.euiToast--info, [data-test-subj="toast-info"]',
    toastCloseButton: '.euiToast__closeButton',
    confirmModal: '.euiConfirmModal, [data-test-subj="confirmModal"]',
    confirmButton: '[data-test-subj="confirmModalConfirmButton"], button:has-text("Confirm")',
    cancelModalButton: '[data-test-subj="confirmModalCancelButton"], button:has-text("Cancel")',
    popover: '.euiPopover__panel',
    comboBoxOptions: '.euiComboBoxOptionsList',
    loadingSpinner: '.euiLoadingSpinner',
    progressBar: '.euiProgress',
  },

  // Sidebar and Layout
  layout: {
    sidebar: '[data-test-subj="indexManagerSidebar"]',
    mainContent: '[data-test-subj="mainContent"]',
    header: '[data-test-subj="header"]',
    breadcrumbs: '[data-test-subj="breadcrumbs"]',
    tab: '[data-test-subj="tab"], [role="tab"]',
    activeTab: '[aria-selected="true"], .euiTab-isSelected',
  },

  // Create Document Button
  createDocument: {
    button: '[data-test-subj="createDocumentButton"], button:has-text("Create")',
    dropdown: '[data-test-subj="createDocumentDropdown"]',
    fromFormOption: '[data-test-subj="createFromForm"]',
    fromJsonOption: '[data-test-subj="createFromJson"]',
  },

  // Document Count
  documentCount: {
    badge: '[data-test-subj="documentCountBadge"]',
    totalText: '[data-test-subj="totalDocuments"], span:has-text("documents")',
    showingText: '[data-test-subj="showingDocuments"]',
  },

  // Sorting
  sorting: {
    sortButton: '[data-test-subj="sortButton"], button[data-test-subj*="sort"]',
    sortDropdown: '[data-test-subj="sortDropdown"]',
    sortField: '[data-test-subj="sortField"]',
    sortOrder: '[data-test-subj="sortOrder"]',
    sortAscending: '[data-test-subj="sortAscending"]',
    sortDescending: '[data-test-subj="sortDescending"]',
    sortableHeader: 'th[data-test-subj*="tableHeaderSort"]',
  },
} as const;

/**
 * XPath selectors for complex scenarios
 */
export const XPathSelectors = {
  // Dynamic content
  containsText: (text: string) => `//*[contains(text(), "${text}")]`,
  exactText: (text: string) => `//*[text()="${text}"]`,
  
  // Table cells
  tableCellByContent: (content: string) => `//td[contains(text(), "${content}")]`,
  
  // Buttons by text
  buttonByText: (text: string) => `//button[contains(text(), "${text}")]`,
  
  // Form elements by label
  inputByLabel: (label: string) => `//label[contains(text(), "${label}")]/following-sibling::input | //label[contains(text(), "${label}")]//input`,
  
  // Nested elements
  nestedFieldByPath: (path: string) => `//*[@data-field-path="${path}"]`,
} as const;

/**
 * Helper to get data-test-subj selector
 */
export function testSubj(selector: string): string {
  return `[data-test-subj="${selector}"]`;
}

/**
 * Helper to get data-test-subj that starts with value
 */
export function testSubjStartsWith(prefix: string): string {
  return `[data-test-subj^="${prefix}"]`;
}

/**
 * Helper to get data-test-subj that contains value
 */
export function testSubjContains(text: string): string {
  return `[data-test-subj*="${text}"]`;
}