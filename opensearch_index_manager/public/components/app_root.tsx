import React, { useState, useEffect } from "react";
import { CoreStart } from "opensearch-dashboards/public";
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSpacer,
  EuiToast,
} from "@elastic/eui";
import { AppPluginStartDependencies } from "../types";
import { HttpService, IndexService, DocumentService } from "../services";
import { IndexSelector } from "./index_selector";
import { DocumentList } from "./document_list";
import { DocumentEditor } from "./document_editor";
import { MappingViewer } from "./mapping_viewer";
import { Document, IndexInfo } from "../../common/types";

interface AppRootProps {
  core: CoreStart;
  deps: AppPluginStartDependencies;
  history?: any;
}

export const AppRoot: React.FC<AppRootProps> = ({
  core,
  deps: _deps,
  history: _history,
}) => {
  const httpService = new HttpService(core.http);
  const indexService = new IndexService(httpService);
  const documentService = new DocumentService(httpService);

  const [indices, setIndices] = useState<IndexInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; title: string; color: "success" | "danger" }>
  >([]);
  const [mapping, setMapping] = useState<any>(null);
  const [showMapping, setShowMapping] = useState<boolean>(false);

  // Load indices on mount
  useEffect(() => {
    loadIndices();
  }, []);

  // Load documents when index or pagination changes
  useEffect(() => {
    if (selectedIndex) {
      loadDocuments();
      loadMapping();
    }
  }, [selectedIndex, currentPage, pageSize]);

  const loadIndices = async () => {
    try {
      const indicesData = await indexService.getIndices();
      setIndices(indicesData);
    } catch (error) {
      showToast("Error loading indices", "danger");
    }
  };

  const loadDocuments = async () => {
    if (!selectedIndex) return;

    setIsLoading(true);
    try {
      const from = currentPage * pageSize;
      const result = await documentService.getDocuments(selectedIndex, {
        from,
        size: pageSize,
      });
      setDocuments(result.hits);
      setTotalDocuments(
        typeof result.total === "number" ? result.total : result.total.value,
      );
    } catch (error) {
      showToast("Error loading documents", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMapping = async () => {
    if (!selectedIndex) return;

    try {
      const mappingData = await indexService.getMapping(selectedIndex);
      setMapping(mappingData);
    } catch (error) {
      console.error("Error loading mapping:", error);
    }
  };

  const handleIndexChange = (index: string) => {
    setSelectedIndex(index);
    setCurrentPage(0);
  };

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setIsCreating(false);
    setIsEditorOpen(true);
  };

  const handleDeleteDocument = async (document: Document) => {
    if (!selectedIndex) return;

    if (
      window.confirm(
        `Are you sure you want to delete document ${document._id}?`,
      )
    ) {
      try {
        await documentService.deleteDocument(selectedIndex, document._id);
        showToast("Document deleted successfully", "success");
        loadDocuments();
      } catch (error) {
        showToast("Error deleting document", "danger");
      }
    }
  };

  const handleSaveDocument = async (documentData: Record<string, any>) => {
    if (!selectedIndex) return;

    try {
      if (isCreating) {
        await documentService.createDocument(selectedIndex, documentData);
        showToast("Document created successfully", "success");
      } else if (editingDocument) {
        await documentService.updateDocument(
          selectedIndex,
          editingDocument._id,
          documentData,
        );
        showToast("Document updated successfully", "success");
      }
      setIsEditorOpen(false);
      loadDocuments();
    } catch (error) {
      showToast("Error saving document", "danger");
    }
  };

  const showToast = (title: string, color: "success" | "danger") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, color }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <EuiPage data-test-subj="opensearchIndexManager-app">
      <EuiPageBody component="main">
        <EuiPageHeader data-test-subj="opensearchIndexManager-header">
          <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1 data-test-subj="pageTitle">Index Manager</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <IndexSelector
                indices={indices}
                selectedIndex={selectedIndex}
                onChange={handleIndexChange}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageHeader>

        <EuiPageContent data-test-subj="mainContent" paddingSize="l">
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="indexMapping"
                onClick={() => setShowMapping(!showMapping)}
                isDisabled={!selectedIndex}
              >
                {showMapping ? "Hide Mapping" : "Show Mapping"}
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                iconType="plus"
                onClick={handleCreateDocument}
                isDisabled={!selectedIndex}
              >
                Create Document
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="m" />

          {showMapping && mapping && (
            <>
              <MappingViewer mapping={mapping} />
              <EuiSpacer size="m" />
            </>
          )}

          <DocumentList
            documents={documents}
            total={totalDocuments}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
          />
        </EuiPageContent>

        {isEditorOpen && (
          <DocumentEditor
            document={editingDocument}
            isCreating={isCreating}
            onSave={handleSaveDocument}
            onClose={() => setIsEditorOpen(false)}
          />
        )}

        {/* Toasts */}
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
          {toasts.map((toast) => (
            <EuiToast
              key={toast.id}
              title={toast.title}
              color={toast.color}
              onClose={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            />
          ))}
        </div>
      </EuiPageBody>
    </EuiPage>
  );
};
