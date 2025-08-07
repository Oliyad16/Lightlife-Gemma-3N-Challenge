import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifelight.medication.gemma3n',
  appName: 'LifeLight Gemma 3N',
  webDir: 'out',
  // bundledWebRuntime: false, // Removed as it's not a valid property
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FBD24D",
      androidSplashResourceName: "splash",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: "#FBD24D",
      style: "dark"
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    Haptics: {
      enabled: true
    },
    LocalNotifications: {
      iconColor: "#FBD24D",
      sound: "default"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: "LifeLightGemma3N/1.0.0",
    loggingBehavior: "none",
    useLegacyBridge: false,
    includePlugins: [
      "GemmaAI"
    ]
  }
};

export default config;