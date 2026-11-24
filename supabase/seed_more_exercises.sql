-- ============================================================
-- ASCEND — additional exercise library seed (v2)
-- Adds 18 techniques covering the newer hologram scenes.
-- Idempotent: each row only inserts when its name is absent.
-- Run in Supabase SQL Editor (Dashboard → SQL).
-- ============================================================

-- 1. Burpee ---------------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Burpee','calisthenics','advanced','END','{quads,chest,core}','{}',
  'Full-body conditioner: squat, thrust to a plank, snap back up and jump.',
  array['Move with control — speed comes after form','Land softly with knees tracking over toes','Brace the core through the plank phase'],
  array['Sagging hips in the plank','Crash-landing the jump','Rushing and skipping the full stand-up'],
  40,3,'10',null,true,'anim:burpee'
where not exists (select 1 from public.exercises where lower(name) = 'burpee');

-- 2. Crunch ---------------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Crunch','home','beginner','TEC','{abs,core}','{}',
  'Classic abdominal curl: peel the shoulder blades off the floor and lower slowly.',
  array['Exhale as you curl up','Chin off the chest — look at the ceiling','Lower with control, no dropping'],
  array['Yanking the head with the hands','Using momentum instead of the abs','Bouncing off the floor between reps'],
  18,3,'15',null,true,'anim:crunch'
where not exists (select 1 from public.exercises where lower(name) = 'crunch');

-- 3. Bicycle Crunch ------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Bicycle Crunch','home','intermediate','TEC','{abs,obliques}','{}',
  'Alternating elbow-to-knee rotation that lights up the obliques.',
  array['Rotate from the ribs, not the elbows','Extend the opposite leg long and low','Slow pedals beat fast flailing'],
  array['Pulling on the neck','Hips rocking side to side','Holding your breath'],
  22,3,'20',null,true,'anim:crunch'
where not exists (select 1 from public.exercises where lower(name) = 'bicycle crunch');

-- 4. Jump Rope ------------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Jump Rope','home','intermediate','VIT','{calves,shoulders,core}','{jump rope}',
  'Simple, brutal conditioning — small hops, fast wrists, steady breath.',
  array['Jump just high enough for the rope to pass','Spin the rope from the wrists','Stay on the balls of the feet'],
  array['Tucking into huge kangaroo jumps','Swinging with whole arms','Landing flat-footed'],
  25,3,'1 min',60,true,'anim:rope'
where not exists (select 1 from public.exercises where lower(name) = 'jump rope');

-- 5. High Knees ----------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'High Knees','home','beginner','AGI','{quads,hip flexors,calves}','{}',
  'Run-in-place drill driving the knees to hip height — agility and conditioning.',
  array['Drive knees to hip height','Pump the arms in rhythm','Stay tall and light'],
  array['Leaning back','Low, lazy knees','Heavy stomping landings'],
  20,4,'30 s',45,true,'anim:run'
where not exists (select 1 from public.exercises where lower(name) = 'high knees');

-- 6. Jump Squat ----------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Jump Squat','calisthenics','intermediate','AGI','{quads,glutes,calves}','{}',
  'Plyometric squat: sink to parallel and explode vertically, landing soft.',
  array['Load the hips before every jump','Swing the arms for lift','Absorb the landing through the legs'],
  array['Stiff-legged landings','Half-depth squats between reps','Knees caving inward'],
  26,3,'12',null,true,'anim:squat'
where not exists (select 1 from public.exercises where lower(name) = 'jump squat');

-- 7. Bulgarian Split Squat ------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Bulgarian Split Squat','gym','intermediate','STR','{quads,glutes}','{dumbbells, bench}',
  'Rear-foot-elevated split squat — a brutal single-leg strength builder.',
  array['Front shin roughly vertical at the bottom','Torso tall, slight forward lean ok','Push the floor away through the front heel'],
  array['Stance too short','Front heel lifting off','Bouncing off the back knee'],
  30,3,'10 / leg',null,true,'anim:lunge'
where not exists (select 1 from public.exercises where lower(name) = 'bulgarian split squat');

-- 8. Walking Lunge --------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Walking Lunge','home','beginner','STR','{quads,glutes}','{dumbbells}',
  'Travelling lunges that stretch and strengthen the hips with every step.',
  array['Step long enough for a 90° front knee','Keep the torso upright','Trail knee hovers just above the floor'],
  array['Short steps that overload the front knee','Front knee shooting past the toes','Wobbling without bracing the core'],
  24,3,'12 / leg',null,true,'anim:lunge'
where not exists (select 1 from public.exercises where lower(name) = 'walking lunge');

-- 9. Single-Leg Deadlift --------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Single-Leg Deadlift','home','intermediate','TEC','{hamstrings,glutes,core}','{dumbbells}',
  'Balance-meets-hinge: one leg behind you as the weight traces down the standing shin.',
  array['Hips square to the floor','Hinge — do not squat','Standing knee soft, never locked'],
  array['Rotating the hips open','Rounding the spine','Rushing the return to standing'],
  28,3,'10 / side',null,true,'anim:deadlift'
where not exists (select 1 from public.exercises where lower(name) = 'single-leg deadlift');

