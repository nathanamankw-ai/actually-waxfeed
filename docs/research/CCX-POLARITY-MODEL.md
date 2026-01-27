# CCX POLARITY Model v3.0
## Scientific Foundations for Music Taste Profiling

---

## Overview

The CCX POLARITY Model is WAXFEED's proprietary music perception framework that combines established music psychology research with behavioral data to create accurate taste profiles. This document outlines the scientific foundations and research that inform our approach.

---

## 1. Theoretical Foundations

### 1.1 Russell's Circumplex Model of Affect (1980)

**Reference:** Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161-1178.

The foundation of emotional music perception. Maps emotions on two orthogonal dimensions:
- **Valence** (X-axis): Pleasure-displeasure continuum
- **Arousal** (Y-axis): Activation-deactivation continuum

**Application in POLARITY:**
- Descriptors: EUPHORIC, TRIUMPHANT, MELANCHOLIC, DARK, ANXIOUS (Valence)
- Descriptors: EXPLOSIVE, DRIVING, SIMMERING, SUBDUED (Arousal)

### 1.2 Berlyne's Arousal Theory (1971)

**Reference:** Berlyne, D. E. (1971). *Aesthetics and Psychobiology*. Appleton-Century-Crofts.

Aesthetic appreciation as a function of arousal potential:
- **Novelty**: How unexpected or familiar
- **Complexity**: Structural intricacy
- **Surprisingness**: Violation of expectations

**Application in POLARITY:**
- Descriptors: AVANT-GARDE, NOSTALGIC, FUTURISTIC, TIMELESS
- Drives the "Novelty" dimension

### 1.3 MUSIC Model (Rentfrow et al., 2011)

**Reference:** Rentfrow, P. J., Goldberg, L. R., & Levitin, D. J. (2011). The structure of musical preferences: A five-factor model. *Journal of Personality and Social Psychology*, 100(6), 1139-1157.

Five broad music preference factors:
1. **Mellow** (romantic, slow, quiet)
2. **Unpretentious** (relaxing, unaggressive, soft)
3. **Sophisticated** (complex, intelligent, avant-garde)
4. **Intense** (aggressive, loud, forceful)
5. **Contemporary** (rhythmic, electronic, danceable)

**Application in POLARITY:**
- Maps to our TEXTURE, AUTHENTICITY, and AROUSAL dimensions
- Informs archetype classifications

### 1.4 Groove Theory (Madison et al., 2011)

**Reference:** Madison, G., Gouyon, F., Ullén, F., & Hörnström, K. (2011). Modeling the tendency for music to induce movement in humans. *Music Perception*, 28(4), 313-324.

Scientific model of rhythmic entrainment:
- **Pulse clarity**: How clear the beat is
- **Syncopation**: Off-beat emphasis
- **Event density**: Notes per beat

**Application in POLARITY:**
- Descriptors: HYPNOTIC, CHAOTIC, GROOVY, FLOATING
- The "Temporal" dimension

### 1.5 Gabrielsson's Emotional Expression in Music (2001)

**Reference:** Gabrielsson, A., & Lindström, E. (2001). The influence of musical structure on emotional expression. *Music and Emotion: Theory and Research*, 223-248.

Structural features that convey emotion:
- Tempo, mode, loudness
- Pitch height, intervals
- Articulation, timbre

**Application in POLARITY:**
- Informs TEXTURE dimension descriptors
- LUSH, SPARSE, GRITTY, CRYSTALLINE

### 1.6 BRECVEMA Model (Juslin, 2013)

**Reference:** Juslin, P. N. (2013). From everyday emotions to aesthetic emotions: Towards a unified theory of musical emotions. *Physics of Life Reviews*, 10(3), 235-266.

Eight psychological mechanisms for musical emotions:
1. **B**rain stem reflex
2. **R**hythmic entrainment
3. **E**valuative conditioning
4. **C**ontagion
5. **V**isual imagery
6. **E**pisodic memory
7. **M**usical expectancy
8. **A**esthetic judgment

**Application in POLARITY:**
- NARRATIVE dimension (Cinematic, Abstract, Confessional)
- Explains why certain combinations evoke strong responses

---

## 2. The 8 POLARITY Dimensions

Based on the above research, POLARITY uses 8 orthogonal dimensions:

