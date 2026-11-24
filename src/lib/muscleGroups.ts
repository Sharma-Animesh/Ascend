// Muscle-group taxonomy for the Exercise Archive.
// Maps the free-form `exercises.muscles` strings onto seven canonical training segments
// so the library can be segregated (Full Body / Chest / Back / Shoulders / Arms / Legs / Core).

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'full body'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  'full body': 'Full Body',
}

/** Canonical section order for the segmented archive view (and the Target chip row). */
export const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'full body',
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
]

/** "lower back" belongs to core, so it must be masked before the generic "back" test runs. */
const LOWER_BACK = /lower[\s-]?back/g

const FULL_BODY = /\b(?:full|whole|total)[\s-]?body\b/

/**
 * Keyword tests per group. Matching is case-insensitive (input is lowercased) and
 * word-bounded so e.g. "forearms" never triggers the bare "arms" keyword by accident.
 */
const GROUP_TESTS: Array<{ group: Exclude<MuscleGroup, 'full body'>; pattern: RegExp }> = [
  { group: 'chest', pattern: /\b(?:chest|pecs?|pectorals?)\b/ },
  { group: 'back', pattern: /\b(?:back|lats?|latissimus|rhomboids?|traps?|trapezius)\b/ },
  { group: 'shoulders', pattern: /\b(?:shoulders?|delts?|deltoids?)\b/ },
  { group: 'arms', pattern: /\b(?:arms?|biceps?|triceps?|forearms?|grip)\b/ },
  {
    group: 'legs',
    pattern:
      /\b(?:legs?|quads?|quadriceps|glutes?|gluteus|hamstrings?|calves|calf|adductors?|abductors?|hips?)\b/,
  },
  {
    group: 'core',
    pattern: /\b(?:core|abs|abdominals?|obliques?|spine|spinal|lower[\s-]?back)\b/,
  },
]

/**
 * Resolve the muscle groups an exercise belongs to.
 *
 * - Groups are returned in the order they are first encountered in `muscles`, so
 *   index 0 is the exercise's primary group (muscle lists lead with the prime mover).
 * - An explicit "full body" keyword adds 'full body' at its encounter position.
 * - Hitting 3+ distinct groups also appends 'full body' (compound movements), without
 *   displacing the primary group.
 * - Unrecognised strings (e.g. "diaphragm", "neck") contribute nothing; breath work
 *   is intentionally left ungrouped and lives in its own Breath Control section.
 */
export function groupsForExercise(muscles: string[]): MuscleGroup[] {
  const groups: MuscleGroup[] = []
  const add = (group: MuscleGroup) => {
    if (!groups.includes(group)) groups.push(group)
  }

  for (const raw of muscles) {
    const muscle = raw.toLowerCase()
    if (FULL_BODY.test(muscle)) add('full body')
    for (const { group, pattern } of GROUP_TESTS) {
      const haystack = group === 'back' ? muscle.replace(LOWER_BACK, ' ') : muscle
      if (pattern.test(haystack)) add(group)
    }
  }

  const distinct = groups.filter((g) => g !== 'full body').length
  if (distinct >= 3) add('full body')

  return groups
}
