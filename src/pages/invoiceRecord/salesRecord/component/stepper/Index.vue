<template>
  <div>
    <q-stepper
      flat
      v-model="step"
      color="primary"
      animated
      class="stepper"
      v-if="serialNumber"
    >
      <q-step
        :name="1"
        title="發票基本資料"
        icon="assignment"
        :done="step > 1"
      >
        <Form />
      </q-step>

      <q-step
        :name="2"
        title="發票細項"
        icon="assignment"
      >
        <Quotation />
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Form from 'src/pages/invoiceRecord/salesRecord/component/stepper/Form.vue'
import Quotation from 'src/pages/invoiceRecord/salesRecord/component/stepper/Quotation.vue'
export default {
  components: {
    Form,
    Quotation
  },
  computed: {
    ...mapState('invoiceRecord', ['step', 'serialNumber'])
  }
}
</script>

<style lang="scss">
  .stepper {
    background: transparent;
  }
</style>
