-- ASCEND seed data: public.exercises
-- 48 exercises across home / gym / calisthenics / yoga / breath / martial.
-- Plain INSERTs only. Safe to run once against a fresh database.

-- ---------- HOME (10) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Push-Up', 'home', ARRAY['chest','triceps','shoulders','core'], 'beginner', ARRAY['none'], NULL, 'anim:pushup',
   'Classic bodyweight press that builds the chest, arms, and trunk. Lower under control until your chest nearly touches the floor, then press back up.',
   ARRAY['Hands under shoulders','Body in one straight line','Lower chest to just above the floor','Exhale as you press up'],
   ARRAY['Sagging hips','Flaring elbows out to 90 degrees','Cutting the range short'],
   'STR', 18, 3, '8-12', NULL, true),

  ('Incline Push-Up', 'home', ARRAY['chest','triceps','shoulders'], 'beginner', ARRAY['none'], NULL, 'anim:pushup',
   'Push-up with hands on a sturdy elevated surface such as a counter or low table. The incline reduces load, making it a great entry point before floor push-ups.',
   ARRAY['Choose a stable surface','Brace your core before lowering','Keep a straight line from head to heels'],
   ARRAY['Hips piking up','Shrugging shoulders toward ears'],
   'STR', 15, 3, '10-15', NULL, true),

  ('Glute Bridge', 'home', ARRAY['glutes','hamstrings','core'], 'beginner', ARRAY['none'], NULL, 'anim:squat',
   'Lying hip extension that strengthens the glutes and hamstrings while sparing the lower back. Drive through the heels and squeeze at the top.',
   ARRAY['Heels close to your hips','Push through your heels','Squeeze glutes at the top','Lower slowly'],
   ARRAY['Arching the lower back at the top','Pushing through the toes instead of heels'],
   'STR', 15, 3, '12-15', NULL, true),

  ('Bodyweight Squat', 'home', ARRAY['quads','glutes','hamstrings','core'], 'beginner', ARRAY['none'], NULL, 'anim:squat',
   'Foundational lower-body movement. Sit your hips back and down as if reaching for a chair, keeping your chest tall.',
   ARRAY['Feet shoulder-width apart','Sit hips back and down','Knees track over toes','Chest stays tall'],
   ARRAY['Heels lifting off the floor','Knees caving inward','Rounding the upper back'],
   'STR', 15, 3, '12-15', NULL, true),

  ('Reverse Lunge', 'home', ARRAY['quads','glutes','hamstrings','core'], 'beginner', ARRAY['none'], NULL, 'anim:squat',
   'Step back into a lunge, lowering your rear knee toward the floor. Gentler on the knees than forward lunges and great for single-leg strength and balance.',
   ARRAY['Step back with control','Front shin stays vertical','Lower the back knee gently','Push through the front heel to stand'],
   ARRAY['Front knee drifting past the toes','Leaning the torso far forward','Short, choppy steps'],
   'STR', 16, 3, '8-10 per leg', NULL, true),

  ('Band Row', 'home', ARRAY['back','lats','biceps'], 'beginner', ARRAY['bands'], NULL, 'anim:pull',
   'Seated or standing row using a resistance band anchored at chest height or around the feet. Builds upper-back strength and posture.',
   ARRAY['Anchor the band securely','Pull elbows back past your ribs','Squeeze shoulder blades together','Control the return'],
   ARRAY['Shrugging the shoulders','Leaning back to cheat the pull','Letting the band snap back'],
   'STR', 16, 3, '10-12', NULL, true),

  ('Band Pull-Apart', 'home', ARRAY['rear delts','upper back'], 'beginner', ARRAY['bands'], NULL, 'anim:pull',
   'Hold a band at shoulder height and pull it apart until it touches your chest. Excellent for shoulder health and desk-posture correction.',
   ARRAY['Arms straight but not locked','Pull the band to your chest','Squeeze shoulder blades','Return slowly'],
   ARRAY['Bending the elbows to make it easier','Rushing the reps'],
   'STR', 15, 3, '12-15', NULL, true),

  ('Dumbbell Floor Press', 'home', ARRAY['chest','triceps','shoulders'], 'intermediate', ARRAY['dumbbells'], NULL, 'anim:pushup',
   'Lying on the floor, press dumbbells from the chest to lockout. The floor limits shoulder range, making it a joint-friendly home pressing option.',
   ARRAY['Wrists stacked over elbows','Lower until triceps touch the floor','Press up and slightly together','Keep feet planted'],
   ARRAY['Bouncing the elbows off the floor','Arching the lower back excessively'],
   'STR', 25, 3, '8-12', NULL, true),

  ('Dumbbell Shoulder Press', 'home', ARRAY['shoulders','triceps','core'], 'intermediate', ARRAY['dumbbells'], NULL, 'anim:pushup',
   'Standing or seated overhead press with dumbbells. Builds strong shoulders and a stable trunk.',
   ARRAY['Brace your core before pressing','Press straight up, not forward','Finish with biceps by your ears','Lower with control'],
   ARRAY['Arching the lower back','Flaring the ribs','Pressing unevenly'],
   'STR', 26, 3, '8-10', NULL, true),

  ('Jumping Jacks', 'home', ARRAY['full body','calves','shoulders'], 'beginner', ARRAY['none'], NULL, 'anim:run',
   'Simple full-body cardio move: jump the feet wide while raising the arms overhead, then return. Great warm-up or conditioning filler.',
   ARRAY['Land softly on the balls of your feet','Keep a steady rhythm','Full arm swing overhead'],
   ARRAY['Landing stiff-legged','Shallow, lazy arm movement'],
   'VIT', 15, NULL, NULL, 60, true);

