import React from "react"
import Style from "./Button.css"

function Button({
  size = "md",
  disabled,
  isBlock,
  onClick = () => {},
  children
}) {
  const className = [ Style.root, Style[size] ]

  if (isBlock)
    className.push(Style.block)

  if (disabled)
    className.push(Style.disabled)

  return (
    <button
      type="button"
      className={className.join(" ")}
      onClick={(e) => onClick(e)}
      disabled={disabled}
    >{children}</button>
  )
}

Button.propTypes =
{
  size: React.PropTypes.oneOf([ "xs", "sm", "md", "lg" ]),
  disabled: React.PropTypes.bool,
  isBlock: React.PropTypes.bool,
  onClick: React.PropTypes.func,
  children: React.PropTypes.string.isRequired
}

export default Button
