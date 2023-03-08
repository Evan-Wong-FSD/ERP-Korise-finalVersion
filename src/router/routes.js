const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: '登入',
        component: () => import('pages/Login/Login.vue')
      },
      {
        path: '/BOM表',
        name: 'BOM表',
        component: () => import('pages/bomTable/index.vue')
      },
      {
        path: '/進銷庫存記錄',
        name: '進銷庫存記錄',
        component: () => import('pages/invoiceRecord/Index.vue')
      },
      {
        path: '/進銷項表單',
        name: '進銷項表單',
        component: () => import('pages/invoiceSheet/Index.vue')
      },
      {
        path: '/物料清單2',
        name: '物料清單2',
        component: () => import('pages/materialsList2/Index.vue')
      },
      {
        path: '/材料資料',
        name: '材料資料',
        component: () => import('pages/materialsInform/materialsInformRecord.vue')
      },
      {
        path: '/廠商資料',
        name: '廠商資料',
        component: () => import('pages/firmInform/firmInformRecord.vue')
      },
      {
        path: '/產品種類',
        name: '產品種類',
        component: () => import('pages/ProductClassification/Index.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
