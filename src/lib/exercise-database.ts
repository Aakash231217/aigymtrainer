/**
 * Comprehensive Exercise Database
 * Contains detailed information about exercises for all muscle groups
 */

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'compound' | 'isolation';
  mechanics: 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'isometric';
  instructions: string[];
  tips: string[];
  commonMistakes: string[];
  variations: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'plyometric'
  | 'calisthenics'
  | 'olympic_lifting';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'hip_flexors'
  | 'adductors'
  | 'abductors'
  | 'neck'
  | 'traps'
  | 'lats'
  | 'rhomboids'
  | 'rear_delts'
  | 'front_delts'
  | 'side_delts';

export type Equipment = 
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'resistance_band'
  | 'medicine_ball'
  | 'stability_ball'
  | 'pull_up_bar'
  | 'dip_bars'
  | 'bench'
  | 'squat_rack'
  | 'leg_press'
  | 'ez_curl_bar'
  | 'trap_bar'
  | 'smith_machine'
  | 'foam_roller'
  | 'trx'
  | 'battle_ropes'
  | 'rowing_machine'
  | 'treadmill'
  | 'stationary_bike'
  | 'elliptical'
  | 'box'
  | 'none';

export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'front_delts'],
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'front_delts'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'push',
    instructions: [
      'Lie flat on the bench with your feet firmly planted on the floor',
      'Grip the barbell slightly wider than shoulder-width apart',
      'Unrack the bar and position it directly over your chest',
      'Lower the bar slowly to your mid-chest, keeping elbows at 45-degree angle',
      'Pause briefly at the bottom, then press the bar back up explosively',
      'Lock out your arms at the top without bouncing the bar off your chest',
      'Repeat for the desired number of repetitions'
    ],
    tips: [
      'Keep your shoulder blades retracted and squeezed together throughout',
      'Maintain a slight arch in your lower back',
      'Drive through your feet for additional power',
      'Control the descent - take 2-3 seconds to lower the bar',
      'Breathe out as you press, breathe in as you lower'
    ],
    commonMistakes: [
      'Flaring elbows out to 90 degrees (increases shoulder strain)',
      'Bouncing the bar off the chest',
      'Lifting hips off the bench',
      'Not using a full range of motion',
      'Grip too narrow or too wide'
    ],
    variations: [
      'Incline Bench Press',
      'Decline Bench Press',
      'Close-Grip Bench Press',
      'Pause Bench Press',
      'Floor Press'
    ]
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'front_delts'],
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'front_delts'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'push',
    instructions: [
      'Sit on the bench with dumbbells resting on your thighs',
      'Lie back and use your thighs to help position the dumbbells at chest level',
      'Position dumbbells at the sides of your chest with palms facing forward',
      'Press the dumbbells up until arms are extended (slight elbow bend at top)',
      'Lower dumbbells slowly to the starting position',
      'At the bottom, feel a stretch in your chest before pressing again'
    ],
    tips: [
      'Allows greater range of motion than barbell',
      'Helps identify and correct strength imbalances',
      'Touch dumbbells together at the top for peak contraction',
      'Keep wrists straight, not bent backward'
    ],
    commonMistakes: [
      'Using momentum to swing weights up',
      'Letting dumbbells drift too far apart at the bottom',
      'Not maintaining control throughout the movement',
      'Arching back excessively'
    ],
    variations: [
      'Incline Dumbbell Press',
      'Decline Dumbbell Press',
      'Neutral Grip Dumbbell Press',
      'Single Arm Dumbbell Press'
    ]
  },
  {
    id: 'push-ups',
    name: 'Push-Ups',
    category: 'calisthenics',
    muscleGroups: ['chest', 'triceps', 'front_delts', 'core'],
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'front_delts', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'push',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width',
      'Keep your body in a straight line from head to heels',
      'Lower your body until your chest nearly touches the floor',
      'Keep elbows at a 45-degree angle to your body',
      'Push back up to the starting position',
      'Fully extend arms at the top without locking elbows'
    ],
    tips: [
      'Engage your core throughout the entire movement',
      'Look slightly forward, not straight down',
      'Squeeze glutes to maintain proper alignment',
      'Modify on knees if standard push-ups are too difficult'
    ],
    commonMistakes: [
      'Letting hips sag or pike up',
      'Flaring elbows out to 90 degrees',
      'Not going through full range of motion',
      'Holding breath'
    ],
    variations: [
      'Incline Push-Ups (easier)',
      'Decline Push-Ups (harder)',
      'Diamond Push-Ups',
      'Wide Push-Ups',
      'Archer Push-Ups',
      'Clapping Push-Ups',
      'One-Arm Push-Ups'
    ]
  },
  {
    id: 'cable-flyes',
    name: 'Cable Flyes',
    category: 'strength',
    muscleGroups: ['chest'],
    primaryMuscle: 'chest',
    secondaryMuscles: ['front_delts'],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Set the pulleys to chest height or above',
      'Grab the handles and step forward into a split stance',
      'Start with arms extended out to the sides with a slight bend in elbows',
      'Bring your hands together in front of your chest in an arc motion',
      'Squeeze your chest at the peak contraction',
      'Slowly return to the starting position with controlled movement'
    ],
    tips: [
      'Maintain a slight bend in your elbows throughout',
      'Focus on squeezing your chest, not your hands',
      'Lean slightly forward to increase chest activation',
      'Use a weight that allows full control'
    ],
    commonMistakes: [
      'Straightening arms completely (stresses elbows)',
      'Using too much weight and losing form',
      'Not getting a full stretch at the bottom',
      'Bending arms too much (turns into a press)'
    ],
    variations: [
      'Low Cable Flyes (for upper chest)',
      'High Cable Flyes (for lower chest)',
      'Single Arm Cable Fly',
      'Lying Cable Fly'
    ]
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    category: 'strength',
    muscleGroups: ['chest'],
    primaryMuscle: 'chest',
    secondaryMuscles: ['front_delts'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'intermediate',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Lie on a flat bench holding dumbbells above your chest',
      'Keep a slight bend in your elbows (arms not fully straight)',
      'Lower the dumbbells in an arc motion out to the sides',
      'Feel a deep stretch in your chest at the bottom',
      'Bring dumbbells back up in the same arc motion',
      'Squeeze your chest at the top'
    ],
    tips: [
      'Keep the same bend in elbows throughout the movement',
      'Visualize hugging a large tree',
      'Don\'t go too heavy - this is an isolation exercise',
      'Control the negative portion for maximum stretch'
    ],
    commonMistakes: [
      'Going too deep and straining shoulders',
      'Pressing instead of flying',
      'Using momentum',
      'Changing elbow angle during movement'
    ],
    variations: [
      'Incline Dumbbell Flyes',
      'Decline Dumbbell Flyes',
      'Single Arm Dumbbell Fly'
    ]
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    category: 'strength',
    muscleGroups: ['back', 'hamstrings', 'glutes', 'core', 'traps', 'forearms'],
    primaryMuscle: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'core', 'traps', 'forearms'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    type: 'compound',
    mechanics: 'hinge',
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot',
      'Bend at hips and knees to grip the bar just outside your legs',
      'Keep your back flat, chest up, and shoulders over the bar',
      'Take a deep breath and brace your core',
      'Drive through your heels while pushing the floor away',
      'Keep the bar close to your body as you stand up',
      'Lock out at the top by squeezing glutes',
      'Reverse the movement to lower the bar with control'
    ],
    tips: [
      'Master the hip hinge pattern before adding heavy weight',
      'Keep the bar as close to your body as possible',
      'Think of pushing the floor away rather than pulling the bar up',
      'Use mixed grip or straps if grip is limiting factor',
      'Reset between reps for proper form on heavier sets'
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Starting with hips too high or too low',
      'Letting the bar drift away from the body',
      'Not engaging lats before the pull',
      'Looking up excessively',
      'Hyperextending at the top'
    ],
    variations: [
      'Sumo Deadlift',
      'Romanian Deadlift',
      'Trap Bar Deadlift',
      'Deficit Deadlift',
      'Rack Pull',
      'Single Leg Deadlift'
    ]
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    category: 'calisthenics',
    muscleGroups: ['lats', 'biceps', 'rhomboids', 'rear_delts', 'core'],
    primaryMuscle: 'lats',
    secondaryMuscles: ['biceps', 'rhomboids', 'rear_delts', 'core'],
    equipment: ['pull_up_bar'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Grab the bar with an overhand grip, hands slightly wider than shoulders',
      'Hang with arms fully extended, shoulders engaged (not relaxed)',
      'Pull yourself up by driving elbows down toward your hips',
      'Continue until your chin clears the bar',
      'Lower yourself with control to the starting position',
      'Avoid swinging or using momentum'
    ],
    tips: [
      'Initiate the pull by depressing and retracting shoulder blades',
      'Focus on pulling with your back, not just your arms',
      'Keep core tight to prevent swinging',
      'Use assisted variations if unable to do full pull-ups'
    ],
    commonMistakes: [
      'Not going through full range of motion',
      'Using excessive kipping or swinging',
      'Only pulling with arms (no lat engagement)',
      'Not controlling the descent'
    ],
    variations: [
      'Chin-Ups (underhand grip)',
      'Neutral Grip Pull-Ups',
      'Wide Grip Pull-Ups',
      'Close Grip Pull-Ups',
      'Weighted Pull-Ups',
      'Assisted Pull-Ups',
      'Negative Pull-Ups',
      'Muscle-Ups'
    ]
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    category: 'strength',
    muscleGroups: ['lats', 'rhomboids', 'rear_delts', 'biceps', 'lower_back'],
    primaryMuscle: 'lats',
    secondaryMuscles: ['rhomboids', 'rear_delts', 'biceps', 'lower_back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Stand with feet shoulder-width apart, holding barbell with overhand grip',
      'Hinge at hips until torso is nearly parallel to the floor',
      'Let the bar hang at arms length below your shoulders',
      'Brace your core and keep back flat',
      'Pull the bar to your lower chest/upper abdomen',
      'Squeeze shoulder blades together at the top',
      'Lower with control and repeat'
    ],
    tips: [
      'Keep your back flat throughout - no rounding',
      'Pull with your elbows, not your hands',
      'Don\'t use body momentum to swing the weight up',
      'Maintain consistent torso angle'
    ],
    commonMistakes: [
      'Standing too upright (reduces lat activation)',
      'Rounding the lower back',
      'Using momentum to heave the weight',
      'Not pulling the bar high enough'
    ],
    variations: [
      'Pendlay Row (from floor each rep)',
      'Underhand Barbell Row',
      'T-Bar Row',
      'Seal Row',
      'Meadows Row'
    ]
  },
  {
    id: 'dumbbell-row',
    name: 'Single Arm Dumbbell Row',
    category: 'strength',
    muscleGroups: ['lats', 'rhomboids', 'rear_delts', 'biceps'],
    primaryMuscle: 'lats',
    secondaryMuscles: ['rhomboids', 'rear_delts', 'biceps'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Place one knee and hand on a bench for support',
      'Keep your back flat and parallel to the floor',
      'Hold dumbbell in the other hand with arm fully extended',
      'Pull the dumbbell up toward your hip/lower ribcage',
      'Keep elbow close to your body as you row',
      'Squeeze your lat at the top of the movement',
      'Lower with control and repeat'
    ],
    tips: [
      'Think about pulling your elbow toward the ceiling',
      'Allow a slight rotation of the torso for fuller range of motion',
      'Don\'t let your shoulder drop at the bottom',
      'Great for fixing left/right imbalances'
    ],
    commonMistakes: [
      'Rotating the torso excessively',
      'Using body momentum',
      'Not getting full extension at the bottom',
      'Pulling too high toward the shoulder'
    ],
    variations: [
      'Chest Supported Row',
      'Kroc Row (higher reps with momentum)',
      'Two-Point Row (no bench support)',
      'Renegade Row'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'strength',
    muscleGroups: ['lats', 'biceps', 'rear_delts'],
    primaryMuscle: 'lats',
    secondaryMuscles: ['biceps', 'rear_delts'],
    equipment: ['cable', 'machine'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Sit at the lat pulldown machine with thighs secured under pads',
      'Grab the bar with a wide overhand grip',
      'Lean back slightly and create an arch in your upper back',
      'Pull the bar down to your upper chest',
      'Squeeze your lats at the bottom',
      'Control the bar back up to full arm extension'
    ],
    tips: [
      'Drive your elbows down and back',
      'Don\'t lean back excessively to use momentum',
      'Focus on stretching lats at the top',
      'Keep shoulders down, away from ears'
    ],
    commonMistakes: [
      'Pulling bar behind the neck (injury risk)',
      'Using too much body momentum',
      'Not going through full range of motion',
      'Grip too narrow for lat focus'
    ],
    variations: [
      'Close Grip Lat Pulldown',
      'Underhand Lat Pulldown',
      'Neutral Grip Pulldown',
      'Single Arm Pulldown',
      'Straight Arm Pulldown'
    ]
  },
  {
    id: 'cable-row',
    name: 'Seated Cable Row',
    category: 'strength',
    muscleGroups: ['lats', 'rhomboids', 'rear_delts', 'biceps'],
    primaryMuscle: 'lats',
    secondaryMuscles: ['rhomboids', 'rear_delts', 'biceps'],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Sit at the cable row station with feet on the platform',
      'Grab the handle with arms fully extended',
      'Keep back straight with slight arch, chest up',
      'Pull the handle to your lower abdomen',
      'Squeeze shoulder blades together at peak contraction',
      'Slowly extend arms back to starting position'
    ],
    tips: [
      'Avoid using lower back to swing the weight',
      'Pull to your belly button, not your chest',
      'Keep elbows close to your sides',
      'Maintain upright posture throughout'
    ],
    commonMistakes: [
      'Excessive forward lean at the stretch',
      'Leaning back too far during the pull',
      'Shrugging shoulders up',
      'Using momentum'
    ],
    variations: [
      'Wide Grip Cable Row',
      'Single Arm Cable Row',
      'Face Pulls',
      'High Row'
    ]
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Barbell Overhead Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'triceps', 'core'],
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'push',
    instructions: [
      'Stand with feet shoulder-width apart, holding barbell at shoulder height',
      'Grip bar just outside shoulder width',
      'Brace your core and squeeze your glutes',
      'Press the bar straight up, moving your head back to clear the bar',
      'Lock out arms directly over mid-foot',
      'Lower bar back to starting position with control'
    ],
    tips: [
      'Keep your body tight and avoid excessive back arch',
      'Press in a straight vertical path',
      'Move head forward once bar passes',
      'Don\'t flare elbows excessively'
    ],
    commonMistakes: [
      'Excessive lower back arch (use lighter weight)',
      'Pressing bar forward instead of straight up',
      'Not using full range of motion',
      'Letting elbows drop behind the bar'
    ],
    variations: [
      'Seated Overhead Press',
      'Push Press',
      'Dumbbell Overhead Press',
      'Arnold Press',
      'Behind the Neck Press (with caution)'
    ]
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'strength',
    muscleGroups: ['side_delts'],
    primaryMuscle: 'side_delts',
    secondaryMuscles: ['traps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Stand with feet shoulder-width apart, dumbbells at your sides',
      'Keep a slight bend in your elbows',
      'Raise arms out to the sides until parallel to the floor',
      'Lead with your elbows, not your hands',
      'Pause briefly at the top',
      'Lower with control back to starting position'
    ],
    tips: [
      'Use lighter weight and focus on the muscle contraction',
      'Slightly tip pinky finger up at the top (like pouring water)',
      'Control the descent - don\'t just drop the weights',
      'Avoid shrugging shoulders up'
    ],
    commonMistakes: [
      'Using momentum to swing weights up',
      'Going too heavy and compromising form',
      'Lifting too high (above shoulder level)',
      'Bending elbows too much during lift'
    ],
    variations: [
      'Cable Lateral Raise',
      'Leaning Lateral Raise',
      'Lying Lateral Raise',
      'Machine Lateral Raise'
    ]
  },
  {
    id: 'front-raise',
    name: 'Dumbbell Front Raise',
    category: 'strength',
    muscleGroups: ['front_delts'],
    primaryMuscle: 'front_delts',
    secondaryMuscles: ['side_delts'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Stand with feet shoulder-width apart, dumbbells in front of thighs',
      'Keep a slight bend in elbows',
      'Raise one or both arms straight in front to shoulder height',
      'Keep palms facing down or neutral',
      'Lower with control and repeat'
    ],
    tips: [
      'Don\'t swing the body to lift the weight',
      'Raise to shoulder height only - no higher',
      'Alternating arms reduces momentum',
      'Keep core engaged throughout'
    ],
    commonMistakes: [
      'Using too much weight',
      'Swinging the body',
      'Raising arms too high',
      'Bending elbows excessively'
    ],
    variations: [
      'Barbell Front Raise',
      'Cable Front Raise',
      'Plate Front Raise',
      'Alternating Front Raise'
    ]
  },
  {
    id: 'reverse-fly',
    name: 'Reverse Dumbbell Fly',
    category: 'strength',
    muscleGroups: ['rear_delts', 'rhomboids'],
    primaryMuscle: 'rear_delts',
    secondaryMuscles: ['rhomboids', 'traps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'pull',
    instructions: [
      'Bend at hips until torso is nearly parallel to floor',
      'Let dumbbells hang below chest with palms facing each other',
      'Keep slight bend in elbows',
      'Raise arms out to sides, squeezing shoulder blades',
      'Lower with control to starting position'
    ],
    tips: [
      'Focus on squeezing the rear delts',
      'Don\'t use body momentum',
      'Keep torso stable throughout',
      'Use lighter weight for better muscle connection'
    ],
    commonMistakes: [
      'Standing too upright',
      'Using momentum',
      'Shrugging shoulders',
      'Not getting full range of motion'
    ],
    variations: [
      'Seated Reverse Fly',
      'Cable Reverse Fly',
      'Machine Reverse Fly',
      'Face Pulls'
    ]
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    category: 'strength',
    muscleGroups: ['rear_delts', 'rhomboids', 'traps'],
    primaryMuscle: 'rear_delts',
    secondaryMuscles: ['rhomboids', 'traps'],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'pull',
    instructions: [
      'Set cable pulley at face height with rope attachment',
      'Grab rope with overhand grip, step back',
      'Pull the rope toward your face, separating the ends',
      'Pull until hands are beside your ears',
      'Squeeze rear delts and external rotate shoulders',
      'Return with control to starting position'
    ],
    tips: [
      'Excellent for shoulder health and posture',
      'Focus on external rotation at the end of movement',
      'Keep elbows high throughout',
      'Don\'t lean back excessively'
    ],
    commonMistakes: [
      'Pulling too low (toward chest)',
      'Not externally rotating',
      'Using too much weight',
      'Letting elbows drop'
    ],
    variations: [
      'Band Face Pulls',
      'Low Cable Face Pulls',
      'Lying Face Pulls'
    ]
  },

  // LEG EXERCISES
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    equipment: ['barbell', 'squat_rack'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'squat',
    instructions: [
      'Set up barbell on rack at upper chest height',
      'Step under bar, positioning it on upper back (high bar) or rear delts (low bar)',
      'Grip bar firmly, squeeze shoulder blades, and unrack',
      'Step back and set feet shoulder-width or wider',
      'Brace core, push hips back, and descend by bending knees',
      'Go down until thighs are at least parallel to floor',
      'Drive through feet to stand back up',
      'Keep chest up and back flat throughout'
    ],
    tips: [
      'Master bodyweight squats before adding weight',
      'Keep knees tracking over toes',
      'Push knees out to maintain proper alignment',
      'Don\'t let knees cave inward',
      'Breathe deep into belly before each rep'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Rounding lower back at bottom',
      'Rising on toes',
      'Not hitting depth',
      'Looking up (strains neck)',
      'Weight shifting forward'
    ],
    variations: [
      'Front Squat',
      'Goblet Squat',
      'Box Squat',
      'Pause Squat',
      'High Bar vs Low Bar',
      'Safety Bar Squat'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['leg_press'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'squat',
    instructions: [
      'Sit in leg press machine with back flat against pad',
      'Place feet shoulder-width apart on platform',
      'Release safety handles and lower weight by bending knees',
      'Lower until knees are at approximately 90 degrees',
      'Press through heels to extend legs',
      'Don\'t lock knees completely at the top'
    ],
    tips: [
      'Keep lower back pressed against pad',
      'Don\'t let knees collapse inward',
      'Adjust foot placement for different emphasis',
      'High and wide = more glute focus',
      'Low and narrow = more quad focus'
    ],
    commonMistakes: [
      'Going too deep and rounding lower back',
      'Locking out knees completely',
      'Letting knees cave inward',
      'Using too narrow of foot placement'
    ],
    variations: [
      'Single Leg Press',
      'Wide Stance Leg Press',
      'Narrow Stance Leg Press',
      'Horizontal Leg Press',
      'Vertical Leg Press'
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'strength',
    muscleGroups: ['hamstrings', 'glutes', 'lower_back'],
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['glutes', 'lower_back'],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'hinge',
    instructions: [
      'Stand with feet hip-width apart, holding barbell at thighs',
      'Maintain slight bend in knees throughout',
      'Push hips back while lowering bar along legs',
      'Keep back flat and chest up',
      'Lower until you feel a strong hamstring stretch',
      'Drive hips forward to return to standing'
    ],
    tips: [
      'This is NOT a stiff-leg deadlift - maintain soft knees',
      'Push hips BACK, not just down',
      'Bar should travel close to your body',
      'Feel the stretch in hamstrings, not lower back'
    ],
    commonMistakes: [
      'Rounding the back',
      'Straightening legs completely',
      'Going too low (below where you feel stretch)',
      'Letting bar drift away from body'
    ],
    variations: [
      'Dumbbell Romanian Deadlift',
      'Single Leg Romanian Deadlift',
      'Deficit Romanian Deadlift',
      'Banded Romanian Deadlift'
    ]
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['bodyweight', 'dumbbell', 'barbell'],
    difficulty: 'beginner',
    type: 'compound',
    mechanics: 'squat',
    instructions: [
      'Stand with feet together',
      'Step forward with one leg into a lunge position',
      'Lower until back knee nearly touches the ground',
      'Front thigh should be parallel to floor',
      'Push through front heel to bring back leg forward',
      'Step into the next lunge with the other leg'
    ],
    tips: [
      'Keep torso upright throughout',
      'Don\'t let front knee extend past toes',
      'Step far enough forward for proper form',
      'Keep core engaged for balance'
    ],
    commonMistakes: [
      'Too short of a step',
      'Knee going past toes',
      'Torso leaning forward',
      'Pushing off back foot instead of front'
    ],
    variations: [
      'Stationary Lunges',
      'Reverse Lunges',
      'Bulgarian Split Squat',
      'Side Lunges',
      'Curtsy Lunges'
    ]
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    category: 'strength',
    muscleGroups: ['hamstrings'],
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['calves'],
    equipment: ['machine'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'pull',
    instructions: [
      'Lie face down on leg curl machine',
      'Position pad just above your heels',
      'Grip the handles for stability',
      'Curl your heels toward your glutes',
      'Squeeze hamstrings at the top',
      'Lower weight with control'
    ],
    tips: [
      'Don\'t lift hips off the pad',
      'Focus on squeezing hamstrings',
      'Use full range of motion',
      'Control both the up and down phases'
    ],
    commonMistakes: [
      'Lifting hips during curl',
      'Using momentum',
      'Not using full range of motion',
      'Going too fast'
    ],
    variations: [
      'Seated Leg Curl',
      'Standing Leg Curl',
      'Stability Ball Leg Curl',
      'Nordic Hamstring Curl'
    ]
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'strength',
    muscleGroups: ['quadriceps'],
    primaryMuscle: 'quadriceps',
    secondaryMuscles: [],
    equipment: ['machine'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Sit in leg extension machine with back against pad',
      'Position pad on lower shins, just above feet',
      'Adjust seat so knees align with machine pivot point',
      'Extend legs until fully straight',
      'Squeeze quads at the top',
      'Lower weight with control'
    ],
    tips: [
      'Don\'t use momentum to swing weight up',
      'Focus on quad contraction',
      'Don\'t lock knees aggressively',
      'Keep back against pad throughout'
    ],
    commonMistakes: [
      'Using too much weight',
      'Swinging weight up',
      'Not using full range of motion',
      'Leaning back during extension'
    ],
    variations: [
      'Single Leg Extension',
      'Toes Pointed Out (outer quad)',
      'Toes Pointed In (inner quad)'
    ]
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    category: 'strength',
    muscleGroups: ['calves'],
    primaryMuscle: 'calves',
    secondaryMuscles: [],
    equipment: ['machine', 'dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Stand on calf raise machine with balls of feet on platform',
      'Position shoulders under pads',
      'Lower heels below platform level for full stretch',
      'Rise up on toes as high as possible',
      'Squeeze calves at the top',
      'Lower with control to full stretch'
    ],
    tips: [
      'Use full range of motion - stretch at bottom, squeeze at top',
      'Don\'t bounce at the bottom',
      'Keep knees slightly bent',
      'Pause at peak contraction'
    ],
    commonMistakes: [
      'Bouncing out of the bottom',
      'Not using full range of motion',
      'Bending knees during movement',
      'Going too fast'
    ],
    variations: [
      'Seated Calf Raise (soleus focus)',
      'Donkey Calf Raise',
      'Single Leg Calf Raise',
      'Smith Machine Calf Raise'
    ]
  },

  // ARM EXERCISES
  {
    id: 'barbell-curl',
    name: 'Barbell Bicep Curl',
    category: 'strength',
    muscleGroups: ['biceps', 'forearms'],
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: ['barbell', 'ez_curl_bar'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'pull',
    instructions: [
      'Stand with feet shoulder-width apart, holding barbell with underhand grip',
      'Keep elbows close to your sides',
      'Curl the weight up toward shoulders',
      'Squeeze biceps at the top',
      'Lower with control back to starting position'
    ],
    tips: [
      'Don\'t swing the body to lift weight',
      'Keep elbows stationary - only forearms move',
      'Use a weight you can control',
      'EZ curl bar reduces wrist strain'
    ],
    commonMistakes: [
      'Swinging body/using momentum',
      'Moving elbows forward',
      'Not using full range of motion',
      'Going too heavy'
    ],
    variations: [
      'EZ Bar Curl',
      'Drag Curl',
      'Reverse Grip Curl',
      '21s'
    ]
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Bicep Curl',
    category: 'strength',
    muscleGroups: ['biceps', 'forearms'],
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'pull',
    instructions: [
      'Stand with dumbbells at sides, palms facing forward',
      'Keep elbows close to your body',
      'Curl weights up while keeping upper arms stationary',
      'Squeeze biceps at the top',
      'Lower with control'
    ],
    tips: [
      'Supinate (rotate palm up) as you curl for peak contraction',
      'Alternate arms or curl both simultaneously',
      'Don\'t let elbows drift forward',
      'Control the negative portion'
    ],
    commonMistakes: [
      'Swinging weights',
      'Moving elbows',
      'Not supinating wrist',
      'Dropping weight too fast'
    ],
    variations: [
      'Hammer Curl',
      'Incline Curl',
      'Concentration Curl',
      'Preacher Curl',
      'Cross-Body Curl'
    ]
  },
  {
    id: 'tricep-dip',
    name: 'Tricep Dips',
    category: 'calisthenics',
    muscleGroups: ['triceps', 'chest', 'front_delts'],
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'front_delts'],
    equipment: ['dip_bars', 'bench'],
    difficulty: 'intermediate',
    type: 'compound',
    mechanics: 'push',
    instructions: [
      'Grip the dip bars with arms straight',
      'Keep body upright (leaning forward works chest more)',
      'Lower body by bending elbows until upper arms parallel to floor',
      'Keep elbows close to body for tricep focus',
      'Press back up to starting position'
    ],
    tips: [
      'Stay upright to target triceps',
      'Don\'t go too deep - stresses shoulders',
      'Add weight with belt once bodyweight is easy',
      'Use assisted machine if needed'
    ],
    commonMistakes: [
      'Going too deep',
      'Flaring elbows out',
      'Swinging body',
      'Not using full range of motion'
    ],
    variations: [
      'Bench Dips',
      'Weighted Dips',
      'Assisted Dips',
      'Korean Dips'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Cable Pushdown',
    category: 'strength',
    muscleGroups: ['triceps'],
    primaryMuscle: 'triceps',
    secondaryMuscles: [],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Attach straight bar or rope to high cable pulley',
      'Stand facing machine, grab attachment with overhand grip',
      'Keep elbows pinned to your sides',
      'Push the weight down until arms are fully extended',
      'Squeeze triceps at the bottom',
      'Control the weight back up'
    ],
    tips: [
      'Don\'t let elbows move away from body',
      'Keep body upright - don\'t lean over the weight',
      'Squeeze triceps hard at full extension',
      'Use rope and spread at bottom for extra contraction'
    ],
    commonMistakes: [
      'Elbows flaring out',
      'Leaning over the weight',
      'Using body momentum',
      'Not fully extending arms'
    ],
    variations: [
      'Rope Pushdown',
      'V-Bar Pushdown',
      'Reverse Grip Pushdown',
      'Single Arm Pushdown'
    ]
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crushers (Lying Tricep Extension)',
    category: 'strength',
    muscleGroups: ['triceps'],
    primaryMuscle: 'triceps',
    secondaryMuscles: [],
    equipment: ['barbell', 'ez_curl_bar', 'dumbbell'],
    difficulty: 'intermediate',
    type: 'isolation',
    mechanics: 'push',
    instructions: [
      'Lie on bench holding bar with narrow grip',
      'Extend arms straight up over chest',
      'Lower bar toward forehead by bending elbows',
      'Keep upper arms stationary',
      'Extend elbows to press weight back up'
    ],
    tips: [
      'Keep elbows pointing up, not out',
      'Lower to forehead or just behind head',
      'Use EZ curl bar to reduce wrist strain',
      'Don\'t use too heavy of weight'
    ],
    commonMistakes: [
      'Flaring elbows out',
      'Moving upper arms',
      'Going too heavy',
      'Bouncing at bottom'
    ],
    variations: [
      'Decline Skull Crushers',
      'Incline Skull Crushers',
      'Dumbbell Skull Crushers',
      'Behind-the-Head Extensions'
    ]
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    category: 'calisthenics',
    muscleGroups: ['core', 'abs', 'shoulders'],
    primaryMuscle: 'core',
    secondaryMuscles: ['abs', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'isometric',
    instructions: [
      'Start in forearm plank position',
      'Elbows directly under shoulders',
      'Body in straight line from head to heels',
      'Engage core and squeeze glutes',
      'Keep hips level - don\'t sag or pike',
      'Hold for prescribed time'
    ],
    tips: [
      'Breathe normally throughout',
      'Focus on quality over duration',
      'Keep neck neutral',
      'Squeeze abs like bracing for a punch'
    ],
    commonMistakes: [
      'Hips sagging or piked up',
      'Looking up (strains neck)',
      'Holding breath',
      'Elbows too far forward'
    ],
    variations: [
      'High Plank',
      'Side Plank',
      'Plank with Shoulder Tap',
      'Plank to Push-up',
      'Plank with Leg Lift'
    ]
  },
  {
    id: 'crunch',
    name: 'Crunch',
    category: 'calisthenics',
    muscleGroups: ['abs'],
    primaryMuscle: 'abs',
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'rotation',
    instructions: [
      'Lie on back with knees bent, feet flat on floor',
      'Place hands behind head or across chest',
      'Lift shoulder blades off floor by contracting abs',
      'Exhale as you crunch up',
      'Lower with control, keeping tension on abs'
    ],
    tips: [
      'Don\'t pull on your neck',
      'Focus on using abs, not hip flexors',
      'Keep lower back pressed into floor',
      'Movement is small - just lifting shoulders off'
    ],
    commonMistakes: [
      'Pulling on neck with hands',
      'Using momentum to sit all the way up',
      'Letting feet come off floor',
      'Not controlling the descent'
    ],
    variations: [
      'Bicycle Crunch',
      'Reverse Crunch',
      'Cable Crunch',
      'Decline Crunch',
      'Cross-Body Crunch'
    ]
  },
  {
    id: 'leg-raise',
    name: 'Hanging Leg Raise',
    category: 'calisthenics',
    muscleGroups: ['abs', 'hip_flexors'],
    primaryMuscle: 'abs',
    secondaryMuscles: ['hip_flexors'],
    equipment: ['pull_up_bar'],
    difficulty: 'intermediate',
    type: 'isolation',
    mechanics: 'rotation',
    instructions: [
      'Hang from pull-up bar with arms extended',
      'Engage core and keep body still',
      'Raise legs until parallel to floor or higher',
      'Lower legs with control',
      'Avoid swinging'
    ],
    tips: [
      'Start with bent knees if straight legs are too difficult',
      'Posterior pelvic tilt (curl pelvis) to better engage abs',
      'Don\'t use momentum',
      'Use ab straps if grip is limiting factor'
    ],
    commonMistakes: [
      'Swinging for momentum',
      'Using hip flexors more than abs',
      'Not controlling the descent',
      'Limited range of motion'
    ],
    variations: [
      'Lying Leg Raise',
      'Captain\'s Chair Leg Raise',
      'Knee Raise',
      'Windshield Wipers',
      'Toes to Bar'
    ]
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'calisthenics',
    muscleGroups: ['obliques', 'abs'],
    primaryMuscle: 'obliques',
    secondaryMuscles: ['abs'],
    equipment: ['bodyweight', 'medicine_ball', 'dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'rotation',
    instructions: [
      'Sit with knees bent, feet slightly off floor',
      'Lean back to about 45 degrees',
      'Hold weight at chest or clasp hands together',
      'Rotate torso to one side, then the other',
      'Keep core engaged throughout'
    ],
    tips: [
      'Move from the torso, not just the arms',
      'Keep feet elevated to increase difficulty',
      'Control the movement - don\'t use momentum',
      'Breathe consistently'
    ],
    commonMistakes: [
      'Moving arms without rotating torso',
      'Rounding back',
      'Going too fast',
      'Dropping feet to make it easier'
    ],
    variations: [
      'Weighted Russian Twist',
      'Feet-Down Russian Twist',
      'Medicine Ball Russian Twist',
      'Decline Russian Twist'
    ]
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'calisthenics',
    muscleGroups: ['core', 'abs'],
    primaryMuscle: 'core',
    secondaryMuscles: ['abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    type: 'isolation',
    mechanics: 'isometric',
    instructions: [
      'Lie on back with arms extended toward ceiling',
      'Raise legs with knees bent at 90 degrees',
      'Press lower back firmly into floor',
      'Simultaneously lower opposite arm and leg',
      'Return to starting position and switch sides',
      'Maintain lower back contact throughout'
    ],
    tips: [
      'Focus on keeping lower back pressed down',
      'Move slowly and with control',
      'Breathe out as you extend limbs',
      'Great for learning core bracing'
    ],
    commonMistakes: [
      'Letting lower back arch up',
      'Moving too quickly',
      'Not coordinating opposite limbs',
      'Holding breath'
    ],
    variations: [
      'Dead Bug with Band',
      'Dead Bug with Weight',
      'Bird Dog (prone version)',
      'Single Side Dead Bug'
    ]
  }
];

// Utility functions
export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => 
    ex.primaryMuscle === muscle || ex.secondaryMuscles.includes(muscle)
  );
}

export function getExercisesByEquipment(equipment: Equipment): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => 
    ex.equipment.includes(equipment)
  );
}

export function getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.difficulty === difficulty);
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.category === category);
}

export function getCompoundExercises(): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.type === 'compound');
}

export function getIsolationExercises(): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.type === 'isolation');
}

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.muscleGroups.some(m => m.includes(lowerQuery)) ||
    ex.equipment.some(e => e.includes(lowerQuery))
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_DATABASE.find(ex => ex.id === id);
}

export function getRandomExercisesForMuscle(muscle: MuscleGroup, count: number = 3): Exercise[] {
  const exercises = getExercisesByMuscle(muscle);
  const shuffled = [...exercises].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getExercisesForWorkout(
  muscles: MuscleGroup[],
  equipment: Equipment[],
  difficulty: Exercise['difficulty']
): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => 
    (muscles.some(m => ex.primaryMuscle === m || ex.secondaryMuscles.includes(m))) &&
    (equipment.length === 0 || ex.equipment.some(e => equipment.includes(e))) &&
    (ex.difficulty === difficulty || 
     (difficulty === 'intermediate' && ex.difficulty === 'beginner') ||
     (difficulty === 'advanced'))
  );
}
