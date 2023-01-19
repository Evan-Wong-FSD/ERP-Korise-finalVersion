<template>
  <section class="Wrap bg-grey-1">
    <q-form ref="form" @reset="onReset" @submit="onSubmit">
      <div class="row justify-between q-gutter-y-md">
        <div v-for="(elem, name) of inputBox" :key="name" class="inputBox">
          <q-select
            outlined
            v-model="elem.value"
            :options="elem.options"
            :label="elem.label"
            v-if="name === 'material'"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          />

          <q-select
            outlined
            use-input
            input-debounce="1000"
            v-model="elem.value"
            :options="elem.options"
            :label="elem.label"
            v-else-if="name === 'taxIdNumber' || name === 'firm'"
            @filter="(value, update, abort) => { fetchAndFilterOptions( elem.label, value.trim(), update, abort) }"
            @input="(value) => { firmInformInput(name, elem.label, value) }"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  無結果
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            outlined
            v-model="elem.value"
            :options="elem.options"
            :label="elem.label"
            v-else-if="name === 'materialClass' || name === 'materialSubclass'"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          />

          <q-select
            outlined
            :use-input="inputBox.materialClass.value !== '管材'"
            v-model="elem.value"
            :options="elem.options"
            :label="elem.label"
            v-else-if="name === 'partNumber'"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          >
            <template v-slot:no-option>
              <q-item v-if="inputBox.materialClass.value === '其他'">
                <q-item-section class="text-grey">
                  無結果
                </q-item-section>
              </q-item>

              <q-item class="bg-grey-1"  v-else-if="inputBox.materialClass.value === '管材'">
                <q-item-section>
                  <section class="row justify-end q-gutter-x-sm">
                    <q-btn
                      dense
                      :label="elem.label"
                      class="text-bold"
                      @click="togglePartNumberTooltips(index)"
                      :color="elem.name === 'delete' ? 'negative' : 'grey-3'"
                      :text-color="elem.name === 'delete' ? 'grey-1' : 'black'"
                      v-for="(elem, index) in partNumberTooltips"
                      :key="index"
                    >
                      <section v-show="partNumberTooltips[index].visibility" class="partNumberTooltipPointedTop ">
                        <q-menu persistent :value="partNumberTooltips[index].visibility" content-class="bg-cyan-3" anchor="bottom middle" self="top middle">
                          <q-item>
                            <q-item-section>
                              <section class="row q-gutter-x-sm">
                                <q-btn dense color="grey-3" text-color="black" label="確認" class="text-bold" @click="partNumberTooltips[index].visibility = false" />
                                <q-btn dense color="warning" text-color="grey-1" label="取消" class="text-bold" @click="partNumberTooltips[index].visibility = false" />
                              </section>
                            </q-item-section>
                          </q-item>
                        </q-menu>
                      </section>
                    </q-btn>
                  </section>

                  <br />

                  <section class="row justify-between">
                    <q-select dense outlined label="口徑" class="input-tubeBore" />
                    <q-select dense outlined label="物料名稱" class="input-materialName" />
                  </section>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            outlined
            v-model="elem.value"
            :label="elem.label"
            v-else-if="name === 'model' || name === 'description' || name === 'specification' || name === 'characteristic'"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          />

          <q-input
            outlined
            v-model="elem.value"
            :label="elem.label"
            v-else
            :rules="[val => []]"
          />
        </div>
      </div>

      <br>

      <div class="row justify-end q-gutter-x-lg text-grey-10 bottle-btn-position no-margin">
        <div class="column items-center">
          <q-btn
            size="lg"
            color="white"
            text-color="grey-10"
            label="上傳"
            class="border-radius-btn relative-position"
            @click="emitUploader"
          />

          <q-chip
            v-if="uploadedFileChip"
            removable color="primary"
            text-color="white"
            icon="upload"
            class="absolute no-margin uploadedFileChip"
            @remove="removeUploadFile"
          >
            {{$refs.uploader.files[0].name}}
          </q-chip>
        </div>

        <q-uploader
          ref="uploader"
          accept=".pdf"
          v-show="false"
          :url="uploadUrl"
          :multiple="false"
          @added ="addUploadFile"
          @uploaded="uploadFinished('positive', '上傳完成')"
          @failed ="uploadFinished('negative', '上傳失敗')"
        />

        <q-btn
          type="reset"
          size="lg"
          color="white"
          text-color="grey-10"
          label="重設"
          class="border-radius-btn"
        />

        <q-btn
          type="submit"
          size="lg"
          color="btn-confirm-color"
          text-color="grey-10"
          label="確定"
          class="border-radius-btn"
        />
      </div>
    </q-form>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
