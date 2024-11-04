import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import {
  TagPicker,
  TagPickerList,
  TagPickerInput,
  TagPickerControl,
  TagPickerProps,
  TagPickerOption,
  TagPickerGroup,
  TagPickerSize,
  Button,
  Field,
  TagPickerOnOptionSelectData,
  TagPickerInputProps,
} from '@fluentui/react-components';
import { DebouncedFunc, debounce } from 'lodash';
import { ITag } from './interfaces';
import { Tag } from './Tag';
import { LookupOption } from './LookupOption';

export interface ILookupSelectorBaseProps {
  /**
   * An optional boolean that disables the control.
   */
  disabled?: boolean;
  /**
   * An optional boolean that hides the control.
   */
  visible?: boolean;
  /**
   * List of selectable options.
   */
  options: ITag[];
  /**
   * List of selected options.
   */
  selectedOptions?: ITag[];
  /**
   * Provides a label to go above the control.
   */
  label?: string;
  /**
   * An optional boolean that shows an avatar icon for each option.
   */
  useAvatar?: boolean;
  /**
   * An optional boolean that adds a button to clear selections.
   */
  useClearButton?: boolean;
  /**
   * Sets the size of the control.
   */
  controlSize?: TagPickerSize;
  /**
   * A callback fired when an option gets added.
   */
  onSelect?: (newSelectState: ITag[], value?: ITag) => void;
  /**
   * A callback fired when an option gets removed.
   */
  onDeselect?: (newSelectState: ITag[], value?: ITag) => void;
  /**
   * A callback fired when selections get cleared.
   */
  onClearSelection?: (newSelectState: ITag[], values: ITag[]) => void;
  /**
   * A callback fired when a selected tag gets clicked.
   */
  onClickSelection?: (selectState: ITag[], value?: ITag) => void;
  /**
   * A callback fired as text gets inputted to the control.
   */
  onInputChange?: (selectState: ITag[], input: string) => void;
}

export function LookupSelectorBase({
  disabled = false,
  visible = true,
  options,
  selectedOptions = [],
  label,
  useAvatar = false,
  useClearButton = false,
  controlSize = 'medium',
  onSelect,
  onDeselect,
  onClearSelection,
  onClickSelection,
  onInputChange,
}: ILookupSelectorBaseProps): JSX.Element | null {
  const [_query, setQuery] = useState<string>(''),
    [_selectedOptions, setSelectedOptions] = useState<ITag[]>(selectedOptions),
    { selectedOptionIds, selectedOptionIdsSet } = useMemo(() => {
      const selectedOptionIds: string[] = _selectedOptions.map((o) => o.id);

      return {
        selectedOptionIds,
        selectedOptionIdsSet: new Set(selectedOptionIds),
      };
    }, [_selectedOptions]),
    tagPickerOptions = useMemo(
      () => options.filter((option) => !selectedOptionIdsSet.has(option.id)),
      [options, selectedOptionIdsSet]
    ),
    primaryLabelSize = useMemo(
      () => (controlSize === 'extra-large' ? 'large' : 'medium'),
      [controlSize]
    ),
    onOptionSelect: TagPickerProps['onOptionSelect'] = (
      _,
      data: TagPickerOnOptionSelectData
    ) => {
      const updatedSelectedObjects = options.filter((o) =>
          data.selectedOptions.includes(o.id)
        ),
        value = options.find((o) => o.id === data.value);

      if (_selectedOptions.length < data.selectedOptions.length)
        onSelect && onSelect(updatedSelectedObjects, value);
      else if (_selectedOptions.length > data.selectedOptions.length)
        onDeselect && onDeselect(updatedSelectedObjects, value);

      setSelectedOptions(
        options.filter((o) => data.selectedOptions.includes(o.id))
      );
      setQuery('');
    },
    handleClearAll: MouseEventHandler = (event) => {
      onClearSelection && onClearSelection([], _selectedOptions);
      setSelectedOptions([]);
      setQuery('');
    },
    handleInputHelper: DebouncedFunc<(newValue: any) => void> = useCallback(
      debounce((newValue) => {
        onInputChange && onInputChange(_selectedOptions, newValue);
      }, 300),
      [_selectedOptions, onInputChange]
    ),
    handleInput: (newValue: string) => void = useCallback((newValue) => {
      handleInputHelper(newValue);
      setQuery(newValue);
    }, []),
    renderClearButton: () => JSX.Element | null = useCallback(
      () =>
        useClearButton ? (
          <Button
            appearance="transparent"
            size="small"
            shape="rounded"
            onClick={handleClearAll}
          >
            Clear
          </Button>
        ) : null,
      [useClearButton]
    ),
    renderOption: (option: ITag) => JSX.Element = (option: ITag) => (
      <LookupOption
        option={option}
        useAvatar={useAvatar}
        primaryLabelSize={primaryLabelSize}
      />
    ),
    tpProps: Partial<TagPickerProps> = {
      size: controlSize,
      disabled,
      onOptionSelect,
      selectedOptions: selectedOptionIds,
    },
    tpInputProps: TagPickerInputProps = {
      'aria-label': 'Tag Picker Control',
      value: _query,
      onChange: (e) => handleInput(e.target.value),
    };

  if (!visible) return null;

  return (
    <Field label={label} size={primaryLabelSize} style={{ maxWidth: 400 }}>
      <TagPicker {...tpProps}>
        <TagPickerControl secondaryAction={renderClearButton()}>
          <TagPickerGroup aria-label="Tag Picker Control">
            {_selectedOptions.map((o) => (
              <Tag
                option={o}
                onClickSelection={onClickSelection}
                useAvatar={useAvatar}
              />
            ))}
          </TagPickerGroup>
          <TagPickerInput {...tpInputProps} />
        </TagPickerControl>
        <TagPickerList>
          {tagPickerOptions.length > 0
            ? tagPickerOptions.map(renderOption)
            : 'No options available'}
        </TagPickerList>
      </TagPicker>
    </Field>
  );
}
