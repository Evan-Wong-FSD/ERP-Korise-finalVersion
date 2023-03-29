const ExcelJS = require('exceljs')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const workbook = new ExcelJS.Workbook()
const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/invoice.xlsx'

const materialsLists = []

;(async () => {
  await workbook.xlsx.readFile(filename)
  createMaterialsList()
  // console.log(materialsLists)
  MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
    try {
      await client.db('ERP').collection('materialsList').deleteMany({})
      await client.db('ERP').collection('materialsList').insertMany(materialsLists)
      client.close()
    } catch (err0) {
      client.close()
    }
  })
})()

function createMaterialsList () {
  const worksheet = workbook.getWorksheet('completedMaterialsListIn2022')
  const columnsRequired = [
    // '統編', '公司名稱', '產品名稱', '產品種類', '產品材質', '管材口徑', '型號', '日期', '進銷項', '單價', '數量', '折扣', '付款條件', '稅金', 'Project code', '備註', '複價'
    '統編', '公司名稱', '產品種類', '產品材質', '管材口徑', '型號', '日期', '進銷項', '單價', '數量', '折扣', '付款條件', '稅金', 'Project code', '備註', '複價'
  ]
  const columns = worksheet.getRow(1).values.filter(elem => elem && columnsRequired.includes(elem))
  const colNumberRequiredInWorksheet = columnsRequired.reduce((total, elem) => {
    const colNumber = worksheet.getRow(1).values.indexOf(elem)
    return Object.assign(total, Object.fromEntries([[colNumber, elem]]))
  }, {})
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const materialsList = columns.map(elem => [elem, null])
      row.eachCell((cell, colNumber) => {
        if (colNumber in colNumberRequiredInWorksheet && (typeof cell.value === 'string' || typeof cell.value === 'number')) { // excel無法真的把數字轉換為文字
          const columnIndex = columns.indexOf(colNumberRequiredInWorksheet[colNumber])
          materialsList[columnIndex][1] = String(cell.value)
        }
      })
      materialsLists.push(Object.fromEntries(materialsList))
    }
  })
}
