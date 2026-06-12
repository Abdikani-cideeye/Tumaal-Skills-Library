# FUNCTIONS AND MODULARITY

## SINGLE RESPONSIBILITY

- **ALWAYS** ensure each function does exactly one thing. If a function name contains "and" (e.g., `validateAndSave`), it does too much — split it.
- **ALWAYS** keep functions at one level of abstraction. High-level orchestration functions should call lower-level implementation functions, not mix both.
```javascript
// NEVER — mixed abstraction levels
function processOrder(order) {
  const tax = order.total * 0.08;
  order.tax = tax;
  db.save(order);
  sendEmail(order.userEmail, "Order confirmed");
}
// ALWAYS — single level of abstraction
function processOrder(order) {
  applyTax(order);
  saveOrder(order);
  notifyUser(order);
}
```

## ARGUMENT LIMITS

- **ALWAYS** limit function arguments to 2 or fewer. If more are needed, use an options object with destructuring.
```javascript
// NEVER
function createMenu(title, body, buttonText, cancellable) { ... }
// ALWAYS
function createMenu({ title, body, buttonText, cancellable }) { ... }
```
- **NEVER** use boolean flags as function parameters. Flags signal the function does more than one thing. Split into two functions.
```javascript
// NEVER
function createFile(name, temp) { ... }
// ALWAYS
function createFile(name) { ... }
function createTempFile(name) { createFile(`./temp/${name}`); }
```

## PURITY AND SIDE EFFECTS

- **ALWAYS** favor pure functions (same input → same output, no side effects) over impure ones.
- **NEVER** mutate input arguments. ALWAYS return new values.
```javascript
// NEVER
const addItemToCart = (cart, item) => { cart.push(item); };
// ALWAYS
const addItemToCart = (cart, item) => [...cart, item];
```
- **ALWAYS** centralize side effects (file writes, database calls, API requests) into dedicated service modules. NEVER scatter I/O operations across utility functions.
- **NEVER** write to global state or prototype chains. NEVER extend built-in prototypes (e.g., `Array.prototype.diff`).

## FUNCTION NAMING

- **ALWAYS** name functions with verbs that describe what they do: `getUser`, `calculateTax`, `validateEmail`, `formatCurrency`.
- **NEVER** use vague names like `handle`, `process`, `do`, or `manage` without further specificity.

## FUNCTIONAL PROGRAMMING PREFERENCE

- **ALWAYS** prefer `map`, `filter`, `reduce`, `find`, `some`, `every` over imperative `for` loops when iterating over arrays.
- **ALWAYS** prefer immutable data patterns. Use `const` by default; only use `let` when reassignment is genuinely required. NEVER use `var`.

## ENCAPSULATE CONDITIONALS

- **ALWAYS** extract complex conditional logic into well-named functions.
```javascript
// NEVER
if (user.age > 18 && user.hasVerifiedEmail && !user.isBanned) { ... }
// ALWAYS
if (isEligibleUser(user)) { ... }
```

## AVOID NEGATIVE CONDITIONALS

- **ALWAYS** prefer positive conditionals over negative ones. `if (isActive)` is clearer than `if (!isInactive)`.

## DEAD CODE

- **NEVER** leave dead code (unreachable functions, commented-out blocks, unused imports) in the codebase. Version control is the history. Delete it.
