# KEYBOARD AND FORM ERGONOMICS

## KEYBOARD AVOIDANCE

- **ALWAYS** wrap form screens in a `KeyboardAvoidingView` (or platform equivalent) with platform-specific behavior:
  - iOS: `behavior="padding"` or `behavior="position"`.
  - Android: `behavior="height"` or rely on `android:windowSoftInputMode="adjustResize"` in the manifest.
- **ALWAYS** nest a `ScrollView` inside the `KeyboardAvoidingView` to allow the user to scroll through the form when the keyboard is open.
- **ALWAYS** add massive bottom padding (200px+) to the `ScrollView`'s content container. This forces the scroll view to allow free panning when the keyboard is open, preventing rigid "jumps" and ensuring the submit button is always reachable.

## INPUT BEHAVIOR

- **ALWAYS** set the appropriate `keyboardType` for each input field:
  - `email-address` for email fields.
  - `phone-pad` or `number-pad` for phone/numeric fields.
  - `decimal-pad` for currency/decimal fields.
  - `default` for general text.
- **ALWAYS** set `returnKeyType` to guide the user through the form:
  - `next` for fields that should advance to the next input.
  - `done` or `go` for the final field that triggers submission.
- **ALWAYS** implement `onSubmitEditing` to automatically focus the next input field when the user presses "Next" on the keyboard. NEVER require the user to manually tap each field.

## FORM UX BY PERSONA

- **ALWAYS** match form UX to the target user persona:
  - **Self-service users (e.g., consumers, students):** Use multi-step wizards to reduce cognitive load. Show one section at a time with clear progress indicators.
  - **Back-office staff (e.g., data entry operators, registrars):** Use single-page, vertically scrollable forms optimized for keyboard `Tab` navigation. Minimize clicks; maximize keyboard efficiency.
- **NEVER** use a "one-size-fits-all" approach for all forms in an application.

## FORM VALIDATION ON MOBILE

- **ALWAYS** display validation errors inline, directly below the offending field. NEVER use alert dialogs for validation errors.
- **ALWAYS** scroll to the first invalid field when the user attempts to submit a form with errors.
- **ALWAYS** debounce validation on text inputs (300-500ms) to avoid validating on every keystroke.

## DISMISSING THE KEYBOARD

- **ALWAYS** allow the user to dismiss the keyboard by tapping outside the input fields. Wrap the screen in a `TouchableWithoutFeedback` with `Keyboard.dismiss()` or use `keyboardShouldPersistTaps="handled"` on `ScrollView`.
- **NEVER** trap the user with an undismissible keyboard. Every screen with text inputs MUST have a way to dismiss the keyboard.

## AD-HOC ENTITY CREATION

- **NEVER** allow ad-hoc entity creation inside unrelated workflows. For example, a grade entry modal MUST ONLY allow grading of pre-existing students. NEVER allow users to create new student profiles from within a grading workflow. Maintain strict separation of duties.
