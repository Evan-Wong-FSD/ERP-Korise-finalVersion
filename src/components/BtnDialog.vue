<template>
  <q-dialog ref="dialog" v-model="dialogProps.open" persistent class="my-font-medium bg-grey-2" @hide="onHide">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar
          :ref="`dialog-icon-${dialogProps.icon.name}`"
          :icon="dialogProps.icon.name"
          :color="dialogProps.icon.color"
          :text-color="dialogProps.icon.textColor"
        />
        <span
          :ref="`dialog-message-${dialogProps.name}`"
          class="q-ml-sm text-bold text-grey-9"
          style="font-size: 1.2em;"
          v-html="dialogProps.message"
        />
      </q-card-section>

      <q-card-actions :align="dialogProps.buttonAlign" class="text-bold">
        <q-btn
          ref="dialog-leftButton"
          :label="dialogProps.leftButton.label"
          :color="dialogProps.leftButton.color"
          @click="dialogProps.leftButtonOnClick ? dialogProps.leftButtonOnClick() : $refs.dialog.hide()"
        />

        <q-btn
          ref="dialog-rightButton"
          flat
          :label="dialogProps.rightButton.label"
          :color="dialogProps.rightButton.color"
          @click="dialogProps.rightButtonOnClick ? dialogProps.rightButtonOnClick() : $refs.dialog.hide()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: ['dialogProps'],
  mounted () {
    this.$emit('initDialogPrototype', this.$refs)
  },
  methods: {
    onHide () {
      this.$emit('initDialogProps')
    }
  }
}
</script>
