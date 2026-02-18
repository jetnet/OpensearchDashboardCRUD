import React, { useState, useEffect } from "react";
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiTitle,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabs,
  EuiTab,
} from "@elastic/eui";
import { Document } from "../../../common/types";
import { JsonEditor } from "./json_editor";
import { FieldEditor } from "./field_editor";
import { flattenObject } from "../../../common/field_utils";

interface DocumentEditorProps {
  document: Document | null;
  isCreating: boolean;
  onSave: (document: Record<string, any>) => void;
  onClose: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  isCreating,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>("fields");
  const [documentData, setDocumentData] = useState<Record<string, any>>({});
  const [flattenedFields, setFlattenedFields] = useState<any[]>([]);

  useEffect(() => {
    const initialData = document?._source || {};
    setDocumentData(initialData);
    setFlattenedFields(flattenObject(initialData));
  }, [document]);

  const handleFieldChange = (path: string, value: any) => {
    const updatedFields = flattenedFields.map((f) =>
      f.path === path ? { ...f, value } : f
    );
    setFlattenedFields(updatedFields);
    // Update document data from flattened fields
    const newData: Record<string, any> = {};
    updatedFields
      .filter((f) => f.depth === 0)
      .forEach((f) => {
        newData[f.key] = f.value;
      });
    setDocumentData(newData);
  };

  const handleJsonChange = (newData: Record<string, any>) => {
    setDocumentData(newData);
    setFlattenedFields(flattenObject(newData));
  };

  const handleSave = () => {
    onSave(documentData);
  };

  const tabs = [
    { id: "fields", name: "Fields" },
    { id: "json", name: "JSON" },
  ];

  return (
    <EuiFlyout ownFocus onClose={onClose} size="m">
      <EuiFlyoutHeader>
        <EuiTitle size="m">
          <h2>
            {isCreating ? "Create Document" : `Edit Document: ${document?._id}`}
          </h2>
        </EuiTitle>
        <EuiTabs>
          {tabs.map((tab) => (
            <EuiTab
              key={tab.id}
              isSelected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </EuiTab>
          ))}
        </EuiTabs>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>
        {activeTab === "fields" && (
          <div>
            {flattenedFields.map((field) => (
              <FieldEditor
                key={field.path}
                field={field}
                onChange={handleFieldChange}
                onDelete={(path) => {
                  setFlattenedFields(
                    flattenedFields.filter((f) => f.path !== path)
                  );
                }}
              />
            ))}
          </div>
        )}
        {activeTab === "json" && (
          <JsonEditor value={documentData} onChange={handleJsonChange} />
        )}
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={handleSave}>
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
