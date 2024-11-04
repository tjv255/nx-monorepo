import {
  Label,
  LabelProps,
  TagPickerOption,
  TagPickerOptionProps,
  makeStyles,
} from '@fluentui/react-components';
import { ITag } from './interfaces';
import { Avatar } from './Avatar';

const useStyles = makeStyles({
  optionContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionPrimaryContent: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionSecondaryContent: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export interface ILookupOptionProps {
  /**
   * The option to display.
   */
  option: ITag;
  /**
   * An optional boolean to render an avatar component inside the tag.
   */
  useAvatar?: boolean;
  /**
   * A value to set the size of the primary label.
   */
  primaryLabelSize?: 'medium' | 'small' | 'large';
  /**
   * A function to set the format of the text displayed in the popover.
   */
  formatPopupText?: (label: string, secondaryLabel?: string) => string;
}

export function LookupOption({
  option,
  useAvatar = false,
  primaryLabelSize = 'medium',
  formatPopupText = (label: string, secondaryLabel?: string) =>
    secondaryLabel ? `${label}\n${secondaryLabel}` : label,
}: ILookupOptionProps) {
  const styles = useStyles(),
    secondaryLabelSize: 'medium' | 'small' | 'large' =
      primaryLabelSize === 'medium' || primaryLabelSize === 'small'
        ? 'small'
        : 'medium',
    tpoProps: TagPickerOptionProps = {
      key: option.id,
      value: option.id,
      title: formatPopupText(option.label, option.secondaryLabel),
      media: useAvatar ? <Avatar option={option} /> : null,
      text: option.label,
    },
    pLabelProps: LabelProps = {
      className: styles.optionPrimaryContent,
      size: primaryLabelSize,
    },
    sLabelProps: LabelProps = {
      className: styles.optionSecondaryContent,
      size: secondaryLabelSize,
    };

  return (
    <TagPickerOption {...tpoProps}>
      <div className={styles.optionContainer}>
        <Label {...pLabelProps}>{option.label}</Label>
        <Label {...sLabelProps}>{option.secondaryLabel}</Label>
      </div>
    </TagPickerOption>
  );
}
