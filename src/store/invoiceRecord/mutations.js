const updateStep = (state, value) => {
  state.step = value
}

const resetStep = (state) => {
  state.step = 1
}

const updateInputsOnBaseOfPurchseRecord = (state, value) => {
  state.inputsOnBaseOfPurchseRecord = JSON.parse(JSON.stringify(value))
}

const resetInputsOnBaseOfPurchseRecord = (state) => {
  state.inputsOnBaseOfPurchseRecord = {
    date: { label: '時間', value: '' },
    invoiceClass: { label: '發票種類', value: '', options: ['三聯式統一發票', '二聯式統一發票', '特種統一發票', '收銀機統一發票', '電子發票'] },
    invoiceNumber: { label: '發票號', value: '' },
    taxIdNumber: { label: '統編', value: '', options: [] },
    firm: { label: '公司名稱', value: '', options: [] },
    year: { label: '期年', value: '' },
    periodOfMonth: { label: '期數', value: '', options: ['1-2月', '3-4月', '5-6月', '7-8月', '9-10月', '11-12月'] }
  }
}

const updateInputsOnDetailOfPurchseRecord = (state, value) => {
  state.inputsOnDetailOfPurchseRecord = value
}

const resetInputsOnDetailOfPurchseRecord = (state) => {
  state.inputsOnDetailOfPurchseRecord = {
    productName: { label: '產品名稱', value: '', options: [] },
    model: { label: '型號', value: '', options: [] },
    amount: { label: '數量', value: '' },
    unitPrice: { label: '單價', value: '', options: [] },
    projectCode: { label: 'Project code', value: '', options: [] },
    remark: { label: '備註(選填)', value: '' }
  }
}

const updateProductNameOptions = (state, value) => {
  state.inputsOnDetailOfPurchseRecord.productName.options = value
}

const updateSerialNumber = (state, value) => {
  state.serialNumber = value
}

const resetSerialNumberValue = (state) => {
  state.serialNumber = ''
}

const updateQuotationRawData = (state, value) => {
  state.rawDataOfQuotation = value
}

const resetQuotationRawData = (state, value) => {
  state.rawDataOfQuotation.length = 0
}

const updateInputsOnBaseOfSalesRecord = (state, value) => {
  state.inputsOnBaseOfSalesRecord = value
}

const resetInputsOnBaseOfSalesRecord = (state) => {
  state.inputsOnBaseOfSalesRecord = {
    date: { label: '時間', value: '' },
    invoiceClass: { label: '發票種類', value: '', options: ['三聯式統一發票', '二聯式統一發票', '特種統一發票', '收銀機統一發票', '電子發票'] },
    invoiceNumber: { label: '發票號', value: '' },
    year: { label: '期年', value: '' },
    periodOfMonth: { label: '期數', value: '', options: ['1-2月', '3-4月', '5-6月', '7-8月', '9-10月', '11-12月'] }
  }
}

const insertSalesInvoiceRecords = (state, value) => {
  state.salesInvoiceRecords = value
}

const initState = (state) => {
  resetStep(state)
  resetInputsOnBaseOfPurchseRecord(state)
  resetInputsOnDetailOfPurchseRecord(state)
  resetSerialNumberValue(state)
  resetQuotationRawData(state)
  resetInputsOnBaseOfSalesRecord(state)
}

const destroyState = (state) => {
  for (const key in state) {
    if (Array.isArray(state[key])) {
      state[key].length = 0
    } else if (typeof state[key] === 'object') {
      state[key] = null
    }
  }
}

export {
  updateStep,
  resetStep,
  updateInputsOnBaseOfPurchseRecord,
  resetInputsOnBaseOfPurchseRecord,
  updateInputsOnDetailOfPurchseRecord,
  resetInputsOnDetailOfPurchseRecord,
  updateProductNameOptions,
  updateSerialNumber,
  resetSerialNumberValue,
  updateQuotationRawData,
  resetQuotationRawData,
  updateInputsOnBaseOfSalesRecord,
  resetInputsOnBaseOfSalesRecord,
  insertSalesInvoiceRecords,
  initState,
  destroyState
}