-- ---------- GYM (10) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Goblet Squat', 'gym', ARRAY['quads','glutes','core'], 'beginner', ARRAY['dumbbells'], NULL, 'anim:squat',
   'Squat while holding a dumbbell at your chest. The front load teaches an upright torso and is one of the best squat-learning tools.',
   ARRAY['Hold the dumbbell close to your chest','Elbows point down','Sit between your heels','Stand tall by driving through the floor'],
   ARRAY['Letting the weight pull you forward','Heels rising','Collapsing the chest'],
   'STR', 18, 3, '8-12', NULL, true),

  ('Lat Pulldown', 'gym', ARRAY['lats','biceps','upper back'], 'beginner', ARRAY['machine'], NULL, 'anim:pull',
   'Cable pulldown that builds the lats and prepares you for pull-ups. Pull the bar to your upper chest with a tall, slightly leaned-back torso.',
   ARRAY['Grip just outside shoulder width','Pull the bar to your collarbone','Lead with the elbows','Control the way up'],
   ARRAY['Swinging the torso for momentum','Pulling the bar behind the neck','Half-range reps'],
   'STR', 18, 3, '10-12', NULL, true),

  ('Leg Press', 'gym', ARRAY['quads','glutes','hamstrings'], 'beginner', ARRAY['machine'], NULL, 'anim:squat',
   'Machine-supported lower-body press. Lower the sled until your knees approach 90 degrees, then drive back up without locking out hard.',
   ARRAY['Feet shoulder-width on the platform','Lower under control','Keep your lower back on the pad','Do not lock the knees hard'],
   ARRAY['Going so deep the hips curl off the pad','Slamming into lockout','Knees caving in'],
   'STR', 18, 3, '10-12', NULL, true),

  ('Barbell Bench Press', 'gym', ARRAY['chest','triceps','shoulders'], 'intermediate', ARRAY['barbell'], NULL, 'anim:pushup',
   'The classic barbell chest press. Lower the bar to your mid-chest and press back to lockout with your feet planted and shoulder blades pinned.',
   ARRAY['Squeeze shoulder blades into the bench','Bar touches mid-chest','Drive feet into the floor','Press up and slightly back'],
   ARRAY['Bouncing the bar off the chest','Flaring elbows to 90 degrees','Lifting the hips off the bench'],
   'STR', 28, 4, '6-10', NULL, true),

  ('Seated Cable Row', 'gym', ARRAY['back','lats','biceps'], 'beginner', ARRAY['machine'], NULL, 'anim:pull',
   'Seated horizontal row on a cable stack. Builds mid-back thickness and reinforces good pulling posture.',
   ARRAY['Sit tall with a proud chest','Pull the handle to your stomach','Squeeze shoulder blades together','Let the arms lengthen fully'],
   ARRAY['Rocking the torso back and forth','Shrugging into the pull','Rounding the lower back'],
   'STR', 18, 3, '10-12', NULL, true),

  ('Romanian Deadlift', 'gym', ARRAY['hamstrings','glutes','lower back'], 'intermediate', ARRAY['barbell'], NULL, 'anim:squat',
   'Hip hinge with a barbell: push the hips back with soft knees until you feel a hamstring stretch, then stand by driving the hips forward.',
   ARRAY['Push hips back, not down','Bar stays close to your legs','Flat back throughout','Squeeze glutes to stand'],
   ARRAY['Rounding the lower back','Bending the knees into a squat','Overextending at the top'],
   'STR', 28, 3, '8-10', NULL, true),

  ('Barbell Back Squat', 'gym', ARRAY['quads','glutes','hamstrings','core'], 'advanced', ARRAY['barbell'], NULL, 'anim:squat',
   'The king of lower-body lifts. With the bar on your upper back, squat to at least parallel while keeping a braced trunk and stable feet.',
   ARRAY['Brace before you descend','Break at hips and knees together','Knees track over toes','Drive up through the whole foot'],
   ARRAY['Good-morning the weight up (hips shooting back first)','Heels lifting','Losing the brace at the bottom'],
   'STR', 36, 4, '5-8', NULL, true),

  ('Barbell Overhead Press', 'gym', ARRAY['shoulders','triceps','core'], 'intermediate', ARRAY['barbell'], NULL, 'anim:pushup',
   'Standing strict press from the collarbone to overhead lockout. Builds pressing strength and total-body stability.',
   ARRAY['Squeeze glutes and brace','Bar path close to the face','Push your head through at the top','Lower to the collarbone with control'],
   ARRAY['Leaning back to turn it into an incline press','Bending the knees to cheat','Flaring the ribs'],
   'STR', 27, 3, '6-10', NULL, true),

  ('Dumbbell Biceps Curl', 'gym', ARRAY['biceps','forearms'], 'beginner', ARRAY['dumbbells'], NULL, 'anim:pull',
   'Standing curl with dumbbells. Keep the elbows pinned to your sides and lift with the biceps, not momentum.',
   ARRAY['Elbows glued to your sides','Curl up without swinging','Squeeze at the top','Lower slowly'],
   ARRAY['Swinging the torso','Letting the elbows drift forward','Dropping the weight on the way down'],
   'STR', 15, 3, '10-12', NULL, true),

  ('Chest Press Machine', 'gym', ARRAY['chest','triceps','shoulders'], 'beginner', ARRAY['machine'], NULL, 'anim:pushup',
   'Guided horizontal press that is ideal for learning pressing mechanics safely before moving to free weights.',
   ARRAY['Adjust the seat so handles sit at mid-chest','Keep your back against the pad','Press smoothly to near lockout','Control the return'],
   ARRAY['Setting the seat too high or low','Letting the shoulders roll forward'],
   'STR', 16, 3, '10-12', NULL, true);

