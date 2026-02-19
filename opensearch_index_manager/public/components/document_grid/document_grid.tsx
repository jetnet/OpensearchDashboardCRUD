import React, { useState, useMemo, useCallback } from "react";
import {
  EuiDataGrid,
  EuiDataGridColumn,
  EuiDataGridColumnCellActionProps,
  EuiButtonIcon,
  EuiText,
  EuiEmptyPrompt,
} from "@elastic/eui";
import { Document, JsonValue } from "../../../common/types";

interface DocumentGridProps {
  documents: Document[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onRowExpand?: (document: Document) => void;
}

// Helper to extract column definitions from documents
const extractColumns = (documents: Document[]): EuiDataGridColumn[] => {
  const columnMap = new Map<string, EuiDataGridColumn>();

  // Always include ID column first
  columnMap.set("_id", {
    id: "_id",
    displayAsText: "ID",
    defaultSortDirection: "asc",
    initialWidth: 200,
  });

  // Extract fields from document sources
  documents.forEach((doc) => {
    if (doc._source) {
      Object.keys(doc._source).forEach((key) => {
        if (!columnMap.has(key)) {
          columnMap.set(key, {
            id: key,
            displayAsText: key,
            initialWidth: 150,
          });
        }
      });
    }
  });

  // Add score column if present (from search results)
  if (documents.some((doc) => doc._score !== undefined)) {
    columnMap.set("_score", {
      id: "_score",
      displayAsText: "Score",
      initialWidth: 80,
    });
  }

  // Add actions column
  columnMap.set("_actions", {
    id: "_actions",
    displayAsText: "Actions",
    initialWidth: 100,
    isExpandable: false,
  });

  return Array.from(columnMap.values());
};

// Format cell value for display
const formatCellValue = (value: JsonValue): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

// Truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  total,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Extract columns from documents
  const columns = useMemo(() => extractColumns(documents), [documents]);

  // Initialize visible columns when columns change
  React.useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.id));
    }
  }, [columns, visibleColumns.length]);

  // Create row data with _id as identifier
  const rowData = useMemo(() => {
    return documents.map((doc) => ({
      id: doc._id,
      document: doc,
    }));
  }, [documents]);

  // Render cell content
  const renderCellValue = useCallback(
    ({ rowIndex, columnId }: { rowIndex: number; columnId: string }) => {
      const row = rowData[rowIndex];
      if (!row) return null;

      const doc = row.document;

      if (columnId === "_id") {
        return (
          <EuiText size="s" className="eui-textTruncate">
            {doc._id}
          </EuiText>
        );
      }

      if (columnId === "_score") {
        return (
          <EuiText size="s">
            {doc._score !== undefined ? doc._score.toFixed(2) : "-"}
          </EuiText>
        );
      }

      if (columnId === "_actions") {
        return (
          <EuiText size="s">
            <EuiButtonIcon
              iconType="pencil"
              onClick={() => onEdit(doc)}
              aria-label="Edit document"
              title="Edit"
            />
            <EuiButtonIcon
              iconType="trash"
              color="danger"
              onClick={() => onDelete(doc)}
              aria-label="Delete document"
              title="Delete"
            />
          </EuiText>
        );
      }

      // Regular field from _source
      const value = doc._source?.[columnId];
      const displayValue = truncateText(formatCellValue(value));

      return <EuiText size="s">{displayValue}</EuiText>;
    },
    [rowData, onEdit, onDelete]
  );

  // Define column cell actions
  const getColumnCellActions = useCallback(
    (
      column: EuiDataGridColumn
    ): Array<(props: EuiDataGridColumnCellActionProps) => React.ReactNode> => {
      if (column.id === "_actions") {
        return [];
      }
      return [];
    },
    []

  // Pagination configuration
  );

  const pagination = {
    pageIndex: currentPage,
    pageSize: pageSize,
    pageSizeOptions: [10, 25, 50, 100],
    onChangeItemsPerPage: onPageSizeChange,
    onChangePage: onPageChange,
  };

  // Column visibility configuration
  const columnVisibilityConfig = {
    visibleColumns,
    setVisibleColumns,
  };

  // Sorting configuration
  const sorting = {
    columns: [{ id: "_id", direction: "asc" as const }],
    onSort: () => {},
  };

  if (documents.length === 0 && !isLoading) {
    return (
      <EuiEmptyPrompt
        iconType="documents"
        title={<h2>No documents found</h2>}
        body={<p>Select an index or adjust your search to view documents.</p>}
      />
    );
  }

  return (
    <div data-test-subj="document-grid">
      <EuiDataGrid
        aria-label="Document Grid"
        columns={columns}
        columnVisibility={columnVisibilityConfig}
        rowCount={documents.length}
        renderCellValue={renderCellValue}
        pagination={pagination}
        sorting={sorting}
        inMemory={{ level: "sorting" }}
        gridStyle={{
          border: "all",
          stripes: true,
          header: "shade",
        }}
        width="100%"
        height="auto"
        minSizeForControls={0}
        toolbarVisibility={{
          showColumnSelector: true,
          showDisplaySelector: true,
          showKeyboardShortcuts: false,
          showFullScreenSelector: false,
        }}
      />
    </div>
  );
};