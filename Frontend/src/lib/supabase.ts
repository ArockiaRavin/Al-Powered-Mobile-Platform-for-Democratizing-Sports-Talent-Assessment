import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  sport_focus: string | null;
  role: 'athlete' | 'scout' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Trial = {
  id: string;
  athlete_id: string;
  video_url: string | null;
  sport_type: string;
  description: string | null;
  cheat_score: number;
  status: 'pending' | 'processing' | 'completed' | 'flagged';
  created_at: string;
  updated_at: string;
};

export type AiMetric = {
  id: string;
  trial_id: string;
  vertical_jump: number | null;
  limb_angle: number | null;
  execution_speed: number | null;
  overall_score: number | null;
  notes: string | null;
  detected_sport: string | null;
  appreciation: string | null;
  moment_summary: string | null;
  created_at: string;
};

export type TrialMoment = {
  id: string;
  trial_id: string;
  timestamp_sec: number;
  rating: 'weak' | 'average' | 'strong';
  description: string;
  mistake_type: string | null;
  tutorial_url: string | null;
  tutorial_title: string | null;
  created_at: string;
};

export const SPORT_TYPES = [
  'Cricket',
  'Football',
  'Basketball',
  'Athletics (Sprint)',
  'Athletics (Long Jump)',
  'Kabaddi',
  'Badminton',
  'Wrestling',
  'Boxing',
  'Swimming',
  'Volleyball',
  'Hockey',
  'Tennis',
  'Other',
];

