import { StoryFn, Meta } from '@storybook/react';
import { EmailDateBanner } from './EmailDateBanner';
import './style.css'

const meta: Meta<typeof EmailDateBanner> = {
    title: 'Components/EmailDateBanner',
    component: EmailDateBanner,
    argTypes: {},
  },
  MSTest = (args: any): JSX.Element => <EmailDateBanner {...args} />,
  Template: StoryFn<typeof EmailDateBanner> = (args: any) => (
    <MSTest {...args} />
  );

export const Default = Template.bind({});
Default.parameters = {};
Default.args = {};

export default meta;