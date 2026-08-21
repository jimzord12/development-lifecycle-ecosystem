# Roadmap

The Roadmap artifact is delivery/roadmap.json.

Published schema v2 requires:

- `kind` is `delivery-roadmap`
- `schemaVersion` is `2`
- `title` is a non-empty string
- `repositories` is a non-empty registry of repository ids, each with an `identity` string
- `milestoneOrder` is a unique array of Milestone ids matching `M-[0-9]{3,}`

Graph validation requires every id in `milestoneOrder` to exist as a Milestone artifact, and Phase `repositories` entries to refer to ids in this registry.
