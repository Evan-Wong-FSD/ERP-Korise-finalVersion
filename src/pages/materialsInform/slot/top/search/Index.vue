<template>
    <section class="row justify-between no-wrap q-gutter-x-md Wrap-search">
      <Select v-on="$listeners" />
      <Input v-on="$listeners" />
    </section>
  </template>
<script>
import Select from 'src/pages/materialsInform/slot/top/search/Select.vue'
import Input from 'src/pages/materialsInform/slot/top/search/Input.vue'
export default {
  components: {
    Select,
    Input
  }
}
</script>

<style lang="scss" scope>
  .Wrap-search {
    width: 30%;
  }
</style>
