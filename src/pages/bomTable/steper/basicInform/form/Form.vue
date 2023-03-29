<template>
  <q-form class="q-gutter-y-md Form" ref="form" @reset="onReset">
    <div class="row justify-evenly q-gutter-y-md">
      <div v-for="(item, index) of inputBox" :key="index" class="basicInformInputBox">
        <q-select
          use-input
          hide-selected
          fill-input
          outlined
          clearable
          input-debounce="500"
          :label="item.label"
          :options="options"
          :readonly="Boolean(item.value)"
          @filter="(value, update, abort) => { fetchAndFilter(item.label, value, update, abort) }"
          @input="getBasicFirmInfrom(item.label, inputBox[index].value)"
          v-if="item.label === '統編' || item.label === '客戶名稱'"
          v-model="inputBox[index].value"
          :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                無結果
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          outlined
          clearable
          :label="item.label"
          @focus="() => {showCalendar = true}"
          @blur="() => {showCalendar = false}"
          v-else-if="item.label === '日期'"
          v-model="inputBox[index].value"
          :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        >
          <template v-slot:prepend>
            <q-icon name="event" />

            <q-popup-proxy v-model="showCalendar" transition-show="scale" transition-hide="scale">
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn label="確認" color="primary" flat @click="saveDate(proxyDate, index)" v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </template>
        </q-input>

        <q-input
          outlined
          clearable
          :label="item.label"
          :readonly="Boolean(item.value)"
          v-else-if="item.label !== 'Project code' && item.label !== '工程名稱'"
          v-model="inputBox[index].value"
          :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        />

        <q-input
          outlined
          clearable
          :label="item.label"
          v-else
          v-model="inputBox[index].value"
          :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        />
      </div>
    </div>
  </q-form>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { date } from 'quasar'
import { firmInformAPI } from 'boot/axios'
export default {
  data () {
    return {
      inputBox: [],
      options: [],
      showCalendar: false,
      proxyDate: this.initCurrentDate()
    }
  },
  computed: {
    ...mapState('bomTable', ['basicInform', 'productClassData'])
  },
  mounted () {
    this.initInputBox()
    this.submitBasicInformOnGlobalEventBus()
    this.resetBasicInformOnGlobalEventBus()
  },
  methods: {
    ...mapActions('bomTable', {
      updateSerialNumber: 'updateSerialNumber'
    }),
    ...mapMutations('bomTable', {
      updateStep: 'updateStep',
      updateBasicInform: 'updateBasicInform',
      insertBasicInformOnTable: 'insertBasicInformOnTable',
      resetBasicInformInput: 'resetBasicInformInput'
    }),
    initInputBox () {
      this.inputBox = []
      this.basicInform.slice().forEach(elem => {
        this.inputBox.push({ ...elem })
      })
    },
    onReset () {
      this.resetBasicInformInput()
      this.initInputBox()
    },
    fetchAndFilter (searchKey, inputValue, update, abort) {
      if (!inputValue || inputValue.length < 2) {
        abort()
      } else {
        searchKey = searchKey.replace(/客戶名稱/, '公司名稱')
        firmInformAPI.post('/api/filterFirmKeyInform', { searchKey, inputValue }).then((res) => {
          update(() => {
            const { arrResult } = res.data
            this.options = arrResult
          })
        })
      }
    },
    getBasicFirmInfrom (searchKey, searchValue) {
      if (searchValue) {
        searchKey = searchKey.replace(/客戶名稱/, '公司名稱')
        firmInformAPI.post('/api/getBasicFirmInfrom', { searchKey, searchValue }).then((res) => {
          const objResult = res.data
          this.inputBox.slice(3).forEach(elem => {
            elem.value = objResult[elem.label]
          })
          this.updateBasicInform(this.inputBox)
        })
      }
    },
    initCurrentDate () {
      const timeStamp = Date.now()
      const formattedDate = date.formatDate(timeStamp, 'YYYY/MM/DD')
      return formattedDate
    },
    submitBasicInformOnGlobalEventBus () {
      this.$root.$on('submitBasicInform', () => {
        const refForm = this.$refs.form
        if (refForm) {
          refForm.validate().then(success => {
            if (success) {
              if (this.productClassData.length > 0) {
                this.updateSerialNumber()
                this.updateBasicInform(this.inputBox)
                this.insertBasicInformOnTable(this.inputBox)
                this.updateStep(2)
              } else {
                this.$q.notify({
                  type: 'warning',
                  message: '"產品種類" 不得留空'
                })
              }
            }
          })
        }
      })
    },
    resetBasicInformOnGlobalEventBus () {
      this.$root.$on('resetBasicInformInputBox', () => {
        if (this.$refs.form) {
          this.$refs.form.reset()
        } else {
          this.onReset()
        }
        this.proxyDate = this.initCurrentDate()
      })
    },
    saveDate (proxyDate, index) {
      const timeStampDiffBetweenNowAndROC = 60305326602000
      const formattedDate = proxyDate.replace(/\//g, '-')
      this.inputBox[index].value = date.formatDate(Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC, 'YYYY/MM/DD')
    }
  }
}
</script>

<style lang="scss">
  .basicInformInputBox {
    width: 40%;
  }
</style>
