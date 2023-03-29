const ExcelJS = require('exceljs')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const workbook = new ExcelJS.Workbook()
const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/產品種類.xlsx'
// const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/待補資料/產品種類-1.xlsx'

const ProductClassifications = []

;(async () => {
  await workbook.xlsx.readFile(filename)
  createProductClassification()
  // console.log(ProductClassifications)
  MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
    try {
      // await client.db('ERP').collection('ProductClassification').deleteMany({})
      await client.db('ERP').collection('ProductClassification').insertMany(ProductClassifications)
      client.close()
    } catch (err0) {
      client.close()
      console.log(err0)
    }
  })
})()

function createProductClassification () {
  const worksheet = workbook.getWorksheet('productClassification')
  const columns = worksheet.getRow(1).values.filter(elem => elem)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
    let ProductClassification = columns.map(elem => [elem, null])
    row.eachCell((cell, colNumber) => {
      if ((typeof cell.value === 'string' || typeof cell.value === 'number')) {
        ProductClassification[colNumber - 1][1] = cell.value
      }
    })
    ProductClassification = ProductClassification.filter(elem => elem[0] !== '品名')
    ProductClassifications.push(Object.fromEntries(ProductClassification))
    }
  })
}
