const updateOptionClicked = (state, value) => {
  const { label, selected } = value
  state.searchOptionClicked = selected ? label : null
}

const resetOptionClicked = (state) => {
  state.searchOptionClicked = ''
}

const updateSearchingColumnSelect = (state, value) => {
  const { searchingColumns } = state, { optionIndex } = value
  searchingColumns[optionIndex].selected = !searchingColumns[optionIndex].selected
}

const updateSearchingColumnTypeIn = (state, value) => {
  const { searchOptionClicked, searchingColumns } = state
  const search = searchingColumns.find(elem => elem.label === searchOptionClicked)
  search.typeIn = value
}

const resetSearchingColumns = (state) => {
  state.searchingColumns.forEach(elem => {
    elem.selected = false
    elem.typeIn = ''
  })
}

const updateControlInputsValue = (state, value) => {
  const { name, input } = value
  const controlInput = state.controlInputs.find(elem => elem.name === name)
  controlInput.value = input
}

const resetControlInputsValue = (state) => {
  state.controlInputs.forEach(elem => {
    elem.value = null
  })
}

const resetControlInputsValueAfterCreate = (state) => {
  state.controlInputs.forEach(elem => {
    if (elem.name !== 'taxIdNumber' && elem.name !== 'firm') elem.value = null
  })
}

const loadTableData = (state, value) => {
  const { tableData } = state
  tableData.splice(0, tableData.length, ...value)
}

const updateTableDataSelected = (state, value) => {
  state.tableDataSelected.splice(0, state.tableDataSelected.length, ...value.select)
}

const updateTableDataValue = (state, value) => {
  const { id, controlInputs } = value
  const oldDataIndex = state.tableData.findIndex(elem => elem.id === id)
  const oldData = state.tableData[oldDataIndex]
  const newData = controlInputs.reduce((total, elem) => {
    return Object.assign(total, Object.fromEntries([[elem.name, elem.value]]))
  }, {})
  Object.assign(oldData, newData)
}

const resetTableDataSelected = (state) => {
  state.tableDataSelected.splice(0, state.tableDataSelected.length)
}

export {
  updateOptionClicked,
  resetOptionClicked,
  updateSearchingColumnSelect,
  updateSearchingColumnTypeIn,
  resetSearchingColumns,
  updateControlInputsValue,
  resetControlInputsValue,
  loadTableData,
  updateTableDataSelected,
  updateTableDataValue,
  resetTableDataSelected,
  resetControlInputsValueAfterCreate
}
