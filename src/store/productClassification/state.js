export default function () {
  return {
    searchOptionClicked: '',
    searchingColumns: [
      { name: 'taxIdNumber', label: '統編', selected: false, typeIn: '' },
      { name: 'firm', label: '公司名稱', selected: false, typeIn: '' },
      { name: 'productClass', label: '產品種類', selected: false, typeIn: '' },
      { name: 'productPartNumber', label: '種類料號', selected: false, typeIn: '' },
      { name: 'productSubclass', label: '產品材質', selected: false, typeIn: '' },
      { name: 'productSubclassPartNumber', label: '材質料號', selected: false, typeIn: '' }
    ],
    controlInputs: [
      { name: 'taxIdNumber', label: '統編', options: [], value: null },
      { name: 'firm', label: '公司名稱', options: [], value: null },
      { name: 'productClass', label: '產品種類', options: [], value: null },
      { name: 'productPartNumber', label: '種類料號', options: [], value: null },
      { name: 'productSubclass', label: '產品材質', options: [], value: null },
      { name: 'productSubclassPartNumber', label: '材質料號', options: [], value: null }
    ],
    tableData: [],
    tableDataSelected: []
  }
}
