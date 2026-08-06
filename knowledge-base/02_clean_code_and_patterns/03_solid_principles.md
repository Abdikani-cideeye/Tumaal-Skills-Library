# SOLID PRINCIPLES

## S — SINGLE RESPONSIBILITY PRINCIPLE (SRP)

- **ALWAYS** ensure each class, module, or component has exactly one reason to change. If a change in business logic, UI rendering, AND data access all require editing the same file, it violates SRP.
- **NEVER** combine data fetching logic, business rules, and presentation rendering in the same component or function.
- **ALWAYS** decompose "God classes" or "God components" that accumulate unrelated responsibilities. Split by domain concern.

## O — OPEN/CLOSED PRINCIPLE (OCP)

- **ALWAYS** design modules to be open for extension but closed for modification. Adding new behavior should NOT require changing existing, tested code.
- **ALWAYS** prefer composition over inheritance. Use dependency injection, strategy patterns, or plugin architectures to extend behavior.
- **NEVER** use long `if/else` or `switch` chains that must be modified every time a new case is added. Use polymorphism, maps, or registries instead.
```javascript
// NEVER — must modify for every new shape
function getArea(shape) {
  if (shape.type === "circle") return Math.PI * shape.radius ** 2;
  if (shape.type === "square") return shape.side ** 2;
}
// ALWAYS — extend by adding new classes
class Circle { getArea() { return Math.PI * this.radius ** 2; } }
class Square { getArea() { return this.side ** 2; } }
```

## L — LISKOV SUBSTITUTION PRINCIPLE (LSP)

- **ALWAYS** ensure that subclasses or implementations can replace their parent class or interface without breaking the program.
- **NEVER** throw unexpected errors, remove base class functionality, or change return types in subclass overrides.
- **NEVER** create inheritance hierarchies where a subclass violates the contract of its parent (e.g., `Square extends Rectangle` where `setWidth` breaks `setHeight`).

## I — INTERFACE SEGREGATION PRINCIPLE (ISP)

- **NEVER** force consumers to depend on interfaces they do not use. Split large interfaces into smaller, focused ones.
- **ALWAYS** design component props, function parameters, and API contracts to include only what the consumer actually needs.
- **NEVER** pass an entire entity object to a component that only needs two fields. Destructure and pass only the required fields.

## D — DEPENDENCY INVERSION PRINCIPLE (DIP)

- **ALWAYS** depend on abstractions, not concretions. High-level business logic modules MUST NOT import low-level implementation modules directly.
- **ALWAYS** inject dependencies (database clients, API clients, loggers) rather than importing them directly at the module level. This enables testing and swapping implementations.
- **ALWAYS** wrap third-party libraries in adapter modules. The application should depend on your adapter interface, not the library's raw API. This allows replacing the library without touching business logic.
```javascript
// NEVER — direct dependency on implementation
import axios from "axios";
function getUser(id) { return axios.get(`/users/${id}`); }
// ALWAYS — depend on abstraction
function getUser(id, httpClient) { return httpClient.get(`/users/${id}`); }
```

## DRY — DON'T REPEAT YOURSELF

- **NEVER** duplicate logic across multiple files. If the same pattern appears in 3+ places, extract it into a shared utility, hook, or service.
- **ALWAYS** identify the correct abstraction before extracting. A wrong abstraction is worse than duplication. Wait for the pattern to emerge clearly (Rule of Three).
- **NEVER** create abstractions for things that are merely similar but semantically different. Two functions that look alike but serve different domains should remain separate.

## YAGNI — YOU AIN'T GONNA NEED IT

- **NEVER** build features, abstractions, or infrastructure for hypothetical future requirements. Build for what is needed today.
- **ALWAYS** delete unused code, unused dependencies, and unused configuration. Dead weight increases cognitive load and maintenance burden.
