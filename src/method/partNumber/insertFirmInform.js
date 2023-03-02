const ExcelJS = require('exceljs')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const workbook = new ExcelJS.Workbook()
// const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/廠商資料.xlsx'
const filename = '/Volumes/ADATA UFD/卓面/瑋安企業/料號管理/classifyMaterialSerialNumbers/2021-2023發票資料/待補資料/廠商資料finished.xlsx'
const firmInforms = []
const contactPersonInforms = []

;(async () => {
  await workbook.xlsx.readFile(filename)
  createContactPersonInform()
  createFirmInform()
  if (firmInforms.length !== contactPersonInforms.length) return console.error("firmInforms' length !== contactPersonInforms' length")
  const document = contactPersonInforms.map((elem, index) => {
    return {
      contactPersonInform: elem,
      firmInform: firmInforms[index]
    }
  })
  // console.log(document)
  MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }, async function (err0, client) {
    try {
      await client.db('ERP').collection('firmInform').deleteMany({})
      await client.db('ERP').collection('firmInform').insertMany(document)
      client.close()
    } catch (err0) {
      client.close()
      console.log(err0)
    }
  })
})()

function createFirmInform () {
  const worksheet = workbook.getWorksheet('firmInform')
  const columns = worksheet.getRow(2).values.filter(elem => elem)
  const faxIndex = columns.indexOf('傳真國際區號'), telephoneIndex = columns.indexOf('電話國際區號')
  const columnsWithNumber = columns.reduce((total, elem, index) => {
    return Object.assign(total, Object.fromEntries([[index + 1, elem]]))
  }, {})
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      const firmInform = columns.map(elem => [elem, null])
      row.eachCell((cell, colNumber) => {
        const columnIndex = firmInform.findIndex(elem => elem[0] === columnsWithNumber[colNumber])
        firmInform[columnIndex][1] = String(cell.value)
      })
      const fax = ['傳真國際區號', Object.fromEntries(firmInform.slice(faxIndex, faxIndex + 2 + 1))]
      const telephone = ['電話國際區號', Object.fromEntries(firmInform.slice(telephoneIndex, telephoneIndex + 2 + 1))]
      firmInform.splice(faxIndex, 3, fax)
      firmInform.splice(telephoneIndex - 2, 3, telephone)
      firmInforms.push(Object.fromEntries(firmInform))
    }
  })
}

function createContactPersonInform () {
  const worksheet = workbook.getWorksheet('contactPersonInform')
  const columns = worksheet.getRow(2).values.filter(elem => elem && !['統編', '公司名稱'].includes(elem))
  const telephoneIndex = columns.indexOf('電話國際區號'), mobilePhoneIndex = columns.indexOf('手機國際區號')
  const columnsWithNumber = columns.reduce((total, elem, index) => {
    return Object.assign(total, Object.fromEntries([[index + 1, elem]]))
  }, {})
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      const contactPersonInform = columns.map(elem => [elem, null])
      row.eachCell((cell, colNumber) => {
        if (colNumber > 2) {
          const columnIndex = contactPersonInform.findIndex(elem => elem[0] === columnsWithNumber[colNumber - 2])
          contactPersonInform[columnIndex][1] = cell.value
        }
      })
      contactPersonInform.push(['blank', null])
      const telephone = ['聯絡人電話', Object.fromEntries(contactPersonInform.slice(telephoneIndex, telephoneIndex + 3 + 1))]
      const mobilePhone = ['聯絡人手機', Object.fromEntries(contactPersonInform.slice(mobilePhoneIndex, mobilePhoneIndex + 1 + 1))]
      contactPersonInform.splice(telephoneIndex, 4, telephone)
      contactPersonInform.splice(mobilePhoneIndex - 3, 2, mobilePhone)
      contactPersonInforms.push(Object.fromEntries(contactPersonInform))
    }
  })
}
