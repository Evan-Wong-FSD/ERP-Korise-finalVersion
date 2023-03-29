export default function () {
  return {
    step: 1,
    inputsOnBaseOfPurchseRecord: {
      date: { label: '時間', value: '' },
      invoiceClass: { label: '發票種類', value: '', options: ['三聯式統一發票', '二聯式統一發票', '特種統一發票', '收銀機統一發票', '電子發票'] },
      invoiceNumber: { label: '發票號', value: '' },
      taxIdNumber: { label: '統編', value: '', options: [] },
      firm: { label: '公司名稱', value: '', options: [] },
      year: { label: '期年', value: '' },
      periodOfMonth: { label: '期數', value: '', options: ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12'] }
    },
    inputsOnDetailOfPurchseRecord: {
      productClass: { label: '產品種類', value: '', options: [] },
      productSubclass: { label: '產品材質', value: '', options: [] },
      productName: { label: '產品名稱', value: '', options: [] },
      model: { label: '型號', value: '', options: [] },
      amount: { label: '數量', value: '' },
      // unitPrice: { label: '單價', value: '', options: [] },
      unitPrice: { label: '單價', value: '' },
      projectCode: { label: 'Project code', value: '', options: [] },
      remark: { label: '備註(選填)', value: '' }
    },
    serialNumber: '',
    rawDataOfQuotation: [],
    inputsOnBaseOfSalesRecord: {
      date: { label: '時間', value: '' },
      invoiceClass: { label: '發票種類', value: '', options: ['三聯式統一發票', '二聯式統一發票', '特種統一發票', '收銀機統一發票', '電子發票'] },
      invoiceNumber: { label: '發票號', value: '' },
      year: { label: '期年', value: '' },
      periodOfMonth: { label: '期數', value: '', options: ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12'] }
    },
    salesInvoiceRecords: []
  }
}
