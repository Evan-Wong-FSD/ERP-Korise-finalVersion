const ExcelJS = require('exceljs')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const workbook = new ExcelJS.Workbook()
const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/invoice.xlsx'

const invoiceRecords = []

;(async () => {
  await workbook.xlsx.readFile(filename)
  createInvoiceRecord()
  // console.log(invoiceRecords)
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
    try {
      await client.db('ERP').collection('invoiceRecord').deleteMany({})
      await client.db('ERP').collection('invoiceRecord').insertMany(invoiceRecords)
      client.close()
    } catch (err0) {
      client.close()
    }
  })
})()

function createInvoiceRecord () {
  const worksheet = workbook.getWorksheet('completedInvoicesIn2022')
  const columnsRequired = [
    '產品名稱', '單價', '數量', '複價', '備註', '發票號', '進銷項', '時間', '統編', '公司名稱', '期年', '期數', '發票種類', '產品材質', '產品種類', '型號', 'Project code', '稅金'
  ]
  const columns = worksheet.getRow(1).values.filter(elem => elem && columnsRequired.includes(elem))
  const colNumberRequiredInWorksheet = columnsRequired.reduce((total, elem) => {
    const colNumber = worksheet.getRow(1).values.indexOf(elem)
    return Object.assign(total, Object.fromEntries([[colNumber, elem]]))
  }, {})
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const invoiceRecord = columns.map(elem => [elem, null])
      row.eachCell((cell, colNumber) => {
        if (colNumber in colNumberRequiredInWorksheet && (typeof cell.value === 'string' || typeof cell.value === 'number')) {
          const columnIndex = columns.indexOf(colNumberRequiredInWorksheet[colNumber])
          invoiceRecord[columnIndex][1] = String(cell.value)
        }
      })
      invoiceRecords.push(Object.fromEntries(invoiceRecord))
    }
  })
}