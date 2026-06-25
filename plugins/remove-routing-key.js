const { withInfoPlist } = require('@expo/config-plugins');

// Removes MKDirectionsApplicationSupportedModes from Info.plist.
// That key marks the app as a turn-by-turn navigation provider; Apple rejects
// it (ITMS-90118) unless a routing coverage file is uploaded. This app is not
// a routing app — the key is injected unintentionally during the iOS build.
module.exports = (config) =>
  withInfoPlist(config, (cfg) => {
    delete cfg.modResults['MKDirectionsApplicationSupportedModes'];
    return cfg;
  });
