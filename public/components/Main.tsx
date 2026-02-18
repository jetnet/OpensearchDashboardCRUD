import React, { useState, useEffect, useCallback } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiTitle,
  EuiButton,
  EuiGlobalToastList,
} from '@elastic/eui';
import { CoreStart } from 'opensearch-dashboards/public';
import { EntityList } from './EntityList';
import { EntityFlyout } from './EntityFlyout';
import { IEntity, IGetEntitiesResponse } from '../../common/types';

interface MainProps {
  coreStart: CoreStart;
}

export const Main: React.FC<MainProps> = ({ coreStart }) => {
  const [entities, setEntities] = useState<IEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<IEntity | undefined>(undefined);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (title: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'success', text?: string) => {
    setToasts([...toasts, {
      id: Math.random().toString(36).substring(7),
      title,
      color,
      text,
    }]);
  };

  const removeToast = (removedToast: any) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await coreStart.http.get<IGetEntitiesResponse>('/api/osd_crud/entities');
      setEntities(response.data);
    } catch (error) {
      addToast('Error fetching entities', 'danger', error.message);
    } finally {
      setLoading(false);
    }
  }, [coreStart.http]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const openCreateFlyout = () => {
    setSelectedEntity(undefined);
    setIsFlyoutOpen(true);
  };

  const openEditFlyout = (entity: IEntity) => {
    setSelectedEntity(entity);
    setIsFlyoutOpen(true);
  };

  const closeFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedEntity(undefined);
  };

  const handleDelete = async (id: string) => {
    try {
      await coreStart.http.delete(`/api/osd_crud/entities/${id}`);
      addToast('Entity deleted successfully');
      fetchEntities();
    } catch (error) {
      addToast('Error deleting entity', 'danger', error.message);
    }
  };

  return (
    <EuiPage>
      <EuiPageBody component="main">
        <EuiPageHeader
          pageTitle="Entity Management"
          rightSideItems={[
            <EuiButton onClick={openCreateFlyout} fill>
              Create Entity
            </EuiButton>,
          ]}
        />
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>Entities</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EntityList
            entities={entities}
            loading={loading}
            onEdit={openEditFlyout}
            onDelete={handleDelete}
          />
        </EuiPageContent>
        {isFlyoutOpen && (
          <EntityFlyout
            entity={selectedEntity}
            onClose={closeFlyout}
            onSuccess={() => {
              closeFlyout();
              fetchEntities();
              addToast(selectedEntity ? 'Entity updated' : 'Entity created');
            }}
            coreStart={coreStart}
            addToast={addToast}
          />
        )}
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={removeToast}
          toastLifeTimeMs={6000}
        />
      </EuiPageBody>
    </EuiPage>
  );
};
