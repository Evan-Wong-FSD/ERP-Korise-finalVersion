<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <materialsInformRecordHeader />
    <br>
    <materialsInformRecordBody v-if="menuSelected === '記錄'" />
    <materialsInformSheet v-if="menuSelected === '表單'" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import materialsInformRecordHeader from './materialsInformRecordHeader.vue'
import materialsInformRecordBody from './materialsInformRecordBody.vue'
import materialsInformSheet from './materialsInformSheet.vue'
export default {
  components: {
    materialsInformRecordHeader,
    materialsInformRecordBody,
    materialsInformSheet
  },
  computed: {
    ...mapState('materialsInform', ['menuSelected'])
  },
  beforeDestroy () {
    this.$root.$off('clearProductNameSerialNumber')
    this.$root.$off('deleteTableData')
    this.$root.$off('resetSelectedOnTable')
  }
}
</script>
