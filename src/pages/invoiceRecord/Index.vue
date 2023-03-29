<template>
  <section class="my-font-medium">
    <div class="row justify-between q-px-lg q-pt-lg">
      <header>
        <h1 class="text-h4 text-grey-10 text-center">進銷庫存記錄</h1>
        <div class="header-width header-underline"></div>
      </header>

      <nav>
        <q-btn-dropdown unelevated size="lg" color="mainColor" :ripple="false" :label="menuValue" class="border-radius-btn-dropdown">
          <q-list>
            <q-item clickable v-close-popup @click="menuValue = elem" v-model="menuValue" v-for="(elem, index) in menuOption" :key="index">
              <q-item-section>
                <q-item-label class="my-font-medium text-grey-10">{{elem}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </nav>
    </div>

    <br>

    <main class="Wrap">
      <PurchaseRecord v-if="menuValue === '進項'" />
      <SalesRecord v-if="menuValue === '銷項'" />
    </main>
  </section>
</template>

<script>
import PurchaseRecord from 'src/pages/invoiceRecord/purchaseRecord/Index.vue'
import SalesRecord from 'src/pages/invoiceRecord/salesRecord/Index.vue'
export default {
  components: {
    PurchaseRecord,
    SalesRecord
  },
  data () {
    return {
      menuValue: '進項',
      menuOption: ['進項', '銷項']
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';

  .Wrap {
    width: 90%;
    margin: 0 auto;
  }
</style>
