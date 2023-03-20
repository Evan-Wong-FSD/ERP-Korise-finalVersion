<template>
  <section class="row justify-between">
    <Search v-on="$listeners" />
    <!-- <Control v-bind="$attrs" v-on="$listeners" /> -->
    <Control v-bind="$attrs" />
  </section>
</template>

<script>
import Search from 'src/pages/materialsInform/slot/top/search/Index.vue'
import Control from 'src/pages/materialsInform/slot/top/control/Index.vue'
export default {
  components: {
    Search,
    Control
  }
}
</script>

<style lang="scss" scope>

</style>