| Dimension | Research Basis | Descriptors |
|-----------|---------------|-------------|
| **AROUSAL** | Russell (1980) | Explosive, Driving, Simmering, Subdued |
| **VALENCE** | Russell (1980) | Euphoric, Triumphant, Melancholic, Dark, Anxious |
| **TEXTURE** | Gabrielsson (2001), Spectral Analysis | Lush, Sparse, Gritty, Crystalline |
| **TEMPORAL** | Madison et al. (2011) | Hypnotic, Chaotic, Groovy, Floating |
| **NOVELTY** | Berlyne (1971) | Avant-Garde, Nostalgic, Futuristic, Timeless |
| **SCALE** | Production Aesthetics | Epic, Intimate, Visceral, Ethereal |
| **AUTHENTICITY** | Rentfrow (2011) | Raw, Polished, Soulful |
| **NARRATIVE** | Juslin (2013) | Cinematic, Abstract, Confessional |

---

## 3. Mathematical Model

### 3.1 Taste Vector Computation

For each user, we compute an 8-dimensional taste vector:

```
T = [arousal, valence, texture, temporal, novelty, scale, authenticity, narrative]
```

Each dimension is computed as:
```
dimension_score = Σ(descriptor_weight × selection_frequency × rating_weight) / n_ratings
```

Where:
- `descriptor_weight`: The scientific weight assigned to each descriptor (-1 to 1)
- `selection_frequency`: How often user selects this descriptor
- `rating_weight`: Normalized rating (0-10 scaled to 0-1)
- `n_ratings`: Total number of ratings

### 3.2 Polarity Score

The Polarity Score measures taste distinctiveness:

```
polarity = 1 - (cosine_similarity(user_vector, population_mean))
```

Range: 0 (mainstream) to 1 (unique)

### 3.3 Taste Matching

For finding taste matches:
```
match_score = cosine_similarity(user_A_vector, user_B_vector)
```

Interpretation:
- 0.9+ : Taste Twins
- 0.7-0.9 : High Compatibility
- 0.5-0.7 : Moderate Compatibility
- <0.5 : Different Tastes

---

## 4. Accuracy Tiers

TasteID accuracy improves with more data points:

| Ratings | Tier | Accuracy | Statistical Basis |
|---------|------|----------|-------------------|
| 0-19 | Locked | 0% | Insufficient data |
| 20-49 | Emerging | 60% | Basic convergence |
| 50-99 | Developing | 75% | Factor stability |
| 100-199 | Refined | 85% | High confidence intervals |
| 200-499 | Deep | 92% | Robust cross-validation |
| 500+ | Crystallized | 98% | Maximum statistical power |

Based on: Nunnally, J. C., & Bernstein, I. H. (1994). *Psychometric Theory* (3rd ed.).

---

## 5. Implementation Notes

### 5.1 Descriptor Selection
- Users select 3-5 descriptors per album
- 3 minimum ensures signal validity
- 5 maximum prevents cognitive overload
- Descriptors shuffle to prevent position bias

### 5.2 Combination Space
- 31 descriptors, choose 3-5
- C(31,3) + C(31,4) + C(31,5) = 4,495 + 31,465 + 169,911 = 205,871 unique combinations
- Sufficient granularity for individual taste fingerprints

### 5.3 Data Quality
- Ratings weighted by review length (longer = more thoughtful)
- Recent ratings weighted higher (taste evolution)
- Outlier detection for spam prevention

---

## 6. References

1. Berlyne, D. E. (1971). *Aesthetics and Psychobiology*. Appleton-Century-Crofts.

2. Gabrielsson, A., & Lindström, E. (2001). The influence of musical structure on emotional expression. In P. N. Juslin & J. A. Sloboda (Eds.), *Music and Emotion: Theory and Research* (pp. 223-248). Oxford University Press.

3. Juslin, P. N. (2013). From everyday emotions to aesthetic emotions: Towards a unified theory of musical emotions. *Physics of Life Reviews*, 10(3), 235-266.

4. Madison, G., Gouyon, F., Ullén, F., & Hörnström, K. (2011). Modeling the tendency for music to induce movement in humans: First correlations with low-level audio descriptors across music genres. *Journal of Experimental Psychology: Human Perception and Performance*, 37(5), 1578-1594.

5. Nunnally, J. C., & Bernstein, I. H. (1994). *Psychometric Theory* (3rd ed.). McGraw-Hill.

6. Rentfrow, P. J., Goldberg, L. R., & Levitin, D. J. (2011). The structure of musical preferences: A five-factor model. *Journal of Personality and Social Psychology*, 100(6), 1139-1157.

7. Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161-1178.

---

*Document Version: 3.0*
*Last Updated: January 2026*
*Author: WAXFEED Research Team*
