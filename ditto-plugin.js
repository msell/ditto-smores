const withDitto = (config) => {
  if (!config.ios) {
    config.ios = {};
  }
  if (!config.ios.infoPlist) {
    config.ios.infoPlist = {};
  }

  config.ios.infoPlist['NSBluetoothAlwaysUsageDescription'] = 'Uses Bluetooth to connect and sync with nearby devices.';
  config.ios.infoPlist['NSLocalNetworkUsageDescription'] = 'Uses WiFi to connect and sync with nearby devices.';
  config.ios.infoPlist['NSBonjourServices'] = ['_http-alt._tcp.'];

  return config;
}

module.exports.withDitto = withDitto
