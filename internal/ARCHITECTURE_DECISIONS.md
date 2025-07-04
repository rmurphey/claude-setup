# Architecture Decisions - Internal

## Template vs Internal Documentation Separation

**Decision**: Use `/internal/` directory for project development records, `/templates/` for user-facing templates.

**Context**: Tool generates development infrastructure but needs to use that same infrastructure internally without pollution.

**Rationale**: 
- Clean separation of concerns
- Prevents internal development records from being shipped to users
- Allows dogfooding of our own tools
- Maintains professional appearance of distributed templates

**Status**: Implemented

## Future Decisions
*Document architectural choices as they arise*