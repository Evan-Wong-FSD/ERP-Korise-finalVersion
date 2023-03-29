import { bomSheet } from 'boot/axios'

const updateSerialNumber = (context) => {
  bomSheet.post('/api/getSerialNumber').then((res) => {
    const { serialNumber } = res.data
    context.commit('updateSerialNumber', serialNumber)
  })
}

export {
  updateSerialNumber
}
