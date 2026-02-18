import React from 'react';
import {
  EuiBasicTable,
  EuiText,
} from '@elastic/eui';
import { Document } from '../../../common/types';

interface DocumentListProps {
  documents: Document[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
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
  const columns = [
    {
      field: '_id',
      name: 'ID',
      sortable: true,
      truncateText: true,
      width: '200px',
    },
    {
      field: '_source',
      name: 'Content',
      render: (source: any) => {
        const preview = JSON.stringify(source).slice(0, 100) + '...';
        return <EuiText size="s">{preview}</EuiText>;
      },
    },
    {
      field: '_score',
      name: 'Score',
      sortable: true,
      width: '100px',
      render: (score: number | null) => score?.toFixed(2) || '-',
    },
    {
      name: 'Actions',
      width: '120px',
      actions: [
        {
          name: 'Edit',
          description: 'Edit document',
          icon: 'pencil',
          type: 'icon',
          onClick: (doc: Document) => onEdit(doc),
        },
        {
          name: 'Delete',
          description: 'Delete document',
          icon: 'trash',
          type: 'icon',
          color: 'danger',
          onClick: (doc: Document) => onDelete(doc),
        },
      ],
    },
  ];

  const pagination = {
    pageIndex: currentPage,
    pageSize: pageSize,
    totalItemCount: total,
    pageSizeOptions: [10, 20, 50, 100],
  };

  const sorting = {
    sort: {
      field: '_id' as const,
      direction: 'asc' as const,
    },
  };

  return (
    <EuiBasicTable
      items={documents}
      columns={columns}
      loading={isLoading}
      pagination={pagination}
      sorting={sorting}
      onChange={({ page }: any) => {
        if (page) {
          onPageChange(page.index);
          onPageSizeChange(page.size);
        }
      }}
      noItemsMessage="No documents found"
    />
  );
};
