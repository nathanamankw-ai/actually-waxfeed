# WAXFEED TasteID Quick Reference
## CCX POLARITY × Archetype System

---

## POLARITY Descriptors (31 Total)

### Dimension 1: AROUSAL (Russell's Circumplex Y-axis)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| EXPLOSIVE | +1.0 | Maximum energy peaks |
| DRIVING | +0.7 | Relentless momentum |
| SIMMERING | +0.4 | Controlled intensity |
| SUBDUED | -0.8 | Restrained, understated |

### Dimension 2: VALENCE (Russell's Circumplex X-axis)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| EUPHORIC | +1.0 | Pure joy |
| TRIUMPHANT | +0.8 | Victory, uplift |
| MELANCHOLIC | -0.6 | Beautiful sadness |
| DARK | -0.9 | Ominous, heavy |
| ANXIOUS | -0.5 | Unsettled, tense |

### Dimension 3: TEXTURE (Spectral Analysis)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| LUSH | +0.9 | Rich, dense, full spectrum |
| SPARSE | -0.9 | Minimal, breathing room |
| GRITTY | +0.7 | Raw, distorted, lo-fi |
| CRYSTALLINE | +0.5 | Pristine, sharp clarity |

### Dimension 4: TEMPORAL (Groove Theory)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| HYPNOTIC | +0.8 | Trance-inducing, repetitive |
| CHAOTIC | +0.9 | Unpredictable, disorienting |
| GROOVY | +0.7 | Body-moving, pocket |
| FLOATING | -0.7 | Ambient, weightless |

### Dimension 5: NOVELTY (Berlyne's Theory)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| AVANT-GARDE | +1.0 | Boundary-pushing |
| NOSTALGIC | -0.6 | Past eras, familiar |
| FUTURISTIC | +0.8 | Forward-thinking |
| TIMELESS | 0.0 | Era-transcendent |

### Dimension 6: SCALE (Production Aesthetics)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| EPIC | +1.0 | Grand, cinematic |
| INTIMATE | -0.9 | Personal, vulnerable |
| VISCERAL | +0.8 | Gut-punch impact |
| ETHEREAL | +0.6 | Otherworldly |

### Dimension 7: AUTHENTICITY (MUSIC Model)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| RAW | +0.9 | Unpolished, genuine |
| POLISHED | -0.7 | Refined, radio-ready |
| SOULFUL | +0.8 | Deep feeling, heart |

### Dimension 8: NARRATIVE (BRECVEMA Model)
| Descriptor | Weight | Meaning |
|------------|--------|---------|
| CINEMATIC | +0.9 | Visual, story-driven |
| ABSTRACT | +0.7 | Non-representational |
| CONFESSIONAL | +0.6 | Personal, diary-like |

---

## Archetypes Summary

### Genre-Based (10)
| Archetype | Icon | Core Traits |
|-----------|------|-------------|
| Hip-Hop Head | 🎤 | High arousal, authentic, groovy |
| Jazz Explorer | 🎷 | Complex, innovative, lush |
| Rock Purist | 🎸 | Driving, gritty, authentic |
| Electronic Pioneer | 🎹 | Hypnotic, futuristic, crystalline |
| Soul Searcher | 💜 | Soulful, lush, confessional |
| Metal Maven | 🤘 | Explosive, dark, visceral |
| Indie Devotee | 🎧 | Subdued, intimate, avant-garde |
| Pop Connoisseur | ⭐ | Euphoric, polished, groovy |
| Country Soul | 🤠 | Authentic, narrative, nostalgic |
| Classical Mind | 🎻 | Epic, lush, cinematic |

### Behavior-Based (10)
| Archetype | Icon | Detection |
|-----------|------|-----------|
| Genre Fluid | 🌈 | 4+ genre families, no family >50%, adventureness >60% |
| Decade Diver | ⏰ | Single decade > 65% |
| Deep Cutter | 💎 | Obscure albums > 40% |
| Chart Chaser | 📈 | Charting albums > 70% |
| The Critic | 🧐 | Avg rating < 6.0, "harsh" skew |
| The Enthusiast | 🎉 | Avg rating > 7.5, "lenient" skew |
| Essay Writer | 📝 | Avg review > 200 words |
| Album Archaeologist | 🏛️ | Albums >20 years old > 50% |
| New Release Hunter | 🆕 | Releases within 1 year > 70% |
| Taste Twin Seeker | 👯 | High social engagement |

### Genre Families (v2.0)
Subgenres are clustered to prevent false "diversity" detection:
- **r&b-soul**: R&B, Dark R&B, Trap Soul, Neo Soul, Alternative R&B, Motown, Funk
- **hip-hop**: Hip-Hop, Trap, Drill, Cloud Rap, Boom Bap, Conscious Rap
- **electronic**: House, Techno, UK Garage, EDM, Ambient, Dubstep, Trance
- **rock**: Rock, Alternative, Indie Rock, Punk, Grunge, Post-Punk
- **pop**: Pop, Synth-Pop, Dance Pop, Art Pop, Hyperpop
- **metal**: Metal, Death Metal, Black Metal, Metalcore, Thrash
- **jazz**: Jazz, Bebop, Jazz Fusion, Modal Jazz, Nu Jazz
- **country-folk**: Country, Americana, Bluegrass, Folk, Outlaw Country
- **classical**: Classical, Orchestral, Baroque, Opera, Minimalism
- **indie-alternative**: Indie, Lo-fi, Shoegaze, Dream Pop, Bedroom Pop
- **latin**: Reggaeton, Latin Pop, Salsa, Bachata, Latin Trap
- **world**: Afrobeats, K-Pop, J-Pop, Reggae, Dancehall

---

## Accuracy Tiers

| Ratings | Tier | Accuracy | Color |
|---------|------|----------|-------|
| 0-19 | Locked | 0% | #666 |
| 20-49 | Emerging | 60% | #ffd700 |
| 50-99 | Developing | 75% | #ffd700 |
| 100-199 | Refined | 85% | #00ff88 |
| 200-499 | Deep | 92% | #00ff88 |
| 500+ | Crystallized | 98% | #00ffff |

---

## Key Formulas

### Polarity Score
```
polarity = 1 - cosine_similarity(user_vector, population_mean)
```
- 0 = Mainstream taste
- 1 = Highly unique

### Taste Match Score
```
match = cosine_similarity(user_A, user_B)
```
- 0.9+ = Taste Twins
- 0.7-0.9 = High compatibility
- 0.5-0.7 = Moderate
- <0.5 = Different tastes

### Adventureness Score
```
adventureness = genre_entropy / max_possible_entropy
```
- 0 = Single genre only
- 1 = Perfect diversity

---

## File Locations

| Component | Path |
|-----------|------|
| POLARITY Model Doc | `/docs/research/CCX-POLARITY-MODEL.md` |
| Archetypes Doc | `/docs/research/TASTEID-ARCHETYPES.md` |
| Backend Logic | `/src/lib/tasteid.ts` |
| Quick Rate Page | `/src/app/quick-rate/page.tsx` |
| TasteID Page | `/src/app/u/[username]/tasteid/page.tsx` |
| Completion Banner | `/src/components/tasteid-completion-banner.tsx` |

---

*Last Updated: January 2026*
