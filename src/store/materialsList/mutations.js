const updateMaterialsInformRequested = (state, value) => {
  state.materialsInformRequested.splice(0, state.materialsInformRequested.length, ...value)
}

const updateMaterialsListData = (state, value) => {
  state.materialsListData.splice(0, state.materialsListData.length, ...value)
}

const addMaterialsListData = (state, value) => {
  state.materialsListData.push(value)
}

const updateOneMaterialsListData = (state, value) => {
  const { _id, newData } = value
  const oldData = state.materialsListData.find(data => data._id === _id)
  Object.assign(oldData, newData)
}

const deleteOneMaterialsListData = (state, value) => {
  const dataIndex = state.materialsListData.findIndex(data => data.id === value.id)
  state.materialsListData.splice(dataIndex, 1)
}

const updateTradeSelectedValue = (state, value) => {
  state.tableSearch.tradeSelect.value = value
}

const updateTableSearchColumnSelect = (state, value) => {
  updateValue()
  updateOnTypeIn()
  function updateValue () {
    const columnSelect = state.tableSearch.columnSelect.find(select => select.name === value.name)
    columnSelect.value = !columnSelect.value
  }
  function updateOnTypeIn () {
    const { selectLabelClicked } = value
    state.tableSearch.columnSelect.forEach(select => {
      select.onTypeIn = select.value && select.label === selectLabelClicked
    })
  }
}

const updateColumnSelectedTypeIn = (state, value) => {
  const columnSelectedOnTypeIn = state.tableSearch.columnSelect.find(select => select.onTypeIn)
  columnSelectedOnTypeIn.typeIn = value
}

const resetTableSearch = (state) => {
  const { tradeSelect, columnSelect } = state.tableSearch
  tradeSelect.value = '全部'
  columnSelect.forEach(elem => {
    Object.assign(elem, { value: false, typeIn: null, onTypeIn: false })
  })
}

const updateDialogTableInputbox = (state, value) => {
  const { name, input } = value
  state.dialogTableInputboxs[name].value = input
}

const resetDialogTableInputboxs = (state) => {
  Object.values(state.dialogTableInputboxs).forEach(elem => {
    elem.value = ''
  })
}

const updateMaterialSelected = (state, value) => {
  const nodeKeyValidated = state.materialModelSelected ? state.materialModelSelected.nodeKey : null
  state.materialModelSelected = value ? (value.nodeKey === nodeKeyValidated ? null : value) : null
}

const updateTableTitle = (state, value) => {
  state.tableTitle = value
}

const updateDialogTableInputboxOptions = (state, value) => {
  const { options } = state.dialogTableInputboxs[value.name]
  options.splice(0, options.length, ...value.options)
}

const updateMaterialSelectedDetal = (state, value) => {
  state.materialSelectedDetail = Object.assign(state.materialSelectedDetail, value)
}

const updateMaterialListSelected = (state, value) => {
  state.materialListSelected = value.length > 0 ? value : []
}

const clearMaterialListSelected = (state) => {
  state.materialListSelected.splice(0, state.materialListSelected.length)
}

const updateTreeSearchNodeSelect = (state, value) => {
  updateValue()
  updateOnTypeIn()
  function updateValue () {
    const columnSelect = state.treeSearchNodeSelect.find(select => select.name === value.name)
    columnSelect.value = !columnSelect.value
  }
  function updateOnTypeIn () {
    const { selectLabelClicked } = value
    state.treeSearchNodeSelect.forEach(select => {
      select.onTypeIn = select.value && select.label === selectLabelClicked
    })
  }
}

const updateTreeSearchNodeSelectedTypeIn = (state, value) => {
  const columnSelectedOnTypeIn = state.treeSearchNodeSelect.find(select => select.onTypeIn)
  columnSelectedOnTypeIn.typeIn = value
}

const resetTreeSearchNodeSelect = (state, value) => {
  state.treeSearchNodeSelect.forEach(select => {
    Object.assign(select, { value: false, typeIn: null, onTypeIn: false })
  })
}

export {
  updateMaterialsInformRequested,
  updateMaterialsListData,
  addMaterialsListData,
  updateOneMaterialsListData,
  deleteOneMaterialsListData,
  updateTradeSelectedValue,
  // updateColumnSelectValue,
  // updateColumnSelectOnTypeIn,
  updateTableSearchColumnSelect,
  updateColumnSelectedTypeIn,
  resetTableSearch,
  updateDialogTableInputbox,
  resetDialogTableInputboxs,
  updateMaterialSelected,
  updateTableTitle,
  updateDialogTableInputboxOptions,
  updateMaterialSelectedDetal,
  updateMaterialListSelected,
  clearMaterialListSelected,
  updateTreeSearchNodeSelect,
  updateTreeSearchNodeSelectedTypeIn,
  resetTreeSearchNodeSelect
}
