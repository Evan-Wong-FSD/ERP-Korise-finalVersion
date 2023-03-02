import { bomSheetBackend } from './bomSheet-backend.js'
import { firmInformBackend } from './firmInform-backend.js'
import { invoiceRecordBackend } from './invoiceRecord-backend.js'
import { materialsInformBackend } from './materialsInform-backend.js'
import { materialsListBackend } from './materialsList-backend.js'
import { materialsListBackend2 } from './materialsList-backend2.js'
import { ProductClassification } from './ProductClassification-backend.js'
import { login } from './login.js'

bomSheetBackend()
firmInformBackend()
invoiceRecordBackend()
materialsInformBackend()
materialsListBackend()
materialsListBackend2()
ProductClassification()
login()