-- ---------- CALISTHENICS (8) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Pull-Up', 'calisthenics', ARRAY['lats','biceps','upper back','core'], 'intermediate', ARRAY['pull-up bar'], NULL, 'anim:pull',
   'Hang from a bar with an overhand grip and pull until your chin clears it. The benchmark upper-body pulling exercise.',
   ARRAY['Start from a dead hang','Pull shoulder blades down first','Drive elbows toward your ribs','Lower all the way with control'],
   ARRAY['Kipping or swinging','Chin-poking to fake the last inch','Half-range reps'],
   'STR', 28, 3, '5-8', NULL, true),

  ('Negative Pull-Up', 'calisthenics', ARRAY['lats','biceps','upper back'], 'beginner', ARRAY['pull-up bar'], NULL, 'anim:pull',
   'Jump or step to the top of a pull-up, then lower yourself as slowly as possible. The fastest route to your first full pull-up.',
   ARRAY['Start with chin over the bar','Lower for a slow 3-5 count','Stay tight the whole way down','Rest fully between reps'],
   ARRAY['Dropping quickly through the middle','Losing shoulder tension at the bottom'],
   'STR', 18, 3, '3-5', NULL, true),

  ('Straight Bar Dip', 'calisthenics', ARRAY['chest','triceps','shoulders','core'], 'intermediate', ARRAY['pull-up bar'], NULL, 'anim:pushup',
   'Support yourself on top of a low bar and dip down until the bar meets your lower chest, then press back up. Demands pressing strength and trunk control.',
   ARRAY['Lean slightly forward over the bar','Lower with control','Keep shoulders away from ears','Lock out fully at the top'],
   ARRAY['Shrugging at the bottom','Kicking the legs for momentum','Cutting depth short'],
   'STR', 28, 3, '5-8', NULL, true),

  ('Assisted Pistol Squat', 'calisthenics', ARRAY['quads','glutes','core'], 'intermediate', ARRAY['none'], NULL, 'anim:squat',
   'Single-leg squat progression holding a doorframe, post, or strap for balance. Builds the strength and mobility needed for the full pistol squat.',
   ARRAY['Hold support lightly, not with a death grip','Extend the free leg forward','Lower slowly to your depth limit','Keep the working heel down'],
   ARRAY['Pulling yourself up entirely with the arms','Letting the knee cave inward','Rushing the descent'],
   'STR', 27, 3, '4-6 per leg', NULL, true),

  ('Hollow Body Hold', 'calisthenics', ARRAY['core','hip flexors'], 'intermediate', ARRAY['none'], NULL, 'anim:plank',
   'Lie on your back, press your lower back into the floor, and lift shoulders and legs to form a shallow banana shape. A gymnastics staple for total-core tension.',
   ARRAY['Lower back stays glued to the floor','Reach arms past your ears','Legs long and squeezed together','Breathe shallowly, stay tight'],
   ARRAY['Lower back arching off the floor','Bending the knees to hide fatigue','Holding the breath'],
   'END', 25, NULL, NULL, 30, true),

  ('Plank', 'calisthenics', ARRAY['core','shoulders','glutes'], 'beginner', ARRAY['none'], NULL, 'anim:plank',
   'Hold a straight line from head to heels on your forearms. The foundation of core stability work.',
   ARRAY['Elbows under shoulders','Squeeze glutes and quads','Push the floor away','Keep breathing steadily'],
   ARRAY['Hips sagging or piking','Looking up and craning the neck'],
   'END', 15, NULL, NULL, 45, true),

  ('Side Plank', 'calisthenics', ARRAY['obliques','core','shoulders'], 'beginner', ARRAY['none'], NULL, 'anim:plank',
   'Balance on one forearm and the side of your foot, lifting the hips into a straight line. Targets the often-neglected side core.',
   ARRAY['Elbow directly under the shoulder','Stack feet or stagger for balance','Lift hips high','Keep the body in one plane'],
   ARRAY['Hips dropping toward the floor','Rolling the chest forward'],
   'END', 16, NULL, NULL, 30, true),

  ('Pseudo Planche Push-Up', 'calisthenics', ARRAY['chest','shoulders','triceps','core'], 'advanced', ARRAY['none'], NULL, 'anim:pushup',
   'Push-up with hands turned out and placed low near the waist, shoulders leaning far past the wrists. Builds serious straight-arm and pressing strength.',
   ARRAY['Turn fingers out to spare the wrists','Lean shoulders well past the hands','Body rigid from head to heels','Push the floor away hard at the top'],
   ARRAY['Not leaning forward enough','Sagging hips','Losing the lean at the bottom'],
   'STR', 36, 3, '5-8', NULL, true);

