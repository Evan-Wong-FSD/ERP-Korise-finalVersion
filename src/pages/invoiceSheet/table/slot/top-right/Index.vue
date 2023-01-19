<template>
  <section class="row q-gutter-x-md">
    <Search />
    <Delete v-on="$listeners" />
  </section>
</template>

<script>
import Search from 'src/pages/invoiceSheet/table/slot/top-right/Search.vue'
import Delete from 'src/pages/invoiceSheet/table/slot/top-right/Delete.vue'
export default {
  components: {
    Search,
    Delete
  }
}
</script>
