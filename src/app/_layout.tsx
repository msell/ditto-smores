import { Text } from '@/components'
import { initI18n } from '@/i18n'
import { useInitialRootStore } from '@/models'
import { customFontsToLoad } from '@/theme'
import { loadDateFnsLocale } from '@/utils/formatDate'
import { useThemeProvider } from '@/utils/useAppTheme'
import { Ditto } from '@dittolive/ditto'
import { DittoProvider, useOnlinePlaygroundIdentity } from '@dittolive/react-ditto'
import { useFonts } from '@expo-google-fonts/space-grotesk'
import { Slot, SplashScreen } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require('src/devtools/ReactotronConfig.ts')
}

export { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'

// const createDittoInstance = () => {
//   const ditto = new Ditto({
//     type: "onlinePlayground",
//     appID: process.env.EXPO_PUBLIC_DITTO_APP_ID || "",
//     token: process.env.EXPO_PUBLIC_DITTO_PLAYGROUND_TOKEN || "",
//   });
//   ditto.startSync()
//   return ditto
// }

export default function Root() {
  // Wait for stores to load and render our layout inside of it so we have access
  // to auth info etc
  const { rehydrated } = useInitialRootStore()

  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const { themeScheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()
  const { create } = useOnlinePlaygroundIdentity()
  useEffect(() => {
    const initServices = async () => {
      await Promise.all([
        initI18n()
          .then(() => setIsI18nInitialized(true))
          .then(() => loadDateFnsLocale()),
      ])
    }

    initServices()
  }, [])

  const loaded = fontsLoaded && isI18nInitialized && rehydrated

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <KeyboardProvider>
        <DittoProvider
          setup={async () => {
            const ditto = new Ditto(
              create({
                appID: process.env.EXPO_PUBLIC_DITTO_APP_ID || '',
                token: process.env.EXPO_PUBLIC_DITTO_PLAYGROUND_TOKEN || '',
              }),
              'testing'
            )
            await ditto.disableSyncWithV3()
            ditto.startSync()
            return ditto
          }}
          /* initOptions={initOptions} */
        >
          {({ loading, error }) => {
            if (loading) return <View style={$container}><Text>Loading...</Text></View>
            if (error) {
              if(__DEV__){
                console.tron.error(error.message, error.stack)
              }
              return <View style={$container}><Text>{error.message}</Text></View>
            }
            return <Slot />
          }}
        </DittoProvider>
      </KeyboardProvider>
    </ThemeProvider>
  )
}
function createIdentity(): import('@dittolive/ditto').Identity | undefined {
  throw new Error('Function not implemented.')
}

const $container: ViewStyle = ({
  flex: 1,
  alignContent: 'center',
  justifyContent: 'center',
})