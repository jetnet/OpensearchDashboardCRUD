import React, { useState } from "react";
import {
  EuiPanel,
  EuiTitle,
  EuiCodeBlock,
  EuiTabs,
  EuiTab,
  EuiSpacer,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
} from "@elastic/eui";
import { IndexMapping, MappingProperty } from "../../../common/types";

interface MappingViewerProps {
  mapping: IndexMapping;
}

export const MappingViewer: React.FC<MappingViewerProps> = ({ mapping }) => {
  const [activeTab, setActiveTab] = useState<string>("tree");

  const indexName = Object.keys(mapping)[0];
  const mappingData = indexName ? mapping[indexName].mappings : null;

  const renderPropertyTree = (
    properties: Record<string, MappingProperty>,
    depth = 0
  ): React.ReactNode => {
    return Object.entries(properties).map(([key, prop]) => {
      const hasChildren =
        prop.properties && Object.keys(prop.properties).length > 0;
      const paddingLeft = depth * 20;

      return (
        <div key={key} style={{ marginBottom: "4px" }}>
          <EuiFlexGroup
            gutterSize="s"
            alignItems="center"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <EuiFlexItem grow={false}>
              {hasChildren ? (
                <EuiIcon type="folderClosed" size="s" />
              ) : (
                <EuiIcon type="document" size="s" />
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <strong>{key}</strong>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText size="s" color="subdued">
                {prop.type || "object"}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          {hasChildren && prop.properties && (
            <div style={{ marginTop: "4px" }}>
              {renderPropertyTree(prop.properties, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const treeContent = mappingData?.properties
    ? renderPropertyTree(mappingData.properties)
    : null;

  return (
    <EuiPanel>
      <EuiTitle size="xs">
        <h3>Index Mapping: {indexName}</h3>
      </EuiTitle>

      <EuiSpacer size="m" />

      <EuiTabs>
        <EuiTab
          isSelected={activeTab === "tree"}
          onClick={() => setActiveTab("tree")}
        >
          Tree View
        </EuiTab>
        <EuiTab
          isSelected={activeTab === "json"}
          onClick={() => setActiveTab("json")}
        >
          JSON
        </EuiTab>
      </EuiTabs>

      <EuiSpacer size="m" />

      {activeTab === "tree" &&
        (treeContent ? (
          <div>{treeContent}</div>
        ) : (
          <EuiText color="subdued">No properties found</EuiText>
        ))}

      {activeTab === "json" && (
        <EuiCodeBlock language="json" isCopyable>
          {JSON.stringify(mapping, null, 2)}
        </EuiCodeBlock>
      )}
    </EuiPanel>
  );
};
