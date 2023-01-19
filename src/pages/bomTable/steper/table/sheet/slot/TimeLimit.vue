<template>
  <div class="row q-gutter-x-md no-margin no-wrap rightWrap">
    <q-input
      dense
      outlined
      type="number"
      :readonly="bomMode === 'view'"
      :label="validityPeriod.label"
      :value="validityPeriod.value"
      @input="(value) => { updateValidityPeriod(value) }"
    />

    <q-input
      dense
      outlined
      type="number"
      :readonly="bomMode === 'view'"
      :label="deliveryTime.label"
      :value="deliveryTime.value"
      @input="(value) => { updateDeliveryTime(value) }"
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('bomTable', ['validityPeriod', 'deliveryTime', 'bomMode'])
  },
  methods: {
    ...mapMutations('bomTable', {
      updateValidityPeriod: 'updateValidityPeriod',
      updateDeliveryTime: 'updateDeliveryTime'
    })
  }
}
</script>

<style lang="scss">
  .rightWrap {
    width: 50%;
  }
</style>
