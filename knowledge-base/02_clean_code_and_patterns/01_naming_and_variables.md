# NAMING AND VARIABLES

## NAMING CONVENTIONS

- **ALWAYS** use meaningful, pronounceable, and searchable variable names. A name should reveal intent without requiring a comment.
- **NEVER** use single-letter variables (`x`, `i`, `l`) outside of trivially short lambda callbacks. ALWAYS use descriptive names (`location`, `index`, `item`).
- **ALWAYS** use the same vocabulary for the same type of variable across the codebase. If you call it `user` in one function, NEVER call it `client`, `customer`, or `account` in another for the same concept.
- **ALWAYS** use `camelCase` for variables and functions, `PascalCase` for classes and components, `UPPER_SNAKE_CASE` for constants and environment variables, and `snake_case` for database columns and table names.

## SEARCHABILITY

- **NEVER** use magic numbers or magic strings. ALWAYS extract them into named constants.
```javascript
// NEVER
setTimeout(blastOff, 86400000);
// ALWAYS
const MILLISECONDS_PER_DAY = 60 * 60 * 24 * 1000;
setTimeout(blastOff, MILLISECONDS_PER_DAY);
```
- **ALWAYS** prefer named exports over default exports for better searchability and refactoring support.

## CONTEXT AND REDUNDANCY

- **NEVER** add unnecessary context to variable names. If the class is `User`, the property is `name`, not `userName`.
- **NEVER** encode type information in variable names (e.g., `userArray`, `nameString`). Let the type system handle types.
- **ALWAYS** use explanatory variables to break up complex expressions. Extract intermediate results into well-named variables.
```javascript
// NEVER
saveCityZipCode(address.match(cityZipCodeRegex)[1], address.match(cityZipCodeRegex)[2]);
// ALWAYS
const [, city, zipCode] = address.match(cityZipCodeRegex) || [];
saveCityZipCode(city, zipCode);
```

## DEFAULT VALUES

- **ALWAYS** use default parameters instead of short-circuiting or conditional assignment.
```javascript
// NEVER
const breweryName = name || "Default Brewery";
// ALWAYS
function createBrewery(name = "Default Brewery") { ... }
```
- **ALWAYS** use `Object.assign` or spread syntax to merge default configuration objects.

## BOOLEAN NAMING

- **ALWAYS** name booleans as yes/no questions: `isLoading`, `hasPermission`, `canEdit`, `shouldRefresh`. NEVER use ambiguous names like `flag`, `status`, `check`.

## ENUM AND CONSTANT ORGANIZATION

- **ALWAYS** isolate static data, configuration objects, and constant arrays into dedicated `constants.ts` or `[componentName].data.ts` files. NEVER clutter component files with large static arrays.
- **ALWAYS** use enums or constant objects for values that have a fixed, known set of options (e.g., user roles, status codes, filter types).