-- 10. Kettlebell Deadlift -------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Kettlebell Deadlift','gym','beginner','STR','{hamstrings,glutes,back}','{kettlebell}',
  'The fundamental hinge pattern with a bell between the feet — perfect for beginners.',
  array['Wedge the hips back, bell over mid-foot','Flat back, proud chest','Stand tall by driving the hips forward'],
  array['Squatting instead of hinging','Bell drifting away from the shins','Jerking the bell off the floor'],
  26,4,'10',null,true,'anim:deadlift'
where not exists (select 1 from public.exercises where lower(name) = 'kettlebell deadlift');

-- 11. Barbell Hip Thrust --------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Barbell Hip Thrust','gym','intermediate','STR','{glutes,hamstrings}','{barbell, bench}',
  'Upper back on a bench, bar over the hips — drive to a full lockout and squeeze.',
  array['Finish with ribs down, glutes squeezed','Chin tucked, eyes forward','Pause one beat at the top'],
  array['Overextending the lower back','Pushing through the toes','Hyperextending the neck'],
  30,4,'10',null,true,'anim:bridge'
where not exists (select 1 from public.exercises where lower(name) = 'barbell hip thrust');

-- 12. Chair Tricep Dip ----------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Chair Tricep Dip','home','beginner','STR','{triceps,chest,shoulders}','{chair}',
  'Hands on a sturdy chair or step, lower with bent elbows and press back up.',
  array['Elbows track straight back','Shoulders stay down away from the ears','Range to about 90° at the elbow'],
  array['Hips drifting away from the chair','Shrugging into the ears','Bouncing out of the bottom'],
  20,3,'12',null,true,'anim:dip'
where not exists (select 1 from public.exercises where lower(name) = 'chair tricep dip');

-- 13. Seated Dumbbell Shoulder Press ---------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Seated Dumbbell Shoulder Press','gym','beginner','STR','{shoulders,triceps}','{dumbbells}',
  'Seated press from collarbone height to a strong overhead lockout.',
  array['Wrists stacked over the elbows','Press slightly back to finish over the ears','Core braced, ribs down'],
  array['Flaring the ribs and arching the back','Clanging the bells together overhead','Partial lockouts'],
  24,3,'10',null,true,'anim:press'
where not exists (select 1 from public.exercises where lower(name) = 'seated dumbbell shoulder press');

-- 14. Incline Dumbbell Press ----------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Incline Dumbbell Press','gym','intermediate','STR','{chest,shoulders,triceps}','{dumbbells, bench}',
  'Upper-chest focus: press the bells from nipple-to-collarbone height on an incline bench.',
  array['Shoulder blades pinched and down','Elbows at ~45°, not flared to 90','Touch depth without shoulder strain'],
  array['Turning it into a fly','Hips lifting off the bench','Dropping the bells fast'],
  28,3,'10',null,true,'anim:bench'
where not exists (select 1 from public.exercises where lower(name) = 'incline dumbbell press');

-- 15. Dumbbell Single-Arm Row ---------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Dumbbell Single-Arm Row','home','beginner','STR','{lats,back,biceps}','{dumbbells}',
  'One arm, one bench: pull the bell to the hip and feel the lat do the work.',
  array['Pull toward the hip, not the armpit','Square hips and shoulders','Fully straighten the arm each rep'],
  array['Twisting the torso to cheat','Yanking with the biceps','Short, choppy ranges'],
  24,3,'12 / side',null,true,'anim:row'
where not exists (select 1 from public.exercises where lower(name) = 'dumbbell single-arm row');

-- 16. Band Face Pull ------------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Band Face Pull','home','beginner','TEC','{rear delts,upper back}','{bands}',
  'Row a band toward the eyes, splitting the hands wide — posture insurance.',
  array['Pull to the forehead, thumbs back','Squeeze the shoulder blades at the end range','Light band, strict tempo'],
  array['Going too heavy and shrugging','Elbows dropping below wrists','Leaning back for leverage'],
  20,3,'15',null,true,'anim:pullapart'
where not exists (select 1 from public.exercises where lower(name) = 'band face pull');

-- 17. Dumbbell Hammer Curl ------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Dumbbell Hammer Curl','home','beginner','STR','{biceps,forearms}','{dumbbells}',
  'Neutral-grip curls that build the biceps and the brachialis for thicker arms.',
  array['Elbows pinned to the sides','Curl to a hard squeeze, lower in 2–3 s','Wrists neutral and firm'],
  array['Swinging the torso','Elbows drifting forward','Cutting the lowering half short'],
  20,3,'12',null,true,'anim:curl'
where not exists (select 1 from public.exercises where lower(name) = 'dumbbell hammer curl');

-- 18. Plank Shoulder Tap --------------------------------------
insert into public.exercises
  (name, category, difficulty, stat_focus, muscles, equipment, description, cues, mistakes, base_xp, default_sets, default_reps, duration_sec, published, animation_url)
select 'Plank Shoulder Tap','calisthenics','intermediate','END','{core,shoulders}','{}',
  'From a strong plank, tap each shoulder without letting the hips sway.',
  array['Feet wider for more stability','Move slow — this is anti-rotation','Glutes and abs braced the whole time'],
  array['Hips rocking side to side','Rushing the taps','Hiking the butt up'],
  26,3,'40 s',40,true,'anim:plank'
where not exists (select 1 from public.exercises where lower(name) = 'plank shoulder tap');
