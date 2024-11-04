import { CSSProperties, useCallback } from 'react';
import {
  InteractionTag,
  InteractionTagPrimary,
  InteractionTagPrimaryProps,
  InteractionTagSecondary,
  makeStyles,
} from '@fluentui/react-components';
import { Avatar } from './Avatar';
import { ITag } from './interfaces';

const useStyles = makeStyles({
  tagTruncatedPrimaryText: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export interface ITagProps {
  /**
   * An optional boolean that disables the control.
   */
  disabled?: boolean;
  /**
   * An optional boolean that hides the control.
   */
  visible?: boolean;
  /**
   * The option the tag is representing.
   */
  option: ITag;
  /**
   * A value to set the maximum width the tag can reach.
   */
  maxWidth?: CSSProperties['maxWidth'];
  /**
   * A callback that fires when the tag is clicked.
   */
  onClickSelection?: (selectState: ITag[], value?: ITag) => void;
  /**
   * A function to set the format of the text displayed in the popover.
   */
  formatPopupText?: (label: string, secondaryLabel?: string) => string;
  /**
   * An optional boolean to render an avatar component inside the tag.
   */
  useAvatar?: boolean;
}

export function Tag({
  disabled = false,
  visible = true,
  option,
  maxWidth,
  onClickSelection,
  formatPopupText = (label: string, secondaryLabel?: string) =>
    secondaryLabel ? `${label}\n${secondaryLabel}` : label,
  useAvatar,
}: ITagProps): JSX.Element | null {
  const handleClick = useCallback(() => {
      onClickSelection && onClickSelection([option]);
    }, [onClickSelection, option]),
    styles = useStyles(),
    interactionTagPrimaryProps: InteractionTagPrimaryProps = {
      disabled,
      media: useAvatar ? <Avatar option={option} /> : null,
      title: formatPopupText(option.label, option.secondaryLabel),
      primaryText: {
        className: styles.tagTruncatedPrimaryText,
        style: { maxWidth: maxWidth },
      },
      onClick: handleClick,
    };

  if (!visible) return null;

  return (
    <InteractionTag key={option.id} shape="rounded" value={option.id}>
      <InteractionTagPrimary {...interactionTagPrimaryProps}>
        {option.label}
      </InteractionTagPrimary>
      <InteractionTagSecondary aria-label="remove" />
    </InteractionTag>
  );
}
