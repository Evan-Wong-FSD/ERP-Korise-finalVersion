const ExcelJS = require('exceljs')

const firmInform = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/廠商資料.xlsx'
const invoice = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/invoice.xlsx'
const firmInformWorkbook = new ExcelJS.Workbook(), invoiceWorkbook = new ExcelJS.Workbook()

fillFirmName()

async function fillFirmName () {
  await invoiceWorkbook.xlsx.readFile(invoice)
  const invoiceWorksheet = invoiceWorkbook.getWorksheet('invoicesWithoutFirmInformIn2022')
  const firmIdWithName = await getFirmIdWithName()
  invoiceWorksheet.eachRow((row, rowNumber) => {
    const taxIdNumber = row.getCell(12).value, firmName = row.getCell(13).value
    if (rowNumber > 1 && !firmName && (taxIdNumber in firmIdWithName)) {
      // console.log(taxIdNumber)
      // console.log(firmName)
      row.getCell(13).value = firmIdWithName[taxIdNumber]
    }
  })
  await invoiceWorkbook.xlsx.writeFile('/Users/evan/Desktop/invoice.xlsx')
  // console.log(invoiceWorksheet.getColumn(13).values)
  // console.log(invoiceWorksheet.getColumn(13).values.filter(elem => typeof elem !== 'string').length)
}

async function getFirmIdWithName () {
  await firmInformWorkbook.xlsx.readFile(firmInform)
  const firmInformWorksheet = firmInformWorkbook.getWorksheet('firmInform')
  const output = {}
  firmInformWorksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      const taxIdNumber = String(row.getCell(1).value).trim(), firmName = row.getCell(3).value.trim()
      output[taxIdNumber] = firmName
    }
  })
  return output
}
