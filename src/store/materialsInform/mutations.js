const updateMenuSelected = (state, value) => {
  state.menuSelected = value
}

const updateMaterialsInform = (state, value) => {
  const selected = { ...value[0] }
  state.materialsInform.forEach(elem => {
    elem.value = selected[elem.name]
  })
}

const resetMaterialsInform = (state) => {
  state.materialsInform.forEach(elem => {
    elem.value = ''
    if ('options' in elem) elem.options.splice(0, elem.options.length)
  })
}

const updateProductClassSerialNumber = (state, value) => {
  const { materialsInform } = state, { serialNumber } = value
  const productClassSerialNumber = materialsInform.find(elem => elem.name === 'productClassSerialNumber')
  productClassSerialNumber.value = serialNumber
}

const resetProductClassSerialNumber = (state) => {
  const productClassSerialNumber = state.materialsInform.find(elem => elem.name === 'productClassSerialNumber')
  productClassSerialNumber.value = ''
}

const updateProductSubclassSerialNumber = (state, value) => {
  const { materialsInform } = state, { serialNumber } = value
  const productSubclassSerialNumber = materialsInform.find(elem => elem.name === 'productSubclassSerialNumber')
  productSubclassSerialNumber.value = serialNumber
}

const resetProductSubclassSerialNumber = (state) => {
  const productSubclassSerialNumber = state.materialsInform.find(elem => elem.name === 'productSubclassSerialNumber')
  productSubclassSerialNumber.value = ''
}

const updatePipeMaterial = (state, value) => {
  const { materialsInform } = state, { selects } = value
  const pipeMaterialSerialNumberNames = ['caliberSerialNumber', 'pipeMaterialNameSerialNumber']
  selects.forEach(select => {
    const { serialNumber } = select.options.find(opt => opt.label === select.value)
    const pipeMaterialElem = materialsInform.find(elem => elem.name === select.name)
    const pipeMaterialSerialNumberName = pipeMaterialSerialNumberNames.find(elem => elem.includes(select.name))
    const pipeMaterialSerialNumberElem = materialsInform.find(elem => elem.name === pipeMaterialSerialNumberName)
    pipeMaterialElem.value = select.value
    pipeMaterialSerialNumberElem.value = serialNumber
  })
}

const resetPipeMaterial = (state) => {
  const pipeMaterialNames = ['caliber', 'caliberSerialNumber', 'pipeMaterialName', 'pipeMaterialNameSerialNumber']
  const pipeMaterialElems = state.materialsInform.filter(elem => pipeMaterialNames.includes(elem.name))
  pipeMaterialElems.forEach(elem => {
    elem.value = ''
    if ('options' in elem) elem.options.splice(0, elem.options.length)
  })
}

const updateProductNameSerialNumber = (state, value) => {
  const { materialsInform } = state, { serialNumber } = value
  const productNameSerialNumber = materialsInform.find(elem => elem.name === 'productNameSerialNumber')
  productNameSerialNumber.value = serialNumber
}

const resetProductNameSerialNumber = (state) => {
  const { materialsInform } = state
  const productNameSerialNumber = materialsInform.find(elem => elem.name === 'productNameSerialNumber')
  productNameSerialNumber.value = ''
}

const updateProductPartNumber = (state, value) => {
  const { materialsInform } = state, { partNumber } = value
  const productPartNumber = materialsInform.find(elem => elem.name === 'productPartNumber')
  productPartNumber.value = partNumber
}

const resetProductPartNumber = (state) => {
  const { materialsInform } = state, productPartNumber = materialsInform.find(elem => elem.name === 'productPartNumber')
  productPartNumber.value = ''
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

const updateOptionClicked = (state, value) => {
  const { label, selected } = value
  state.searchOptionClicked = selected ? label : null
}

const resetOptionClicked = (state) => {
  state.searchOptionClicked = ''
}

const loadTableData = (state, value) => {
  const { tableData } = state
  tableData.splice(0, tableData.length, ...value)
}

const updateTableDataSelected = (state, value) => {
  state.tableDataSelected.splice(0, state.tableDataSelected.length, ...value.select)
}

const resetTableDataSelected = (state, value) => {
  state.tableDataSelected.splice(0, state.tableDataSelected.length)
}

export {
  updateMenuSelected,
  updateMaterialsInform,
  resetMaterialsInform,
  updateProductClassSerialNumber,
  resetProductClassSerialNumber,
  updateProductSubclassSerialNumber,
  resetProductSubclassSerialNumber,
  updatePipeMaterial,
  resetPipeMaterial,
  updateProductNameSerialNumber,
  resetProductNameSerialNumber,
  updateProductPartNumber,
  resetProductPartNumber,
  updateSearchingColumnSelect,
  updateSearchingColumnTypeIn,
  resetSearchingColumns,
  updateOptionClicked,
  resetOptionClicked,
  loadTableData,
  updateTableDataSelected,
  resetTableDataSelected
}
