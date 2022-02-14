import { dateZhCN, NConfigProvider, NDialogProvider, NMessageProvider, useDialog, useMessage, zhCN } from 'naive-ui'
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

const MyRouterView = defineComponent({
  setup() {
    window.$dialog = useDialog()
    window.$message = useMessage()

    return () => <RouterView />
  },
})

export default defineComponent({
  setup() {
    return () => (
      <NConfigProvider
        locale={zhCN}
        dateLocale={dateZhCN}
        themeOverrides={{
          common: {
            primaryColor: '#8C5AEE',
            primaryColorHover: '#AB80FF',
            primaryColorPressed: '#7537EE',
            primaryColorSuppl: '#B995FF',
            textColor1: '#1F2225FF',
            textColor2: '#333639FF',
            textColor3: '#9EA4AAFF',
          },
          Layout: {
            color: '#f5faff',
          },
          Card: {
            borderRadius: '8px',
            borderColor: 'none',
          },
          Dialog: {
            borderRadius: '8px',
          },
          Tag: {
            color: '#e8eaed',
            border: 'none',
            borderRadius: '4px',
            textColor: '#262626',
            padding: '0 8px',
            heightSmall: '18px',
            fontSizeSmall: '12px',
          },
        }}
      >
        <NMessageProvider>
          <NDialogProvider>
            <MyRouterView />
          </NDialogProvider>
        </NMessageProvider>
      </NConfigProvider>
    )
  },
})
