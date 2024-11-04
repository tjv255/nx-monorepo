import { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

export function OverflowTooltip(props: Partial<TooltipProps>): JSX.Element {
  const [isOverflowed, setIsOverflow] = useState(false),
    textElementRef = useRef<HTMLInputElement | null>(null),
    checkSize = () => {
      const shouldOverflow = !!(
        textElementRef.current &&
        textElementRef.current.scrollWidth > textElementRef.current.clientWidth
      );
      setIsOverflow(shouldOverflow);
    };

  useEffect(() => {
    checkSize();
    window.addEventListener(
      'resize',
      throttle(() => {
        checkSize();
      }, 200)
    );
  }, []);

  return (
    <Tooltip
      {...props}
      title={props.children}
      disableHoverListener={!isOverflowed}
    >
      <div
        ref={textElementRef}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {props.children}
      </div>
    </Tooltip>
  );
}