-- ---------- YOGA (8) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Downward Dog', 'yoga', ARRAY['hamstrings','calves','shoulders','back'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'Inverted V shape with hands and feet on the floor and hips lifted high. Lengthens the whole back line of the body while gently strengthening the shoulders.',
   ARRAY['Spread the fingers wide','Push the floor away','Lift the hips up and back','Soft bend in the knees is fine'],
   ARRAY['Rounding the spine to force heels down','Collapsing into the shoulders'],
   'FLX', 15, NULL, NULL, 45, true),

  ('Cat-Cow', 'yoga', ARRAY['spine','core','neck'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'On hands and knees, alternate slowly between arching and rounding the spine in rhythm with your breath. A gentle mobilizer for the whole back.',
   ARRAY['Move with the breath','Inhale to arch, exhale to round','Let the movement travel the whole spine','Keep it slow and smooth'],
   ARRAY['Rushing through the positions','Moving only from the lower back'],
   'FLX', 15, NULL, NULL, 60, true),

  ('Pigeon Pose', 'yoga', ARRAY['hips','glutes','hip flexors'], 'intermediate', ARRAY['none'], NULL, 'anim:stretch',
   'Deep hip opener with the front leg folded and the back leg extended. Ease in gradually — the stretch should feel strong but never sharp.',
   ARRAY['Square the hips forward','Support with hands or a cushion','Fold forward only as far as comfortable','Breathe into the stretch'],
   ARRAY['Forcing the front shin parallel','Collapsing onto one hip','Pain in the front knee — back off if felt'],
   'FLX', 25, NULL, NULL, 60, true),

  ('Warrior II', 'yoga', ARRAY['quads','hips','shoulders'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'Strong standing pose with a bent front knee and arms extended in a T. Builds leg endurance while opening the hips.',
   ARRAY['Front knee stacks over the ankle','Back foot parallel to the mat edge','Arms reach in opposite directions','Gaze over the front hand'],
   ARRAY['Front knee caving inward','Leaning the torso over the front leg','Shoulders creeping up'],
   'FLX', 16, NULL, NULL, 40, true),

  ('Standing Forward Fold', 'yoga', ARRAY['hamstrings','lower back','calves'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'Hinge from the hips and let the upper body hang toward the floor. A calming stretch for the hamstrings and spine — bend the knees as much as needed.',
   ARRAY['Hinge from the hips, not the waist','Let the head hang heavy','Bend the knees generously','Sway gently if it feels good'],
   ARRAY['Locking the knees','Straining to touch the floor','Bouncing aggressively'],
   'FLX', 15, NULL, NULL, 45, true),

  ('Thread the Needle', 'yoga', ARRAY['upper back','shoulders','neck'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'From hands and knees, slide one arm under the body and rest the shoulder and ear on the mat. A gentle twist that releases the upper back.',
   ARRAY['Slide the arm through slowly','Rest the shoulder and ear down','Keep hips stacked over knees','Breathe into the twist'],
   ARRAY['Collapsing all the weight onto the neck','Twisting from the lower back'],
   'FLX', 15, NULL, NULL, 45, true),

  ('Child''s Pose', 'yoga', ARRAY['back','hips','shoulders'], 'beginner', ARRAY['none'], NULL, 'anim:stretch',
   'Kneel, sit back toward the heels, and fold forward with arms extended. A restful position used to downshift the nervous system between efforts.',
   ARRAY['Knees wide, big toes together','Sink the hips toward the heels','Reach the arms long','Soften the breath'],
   ARRAY['Holding tension in the shoulders','Forcing the hips down if knees complain'],
   'FLX', 15, NULL, NULL, 60, true),

  ('Low Lunge', 'yoga', ARRAY['hip flexors','quads','glutes'], 'intermediate', ARRAY['none'], NULL, 'anim:stretch',
   'Kneeling lunge with the back knee down and hips pressing gently forward. One of the best stretches for hips tightened by sitting.',
   ARRAY['Back knee padded and down','Sink the hips forward and down','Tuck the tailbone slightly','Keep the front knee over the ankle'],
   ARRAY['Overarching the lower back','Letting the front knee slide far past the toes'],
   'FLX', 25, NULL, NULL, 45, true);

-- ---------- BREATH (5) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Box Breathing', 'breath', ARRAY['diaphragm'], 'beginner', ARRAY['none'], NULL, 'anim:breathe',
   'Breathe in a gentle square: inhale 4 seconds, hold 4, exhale 4, hold 4, seated and relaxed. Never practice near water or while driving; stop and sit down if you feel dizzy.',
   ARRAY['Sit comfortably with a tall spine','Count a steady 4-4-4-4 rhythm','Keep every phase gentle, never strained','Return to normal breathing anytime'],
   ARRAY['Forcing the holds when short of breath','Tensing the shoulders while counting'],
   'BRE', 15, NULL, NULL, 240, true),

  ('Diaphragmatic Breathing', 'breath', ARRAY['diaphragm'], 'beginner', ARRAY['none'], NULL, 'anim:breathe',
   'Slow belly breathing with one hand on the chest and one on the stomach, letting only the lower hand rise. Never practice near water or while driving; stop and sit down if you feel dizzy.',
   ARRAY['One hand on chest, one on belly','Inhale so only the belly hand rises','Exhale slowly through pursed lips','Keep the pace unhurried'],
   ARRAY['Breathing high into the chest','Forcing the belly out instead of relaxing it'],
   'BRE', 15, NULL, NULL, 300, true),

  ('4-7-8 Breathing', 'breath', ARRAY['diaphragm'], 'intermediate', ARRAY['none'], NULL, 'anim:breathe',
   'Relaxation pattern: inhale through the nose for 4, hold gently for 7, exhale slowly through the mouth for 8, done seated. Never practice near water or while driving; stop and sit down if you feel dizzy.',
   ARRAY['Sit or lie down before starting','Keep the 7-count hold soft, never straining','Exhale long and quiet for 8','Shorten the counts if uncomfortable'],
   ARRAY['Straining to complete the hold','Gasping on the inhale after the exhale'],
   'BRE', 25, NULL, NULL, 240, true),

  ('Coherent Breathing', 'breath', ARRAY['diaphragm'], 'beginner', ARRAY['none'], NULL, 'anim:breathe',
   'Even, relaxed breathing at about 5-6 breaths per minute — roughly 5 seconds in, 5 seconds out — with no holds. Never practice near water or while driving; stop and sit down if you feel dizzy.',
   ARRAY['Inhale gently for about 5 seconds','Exhale for about 5 seconds','No pauses, just a smooth wave','Let the shoulders stay soft'],
   ARRAY['Over-breathing with big forceful inhales','Watching the clock instead of relaxing into the rhythm'],
   'BRE', 16, NULL, NULL, 300, true),

  ('Guided Calm Breathing', 'breath', ARRAY['diaphragm'], 'beginner', ARRAY['none'], NULL, 'anim:breathe',
   'A longer wind-down session of slow nasal breathing with a gently extended exhale, ideal before sleep. Never practice near water or while driving; stop and sit down if you feel dizzy.',
   ARRAY['Settle somewhere quiet and comfortable','Breathe in through the nose','Make each exhale slightly longer than the inhale','Let thoughts pass without chasing them'],
   ARRAY['Trying to force relaxation','Extending the exhale until it feels like strain'],
   'BRE', 18, NULL, NULL, 600, true);

-- ---------- MARTIAL (7) ----------
insert into public.exercises
  (name, category, muscles, difficulty, equipment, image_url, animation_url, description, cues, mistakes, stat_focus, base_xp, default_sets, default_reps, duration_sec, published)
values
  ('Jab-Cross Shadowboxing', 'martial', ARRAY['shoulders','core','arms'], 'beginner', ARRAY['none'], NULL, 'anim:punch',
   'Throw relaxed jab-cross combinations at the air, focusing on clean technique and returning the hands to guard. A conditioning and technique drill for fitness and self-protection fundamentals.',
   ARRAY['Keep both hands up in guard','Rotate hips and shoulders into the cross','Snap punches back to guard','Stay light on your feet'],
   ARRAY['Dropping the non-punching hand','Fully locking the elbows out','Standing flat-footed'],
   'TEC', 16, NULL, NULL, 120, true),

  ('Footwork Drill', 'martial', ARRAY['calves','quads','core'], 'beginner', ARRAY['none'], NULL, 'anim:run',
   'Move forward, back, and side to side in stance without crossing the feet, keeping steps small and balanced. Builds the agility base every striking art relies on.',
   ARRAY['Small steps, never crossing the feet','Stay on the balls of your feet','Keep your guard up while moving','Maintain stance width at all times'],
   ARRAY['Bouncing too high','Squaring the hips to the front','Letting the feet come together'],
   'AGI', 15, NULL, NULL, 90, true),

  ('Front Kick Technique', 'martial', ARRAY['hips','quads','core'], 'beginner', ARRAY['none'], NULL, 'anim:punch',
   'Practice the front kick in the air with a slow chamber, extension, and re-chamber, holding a wall for balance if needed. Purely a technique and mobility drill — control matters more than height.',
   ARRAY['Chamber the knee first','Extend with the ball of the foot','Re-chamber before setting the foot down','Keep hands in guard throughout'],
   ARRAY['Swinging the leg without chambering','Leaning back excessively','Kicking higher than your control allows'],
   'TEC', 16, 3, '8-10 per leg', NULL, true),

  ('Knee Strike Drill', 'martial', ARRAY['hips','core','glutes'], 'intermediate', ARRAY['none'], NULL, 'anim:punch',
   'Drive the knee upward in the air while pulling the hands down in a clinch motion, alternating sides. Develops hip power and balance as a fitness and self-defense fundamental.',
   ARRAY['Rise onto the ball of the supporting foot','Drive the hip through, not just the knee','Pull the hands down as the knee rises','Reset your stance between reps'],
   ARRAY['Losing balance by leaning too far back','Skipping the hip drive','Rushing and letting the guard drop'],
   'TEC', 25, 3, '10-12 per side', NULL, true),

  ('Defensive Slip Drill', 'martial', ARRAY['core','obliques','legs'], 'intermediate', ARRAY['none'], NULL, 'anim:punch',
   'Practice slipping imaginary straight punches by bending the knees and shifting the head just off the centerline, left and right. A defensive movement pattern drilled purely for technique.',
   ARRAY['Bend from the knees, not the waist','Move the head just off the line, no more','Keep your eyes forward','Return to center immediately'],
   ARRAY['Ducking with the eyes down','Over-slipping far past the line','Straightening the legs mid-drill'],
   'AGI', 25, NULL, NULL, 90, true),

  ('Stance Switch Drill', 'martial', ARRAY['calves','quads','core'], 'beginner', ARRAY['none'], NULL, 'anim:punch',
   'Hop smoothly between orthodox and southpaw stances while keeping guard and balance. Trains coordination and comfort moving on both sides of the body.',
   ARRAY['Switch with a small, quiet hop','Land in a full stance every time','Keep the guard up during the switch','Stay balanced — speed comes later'],
   ARRAY['Landing square with feet parallel','Dropping the hands mid-switch','Big, loud jumps instead of small hops'],
   'AGI', 15, NULL, NULL, 60, true),

  ('Self-Defense Posture and Awareness Drill', 'martial', ARRAY['core','shoulders','legs'], 'beginner', ARRAY['none'], NULL, 'anim:punch',
   'Practice a calm, non-aggressive ready posture: staggered stance, open hands raised at chest height, scanning your surroundings while breathing steadily. Awareness and de-escalation posture are the first layer of self-protection.',
   ARRAY['Stagger the feet for balance','Open palms up at chest height, non-threatening','Scan left and right with your eyes','Keep breathing slow and controlled'],
   ARRAY['Clenching fists and escalating body language','Tunnel vision on one point','Standing square with locked knees'],
   'TEC', 15, NULL, NULL, 180, true);
