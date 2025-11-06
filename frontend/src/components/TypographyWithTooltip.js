import { Typography, Tooltip } from "@mui/material";
import { useCallback, useRef, useState } from "react";


/**
 *
 *
 * @export
 * @param {TypographyProps} props
 * @returns {*}
 */
export function TypographyWithTooltip(props) {
  const {
    label,
    placement = "right",
    followCursor,
    children,
    ...other
  } = props;
  const titleRef = useRef(null);
  const [tooltip, setTooltip] = useState("");
  const handleMouseOver = useCallback(() => {
    if (!children) return;
    if (titleRef?.current) {
      const isOver = isOverflown(titleRef.current);
      if (isOver) {
        setTooltip(children);
      } else {
        setTooltip("");
      }
    }
  }, [children, setTooltip, titleRef]);

  return (
    <Tooltip title={tooltip} placement={placement} followCursor={followCursor}>
      <Typography
        noWrap
        component="span"
        {...other}
        ref={titleRef}
        onMouseOver={handleMouseOver}
        sx={[
          {
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...other.sx,
          },
          ...(Array.isArray(other.sx) ? other.sx : [other.sx]),
        ]}
      >
        {children}
      </Typography>
    </Tooltip>
  );
}
function isOverflown(element) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
