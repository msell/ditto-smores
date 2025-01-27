import { AndroidConfig, type ConfigPlugin, createRunOncePlugin, WarningAggregator } from '@expo/config-plugins'
import { withBluetoothPermissions } from './withBluetoothPermissions'
import { BackgroundMode, withBLEBackgroundModes } from './withBLEBackgroundModes'

const pkg = { name: 'ditto-plugin', version: 'UNVERSIONED' }

const withDitto: ConfigPlugin = (config) => {
  // iOS
  config = withBluetoothPermissions(config, { bluetoothAlwaysPermission: 'Allow $(PRODUCT_NAME) to connect to bluetooth devices' })
  config = withBLEBackgroundModes(config, [BackgroundMode.Central, BackgroundMode.Peripheral])

  // Android
  // config = AndroidConfig.Permissions.withPermissions(config, [
  //   'android.permission.BLUETOOTH',
  //   'android.permission.BLUETOOTH_ADMIN',
  //   'android.permission.BLUETOOTH_CONNECT' // since Android SDK 31
  // ])
  // config = withBLEAndroidManifest(config, {
  //   isBackgroundEnabled,
  //   neverForLocation
  // })
  return config
}

export default createRunOncePlugin(withDitto, 'withDitto', '1.0.0')
