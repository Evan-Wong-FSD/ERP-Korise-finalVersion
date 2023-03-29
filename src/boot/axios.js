import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios
// ^ ^ ^ this will allow you to use this.$axios
//       so you won't necessarily have to import axios in each vue file

const firmInformAPI = axios.create({ baseURL: 'http://localhost:3001/' })
const ProductClassificationAPI = axios.create({ baseURL: 'http://localhost:3008/' })
const materialsInformtAPI = axios.create({ baseURL: 'http://localhost:3003/' })
const materialsListAPI2 = axios.create({ baseURL: 'http://localhost:3009/' })
const invoiceSheetAPI = axios.create({ baseURL: 'http://localhost:3005/' })
const bomSheet = axios.create({ baseURL: 'http://localhost:3006/' })
const login = axios.create({ baseURL: 'http://localhost:3007/' })

// Vue.prototype.$api = api
// ^ ^ ^ this will allow you to use this.$api
//       so you can easily perform requests against your app's API

export {
  axios,
  materialsInformtAPI,
  invoiceSheetAPI,
  firmInformAPI,
  bomSheet,
  login,
  ProductClassificationAPI,
  materialsListAPI2
}
