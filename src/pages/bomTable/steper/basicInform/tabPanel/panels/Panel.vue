<template>
  <q-tab-panels
    :value="tab"
    animated
    transition-prev="scale"
    transition-next="scale"
    class="transparent text-center"
  >
    <q-tab-panel class="no-padding" name="frequentlyUsedPanel">
      <FrequentlyUsedPanel />
    </q-tab-panel>

    <q-tab-panel class="no-padding" name="customPanel">
      <!-- <div class="text-h6">customPanel</div>
      Ad molestiae non facere animi nobis, similique nemo velit reiciendis corporis impedit nam in. -->
      <CustomPanel />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script>
import { mapState } from 'vuex'
import FrequentlyUsedPanel from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/FrequentlyUsedPanel/FrequentlyUsedPanel.vue'
import CustomPanel from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/customPanel/CustomPanel.vue'
export default {
  components: {
    FrequentlyUsedPanel,
    CustomPanel
  },
  computed: {
    ...mapState('bomTable', ['tab'])
  }
}
</script>