export default {
  data () {
    return {
      inputBox: {},
      uploadedFileChip: false,
      partNumberTooltips: [
        {
          name: 'create',
          label: '新增',
          visibility: false
        },
        {
          name: 'update',
          label: '更新',
          visibility: false
        },
        {
          name: 'delete',
          label: '刪除',
          visibility: false
        }
      ]
    }
  },
  computed: {
    ...mapState('materialsInform', ['materialsInform', 'selectedId']),
    uploadUrl () {
      return `http://192.168.0.189:3003/api/upload?partNumber=${this.inputBox.partNumber.value}`
    }
  },
  beforeMount () {
    this.initInputBox()
  },
  methods: {
    ...mapMutations('materialsInform', {
      resetMaterialsInform: 'resetMaterialsInform'
    }),
    initInputBox () {
      this.inputBox = JSON.parse(JSON.stringify(this.materialsInform))
    },
    fetchAndFilterOptions (label, typeIn, update, abort) {
      if (typeIn.length < 3) {
        abort()
        return
      }
      materialsInformtAPI.post('/api/getFirmInformOptions', { label, typeIn }).then(res => {
        update(() => {
          const { taxIdNumber, firm } = this.inputBox
          const { taxIdNumberOptions, firmOptions } = res.data
          taxIdNumber.options = taxIdNumberOptions
          firm.options = firmOptions
        })
      })
    },
    firmInformInput (name, label, input) {
      const { taxIdNumber, firm, material } = this.inputBox
      const selectedIndexInOptions = this.inputBox[name].options.indexOf(input)
      name = name === 'taxIdNumber' ? 'firm' : 'taxIdNumber'
      label = label === '統編' ? '公司名稱' : '統編'
      this.inputBox[name].value = this.inputBox[name].options[selectedIndexInOptions]
      materialsInformtAPI.post('/api/getMaterialOptions', { taxIdNumber, firm }).then(res => {
        material.options = res.data.materialOptions
      })
    },
    onReset () {
      for (const name in this.inputBox) {
        this.inputBox[name].value = ''
        if ('options' in this.inputBox[name]) {
          const { options } = this.inputBox[name]
          options.splice(0, options.length)
        }
      }
      this.removeUploadFile()
    },
    onSubmit () {
      if (this.selectedId) {
        materialsInformtAPI.post('/api/updateMaterialsInform', { _id: this.selectedId, materialsInformInput: this.inputBox }).then(() => {
          this.resetMaterialsInform()
          this.$emit('updated')
        })
      } else {
        if (this.$refs.uploader.files.length === 1) {
          materialsInformtAPI.post('/api/saveMaterialsInform', { materialsInformInput: this.inputBox }).then(res => {
            this.$refs.uploader.upload()
            this.$q.notify({
              type: res.data.success ? 'positive' : 'negative',
              message: res.data.message
            })
          })
        } else {
          this.$q.notify({
            type: 'warning',
            message: '請先上傳檔案'
          })
        }
      }
    },
    emitUploader () {
      this.$refs.form.validate().then(success => {
        if (success) {
          if (this.$refs.uploader.files.length === 0) {
            this.$refs.uploader.pickFiles()
          } else {
            this.$q.notify({
              type: 'warning',
              message: '只可上傳一個檔案'
            })
          }
        }
      })
    },
    uploadFinished (type, message) {
      if (type === 'positive') {
        this.$refs.form.reset()
      }
      this.$q.notify({ type, message })
    },
    removeUploadFile () {
      this.uploadedFileChip = false
      this.$refs.uploader.reset()
    },
    addUploadFile () {
      this.uploadedFileChip = true
    },
    togglePartNumberTooltips (targetIndex) {
      this.partNumberTooltips.forEach((elem, index) => {
        elem.visibility = index === targetIndex ? !elem.visibility : false
      })
    }
  }
}
</script>

<style lang="scss">
  .Wrap {
    width: 90%;
    margin: 0 auto;
  }

  .inputBox {
    width: 48%;
  }

  .uploadedFileChip {
    bottom: 0;
    transform: translateY(130%);
  }

  .input-tubeBore {
    width: 48%;
  }
  .input-materialName {
    width: 48%;
  }

  .partNumberTooltipPointedTop {
    position: absolute;
    top: 50%;
  }
  .partNumberTooltipPointedTop::after {
    content: "";
    top: 100%;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #80deea transparent;
  }
</style>
