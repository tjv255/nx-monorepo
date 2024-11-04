import { Avatar as FluentAvatar } from '@fluentui/react-components';
import { ITag } from './interfaces';

export interface IAvatarProps {
  /**
   * An optional boolean that hides the control.
   */
  visible?: boolean;
  /**
   * The option the avatar is for.
   */
  option: ITag;
}

export function Avatar({
  option,
  visible = true,
}: IAvatarProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <FluentAvatar
      aria-hidden
      name={option.label}
      color="colorful"
      image={{ src: option.imgUrl }}
      shape="square"
    />
  );
}
