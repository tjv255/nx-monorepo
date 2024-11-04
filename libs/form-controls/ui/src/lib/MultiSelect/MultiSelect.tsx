import { HTMLAttributes, ReactNode } from 'react';
import Autocomplete, {
  AutocompleteProps,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteOwnerState,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip/Chip';

import { OverflowTooltip } from './OverflowTooltip';

export interface IMultiSelectProps<T> {
  /**
   * An optional boolean that disables the control.
   */
  disabled?: boolean;
  /**
   * An optional boolean that displays the control.
   */
  visible?: boolean;
  /**
   * An optional boolean to set the control to read only
   */
  readOnly?: boolean;
  /**
   * An optional label to help identify the control.
   */
  label?: string;
  /**
   * An optional placeholder for the input.
   */
  placeholder?: string;
  /**
   * A list of options to be displayed in the dropdown.
   */
  options?: T[];
  /**
   * A list of selected options. Must share references with values in the options list.
   */
  selections?: T[];
  /**
   * An object key name to show the value for the options.
   */
  optionKey?: keyof T | string;
  /**
   * An optional number that limits the amount of tags shown when the control isn't focused. There is no tag limit by default.
   */
  tagLimit?: number;
  /**
   * An optional number that sets the maximum amount of options that can be selected.
   */
  selectionLimit?: number;
  /**
   * An optional boolean that disables the option list from closing after an option is selected.
   */
  disableCloseOnSelect?: boolean;
  /**
   * An optional boolean that disables the clear button. Set to false by default.
   */
  disableClearable?: boolean;
  /**
   * Tooltip text to display for clear action button on mouseover.
   */
  clearText?: string;
  /**
   * Render the input.
   * @param params
   */
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode;
  /**
   * Render the option, use getOptionLabel by default.
   * @param props — The props to apply on the li element.
   * @param option — The option to render.
   * @param state — The state of each option.
   * @param ownerState — The state of the Autocomplete component.
   */
  renderOption?:
    | ((
        props: HTMLAttributes<HTMLLIElement>,
        option: T,
        state: AutocompleteRenderOptionState,
        ownerState: AutocompleteOwnerState<T, true, boolean, false, 'div'>
      ) => ReactNode)
    | undefined;
  /**
   * Render the selected value.
   * @param value — The value provided to the component.
   * @param getTagProps — A tag props getter.
   * @param ownerState — The state of the Autocomplete component.
   */
  renderTags?:
    | ((
        option: T[],
        getTagProps: AutocompleteRenderGetTagProps,
        ownerState: AutocompleteOwnerState<T, true, boolean, false, 'div'>
      ) => ReactNode)
    | undefined;
  /**
   * A callback that is fired when an option gets selected.
   * @param updatedSelections — List of updated selection values.
   * @param selectedValue — The selected value added.
   */
  onSelectOption?: (updatedSelections: T[], selectedValue: T) => void;
  /**
   * A callback that is fired when a selected item is removed.
   * @param updatedSelections — List of updated selection values.
   * @param removedValue — The removed value.
   */
  onRemoveSelection?: (updatedSelections: T[], removedValue: T) => void;
  /**
   * A callback that is fired when the clear button gets pressed.
   * @param updatedSelections — List of updated selection values.
   * @param removedValues — List of all values cleared.
   */
  onClearSelections?: (updatedSelections: T[], removedSelections: T[]) => void;
  /**
   * A callback that fires when one of the selected item tags is clicked.
   * @param value — The value provided to the component.
   */
  onClickTag?: (value: T) => void;
}

export function MultiSelect<T>({
  disabled = false,
  visible = true,
  readOnly = false,
  label = '',
  placeholder = '',
  options = [],
  selections = [],
  optionKey = '' as keyof T | string,
  tagLimit = -1,
  selectionLimit = -1,
  disableCloseOnSelect = false,
  disableClearable = false,
  clearText = 'Clear Selections',
  renderInput: renderCustomInput,
  renderOption: renderCustomOption,
  renderTags: renderCustomTags,
  onSelectOption,
  onRemoveSelection,
  onClearSelections,
  onClickTag,
}: IMultiSelectProps<T>): JSX.Element | null {
  const renderInput: (params: AutocompleteRenderInputParams) => ReactNode = (
      params
    ) =>
      renderCustomInput ? (
        renderCustomInput(params)
      ) : (
        <TextField {...params} label={label} placeholder={placeholder} />
      ),
    renderTags: (
      value: T[],
      getTagProps: AutocompleteRenderGetTagProps,
      ownerState: AutocompleteOwnerState<T, true, boolean, false, 'div'>
    ) => ReactNode = (value, getTagProps, ownerState) =>
      renderCustomTags
        ? renderCustomTags(value, getTagProps, ownerState)
        : value.map((option: T, index: number) => (
            <Chip
              onClick={onClickTag ? () => handleClickTag(option) : undefined}
              clickable={!readOnly}
              {...getTagProps({ index })}
              label={
                <OverflowTooltip
                  children={
                    <label>{option[optionKey as keyof T] as string}</label>
                  }
                />
              }
            />
          )),
    handleClickTag = (item: T) => {
      onClickTag && onClickTag(item);
    },
    handleChange = (
      event: React.SyntheticEvent<Element, Event>,
      value: T[],
      reason: AutocompleteChangeReason,
      details?: AutocompleteChangeDetails<T>
    ) => {
      switch (reason) {
        case 'selectOption':
          if (selectionLimit === -1 || !(value.length > selectionLimit)) {
            onSelectOption && onSelectOption(value, details!.option!);
          }
          break;
        case 'removeOption':
          onRemoveSelection && onRemoveSelection(value, details!.option);
          break;
        case 'clear':
          onClearSelections && onClearSelections(value, selections);
          break;
        default:
      }
    },
    msProps: AutocompleteProps<T, true, boolean, false> = {
      ...(renderCustomOption && { renderOption: renderCustomOption }),
      disabled,
      readOnly,
      multiple: true,
      disableCloseOnSelect,
      clearText,
      disableClearable,
      limitTags: tagLimit,
      id: 'multi-select-control',
      options,
      value: selections,
      getOptionLabel: (option: string | T) => {
        if (typeof option === 'string') return option;
        return option[optionKey as keyof T] as string;
      },
      renderInput,
      renderTags,
      onChange: handleChange,
    };

  if (!visible) return null;

  return (<Autocomplete {...msProps} />);
}
