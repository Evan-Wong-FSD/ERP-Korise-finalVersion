const ExcelJS = require('exceljs')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const workbook = new ExcelJS.Workbook()
// const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/7-8月/七八月發票分類.xlsx'
const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/invoice.xlsx'

const materialsInforms = []

;(async () => {
  await workbook.xlsx.readFile(filename)
  createProductClassification()
  // console.log(materialsInforms)
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, async function (err0, client) {
    try {
      await client.db('ERP').collection('materialsInform').deleteMany({})
      await client.db('ERP').collection('materialsInform').insertMany(materialsInforms)
      client.close()
    } catch (err0) {
      client.close()
    }
  })
})()

// function createProductClassification () {
//   const worksheet = workbook.getWorksheet('conclusion')
//   const columns = worksheet.getRow(1).values.filter(elem => elem)
//   columns.push('電壓', '電流', '頻率', '輸出功率')
//   worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber > 1) {
//     const materialsInform = columns.map(elem => [elem, null])
//     row.eachCell((cell, colNumber) => {
//       if (typeof cell.value === 'string') {
//         materialsInform[colNumber - 1][1] = cell.value
//       }
//     })
//     materialsInforms.push(Object.fromEntries(materialsInform))
//     }
//   })
// }

function createProductClassification () {
  const worksheet = workbook.getWorksheet('completedMaterialsInformIn2022')
  const columnsRequired = [
    '統編', '公司名稱', '產品種類', '產品種類流水號', '產品材質', '產品材質流水號', '產品名稱', '產品名稱流水號', '管材口徑', '管材口徑流水號', '管材名稱', '管材名稱流水號', '產品料號', '型號', '描述', '規格', '特性'
  ]
  const columns = worksheet.getRow(1).values.filter(elem => elem && columnsRequired.includes(elem))
  columns.push('電壓', '電流', '頻率', '輸出功率')
  const colNumberRequiredInWorksheet = columnsRequired.reduce((total, elem) => {
    const colNumber = worksheet.getRow(1).values.indexOf(elem)
    return Object.assign(total, Object.fromEntries([[colNumber, elem]]))
  }, {})
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const materialsInform = columns.map(elem => [elem, null])
      row.eachCell((cell, colNumber) => {
        if (colNumber in colNumberRequiredInWorksheet && typeof cell.value === 'string') {
          const columnIndex = columns.indexOf(colNumberRequiredInWorksheet[colNumber])
          materialsInform[columnIndex][1] = cell.value
        }
      })
      materialsInforms.push(Object.fromEntries(materialsInform))
    }
  })
}
