export default function () {
  return {
    searchOptionClicked: '',
    searchingColumns: [
      { name: 'taxIdNumber', label: '統編', selected: false, typeIn: '' },
      { name: 'firm', label: '公司名稱', selected: false, typeIn: '' },
      { name: 'productClass', label: '產品種類', selected: false, typeIn: '' },
      { name: 'productClassCode', label: '種類料號', selected: false, typeIn: '' },
      { name: 'productSubclass', label: '產品材質', selected: false, typeIn: '' },
      { name: 'productSubclassCode', label: '材質料號', selected: false, typeIn: '' }
    ],
    controlInputs: [
      { name: 'taxIdNumber', label: '統編', options: [], value: null },
      { name: 'firm', label: '公司名稱', options: [], value: null },
      { name: 'productClass', label: '產品種類', options: [], value: null },
      { name: 'productClassCode', label: '種類料號', options: [], value: null },
      { name: 'productSubclass', label: '產品材質', options: [], value: null },
      { name: 'productSubclassCode', label: '材質料號', options: [], value: null }
    ],
    tableData: [],
    tableDataSelected: []
  }
}
