// DialogProps.prototype.leftButtonOnClick = null
// DialogProps.prototype.rightButtonOnClick = null
function DialogProps (props) {
  this.name = props.name
  this.open = props.open || false
  this.message = props.message
  this.buttonAlign = props.buttonAlign || 'right'
  this.icon = {
    name: props.icon.name,
    color: props.icon.color || 'primary',
    textColor: props.icon.textColor || 'white'
  }
  this.leftButton = {
    label: props.leftButton.label || '確定',
    color: props.leftButton.color || 'primary'
  }
  this.rightButton = {
    label: props.rightButton.label || '取消',
    color: props.rightButton.color || 'primary'
  }
}

export { DialogProps }
