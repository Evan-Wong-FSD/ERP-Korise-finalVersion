<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <!-- <materialsInformRecordHeader @select="switchOption" /> -->
    <materialsInformRecordHeader />
    <br>
    <!-- <materialsInformRecordBody v-if="select === '記錄'" /> -->
    <materialsInformRecordBody2 v-if="menuSelected === '記錄'" />
    <!-- <materialsInformSheet v-if="select === '表單'" /> -->
    <materialsInformSheet2 v-if="menuSelected === '表單'" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import materialsInformRecordHeader from './materialsInformRecordHeader.vue'
// import materialsInformRecordBody from './materialsInformRecordBody.vue'
import materialsInformRecordBody2 from './materialsInformRecordBody2.vue'
// import materialsInformSheet from './materialsInformSheet.vue'
import materialsInformSheet2 from './materialsInformSheet2.vue'
export default {
  components: {
    materialsInformRecordHeader,
    // materialsInformRecordBody,
    materialsInformRecordBody2,
    // materialsInformSheet
    materialsInformSheet2
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
