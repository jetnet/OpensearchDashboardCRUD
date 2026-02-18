import React, { useState, useMemo } from "react";
import {
  EuiPanel,
  EuiSpacer,
  EuiCodeBlock,
  EuiTextArea,
  EuiTextColor,
} from "@elastic/eui";
import { JsonValue } from "../../../common/types";

interface JsonEditorProps {
  value: Record<string, JsonValue>;
  onChange: (value: Record<string, JsonValue>) => void;
  readOnly?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const [jsonText, setJsonText] = useState<string>(() =>
    JSON.stringify(value, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);

  // Update text when value changes externally
  useMemo(() => {
    setJsonText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);

    try {
      const parsed = JSON.parse(newText);
      setParseError(null);
      onChange(parsed);
    } catch (err) {
      setParseError("Invalid JSON");
    }
  };

  return (
    <EuiPanel>
      {parseError && (
        <>
          <EuiTextColor color="danger">{parseError}</EuiTextColor>
          <EuiSpacer size="s" />
        </>
      )}

      {readOnly ? (
        <EuiCodeBlock language="json" isCopyable>
          {jsonText}
        </EuiCodeBlock>
      ) : (
        <EuiTextArea
          value={jsonText}
          onChange={handleTextChange}
          fullWidth
          rows={20}
          isInvalid={!!parseError}
        />
      )}
    </EuiPanel>
  );
};
