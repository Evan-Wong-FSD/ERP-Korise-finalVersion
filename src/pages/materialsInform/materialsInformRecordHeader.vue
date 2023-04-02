<template>
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">材料資料管理</h1>
        <div class="header-width header-underline"></div>
      </div>

      <q-btn-dropdown unelevated size="lg" color="mainColor" :ripple="false" :label="menuSelected" class="border-radius-btn-dropdown">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick(elem)" v-model="menuSelected" v-for="(elem, index) in menuOption" :key="index">
            <q-item-section>
              <q-item-label class="my-font-medium text-grey-10">{{elem}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      menuOption: ['記錄', '表單']
    }
  },
  computed: {
    ...mapState('materialsInform', ['menuSelected'])
  },
  methods: {
    ...mapMutations('materialsInform', {
      updateMenuSelected: 'updateMenuSelected'
    }),
    onItemClick (value) {
      this.updateMenuSelected(value)
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
