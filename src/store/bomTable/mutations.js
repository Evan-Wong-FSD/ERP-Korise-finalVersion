const modifyTab = (state, value) => {
  state.tab = value
}

const addProductClass = (state, value) => {
  const { productClassData } = state
  if (!productClassData.includes(value)) productClassData.push({ productClass: value })
}

const updateProductClass = (state, value) => {
  const { productClassData, productClassSelected } = state
  const oldValueIndex = productClassData.findIndex(elem => elem === productClassSelected[0])
  productClassData.splice(oldValueIndex, 1, { productClass: value })
}

const updateProductClassSelectedList = (state, value) => {
  const { productClassSelected } = state
  productClassSelected.splice(0, productClassSelected.length, ...value)
}

const deleteProductClass = (state) => {
  const { productClassSelected, productClassData } = state
  productClassSelected.forEach(elem0 => {
    const productClassIndex = productClassData.findIndex(elem1 => elem1 === elem0)
    productClassData.splice(productClassIndex, 1)
  })
}

const insertProductClassList = (state, value) => {
  const { productClassData } = state
  productClassData.splice(0, productClassData.length, ...value)
}

const resetProductClassSelected = (state) => {
  state.productClassSelected = []
}

const resetProductClass = (state) => {
  state.productClassData = []
  state.productClassSelected = []
}

const updateFrequentlyUsedSelect = (state, value) => {
  state.frequentlyUsedSelect = value
}

const updateStep = (state, value) => {
  state.step = value
}

const updateBasicInform = (state, value) => {
  state.basicInform = []
  value.slice().forEach(elem => {
    state.basicInform.push({ ...elem })
  })
}

const addCheckboxStatus = (state) => {
  const { tableData, checkboxStatus } = state
  const productInformDataRow = tableData.slice(8, tableData.length - 1)
  for (const dataRow of productInformDataRow) {
    if ('id' in dataRow && !(dataRow.id in checkboxStatus)) checkboxStatus[dataRow.id] = false
  }
}

const resetCheckboxStatus = (state) => {
  state.checkboxStatus = {}
}

const updateCheckboxStatus = (state, value) => {
  const { checkboxStatus } = state
  const { id } = value
  checkboxStatus[id] = !checkboxStatus[id]
}

const insertProductInformOnTable = (state, value) => {
  const { tableData } = state
  const { productClass, inputBox } = value
  const pushIndex = tableData.slice(8).findIndex(elem => elem.column1 === productClass) + 8 + 1
  const data = inputBox.reduce((total, elem, index) => {
    if (index === 1) total = Object.fromEntries([['id', productClass + Date.now()], ['column1', total.value]])
    elem = Object.fromEntries([[`column${index + 1}`, elem.value]])
    return Object.assign(total, elem)
  })
  Object.assign(data, { column8: '' })
  tableData.splice(pushIndex, 0, data)
}

const insertBasicInformOnTable = (state) => {
  const { tableData, basicInform, productClassData } = state
  for (let i = 4; i < 7; i++) {
    const dataRow = tableData[i]
    // insert basic inform
    updateBasicInformData(dataRow)
  }

  // insert cost item
  productClassData.forEach((elem, index) => {
    tableData.splice(tableData.length - 1 - 2, 0, { column0: index + 1, column1: elem.productClass })
  })
  tableData[tableData.length - 1 - 2].column0 = productClassData.length + 1 // 運費項次
  tableData[tableData.length - 1 - 1].column0 = productClassData.length + 2 // 其他費用項次

  function updateBasicInformData (dataRow) {
    const getBasicInform = (label) => basicInform.find(elem => elem.label === label)
    Object.values(dataRow).forEach((elem, index) => {
      if (index % 2 !== 0) { // "column0" is not empty
        const stringWithoutSpace = elem.replace(/\s+/g, '')
        const stringWithoutColon = stringWithoutSpace.slice(0, stringWithoutSpace.length - 1)
        dataRow[`column${index + 1}`] = getBasicInform(stringWithoutColon) ? getBasicInform(stringWithoutColon).value : '待定'
      }
    })
  }
}

