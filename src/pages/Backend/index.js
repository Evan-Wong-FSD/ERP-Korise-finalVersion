// import { bomSheetBackend } from './bomSheet-backend.js'
const bomSheetBackend = require('./bomSheet-backend.js')
// import { firmInformBackend } from './firmInform-backend.js'
const firmInformBackend = require('./firmInform-backend.js')
// import { invoiceRecordBackend } from './invoiceRecord-backend.js'
const invoiceRecordBackend = require('./invoiceRecord-backend.js')
// import { materialsInformBackend } from './materialsInform-backend.js'
const materialsInformBackend = require('./materialsInform-backend.js')
// import { materialsListBackend } from './materialsList-backend.js'
const materialsListBackend = require('./materialsList-backend.js')
// import { ProductClassification } from './ProductClassification-backend.js'
const ProductClassification = require('./ProductClassification-backend.js')
// import { login } from './login.js'
const login = require('./login.js')

bomSheetBackend()
firmInformBackend()
invoiceRecordBackend()
materialsInformBackend()
materialsListBackend()
ProductClassification()
login()
