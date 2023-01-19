<template>
  <section>
    <q-stepper
      flat
      v-model="step"
      color="primary"
      animated
      class="bg-grey-1"
    >
      <q-step
        :name="1"
        title="發票基本資料"
        icon="assignment"
        :done="step > 1"
      >
        <Base />
      </q-step>

      <q-step
        :name="2"
        title="發票細項"
        icon="assignment"
      >
        <Detail />
      </q-step>
    </q-stepper>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Base from 'src/pages/invoiceRecord/purchaseRecord/step/Base.vue'
import Detail from 'src/pages/invoiceRecord/purchaseRecord/step/Detail.vue'
export default {
  components: {
    Base,
    Detail
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState('invoiceRecord', ['step'])
  },
  beforeMount () {
    this.initState()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      resetStep: 'resetStep',
      resetInputsOnBaseOfPurchseRecord: 'resetInputsOnBaseOfPurchseRecord',
      resetInputsOnDetailOfPurchseRecord: 'resetInputsOnDetailOfPurchseRecord',
      initState: 'initState'
    })
  },
  beforeDestroy () {
    this.resetStep()
    this.resetInputsOnBaseOfPurchseRecord()
    this.resetInputsOnDetailOfPurchseRecord()
  }
}
</script>