const deleteData = (state) => {
  const { tableData, checkboxStatus } = state
  const selectedDataId = Object.keys(checkboxStatus).filter(elem => checkboxStatus[elem])
  selectedDataId.forEach(id => {
    const productInformData = tableData.slice(8, tableData.length - 1)
    const dataIndex = productInformData.findIndex(elem => 'id' in elem && elem.id === id)
    tableData.splice(dataIndex + 1 + 7, 1) // dataIndex 補上 index 0 和 basic inform 的長度
    delete checkboxStatus[id]
  })
}

const resetBasicInformInput = (state) => {
  state.basicInform = [
    { name: 'projectCode', label: 'Project code', value: '' },
    { name: 'projectName', label: '工程名稱', value: '' },
    { name: 'date', label: '日期', value: '' },
    { name: 'taxIdNumber', label: '統編', value: '' },
    { name: 'client', label: '客戶名稱', value: '' },
    { name: 'contactPerson', label: '連絡人', value: '' },
    { name: 'clientPhoneNumber', label: '客戶電話', value: '' },
    { name: 'clientFaxNumber', label: '客戶傳真', value: '' }
  ]
  console.log('state.basicInform')
  console.log(state.basicInform)
}

const updateTableData = (state, value) => {
  state.tableData = value
}

const resetTableData = (state) => {
  state.tableData = [
    { column0: '瑋安企業有限公司' },
    { column0: '新北市五股區凌雲路3段18之10號' },
    { column0: 'Tel：02-8292-7060', column1: 'Fax：02-8292-7201' },
    { column0: '物  料  清  單' },
    { column0: '', column1: '客戶名稱：', column2: '', column3: '編        號：', column4: '' },
    { column0: '', column1: '工程名稱：', column2: '', column3: '日        期：', column4: '' },
    { column0: '', column1: '連  絡  人：', column2: '', column3: '客戶電話：', column4: '', column5: '客戶傳真：', column6: '' },
    { column0: '項 次', column1: '名  稱  內  容', column2: '規格', column3: '數  量', column4: '單位', column5: '單  價', column6: '複  價', column7: '備註', column8: '小  計' },
    { column0: '', column1: '運費' },
    { column0: '', column1: '其他費用' },
    { column0: '合計' }
  ]
}

const resetProductPrice = (state) => {
  state.productPrice = [
    { label: '產品名稱', value: '' },
    { label: '型號', value: '' },
    { label: '數量', value: '' },
    { label: '單位', value: '' },
    { label: '單價', value: '' },
    { label: '備註', value: '' }
  ]
}

const resetcost = (state) => {
  state.cost = [
    { label: '費用名稱', value: '' },
    { label: '規格', value: '' },
    { label: '數量', value: '' },
    { label: '單位', value: '' },
    { label: '單價', value: '' },
    { label: '備註', value: '' }
  ]
}

const updateValidityPeriod = (state, value) => {
  state.validityPeriod.value = value
}

const updateDeliveryTime = (state, value) => {
  state.deliveryTime.value = value
}

const updateSheetLabel = (state, value) => {
  state.tableData[3].column0 = value
}

const updateSerialNumber = (state, value) => {
  state.tableData[4].column4 = value
}

const resetStep = (state) => {
  state.step = 1
}

const updateSearchData = (state, value) => {
  state.searchData = value
}

const resetSearchData = (state) => {
  state.searchData = []
}

const updateBomMode = (state, value) => {
  state.bomMode = value
}

const updateProductClassInFrequentlyUsedPanelChanged = (state, value) => {
  state.productClassInFrequentlyUsedPanelChanged = value
}

export {
  modifyTab,
  addProductClass,
  updateProductClass,
  updateProductClassSelectedList,
  deleteProductClass,
  insertProductClassList,
  resetProductClass,
  resetProductClassSelected,
  updateFrequentlyUsedSelect,
  updateStep,
  updateBasicInform,
  insertBasicInformOnTable,
  insertProductInformOnTable,
  addCheckboxStatus,
  resetCheckboxStatus,
  updateCheckboxStatus,
  deleteData,
  resetBasicInformInput,
  updateTableData,
  resetTableData,
  resetProductPrice,
  resetcost,
  updateValidityPeriod,
  updateDeliveryTime,
  updateSheetLabel,
  updateSerialNumber,
  resetStep,
  updateSearchData,
  resetSearchData,
  updateBomMode,
  updateProductClassInFrequentlyUsedPanelChanged
}
