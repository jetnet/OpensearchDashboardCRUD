import React, { useState } from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiCodeBlock,
  EuiTabs,
  EuiTab,
  EuiSpacer,
  EuiTreeView,
  EuiText,
} from '@elastic/eui';
import { IndexMapping, MappingProperty } from '../../../common/types';

interface MappingViewerProps {
  mapping: IndexMapping;
}

export const MappingViewer: React.FC<MappingViewerProps> = ({ mapping }) => {
  const [activeTab, setActiveTab] = useState<string>('tree');

  const indexName = Object.keys(mapping)[0];
  const mappingData = indexName ? mapping[indexName].mappings : null;

  const renderPropertyTree = (properties: Record<string, MappingProperty>, path = ''): any[] => {
    return Object.entries(properties).map(([key, prop]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const hasChildren = prop.properties && Object.keys(prop.properties).length > 0;
      
      return {
        label: (
          <EuiText size="s">
            <strong>{key}</strong>
            <span style={{ marginLeft: '8px', color: '#666' }}>
              {prop.type || 'object'}
            </span>
          </EuiText>
        ),
        id: currentPath,
        children: hasChildren && prop.properties ? renderPropertyTree(prop.properties, currentPath) : undefined,
      };
    });
  };

  const treeItems = mappingData?.properties 
    ? renderPropertyTree(mappingData.properties)
    : [];

  return (
    <EuiPanel>
      <EuiTitle size="xs">
        <h3>Index Mapping: {indexName}</h3>
      </EuiTitle>
      
      <EuiSpacer size="m" />
      
      <EuiTabs>
        <EuiTab 
          isSelected={activeTab === 'tree'} 
          onClick={() => setActiveTab('tree')}
        >
          Tree View
        </EuiTab>
        <EuiTab 
          isSelected={activeTab === 'json'} 
          onClick={() => setActiveTab('json')}
        >
          JSON
        </EuiTab>
      </EuiTabs>
      
      <EuiSpacer size="m" />
      
      {activeTab === 'tree' && (
        treeItems.length > 0 ? (
          <EuiTreeView items={treeItems} aria-label="Mapping tree" />
        ) : (
          <EuiText color="subdued">No properties found</EuiText>
        )
      )}
      
      {activeTab === 'json' && (
        <EuiCodeBlock language="json" isCopyable>
          {JSON.stringify(mapping, null, 2)}
        </EuiCodeBlock>
      )}
    </EuiPanel>
  );
};
