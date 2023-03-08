import { numberWithCommas } from 'src/method/numberWithCommas.js'

export default function () {
  return {
    materialsInformRequested: [],
    materialsListData: [],
    // materialSelected: null,
    materialModelSelected: null,
    materialSelectedDetail: { 產品種類: null, 產品材質: null, 型號: null, 管材口徑: null },
    columns: [
      { name: 'id', label: '_id', field: 'id' },
      { name: 'date', label: '日期', field: 'date', sortable: true, sort: (a, b) => Date.parse(a.replace('/', '-')) - Date.parse(b.replace('/', '-')) },
      { name: 'trade', label: '進銷項', field: 'trade' },
      { name: 'taxIdNumber', label: '統編', field: 'taxIdNumber' },
      { name: 'firm', label: '公司名稱', field: 'firm' },
      // { name: 'unitPrice', label: '單價', field: 'unitPrice', format: val => `$${numberWithCommas(val)}`, sortable: true },
      { name: 'unitCost', label: '單價', field: 'unitCost', format: val => `$${numberWithCommas(val)}`, sortable: true },
      { name: 'amount', label: '數量', field: 'amount', format: val => numberWithCommas(val), sortable: true },
      { name: 'discount', label: '折扣', field: 'discount', format: val => `${val}折`, sortable: true },
      { name: 'itemCost', label: '複價', field: 'itemCost', format: val => `$${numberWithCommas(val)}`, sortable: true },
      // { name: 'paymentCondition', label: '付款條件', field: 'paymentCondition' },
      { name: 'paymentRequirement', label: '付款條件', field: 'paymentRequirement' },
      { name: 'hasTaxed', label: '稅金', field: 'hasTaxed' },
      { name: 'projectCode', label: 'Project code', field: 'projectCode' },
      { name: 'remark', label: '備註', field: 'remark' }
    ],
    tableTitle: null,
    tableSearch: {
      tradeSelect: { value: '全部', options: ['全部', '進項', '銷項'] },
      columnSelect: [
        { name: 'date', label: '日期', value: false, typeIn: null, onTypeIn: false },
        { name: 'trade', label: '進銷項', value: false, typeIn: null, onTypeIn: false },
        { name: 'taxIdNumber', label: '統編', value: false, typeIn: null, onTypeIn: false },
        { name: 'firm', label: '公司名稱', value: false, typeIn: null, onTypeIn: false },
        // { name: 'unitPrice', label: '單價', value: false, typeIn: null, onTypeIn: false },
        { name: 'unitCost', label: '單價', value: false, typeIn: null, onTypeIn: false },
        { name: 'amount', label: '數量', value: false, typeIn: null, onTypeIn: false },
        { name: 'discount', label: '折扣', value: false, typeIn: null, onTypeIn: false },
        { name: 'itemCost', label: '複價', value: false, typeIn: null, onTypeIn: false },
        // { name: 'paymentCondition', label: '付款條件', value: false, typeIn: null, onTypeIn: false },
        { name: 'paymentRequirement', label: '付款條件', value: false, typeIn: null, onTypeIn: false },
        { name: 'hasTaxed', label: '稅金', value: false, typeIn: null, onTypeIn: false },
        { name: 'projectCode', label: 'Project code', value: false, typeIn: null, onTypeIn: false },
        { name: 'remark', label: '備註', value: false, typeIn: null, onTypeIn: false }
      ]
    },
    // tableDataSelected: [],
    materialListSelected: [],
    dialogTableInputboxs: {
      date: { label: '日期', value: '' },
      // purchaseSalesOptions: { label: '進銷項', value: '', options: [{ name: 'purchase', label: '進項' }, { name: 'sales', label: '銷項' }] },
      // purchaseSalesOptions: { label: '進銷項', value: '', options: ['進項', '銷項'] },
      trade: { label: '進銷項', value: '', options: ['進項', '銷項'] },
      taxIdNumber: { label: '統編', value: '', options: [] },
      firm: { label: '公司名稱', value: '', options: [] },
      unitCost: { label: '單價', value: '' },
      discount: { label: '折扣', value: '' },
      amount: { label: '數量', value: '' },
      itemCost: { label: '複價', value: '' },
      paymentRequirement: { label: '付款條件', value: '' },
      // tax: { label: '稅金', value: '', options: [{ name: 'taxed', label: '含稅' }, { name: 'taxFree', label: '未稅' }] },
      // tax: { label: '稅金', value: '', options: ['含稅', '未稅'] },
      hasTaxed: { label: '稅金', value: '', options: ['含稅', '未稅'] },
      projectCode: { label: 'Project code', value: '' },
      remark: { label: '備註', value: '' }
    },
    treeSearchNodeSelect: [
      { name: 'productClass', label: '產品種類', value: false, typeIn: null, onTypeIn: false },
      { name: 'productSubclass', label: '產品材質', value: false, typeIn: null, onTypeIn: false },
      { name: 'caliber', label: '管材口徑', value: false, typeIn: null, onTypeIn: false },
      { name: 'model', label: '型號', value: false, typeIn: null, onTypeIn: false }
    ]
  }
}
