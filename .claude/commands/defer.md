---
allowed-tools: [Edit]
description: Move items to deferred section in ACTIVE_WORK.md
---

# Defer Item

## Context
- Current active work: @internal/ACTIVE_WORK.md

## Your task
Move the specified item from active priorities to the deferred section with proper documentation:

**Process**:
1. **Locate Item**: Find the item in current priorities or quick capture
2. **Move to Deferred**: Add to "Deferred Items" section
3. **Add Context**: Include timestamp and reason for deferral
4. **Update Status**: Remove from active sections

**Deferred Entry Format**:
```markdown
## Deferred Items
- **[YYYY-MM-DD]** {item description}
  - **Reason**: {why deferred}
  - **Revisit**: {when to reconsider}
```

**Example**:
```markdown
- **[2025-01-04]** Mobile responsiveness improvements
  - **Reason**: Focusing on core functionality first
  - **Revisit**: After v1.0 release
```

**Confirmation**:
```
✅ Moved item to deferred section:
   {item description}
   Reason: {reason provided}
```