import React from 'react';
import {
  EuiBasicTable,
  EuiButtonIcon,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
} from '@elastic/eui';
import { IEntity } from '../../common/types';

interface EntityListProps {
  entities: IEntity[];
  loading: boolean;
  onEdit: (entity: IEntity) => void;
  onDelete: (id: string) => void;
}

export const EntityList: React.FC<EntityListProps> = ({
  entities,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      field: 'id',
      name: 'ID',
      truncateText: true,
      width: '100px',
    },
    {
      field: 'name',
      name: 'Name',
      sortable: true,
    },
    {
      field: 'description',
      name: 'Description',
    },
    {
      field: 'type',
      name: 'Type',
    },
    {
      field: 'created_at',
      name: 'Created At',
      render: (date: string) => (date ? new Date(date).toLocaleString() : 'N/A'),
    },
    {
      name: 'Actions',
      actions: [
        {
          name: 'Edit',
          description: 'Edit this entity',
          icon: 'pencil',
          type: 'icon',
          onClick: (entity: IEntity) => onEdit(entity),
        },
        {
          name: 'Delete',
          description: 'Delete this entity',
          icon: 'trash',
          color: 'danger',
          type: 'icon',
          onClick: (entity: IEntity) => {
            if (entity.id) onDelete(entity.id);
          },
        },
      ],
    },
  ];

  return (
    <EuiBasicTable
      items={entities}
      columns={columns}
      loading={loading}
      noItemsMessage="No entities found"
    />
  );
};
