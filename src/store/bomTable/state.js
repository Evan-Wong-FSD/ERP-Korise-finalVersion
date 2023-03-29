import { v4 as uuidv4 } from 'uuid'

export default function () {
  return {
    basicInform: [
      { name: 'projectCode', label: 'Project code', value: '' },
      { name: 'projectName', label: '工程名稱', value: '' },
      { name: 'date', label: '日期', value: '' },
      { name: 'taxIdNumber', label: '統編', value: '' },
      { name: 'client', label: '客戶名稱', value: '' },
      { name: 'contactPerson', label: '連絡人', value: '' },
      { name: 'clientPhoneNumber', label: '客戶電話', value: '' },
      { name: 'clientFaxNumber', label: '客戶傳真', value: '' }
    ],
    productPrice: [
      { id: uuidv4(), name: 'productName', label: '產品名稱', value: '' },
      { id: uuidv4(), name: 'model', label: '型號', value: '' },
      { id: uuidv4(), name: 'amount', label: '數量', value: '' },
      { id: uuidv4(), name: 'unit', label: '單位', value: '' },
      { id: uuidv4(), name: 'unitCost', label: '單價', value: '' },
      { id: uuidv4(), name: 'remark', label: '備註', value: '' }
    ],
    cost: [
      { id: uuidv4(), name: 'costName', label: '費用名稱', value: '' },
      { id: uuidv4(), name: 'model', label: '規格', value: '' },
      { id: uuidv4(), name: 'amount', label: '數量', value: '' },
      { id: uuidv4(), name: 'unit', label: '單位', value: '' },
      { id: uuidv4(), name: 'unitCost', label: '單價', value: '' },
      { id: uuidv4(), name: 'remark', label: '備註', value: '' }
    ],
    tableData: [
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
    ],
    searchData: [],
    tab: 'frequentlyUsedPanel',
    productClassData: [],
    productClassSelected: [],
    frequentlyUsedSelect: '',
    step: 1,
    checkboxStatus: {},
    validityPeriod: { label: '有效期限 (天數)', value: 15 },
    deliveryTime: { label: '交貨期限 (天數)', value: 45 },
    bomMode: '',
    productClassInFrequentlyUsedPanelChanged: false
  }
}
