import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

/** True when the web app runs inside the native Android/iOS shell. */
export const isNative = Capacitor.isNativePlatform()

/**
 * Style the native chrome to match the ASCEND abyss theme.
 * Called once at startup; safe no-op on the web.
 */
export async function initNativeChrome(): Promise<void> {
  if (!isNative) return
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    // Android 15+ enforces edge-to-edge; older versions accept the color.
    await StatusBar.setBackgroundColor({ color: '#04060d' })
  } catch {
    // Non-fatal — worst case the status bar keeps its default look.
  }
}

/** Fade out the native splash once the web app has mounted. */
export function hideNativeSplash(): void {
  if (!isNative) return
  void SplashScreen.hide({ fadeOutDuration: 350 }).catch(() => {})
}
