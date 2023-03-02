const ExcelJS = require('exceljs')
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient

const invoice = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/invoice.xlsx'
const partNumbersRecord = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/物料料號管理.xlsx'
const invoiceWorkbook = new ExcelJS.Workbook(), partNumbersRecordWorkbook = new ExcelJS.Workbook()

;(async () => {
  await invoiceWorkbook.xlsx.readFile(invoice)
  await partNumbersRecordWorkbook.xlsx.readFile(partNumbersRecord)
  const getMaterialClasses = (worksheet) => [...new Set(worksheet.getColumn(3).values.filter(elem => elem).slice(1))]
  const partNumbersRecordWorksheets = {
    pipe: partNumbersRecordWorkbook.getWorksheet('管材'),
    others: partNumbersRecordWorkbook.getWorksheet('其他')
  }
  const pipeMaterialClasses = getMaterialClasses(partNumbersRecordWorksheets.pipe)
  const exceptionalPipeKeywords = ['45度彎', '90度彎', '內外徑', '彎頭']
  const pipeKeywords = [...pipeMaterialClasses, ...exceptionalPipeKeywords]
  const otherMaterialSubClasses = getMaterialClasses(partNumbersRecordWorksheets.others)
  readInvoices(pipeKeywords, otherMaterialSubClasses, exceptionalPipeKeywords)
  await invoiceWorkbook.xlsx.writeFile('/Users/evan/Desktop/invoice.xlsx')
})()

function readInvoices (pipeKeywords, otherMaterialSubClasses, exceptionalPipeKeywords) {
  // const invoicesWorksheet = invoiceWorkbook.getWorksheet('errorWithFirmInformIn2022')
  const invoicesWorksheet = invoiceWorkbook.getWorksheet('errorWithoutFirmInformIn2022')
  const colNumbers = invoicesWorksheet.getRow(1).values.reduce((total, elem, index) => {
    return typeof elem === 'string' ? Object.assign(total, Object.fromEntries([[elem, index]])) : total
  }, {})
  invoicesWorksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const materialName = row.getCell(colNumbers.產品名稱).value
      const materialClass = row.getCell(colNumbers.產品種類), materialSubclass = row.getCell(colNumbers.產品材質), materialClassSerialNumber = row.getCell(colNumbers.產品種類流水號)
      const pipeKeyword = pipeKeywords.find(keyword => new RegExp(keyword).test(materialName))
      pipeKeyword
        ? updatePipeRow(materialClass, materialSubclass, pipeKeyword, exceptionalPipeKeywords, materialClassSerialNumber)
        : updateOthersRow(materialName, materialSubclass, otherMaterialSubClasses)
    }
  })
}

function updatePipeRow (materialClass, materialSubclass, pipeKeyword, exceptionalPipeKeywords, materialClassSerialNumber) {
  materialClass.value = '管材'
  materialClassSerialNumber.value = 'K000'
  materialSubclass.value = exceptionalPipeKeywords.includes(pipeKeyword) ? 'unknown' : pipeKeyword
}

function updateOthersRow (materialName, materialSubclass, otherMaterialSubClasses) {
  materialSubclass.value = otherMaterialSubClasses.find(keyword => new RegExp(keyword).test(materialName)) || 'null'
}
