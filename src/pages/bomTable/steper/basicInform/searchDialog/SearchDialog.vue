<template>
  <div class="bg-grey-2 my-font-medium Wrap">
    <div class="row items-center bg-grey-2 q-pa-md">
      <strong style="font-size: 1.8em">物料搜尋</strong>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup @click="resetSearchData" />
    </div>

    <div class="row justify-between">
      <Form />

      <q-separator vertical inset />

      <SearchModeSheet @deleteSheet="deleteSheet" v-if="bomMode === 'search'" />
      <ViewModeSheet style="width: 69%;" class="q-pa-md" v-if="bomMode === 'view'" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { bomSheet } from 'boot/axios'
import Form from 'src/pages/bomTable/steper/basicInform/searchDialog/Form.vue'
import SearchModeSheet from 'src/pages/bomTable/steper/basicInform/searchDialog/Sheet.vue'
import ViewModeSheet from 'src/pages/bomTable/steper/table/sheet/Sheet.vue'
export default {
  components: {
    Form,
    SearchModeSheet,
    ViewModeSheet
  },
  computed: {
    ...mapState('bomTable', ['bomMode'])
  },
  mounted () {
    this.updateBomMode('search')
  },
  methods: {
    ...mapMutations('bomTable', {
      resetSearchData: 'resetSearchData',
      updateBomMode: 'updateBomMode',
      resetTableData: 'resetTableData'
    }),
    deleteSheet (selectedSheet) {
      bomSheet.post('/api/deleteBomData', { selectedSheet })
    }
  },
  beforeDestroy () {
    this.resetTableData()
  }
}
</script>

<style>
  .Wrap {
    width: 100%;
    max-width: 90vw !important;
  }
</style>
