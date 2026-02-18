import React from "react";
import { EuiSelect, EuiFormRow } from "@elastic/eui";
import { IndexInfo } from "../../../common/types";

interface IndexSelectorProps {
  indices: IndexInfo[];
  selectedIndex: string;
  onChange: (index: string) => void;
}

export const IndexSelector: React.FC<IndexSelectorProps> = ({
  indices,
  selectedIndex,
  onChange,
}) => {
  const options = [
    { value: "", text: "Select an index" },
    ...indices.map((index) => ({
      value: index.index,
      text: `${index.index} (${index["docs.count"]} docs)`,
    })),
  ];

  return (
    <EuiFormRow label="Index" data-test-subj="indexSelector">
      <EuiSelect
        options={options}
        value={selectedIndex}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select index"
        data-test-subj="indexSelectorSelect"
      />
    </EuiFormRow>
  );
};
