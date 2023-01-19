const initDialogPrototype = {
  methods: {
    initDialogPrototype ($refs) {
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      dialogPrototype.dialogRef = $refs.dialog
      dialogPrototype.dialogIconRef = $refs[`dialog-icon-${this.dialogProps.icon.name}`]
      dialogPrototype.dialogMessageRef = $refs[`dialog-message-${this.dialogProps.name}`]
      dialogPrototype.leftButtonRef = $refs['dialog-leftButton']
      dialogPrototype.rightButtonRef = $refs['dialog-rightButton']
    }
  }
}

export { initDialogPrototype }