// Sport-specific AI metric labels
export const SPORT_METRICS: Record<string, { label: string; unit: string; key: 'vertical_jump' | 'limb_angle' | 'execution_speed' }[]> = {
  Cricket: [
    { label: 'Bat Swing Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Stance Angle', unit: '°', key: 'limb_angle' },
    { label: 'Footwork Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Football: [
    { label: 'Sprint Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Kick Angle', unit: '°', key: 'limb_angle' },
    { label: 'Vertical Jump', unit: 'm', key: 'vertical_jump' },
  ],
  Basketball: [
    { label: 'Vertical Jump', unit: 'm', key: 'vertical_jump' },
    { label: 'Shot Angle', unit: '°', key: 'limb_angle' },
    { label: 'Reaction Speed', unit: 'm/s', key: 'execution_speed' },
  ],
  'Athletics (Sprint)': [
    { label: 'Sprint Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Stride Length', unit: 'm', key: 'vertical_jump' },
    { label: 'Lean Angle', unit: '°', key: 'limb_angle' },
  ],
  'Athletics (Long Jump)': [
    { label: 'Jump Distance', unit: 'm', key: 'vertical_jump' },
    { label: 'Takeoff Angle', unit: '°', key: 'limb_angle' },
    { label: 'Approach Speed', unit: 'm/s', key: 'execution_speed' },
  ],
  Kabaddi: [
    { label: 'Raid Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Tackle Angle', unit: '°', key: 'limb_angle' },
    { label: 'Agility Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Badminton: [
    { label: 'Smash Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Wrist Angle', unit: '°', key: 'limb_angle' },
    { label: 'Court Coverage', unit: 'pts', key: 'vertical_jump' },
  ],
  Wrestling: [
    { label: 'Grip Strength', unit: 'pts', key: 'execution_speed' },
    { label: 'Stance Angle', unit: '°', key: 'limb_angle' },
    { label: 'Balance Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Boxing: [
    { label: 'Punch Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Guard Angle', unit: '°', key: 'limb_angle' },
    { label: 'Footwork Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Swimming: [
    { label: 'Stroke Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Body Angle', unit: '°', key: 'limb_angle' },
    { label: 'Dive Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Volleyball: [
    { label: 'Spike Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Jump Height', unit: 'm', key: 'vertical_jump' },
    { label: 'Arm Angle', unit: '°', key: 'limb_angle' },
  ],
  Hockey: [
    { label: 'Stick Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Drag Angle', unit: '°', key: 'limb_angle' },
    { label: 'Agility Score', unit: 'pts', key: 'vertical_jump' },
  ],
  Tennis: [
    { label: 'Serve Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Swing Angle', unit: '°', key: 'limb_angle' },
    { label: 'Court Coverage', unit: 'pts', key: 'vertical_jump' },
  ],
  Other: [
    { label: 'Execution Speed', unit: 'm/s', key: 'execution_speed' },
    { label: 'Limb Angle', unit: '°', key: 'limb_angle' },
    { label: 'Performance Score', unit: 'pts', key: 'vertical_jump' },
  ],
};

// Generate sport-specific simulated metrics
export const PRO_ATHLETES: Record<string, { sports: string[]; minScore: number }> = {
  'cristiano ronaldo': { sports: ['Football'], minScore: 95 },
  'ronaldo': { sports: ['Football'], minScore: 95 },
  'lionel messi': { sports: ['Football'], minScore: 96 },
  'messi': { sports: ['Football'], minScore: 96 },
  'usain bolt': { sports: ['Athletics (Sprint)'], minScore: 97 },
  'bolt': { sports: ['Athletics (Sprint)'], minScore: 97 },
  'husain bolt': { sports: ['Athletics (Sprint)'], minScore: 97 },
  'hussain bolt': { sports: ['Athletics (Sprint)'], minScore: 97 },
  'virat kohli': { sports: ['Cricket'], minScore: 94 },
  'kohli': { sports: ['Cricket'], minScore: 94 },
  'ms dhoni': { sports: ['Cricket'], minScore: 93 },
  'dhoni': { sports: ['Cricket'], minScore: 93 },
  'rohit sharma': { sports: ['Cricket'], minScore: 92 },
  'lebron james': { sports: ['Basketball'], minScore: 95 },
  'lebron': { sports: ['Basketball'], minScore: 95 },
  'michael jordan': { sports: ['Basketball'], minScore: 98 },
  'jordan': { sports: ['Basketball'], minScore: 98 },
  'steph curry': { sports: ['Basketball'], minScore: 93 },
  'curry': { sports: ['Basketball'], minScore: 93 },
  'roger federer': { sports: ['Tennis'], minScore: 95 },
  'federer': { sports: ['Tennis'], minScore: 95 },
  'rafael nadal': { sports: ['Tennis'], minScore: 94 },
  'nadal': { sports: ['Tennis'], minScore: 94 },
  'novak djokovic': { sports: ['Tennis'], minScore: 95 },
  'djokovic': { sports: ['Tennis'], minScore: 95 },
  'michael phelps': { sports: ['Swimming'], minScore: 96 },
  'phelps': { sports: ['Swimming'], minScore: 96 },
  'neeraj chopra': { sports: ['Athletics (Long Jump)'], minScore: 93 },
  'sachin tendulkar': { sports: ['Cricket'], minScore: 96 },
  'sachin': { sports: ['Cricket'], minScore: 96 },
  'saina nehwal': { sports: ['Badminton'], minScore: 91 },
  'pv sindhu': { sports: ['Badminton'], minScore: 92 },
  'sindhu': { sports: ['Badminton'], minScore: 92 },
  'mary kom': { sports: ['Boxing'], minScore: 92 },
  'tiger woods': { sports: ['Other'], minScore: 94 },
};

export const generateSportMetrics = (sport: string, athleteName?: string) => {
  const ranges: Record<string, { speed: [number, number]; angle: [number, number]; jump: [number, number] }> = {
    Cricket:               { speed: [20, 45], angle: [65, 95], jump: [55, 85] },
    Football:              { speed: [4, 9],   angle: [30, 60], jump: [0.4, 0.9] },
    Basketball:            { speed: [3, 6],   angle: [45, 65], jump: [0.5, 1.1] },
    'Athletics (Sprint)':  { speed: [7, 12],  angle: [15, 35], jump: [1.8, 2.8] },
    'Athletics (Long Jump)': { speed: [7, 11], angle: [20, 45], jump: [4.5, 8.5] },
    Kabaddi:               { speed: [3, 7],   angle: [40, 80], jump: [50, 90] },
    Badminton:             { speed: [50, 140], angle: [50, 85], jump: [60, 90] },
    Wrestling:             { speed: [60, 90], angle: [30, 70], jump: [50, 85] },
    Boxing:                { speed: [5, 14],  angle: [45, 80], jump: [55, 90] },
    Swimming:              { speed: [1.2, 2.2], angle: [5, 20], jump: [55, 90] },
    Volleyball:            { speed: [12, 28], angle: [50, 80], jump: [0.5, 1.0] },
    Hockey:                { speed: [15, 40], angle: [30, 60], jump: [55, 85] },
    Tennis:                { speed: [30, 90], angle: [50, 85], jump: [55, 88] },
    Other:                 { speed: [3, 9],   angle: [40, 80], jump: [0.5, 1.5] },
  };
  const r = ranges[sport] ?? ranges.Other;
  const rand = (min: number, max: number) => +(min + Math.random() * (max - min)).toFixed(2);

  let overallScore = Math.round(52 + Math.random() * 43);

  if (athleteName) {
    const name = athleteName.toLowerCase().trim();
    for (const [key, info] of Object.entries(PRO_ATHLETES)) {
      if (name.includes(key)) {
        overallScore = Math.max(overallScore, info.minScore + Math.floor(Math.random() * (99 - info.minScore)));
        break;
      }
    }
  }

  return {
    execution_speed: rand(r.speed[0], r.speed[1]),
    limb_angle: rand(r.angle[0], r.angle[1]),
    vertical_jump: rand(r.jump[0], r.jump[1]),
    overall_score: overallScore,
  };
};

// Auto-detect sport from video metadata (simulated AI detection)
export const detectSportFromVideo = (fileName: string): string => {
  const name = fileName.toLowerCase();
  const keywords: Record<string, string[]> = {
    Cricket: ['cricket', 'bat', 'bowl', 'wicket', 'pitch'],
    Football: ['football', 'soccer', 'goal', 'kick', 'dribble'],
    Basketball: ['basketball', 'court', 'dribble', 'shoot', 'hoop'],
    'Athletics (Sprint)': ['sprint', 'race', 'track', '100m', '200m', 'marathon'],
    'Athletics (Long Jump)': ['longjump', 'long_jump', 'jump', 'sand', 'takeoff'],
    Kabaddi: ['kabaddi', 'raid', 'tackle', 'mat'],
    Badminton: ['badminton', 'smash', 'shuttle', 'racket'],
    Wrestling: ['wrestling', 'wrestle', 'mat', 'grapple'],
    Boxing: ['boxing', 'box', 'punch', 'ring', 'sparring'],
    Swimming: ['swimming', 'swim', 'pool', 'stroke', 'freestyle'],
    Volleyball: ['volleyball', 'volley', 'spike', 'serve'],
    Hockey: ['hockey', 'stick', 'drag', 'flick'],
    Tennis: ['tennis', 'serve', 'ace', 'racket', 'court'],
  };
  for (const [sport, kws] of Object.entries(keywords)) {
    if (kws.some((kw) => name.includes(kw))) return sport;
  }
  const sports = SPORT_TYPES.filter((s) => s !== 'Other');
  return sports[Math.floor(Math.random() * sports.length)];
};

// Mistake catalog with tutorial recommendations and improvement tips per sport
type MistakeCatalog = { type: string; description: string; improvement: string; tutorialUrl: string; tutorialTitle: string }[];

export const SPORT_MISTAKES: Record<string, MistakeCatalog> = {
  Cricket: [
    { type: 'Stance', description: 'Backlift slightly high, weight not fully balanced', improvement: 'Keep your backlift compact and distribute weight evenly on both feet. Practice your stance in front of a mirror for 10 minutes daily.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Cricket Batting Stance Fundamentals' },
    { type: 'Head Position', description: 'Head leaning slightly towards off-side', improvement: 'Keep your head still and level. Focus on a fixed point with your eyes and avoid head tilt during the shot.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Keep Your Head Still While Batting' },
    { type: 'Footwork', description: 'Front foot not reaching the pitch of the ball', improvement: 'Practice stepping forward to meet the ball. Use footwork drills with cones to improve your movement to the ball.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Cricket Footwork Drills' },
  ],
  Football: [
    { type: 'First Touch', description: 'Ball bouncing slightly away on control', improvement: 'Cushion the ball with a relaxed foot. Practice first-touch drills against a wall for 15 minutes daily to develop soft control.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Improve Your First Touch in Football' },
    { type: 'Passing', description: 'Ankle not fully locked when passing', improvement: 'Lock your ankle firmly and strike the center of the ball. Practice short passing drills with a partner focusing on ankle lock.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Football Passing Technique' },
    { type: 'Body Balance', description: 'Leaning slightly back when shooting', improvement: 'Keep your body over the ball when shooting. Plant your non-kicking foot beside the ball and stay leaning forward.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Shooting Body Position' },
  ],
  Basketball: [
    { type: 'Shooting Form', description: 'Elbow drifting slightly outward on release', improvement: 'Keep your elbow tucked in and aligned with the rim. Practice form shooting close to the basket focusing on elbow position.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Basketball Shooting Form Guide' },
    { type: 'Dribbling Height', description: 'Ball bouncing a bit above waist level', improvement: 'Keep your dribble below waist height. Practice low dribbling drills with your head up to improve ball control.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Low Dribbling Technique' },
    { type: 'Footwork', description: 'Pivot foot not planted firmly', improvement: 'Plant your pivot foot firmly before making a move. Practice pivot drills to establish a strong base.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Basketball Pivot Footwork' },
  ],
  'Athletics (Sprint)': [
    { type: 'Arm Swing', description: 'Arms slightly crossing the body midline', improvement: 'Drive your arms straight forward and back. Practice arm swing drills in front of a mirror to correct the crossing motion.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Sprint Arm Swing Mechanics' },
    { type: 'Body Lean', description: 'Slightly too upright during acceleration', improvement: 'Lean forward at 45 degrees during the first 20 meters. Practice drive phase starts to develop the forward lean.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Sprint Acceleration Posture' },
    { type: 'Stride', description: 'Slight overstriding causing minor braking', improvement: 'Focus on quick turnover rather than long strides. Practice high-knee drills to improve stride frequency.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Optimal Sprint Stride Length' },
  ],
  'Athletics (Long Jump)': [
    { type: 'Takeoff', description: 'Planting slightly off from the board', improvement: 'Measure your approach run consistently. Practice your run-up 10 times focusing on hitting the same mark each time.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Long Jump Takeoff Technique' },
    { type: 'Flight', description: 'Not fully achieving the hang position', improvement: 'Practice the hang technique off a short approach. Focus on extending your legs in flight and cycling your arms.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Long Jump Flight Phase' },
    { type: 'Landing', description: 'Legs not fully extended forward on landing', improvement: 'Practice landing drills focusing on extending your legs forward. Reach with your heels and avoid falling backward.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Long Jump Landing Form' },
  ],
  Kabaddi: [
    { type: 'Raid Timing', description: 'Slight delay in making the touch during raid', improvement: 'Practice quick touch-and-return drills. Time your raid to make the touch within 3 seconds of entering the opponent half.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Kabaddi Raid Timing Drills' },
    { type: 'Tackle Grip', description: 'Gripping slightly high on the raider', improvement: 'Aim to grip at thigh or waist level. Practice tackle drills focusing on getting low and gripping at the right height.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Kabaddi Tackle Technique' },
    { type: 'Footwork', description: 'Feet slightly crossing during defense', improvement: 'Maintain a staggered stance with feet shoulder-width apart. Practice lateral shuffle drills to avoid crossing feet.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Kabaddi Defensive Footwork' },
  ],
  Badminton: [
    { type: 'Grip Pressure', description: 'Holding the racket slightly too tight', improvement: 'Relax your grip between shots. Practice finger grip drills — hold the racket lightly and only tighten on contact.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Badminton Grip Relaxation' },
    { type: 'Smash Contact', description: 'Contact point slightly low on smash', improvement: 'Reach full extension and contact the shuttle at the highest point. Practice smash drills focusing on contacting above your head.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Badminton Smash Contact Point' },
    { type: 'Court Coverage', description: 'Not returning to center quickly after shot', improvement: 'Always return to the center after every shot. Practice shadow badminton to build the habit of recovering to center.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Badminton Court Movement' },
  ],
  Wrestling: [
    { type: 'Stance', description: 'Hips slightly high in defensive stance', improvement: 'Lower your hips and keep your back flat. Practice stance holds for 30 seconds at a time to build the habit.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Wrestling Stance Fundamentals' },
    { type: 'Grip', description: 'Losing tie-up control at the collar tie', improvement: 'Strengthen your grip and maintain constant pressure. Practice collar-tie drills with a partner to improve control.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Wrestling Grip Strength Drills' },
    { type: 'Leverage', description: 'Not fully using legs for the drive', improvement: 'Drive with your legs, not just your arms. Practice penetration shots focusing on leg drive and explosion.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Wrestling Leverage Techniques' },
  ],
  Boxing: [
    { type: 'Guard', description: 'Lead hand dropping slightly after jab', improvement: 'Keep your guard up at all times. Practice shadow boxing focusing on returning your hand to your face immediately after every punch.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Boxing Guard Position Drills' },
    { type: 'Footwork', description: 'Feet slightly crossing during movement', improvement: 'Step with the lead foot first, then trail foot. Practice footwork drills moving in all directions without crossing feet.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Boxing Footwork Fundamentals' },
    { type: 'Hip Rotation', description: 'Not fully rotating hips on the cross', improvement: 'Rotate your hips and pivot your back foot on the cross. Practice the cross on the heavy bag focusing on full hip rotation.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Boxing Hip Rotation Power' },
  ],
  Swimming: [
    { type: 'Head Position', description: 'Head lifting slightly high during freestyle', improvement: 'Keep your head in line with your spine. Practice looking down at the bottom of the pool with one eye barely above the surface.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Freestyle Head Position' },
    { type: 'Kick Depth', description: 'Kicking slightly deep, creating minor drag', improvement: 'Keep your kicks within the shadow of your body. Practice kicking drills with a kickboard focusing on shallow, quick kicks.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Swimming Kick Technique' },
    { type: 'Catch', description: 'Hand entering slightly early in stroke', improvement: 'Enter fingertips first with a slight outward angle. Practice catch drills focusing on extending fully before the pull.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Freestyle Catch and Pull' },
  ],
  Volleyball: [
    { type: 'Spike Timing', description: 'Jumping slightly early on the approach', improvement: 'Time your jump so you contact the ball at the peak of your jump. Practice approach footwork (left-right-left for righties) without a ball first.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Volleyball Spike Timing' },
    { type: 'Arm Swing', description: 'Non-hitting arm not fully leading the jump', improvement: 'Drive both arms up on your approach. Practice your approach focusing on swinging both arms up to generate height.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Volleyball Arm Swing Mechanics' },
    { type: 'Serve Toss', description: 'Toss slightly inconsistent and low', improvement: 'Practice your toss without serving — toss the ball up and let it drop to check consistency. Aim for the same height every time.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Volleyball Serve Toss Technique' },
  ],
  Hockey: [
    { type: 'Stick Grip', description: 'Hands slightly too close on the stick', improvement: 'Space your hands apart for better control. Practice basic dribbling with the correct grip spacing to build muscle memory.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Hockey Stick Grip Guide' },
    { type: 'Body Position', description: 'Not getting low enough on the drag flick', improvement: 'Bend your knees and get your body low. Practice the drag flick motion in slow motion focusing on staying low throughout.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Hockey Drag Flick Technique' },
    { type: 'Trapping', description: 'Ball bouncing slightly off the stick on receive', improvement: 'Cushion the ball with a soft stick. Practice trapping drills — receive the ball with your stick angled to absorb the impact.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Hockey Ball Trapping Skills' },
  ],
  Tennis: [
    { type: 'Serve Toss', description: 'Toss drifting slightly behind the body', improvement: 'Practice your toss to land slightly in front of you. Toss the ball and let it bounce to check placement before serving.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Tennis Serve Toss Placement' },
    { type: 'Footwork', description: 'Not fully splitting step before groundstroke', improvement: 'Practice the split step every time your opponent makes contact. Do shadow split-step drills to build the habit.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Tennis Split Step Timing' },
    { type: 'Follow Through', description: 'Swing cutting slightly short after contact', improvement: 'Let your racket finish fully across your body. Practice your strokes in slow motion focusing on complete follow-through.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Tennis Follow-Through Technique' },
  ],
  Other: [
    { type: 'Body Alignment', description: 'Posture slightly off for the movement', improvement: 'Focus on maintaining proper alignment. Practice the movement in front of a mirror and correct your posture gradually.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Athletic Body Alignment Basics' },
    { type: 'Timing', description: 'Movement timing slightly off', improvement: 'Practice the movement repeatedly at slow speed. Gradually increase speed once your timing becomes consistent.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Improving Athletic Timing' },
    { type: 'Energy Transfer', description: 'Power not transferring fully efficiently', improvement: 'Focus on connecting your whole body in the movement. Practice the movement focusing on using your legs, core, and arms together.', tutorialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tutorialTitle: 'Energy Transfer in Sports' },
  ],
};

// Appreciation messages for good performance moments
const APPRECIATION_MESSAGES = [
  'Excellent technique! Your form was textbook perfect on this play.',
  'Outstanding performance! That moment showed real athletic quality.',
  'Brilliant execution! Keep replicating that technique.',
  'Fantastic work! That moment demonstrated elite-level skill.',
  'Great job! Your body positioning was spot on.',
  'Superb control and timing on that sequence!',
  'Impressive power and precision! That is how it should be done.',
  'Wonderful performance! That moment was a highlight of your trial.',
];

// Generate per-moment analysis for a trial
// 'strong' = Good Score (well played), 'weak'/'average' = mistake with improvement tip
// If overallScore >= 89, all moments are Good Score — no mistakes shown
export const generateTrialMoments = (sport: string, videoDuration: number, overallScore: number = 60): Omit<TrialMoment, 'id' | 'trial_id' | 'created_at'>[] => {
  const mistakes = SPORT_MISTAKES[sport] ?? SPORT_MISTAKES.Other;
  const numMoments = Math.min(Math.max(Math.floor(videoDuration / 5), 3), 8);
  const moments: Omit<TrialMoment, 'id' | 'trial_id' | 'created_at'>[] = [];

  for (let i = 0; i < numMoments; i++) {
    const ts = +(i * (videoDuration / numMoments)).toFixed(1);
    const roll = Math.random();
    let rating: 'weak' | 'average' | 'strong';
    if (roll < 0.3) rating = 'weak';
    else if (roll < 0.65) rating = 'average';
    else rating = 'strong';

    if (overallScore >= 89 || rating === 'strong') {
      // Good Score — well performed moment with appreciation
      moments.push({
        timestamp_sec: ts,
        rating: 'strong',
        description: APPRECIATION_MESSAGES[Math.floor(Math.random() * APPRECIATION_MESSAGES.length)],
        mistake_type: null,
        tutorial_url: null,
        tutorial_title: null,
      });
    } else {
      // weak or average — mistake with improvement tip and tutorial
      const mistake = mistakes[Math.floor(Math.random() * mistakes.length)];
      moments.push({
        timestamp_sec: ts,
        rating,
        description: `${mistake.type} — ${mistake.description}. To improve: ${mistake.improvement}`,
        mistake_type: mistake.type,
        tutorial_url: mistake.tutorialUrl,
        tutorial_title: mistake.tutorialTitle,
      });
    }
  }
  return moments;
};

// Generate appreciation text for overall performance
export const generateAppreciation = (score: number, sport: string): string => {
  if (score >= 85) return `Outstanding ${sport} performance! You demonstrated exceptional technique and athleticism. Your form, timing, and execution were at an elite level. Keep pushing — you have serious potential!`;
  if (score >= 70) return `Great ${sport} trial! You showed strong fundamentals and good technique. With a few refinements to the areas highlighted, you will be performing at an even higher level. Well done!`;
  if (score >= 55) return `Good effort in your ${sport} trial! You have a solid foundation to build on. Focus on the tutorial videos for your small mistakes and you will see rapid improvement.`;
  return `Every champion started somewhere! Your ${sport} trial shows potential. Review the tutorial videos carefully and practice the fundamentals. Consistency is key — keep working!`;
};
