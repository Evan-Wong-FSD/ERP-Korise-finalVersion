const updateCustomDate = (state, value) => {
  state.selectedPeriodName = 'customDate'
  state.searchItem.customDate = value
}

const resetCustomDate = (state) => {
  state.selectedPeriodName = ''
  state.searchItem.customDate = []
}

const updateAccountingPeriod = (state, value) => {
  const { accountingPeriod } = state.searchItem
  const { yearOfROC, months } = value
  state.selectedPeriodName = 'accountingPeriod'
  Object.assign(accountingPeriod, { yearOfROC, months })
}

const resetAccountingPeriod = (state) => {
  state.selectedPeriodName = ''
  state.searchItem.accountingPeriod = { yearOfROC: '', months: '' }
}

const updatePurchaseSalesItemSelected = (state, value) => {
  state.searchItem.purchaseSalesSelected = value
}

const updateSearchItemSelected = (state, value) => {
  const { searchItem } = state
  const { searchTypeIn, searchItemSelected } = value
  for (const key in searchItem) {
    if (key !== 'customDate' && key !== 'accountingPeriod' && key !== 'purchaseSalesSelected') delete searchItem[key]
  }
  if (searchTypeIn) {
    searchItem[searchItemSelected.value] = {
      label: searchItemSelected.label,
      value: searchTypeIn
    }
  }
}

const updateGeneralTableData = (state, value) => {
  state.generalTableData = value
}

const resetGeneralTableData = (state) => {
  state.generalTableData = []
}

const deleteGeneralTableData = (state, value) => {
  const { generalTableData } = state, { generalDataItemSelected } = value
  generalDataItemSelected.forEach(item => {
    const itemIndex = generalTableData.findIndex(data => data.invoiceNumber === item.invoiceNumber)
    generalTableData.splice(itemIndex, 1)
  })
}

const updateGeneralDataItemSelected = (state, value) => {
  state.generalDataItemSelected = value
}

const resetGeneralDataItemSelected = (state, value) => {
  state.generalDataItemSelected.length = 0
}

const updateInvoiceDetaillTableData = (state, value) => {
  state.invoiceDetaillTableData = value
}

const deleteInvoiceDetaillTableData = (state, value) => {
  const { invoiceDetaillTableData } = state, { invoiceDetaillSelected } = value
  invoiceDetaillSelected.forEach(elem => {
    const dataIndex = invoiceDetaillTableData.indexOf(elem)
    invoiceDetaillTableData.splice(dataIndex, 1)
  })
}

const refreshInvoiceDetaillTableData = (state, value) => {
  const { invoiceDetaillTableData } = state
  const { _id, secondPage, invoiceDetaillTableColumns } = value, { 單價, 數量 } = secondPage
  const refreshItemIndex = invoiceDetaillTableData.findIndex(elem => elem._id === _id)
  invoiceDetaillTableData.splice(refreshItemIndex, 1, invoiceDetaillTableColumns.reduce((total, elem) => {
    const { name, label } = elem
    if (name === 'summary') return Object.assign(total, Object.fromEntries([[name, String(單價 * 數量)]]))
    return Object.assign(total, Object.fromEntries([[name, secondPage[label]]]))
  }, { _id }))
}

export {
  updateCustomDate,
  resetCustomDate,
  updateAccountingPeriod,
  resetAccountingPeriod,
  updatePurchaseSalesItemSelected,
  updateSearchItemSelected,
  updateGeneralTableData,
  resetGeneralTableData,
  deleteGeneralTableData,
  updateGeneralDataItemSelected,
  resetGeneralDataItemSelected,
  updateInvoiceDetaillTableData,
  deleteInvoiceDetaillTableData,
  refreshInvoiceDetaillTableData
}
