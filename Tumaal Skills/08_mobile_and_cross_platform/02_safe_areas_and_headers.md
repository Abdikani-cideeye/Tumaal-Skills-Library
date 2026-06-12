# SAFE AREAS AND HEADERS

## NATIVE HEADERS VS SAFE AREAS

- **NEVER** mix native stack headers with manual safe area padding. If a screen uses a Native Stack Header (which automatically accounts for the status bar height), DO NOT wrap the screen content in a `SafeAreaView`. This causes double-padding and "header jump" bugs, especially on Android.
- **ALWAYS** follow this decision tree:
  - **Screen HAS a native header:** Use a plain `<View>` for content. The header already handles the status bar.
  - **Screen HIDES the native header:** Use `useSafeAreaInsets()` hook and apply dynamic `paddingTop` to a plain `<View>`.
  - **Full-screen/modal screen:** Use `useSafeAreaInsets()` for all edges (top, bottom, left, right).

## SAFE AREA INSETS

- **ALWAYS** prefer the `useSafeAreaInsets()` hook over the `<SafeAreaView>` component. The hook is synchronous and prevents the 1-frame layout jump caused by the asynchronous `<SafeAreaView>` measurement.
- **ALWAYS** apply insets to the correct edges:
  - Top inset: For screens without native headers (status bar avoidance).
  - Bottom inset: For screens with bottom-anchored buttons or tab bars (home indicator avoidance on iPhone X+).
  - Horizontal insets: For landscape mode or devices with camera cutouts.
- **NEVER** hardcode status bar or notch dimensions. Device safe areas vary across manufacturers and models. ALWAYS use the dynamic insets API.

## STATUS BAR MANAGEMENT

- **ALWAYS** control the status bar style (light/dark content) per screen based on the background color:
  - Light background → `barStyle="dark-content"` (dark icons).
  - Dark background → `barStyle="light-content"` (white icons).
- **ALWAYS** make the status bar translucent on Android (`translucent={true}`) so content can extend behind it for immersive designs.
- **NEVER** hide the status bar unless the screen is a full-screen media player or immersive experience.

## ANDROID-SPECIFIC QUIRKS

- **ALWAYS** test safe area behavior on both iOS and Android. Android devices have varying notch shapes, navigation bar styles (gesture vs. button), and status bar heights.
- **ALWAYS** handle the Android software navigation bar (back, home, recent) by applying bottom insets on screens with bottom-anchored UI elements.
- **ALWAYS** set `android:windowSoftInputMode` appropriately in `AndroidManifest.xml`:
  - `adjustResize` for screens with forms (keyboard pushes content up).
  - `adjustPan` for screens where you want the keyboard to overlay content.

## HEADER CUSTOMIZATION

- **ALWAYS** use the navigation library's header customization API for custom headers (custom title, back button, right actions). NEVER create a completely custom header component unless the design requires radical deviation from platform conventions.
- **ALWAYS** ensure custom headers respect the safe area on notched devices.
- **ALWAYS** animate header transitions smoothly. Abrupt header changes on navigation feel jarring.
