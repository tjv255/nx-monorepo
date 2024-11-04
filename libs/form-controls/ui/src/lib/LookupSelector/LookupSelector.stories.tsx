import { StoryFn, Meta } from '@storybook/react';
import { LookupSelectorBase, ILookupSelectorBaseProps } from './LookupSelectorBase';
import { withFluentProvider } from '../../../.storybook/decorators';
import { ITag } from './interfaces';

const meta: Meta<typeof LookupSelectorBase> = {
    title: 'Components/FluentUI/Lookup',
    component: LookupSelectorBase,
    argTypes: {
      onClearSelection: { action: 'Selection Cleared' },
      onClickSelection: { action: 'Selection Clicked' },
      onSelect: { action: 'Selection Added' },
      onDeselect: { action: 'Selection Removed' },
      onInputChange: { action: 'Input Changed' },
    },
    decorators: [withFluentProvider],
  },
  options: ITag[] = [
    { id: '1', label: 'John Doe', secondaryLabel: 'Software Developer' },
    {
      id: '2',
      label: 'Jane Doe',
      secondaryLabel: 'Software Architect',
      imgUrl:
        'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    },
    { id: '3', label: 'Max Mustermann', imgUrl: '' },
    { id: '4', label: 'Erika Mustermann', secondaryLabel: 'Sales Manager' },
    { id: '5', label: 'Pierre Dupont' },
    { id: '6', label: 'Amelie Dupont' },
    {
      id: '7',
      label: 'Mario Rossi',
      imgUrl:
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Twinkle&skinColor=Light',
    },
    { id: '8', label: 'Maria Rossi' },
    {
      id: '9',
      label:
        'Label with a very long name!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      secondaryLabel:
        'Secondary label with a very long name!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    },
  ];

const Template: StoryFn<typeof LookupSelectorBase> = (args: ILookupSelectorBaseProps) => (
  <LookupSelectorBase {...args} />
);

export const Default = Template.bind({});
Default.parameters = {};
Default.args = {
  label: 'Default',
  options,
  selectedOptions: [options[0], options[2]],
};

export const Disabled = Template.bind({});
Disabled.parameters = {};
Disabled.args = { ...Default.args, label: 'Disabled', disabled: true };

export const Invisible = Template.bind({});
Invisible.parameters = {};
Invisible.args = { ...Default.args, label: 'Invisible', visible: false };

export const WithAvatar = Template.bind({});
WithAvatar.parameters = {};
WithAvatar.args = {
  ...Default.args,
  label: 'With Avatar',
  useAvatar: true,
};

export const NoSelections = Template.bind({});
NoSelections.parameters = {};
NoSelections.args = {
  ...Default.args,
  label: 'No Selections',
  selectedOptions: undefined,
};

export const ClearButton = Template.bind({});
ClearButton.parameters = {};
ClearButton.args = {
  ...Default.args,
  label: 'Clear Button',
  useClearButton: true,
};

export const DuplicateOptions = Template.bind({});
DuplicateOptions.parameters = {};
DuplicateOptions.args = {
  ...Default.args,
  options: [
    { ...options[0], id: '1' },
    { ...options[0], id: '2' },
    { ...options[1], id: '3' },
    { ...options[1], id: '4' },
    { ...options[1], id: '5' },
    { ...options[4], id: '6' },
    { ...options[4], id: '7' },
  ],
  label: 'Duplicate Options',
};

export const Large = Template.bind({});
Large.parameters = {};
Large.args = {
  ...Default.args,
  label: 'Large',
  controlSize: 'large',
};

export const ExtraLarge = Template.bind({});
ExtraLarge.parameters = {};
ExtraLarge.args = {
  ...Default.args,
  label: 'Extra Large',
  controlSize: 'extra-large',
};

export default meta;
