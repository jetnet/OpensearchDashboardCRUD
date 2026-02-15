// Type stubs for @opensearch-project/oui
// These are minimal stubs to allow compilation

declare module '@opensearch-project/oui' {
  import { ComponentType, ReactNode, ReactElement, HTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes, SelectHTMLAttributes } from 'react';
  
  // Button
  export interface OuiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    fill?: boolean;
    size?: 's' | 'm' | 'l';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' | 'accent';
    iconType?: string;
    iconSide?: 'left' | 'right';
    isLoading?: boolean;
    isDisabled?: boolean;
    href?: string;
    target?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  }
  export const OuiButton: ComponentType<OuiButtonProps>;
  
  // Button Group
  export interface OuiButtonGroupProps {
    options: Array<{ id: string; label: string; isDisabled?: boolean }>;
    idSelected?: string;
    onChange?: (id: string) => void;
    type?: 'single' | 'multi';
    isFullWidth?: boolean;
    buttonSize?: 's' | 'm' | 'l';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' | 'accent';
  }
  export const OuiButtonGroup: ComponentType<OuiButtonGroupProps>;
  
  // Form Controls
  export interface OuiFieldTextProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    isLoading?: boolean;
    isInvalid?: boolean;
    prepend?: ReactNode;
    append?: ReactNode;
    control?: ReactNode;
  }
  export const OuiFieldText: ComponentType<OuiFieldTextProps>;
  
  export interface OuiFieldSearchProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    isLoading?: boolean;
    isInvalid?: boolean;
    onSearch?: (value: string) => void;
  }
  export const OuiFieldSearch: ComponentType<OuiFieldSearchProps>;
  
  export interface OuiSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: Array<{ value: string; text: string; disabled?: boolean }>;
    fullWidth?: boolean;
    isLoading?: boolean;
    isInvalid?: boolean;
    hasNoInitialSelection?: boolean;
    prepend?: ReactNode;
    append?: ReactNode;
  }
  export const OuiSelect: ComponentType<OuiSelectProps>;
  
  export interface OuiTextAreaProps extends HTMLAttributes<HTMLTextAreaElement> {
    fullWidth?: boolean;
    isLoading?: boolean;
    isInvalid?: boolean;
    resize?: 'vertical' | 'horizontal' | 'both' | 'none';
  }
  export const OuiTextArea: ComponentType<OuiTextAreaProps>;
  
  export interface OuiSwitchProps {
    label: ReactNode;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    showLabel?: boolean;
    compressed?: boolean;
  }
  export const OuiSwitch: ComponentType<OuiSwitchProps>;
  
  export interface OuiCheckboxProps {
    id?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: ReactNode;
    disabled?: boolean;
    indeterminate?: boolean;
  }
  export const OuiCheckbox: ComponentType<OuiCheckboxProps>;
  
  // Form Row
  export interface OuiFormRowProps {
    label?: ReactNode;
    helpText?: ReactNode;
    error?: ReactNode | string[];
    isInvalid?: boolean;
    fullWidth?: boolean;
    children: ReactNode;
  }
  export const OuiFormRow: ComponentType<OuiFormRowProps>;
  
  // Form
  export const OuiForm: ComponentType<{ children: ReactNode; isInvalid?: boolean; error?: ReactNode }>;
  
  // Layout
  export interface OuiPageProps {
    children: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    restrictWidth?: boolean | number | string;
  }
  export const OuiPage: ComponentType<OuiPageProps>;
  
  export interface OuiPageContentProps {
    children: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    panelPaddingSize?: 'none' | 's' | 'm' | 'l';
    verticalPosition?: 'top' | 'center' | 'bottom';
    horizontalPosition?: 'left' | 'center' | 'right';
    hasShadow?: boolean;
    borderRadius?: 'none' | 'm';
  }
  export const OuiPageContent: ComponentType<OuiPageContentProps>;
  
  export interface OuiPageContentHeaderProps {
    children: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    alignItems?: 'center' | 'flex-start' | 'flex-end';
  }
  export const OuiPageContentHeader: ComponentType<OuiPageContentHeaderProps>;
  
  export interface OuiPageContentBodyProps {
    children: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    restrictWidth?: boolean | number | string;
  }
  export const OuiPageContentBody: ComponentType<OuiPageContentBodyProps>;
  
  export interface OuiPageHeaderProps {
    children?: ReactNode;
    pageTitle: ReactNode;
    pageTitleProps?: any;
    rightSideItems?: ReactNode[];
    description?: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    bottomBorder?: boolean;
  }
  export const OuiPageHeader: ComponentType<OuiPageHeaderProps>;
  
  export interface OuiFlexGroupProps {
    children: ReactNode;
    gutterSize?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';
    alignItems?: 'center' | 'flexStart' | 'flexEnd' | 'stretch' | 'baseline';
    justifyContent?: 'center' | 'flexStart' | 'flexEnd' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
    direction?: 'row' | 'column' | 'rowReverse' | 'columnReverse';
    wrap?: boolean;
    responsive?: boolean;
    className?: string;
  }
  export const OuiFlexGroup: ComponentType<OuiFlexGroupProps>;
  
  export interface OuiFlexItemProps {
    children?: ReactNode;
    grow?: boolean | number | number[];
    style?: any;
    className?: string;
  }
  export const OuiFlexItem: ComponentType<OuiFlexItemProps>;
  
  export interface OuiSpacerProps {
    size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
  }
  export const OuiSpacer: ComponentType<OuiSpacerProps>;
  
  export interface OuiPanelProps {
    children?: ReactNode;
    paddingSize?: 'none' | 's' | 'm' | 'l';
    hasShadow?: boolean;
    hasBorder?: boolean;
    borderRadius?: 'none' | 'm';
    grow?: boolean;
    className?: string;
  }
  export const OuiPanel: ComponentType<OuiPanelProps>;
  
  // Typography
  export interface OuiTitleProps {
    children: ReactNode;
    size?: 'xs' | 's' | 'm' | 'l';
    className?: string;
  }
  export const OuiTitle: ComponentType<OuiTitleProps>;
  
  export interface OuiTextProps {
    children: ReactNode;
    size?: 'xs' | 's' | 'm' | 'relative';
    color?: 'default' | 'subdued' | 'secondary' | 'success' | 'accent' | 'warning' | 'danger';
    grow?: boolean;
    textAlign?: 'left' | 'right' | 'center';
    className?: string;
  }
  export const OuiText: ComponentType<OuiTextProps>;
  
  // Table
  export interface OuiTableProps {
    children: ReactNode;
    className?: string;
  }
  export const OuiTable: ComponentType<OuiTableProps>;
  
  export interface OuiTableHeaderProps {
    children: ReactNode;
  }
  export const OuiTableHeader: ComponentType<OuiTableHeaderProps>;
  
  export interface OuiTableHeaderCellProps {
    children?: ReactNode;
    width?: string | number;
    align?: 'left' | 'right' | 'center';
    onSort?: () => void;
    isSorted?: boolean;
    isSortAscending?: boolean;
    allowNeutralSort?: boolean;
  }
  export const OuiTableHeaderCell: ComponentType<OuiTableHeaderCellProps>;
  
  export interface OuiTableBodyProps {
    children: ReactNode;
  }
  export const OuiTableBody: ComponentType<OuiTableBodyProps>;
  
  export interface OuiTableRowProps {
    children: ReactNode;
    hasActions?: boolean;
    isSelectable?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
  }
  export const OuiTableRow: ComponentType<OuiTableRowProps>;
  
  export interface OuiTableRowCellProps {
    children?: ReactNode;
    header?: ReactNode;
    align?: 'left' | 'right' | 'center';
    truncateText?: boolean;
    showOnHover?: boolean;
    textOnly?: boolean;
  }
  export const OuiTableRowCell: ComponentType<OuiTableRowCellProps>;
  
  export interface OuiTableFooterProps {
    children: ReactNode;
  }
  export const OuiTableFooter: ComponentType<OuiTableFooterProps>;
  
  export interface OuiTableFooterCellProps {
    children?: ReactNode;
    align?: 'left' | 'right' | 'center';
  }
  export const OuiTableFooterCell: ComponentType<OuiTableFooterCellProps>;
  
  // Pagination
  export interface OuiPaginationProps {
    activePage?: number;
    pageCount: number;
    onPageClick?: (page: number) => void;
    compressed?: boolean;
    showPerPageOptions?: boolean;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    onChangeItemsPerPage?: (count: number) => void;
  }
  export const OuiPagination: ComponentType<OuiPaginationProps>;
  
  export interface OuiTablePaginationProps {
    activePage?: number;
    pageCount: number;
    onPageClick?: (page: number) => void;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    onChangeItemsPerPage?: (count: number) => void;
    showPerPageOptions?: boolean;
  }
  export const OuiTablePagination: ComponentType<OuiTablePaginationProps>;
  
  // Modal
  export interface OuiModalProps {
    children: ReactNode;
    onClose: () => void;
    initialFocus?: number;
    maxWidth?: number | boolean;
  }
  export const OuiModal: ComponentType<OuiModalProps>;
  
  export interface OuiModalHeaderProps {
    children: ReactNode;
  }
  export const OuiModalHeader: ComponentType<OuiModalHeaderProps>;
  
  export interface OuiModalHeaderTitleProps {
    children: ReactNode;
  }
  export const OuiModalHeaderTitle: ComponentType<OuiModalHeaderTitleProps>;
  
  export interface OuiModalBodyProps {
    children: ReactNode;
  }
  export const OuiModalBody: ComponentType<OuiModalBodyProps>;
  
  export interface OuiModalFooterProps {
    children: ReactNode;
  }
  export const OuiModalFooter: ComponentType<OuiModalFooterProps>;
  
  export interface OuiConfirmModalProps {
    title: ReactNode;
    children?: ReactNode;
    cancelButtonText?: string;
    confirmButtonText: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmButtonDisabled?: boolean;
    buttonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    defaultFocusedButton?: 'confirm' | 'cancel';
    isLoading?: boolean;
  }
  export const OuiConfirmModal: ComponentType<OuiConfirmModalProps>;
  
  // Overlay Mask
  export const OuiOverlayMask: ComponentType<{ children: ReactNode; onClick?: () => void }>;
  
  // Callout
  export interface OuiCallOutProps {
    title?: ReactNode;
    children?: ReactNode;
    iconType?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    heading?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
    onDismiss?: () => void;
  }
  export const OuiCallOut: ComponentType<OuiCallOutProps>;
  
  // Loading
  export interface OuiLoadingSpinnerProps {
    size?: 's' | 'm' | 'l' | 'xl';
  }
  export const OuiLoadingSpinner: ComponentType<OuiLoadingSpinnerProps>;
  
  export interface OuiLoadingContentProps {
    lines?: number;
  }
  export const OuiLoadingContent: ComponentType<OuiLoadingContentProps>;
  
  // Empty Prompt
  export interface OuiEmptyPromptProps {
    title?: ReactNode;
    body?: ReactNode;
    actions?: ReactNode | ReactNode[];
    iconType?: string;
    iconColor?: string;
  }
  export const OuiEmptyPrompt: ComponentType<OuiEmptyPromptProps>;
  
  // Badge
  export interface OuiBadgeProps {
    children: ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'accent' | 'hollow' | string;
    iconType?: string;
    iconSide?: 'left' | 'right';
    iconOnClick?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
    onClickAriaLabel?: string;
    iconOnClickAriaLabel?: string;
    isDisabled?: boolean;
  }
  export const OuiBadge: ComponentType<OuiBadgeProps>;
  
  // Icon
  export interface OuiIconProps {
    type: string;
    size?: 'original' | 's' | 'm' | 'l' | 'xl' | 'xxl';
    color?: string;
    className?: string;
  }
  export const OuiIcon: ComponentType<OuiIconProps>;
  
  // Tool Tip
  export interface OuiToolTipProps {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
    title?: string;
    delay?: 'regular' | 'long';
  }
  export const OuiToolTip: ComponentType<OuiToolTipProps>;
  
  // Horizontal Rule
  export interface OuiHorizontalRuleProps {
    margin?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
    size?: 'quarter' | 'half' | 'full';
  }
  export const OuiHorizontalRule: ComponentType<OuiHorizontalRuleProps>;
  
  // Avatar
  export interface OuiAvatarProps {
    name: string;
    size?: 's' | 'm' | 'l' | 'xl';
    imageUrl?: string;
    color?: string;
    initialsLength?: number;
    isDisabled?: boolean;
  }
  export const OuiAvatar: ComponentType<OuiAvatarProps>;
  
  // Health
  export interface OuiHealthProps {
    children?: ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'subdued' | string;
    textAlign?: 'left' | 'right' | 'center';
  }
  export const OuiHealth: ComponentType<OuiHealthProps>;
  
  // Stat
  export interface OuiStatProps {
    title: ReactNode;
    description: ReactNode;
    titleColor?: string;
    titleSize?: 'xs' | 's' | 'm' | 'l';
    textAlign?: 'left' | 'right' | 'center';
    isLoading?: boolean;
  }
  export const OuiStat: ComponentType<OuiStatProps>;
  
  // Progress
  export interface OuiProgressProps {
    value?: number;
    max?: number;
    size?: 'xs' | 's' | 'm' | 'l';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'subdued' | 'accent';
    position?: 'fixed' | 'absolute' | 'static';
  }
  export const OuiProgress: ComponentType<OuiProgressProps>;
  
  // Context Menu
  export interface OuiContextMenuProps {
    panels: any[];
    initialPanelId?: string;
    onClose?: () => void;
  }
  export const OuiContextMenu: ComponentType<OuiContextMenuProps>;
  
  // Popover
  export interface OuiPopoverProps {
    children: ReactNode;
    button: ReactNode;
    isOpen?: boolean;
    closePopover?: () => void;
    panelPaddingSize?: 'none' | 's' | 'm' | 'l';
    anchorPosition?: 'upCenter' | 'upLeft' | 'upRight' | 'downCenter' | 'downLeft' | 'downRight' | 'leftCenter' | 'leftUp' | 'leftDown' | 'rightCenter' | 'rightUp' | 'rightDown';
    display?: 'inlineBlock' | 'block';
  }
  export const OuiPopover: ComponentType<OuiPopoverProps>;
  
  // Link
  export interface OuiLinkProps {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    children: ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' | 'subdued' | 'accent';
    external?: boolean;
    target?: string;
  }
  export const OuiLink: ComponentType<OuiLinkProps>;
  
  // Card
  export interface OuiCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    image?: string;
    footer?: ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    href?: string;
    isDisabled?: boolean;
    display?: 'panel' | 'plain';
    paddingSize?: 'none' | 's' | 'm' | 'l';
    layout?: 'vertical' | 'horizontal';
    grow?: boolean;
  }
  export const OuiCard: ComponentType<OuiCardProps>;
  
  // Accordion
  export interface OuiAccordionProps {
    children: ReactNode;
    buttonContent?: ReactNode;
    initialIsOpen?: boolean;
    isDisabled?: boolean;
    id?: string;
    onToggle?: (isOpen: boolean) => void;
    paddingSize?: 'none' | 's' | 'm' | 'l';
  }
  export const OuiAccordion: ComponentType<OuiAccordionProps>;
  
  // Tabs
  export interface OuiTabsProps {
    children: ReactNode;
    display?: 'default' | 'condensed' | 'small';
    size?: 's' | 'm' | 'l';
    expand?: boolean;
  }
  export const OuiTabs: ComponentType<OuiTabsProps>;
  
  export interface OuiTabProps {
    children: ReactNode;
    isSelected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    prepend?: ReactNode;
    append?: ReactNode;
  }
  export const OuiTab: ComponentType<OuiTabProps>;
  
  // Notification Badge
  export interface OuiNotificationBadgeProps {
    children: ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent';
    size?: 's' | 'm';
  }
  export const OuiNotificationBadge: ComponentType<OuiNotificationBadgeProps>;
  
  // Breadcrumbs
  export interface OuiBreadcrumbsProps {
    breadcrumbs: Array<{
      text: string;
      href?: string;
      onClick?: (e: React.MouseEvent) => void;
    }>;
    truncate?: boolean;
    max?: number;
  }
  export const OuiBreadcrumbs: ComponentType<OuiBreadcrumbsProps>;
  
  // Basic Table
  export interface OuiBasicTableColumn<T> {
    field?: keyof T;
    name: ReactNode;
    description?: string;
    width?: string | number;
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
    render?: (value: any, record: T) => ReactNode;
    truncateText?: boolean;
  }
  
  export interface OuiBasicTableProps<T> {
    items: T[];
    columns: OuiBasicTableColumn<T>[];
    itemId?: string | ((item: T) => string);
    pagination?: {
      pageIndex: number;
      pageSize: number;
      totalItemCount: number;
      pageSizeOptions?: number[];
      hidePerPageOptions?: boolean;
    };
    sorting?: {
      sort: {
        field: keyof T | string;
        direction: 'asc' | 'desc';
      };
    };
    onChange?: (criteria: any) => void;
    selection?: {
      onSelectionChange: (selected: T[]) => void;
      selectable?: (item: T) => boolean;
      selectableMessage?: (selectable: boolean, item: T) => string;
    };
    rowProps?: (item: T) => any;
    cellProps?: (item: T, column: OuiBasicTableColumn<T>) => any;
    loading?: boolean;
    noItemsMessage?: ReactNode;
    error?: string;
    hasActions?: boolean;
    isExpandable?: boolean;
    isSelectable?: boolean;
    compressed?: boolean;
    responsive?: boolean;
    tableLayout?: 'fixed' | 'auto';
  }
  export function OuiBasicTable<T>(props: OuiBasicTableProps<T>): ReactElement;
  
  // Search Bar
  export interface OuiSearchBarProps {
    onChange?: (query: any) => void;
    onSearch?: (query: string) => void;
    box?: {
      placeholder?: string;
      incremental?: boolean;
      schema?: boolean;
      value?: string;
    };
    filters?: any[];
    toolsLeft?: ReactNode;
    toolsRight?: ReactNode;
    query?: any;
    isLoading?: boolean;
  }
  export const OuiSearchBar: ComponentType<OuiSearchBarProps>;
  
  // Super Date Picker
  export interface OuiSuperDatePickerProps {
    start?: string;
    end?: string;
    onTimeChange?: (time: { start: string; end: string }) => void;
    isPaused?: boolean;
    onRefreshChange?: (refresh: { isPaused: boolean; refreshInterval: number }) => void;
    refreshInterval?: number;
    showUpdateButton?: boolean;
    isAutoRefreshOnly?: boolean;
  }
  export const OuiSuperDatePicker: ComponentType<OuiSuperDatePickerProps>;
  
  // ComboBox
  export interface OuiComboBoxProps<T = { label: string; value?: string }> {
    options: T[];
    selectedOptions?: T[];
    onChange?: (selected: T[]) => void;
    onSearchChange?: (search: string) => void;
    onCreateOption?: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
    singleSelection?: boolean | { asPlainText?: boolean };
    fullWidth?: boolean;
    async?: boolean;
    compressed?: boolean;
    delimiter?: string;
  }
  export const OuiComboBox: ComponentType<OuiComboBoxProps>;
  
  // Color Picker
  export interface OuiColorPickerProps {
    color?: string;
    onChange?: (color: string) => void;
    display?: 'default' | 'inline' | 'colorName' | 'swatch';
    fullWidth?: boolean;
    compressed?: boolean;
    isDisabled?: boolean;
  }
  export const OuiColorPicker: ComponentType<OuiColorPickerProps>;
  
  // Date Picker
  export interface OuiDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date) => void;
    placeholder?: string;
    isDisabled?: boolean;
    showTimeSelect?: boolean;
    dateFormat?: string;
    timeFormat?: string;
    injectTimes?: any[];
  }
  export const OuiDatePicker: ComponentType<OuiDatePickerProps>;
  
  // File Picker
  export interface OuiFilePickerProps {
    id?: string;
    onChange?: (files: FileList) => void;
    initialPromptText?: string;
    compressed?: boolean;
    fullWidth?: boolean;
    isDisabled?: boolean;
    display?: 'default' | 'large';
    accept?: string;
  }
  export const OuiFilePicker: ComponentType<OuiFilePickerProps>;
  
  // Range Slider
  export interface OuiRangeSliderProps {
    id?: string;
    min: number;
    max: number;
    value?: number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: number;
    showLabels?: boolean;
    showValue?: boolean;
    showRange?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    compressed?: boolean;
  }
  export const OuiRangeSlider: ComponentType<OuiRangeSliderProps>;
  
  // Resize Observer
  export interface OuiResizeObserverProps {
    children: (dimensions: { width: number; height: number }) => ReactNode;
    onResize?: (dimensions: { width: number; height: number }) => void;
  }
  export const OuiResizeObserver: ComponentType<OuiResizeObserverProps>;
  
  // Window Event
  export interface OuiWindowEventProps {
    event: string;
    handler: (e: Event) => void;
  }
  export const OuiWindowEvent: ComponentType<OuiWindowEventProps>;
  
  // Outside Click Detector
  export interface OuiOutsideClickDetectorProps {
    children: ReactNode;
    onOutsideClick: () => void;
    isDisabled?: boolean;
  }
  export const OuiOutsideClickDetector: ComponentType<OuiOutsideClickDetectorProps>;
}
