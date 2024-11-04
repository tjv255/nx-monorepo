import { StoryFn, Meta } from '@storybook/react';

import { top100Films, IFilm } from './data';
import { MultiSelect, IMultiSelectProps } from './MultiSelect';
import { useState } from 'react';

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/Material UI/Multi-select',
  component: MultiSelect,
  argTypes: {
    onClickTag: { action: 'Tag Click' },
    onSelectOption: { action: 'Select Option' },
    onRemoveSelection: { action: 'Remove Selection' },
    onClearSelections: { action: 'Clear Selections' },
  },
};

const MSTest = (args: IMultiSelectProps<IFilm>): JSX.Element => {
    const [_selections, setSelections] = useState(args.selections || []),
      update = (updatedSelections: IFilm[]) => {
        setSelections(updatedSelections);
      };

    return (
      <MultiSelect
        {...args}
        selections={_selections}
        onSelectOption={update}
        onRemoveSelection={update}
        onClearSelections={update}
      />
    );
  },
  Template: StoryFn<typeof MultiSelect<IFilm>> = (
    args: IMultiSelectProps<IFilm>
  ) => <MSTest {...args} />;

let selections = [top100Films[2], top100Films[3], top100Films[5]];

export const Default = Template.bind({});
Default.parameters = {};
Default.args = {
  options: top100Films,
  selections,
  optionKey: 'title',
};

export const Disabled = Template.bind({});
Disabled.parameters = {};
Disabled.args = { ...Default.args, disabled: true };

export const ReadOnly = Template.bind({});
ReadOnly.parameters = {};
ReadOnly.args = { ...Default.args, readOnly: true };

export const Invisible = Template.bind({});
Invisible.parameters = {};
Invisible.args = { ...Default.args, visible: false };

export const DisableClearable = Template.bind({});
DisableClearable.parameters = {};
DisableClearable.args = { ...Default.args, disableClearable: true };

export const TagLimit2 = Template.bind({});
TagLimit2.parameters = {};
TagLimit2.args = { ...Default.args, tagLimit: 2 };

export const SelectionLimit3 = Template.bind({});
SelectionLimit3.parameters = {};
SelectionLimit3.args = { ...Default.args, selectionLimit: 3 };

export const DisableCloseOnSelect = Template.bind({});
DisableCloseOnSelect.parameters = {};
DisableCloseOnSelect.args = { ...Default.args, disableCloseOnSelect: true };

export default meta;
