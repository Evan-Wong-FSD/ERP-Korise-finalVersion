<template>
  <section>
    <section class="row justify-between">
      <Search v-on="$listeners" />
      <Button />
    </section>

    <br>

    <Input v-on="$listeners" />
  </section>
</template>

<script>
import Search from 'src/pages/ProductClassification/table/slot/top/search/Index.vue'
import Button from 'src/pages/ProductClassification/table/slot/top/control/Button.vue'
import Input from 'src/pages/ProductClassification/table/slot/top/control/Input.vue'
export default {
  components: {
    Search,
    Button,
    Input
  }
}
</script>

<style lang="scss" scope>

</style>
