<template>
  <q-tabs
    ripple
    align="justify"
    narrow-indicator
    class="shadow-2"
    :value="tab"
    @input="(value) => modifyTab(value)"
  >
    <q-tab name="frequentlyUsedPanel" label="常用清單" :class="frequentlyUsedPanelClass" />
    <q-tab name="customPanel" label="自訂類別" :class="customPanelClass" />
  </q-tabs>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('bomTable', ['tab']),
    frequentlyUsedPanelClass () {
      const backgroundColor = this.tab === 'frequentlyUsedPanel' ? 'bg-warning' : 'bg-mainColor'
      return `rounded-borders ${backgroundColor}`
    },
    customPanelClass () {
      const backgroundColor = this.tab === 'customPanel' ? 'bg-warning' : 'bg-mainColor'
      return `rounded-borders ${backgroundColor}`
    }
  },
  methods: {
    ...mapMutations('bomTable', { modifyTab: 'modifyTab' })
  }
}
</script>
