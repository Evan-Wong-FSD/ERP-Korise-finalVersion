export default function () {
  return {
    generalDataItemSelected: [],
    selectedPeriodName: '',
    searchItem: {
      customDate: [],
      accountingPeriod: { yearOfROC: '', months: '' },
      purchaseSalesSelected: { label: '全部', value: 'all' }
      // taxIdNumber: { label: '統編', value: '' },
      // firm: { label: '公司名稱', value: '' },
      // invoiceNumbers: { label: '發票號', value: '' },
      // productClass: { label: '產品種類', value: '' },
      // productName: { label: '產品名稱', value: '' },
      // model: { label: '型號', value: '' },
      // projectCode: { label: 'Project code', value: '' },
      // remark: { label: '備註 (選填)', value: '' }
    },
    generalTableData: [],
    invoiceDetaillTableData: []
  }
}
