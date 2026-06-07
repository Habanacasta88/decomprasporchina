# Agent Soul System

Each agent has a `soul` file that defines its personality, voice, decision-making principles, and memory access patterns.

## Architecture

```
agents/
  soul/                     # Personality + identity
    seo-sentinel.md         # SEO Sentinel personality
    content-writer.md       # Content Strategist personality
    geo-optimizer.md        # GEO Optimizer personality
    site-doctor.md          # Site Doctor personality
    deploy-bot.md           # Deploy Bot personality
    revenue-analyst.md      # Revenue Analyst personality
  memory/                   # Persistent memory (survives sessions)
    shared-context.json     # Shared knowledge: site goals, audience, brand voice
    decisions-log.json      # Log of all agent decisions with reasoning
    learnings.json          # What agents have learned over time
    relationships.json      # Inter-agent communication preferences
  state/                    # Operational state (per-cycle)
    seo-baseline.json
    content-queue.json
    ...
```

## How It Works

1. Every slash command reads its soul file FIRST → sets tone, priorities, decision style
2. Then reads `memory/shared-context.json` → understands site mission and constraints
3. Then reads `memory/learnings.json` → avoids repeating mistakes
4. Then reads its operational state files → current data
5. After completing work → writes to `memory/decisions-log.json` and optionally `learnings.json`

## Memory vs State

- **Memory** = persistent knowledge that grows over time (decisions, learnings, patterns)
- **State** = operational data that gets overwritten each cycle (baselines, queues, health)
