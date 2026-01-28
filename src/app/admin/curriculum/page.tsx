'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Clock, Brain, Check, Star, MessageSquare, FileText, Users } from 'lucide-react';

type Domain = 'cognitive' | 'creative' | 'language' | 'physical' | 'social_emotional';
const domainColors: Record<Domain, string> = { cognitive: 'bg-christina-blue', creative: 'bg-christina-coral', language: 'bg-christina-red', physical: 'bg-christina-yellow', social_emotional: 'bg-purple-500' };

interface Milestone { area: string; skill: string; status: 'mastered' | 'developing' | 'emerging' }
interface Activity { title: string; day: string; time: string; domain: Domain; duration: number }
interface Lesson { title: string; objectives: string[]; materials: string[]; duration: number }
interface Assessment { child: string; area: string; score: number; notes: string }
interface Observation { child: string; date: string; note: string; teacher: string }

interface RoomData {
  milestones: Milestone[];
  activities: Activity[];
  lessons: Lesson[];
  assessments: Assessment[];
  observations: Observation[];
}

const rooms: Record<string, RoomData> = {
  Infant: {
    milestones: [
      { area: 'Motor', skill: 'Grasps rattle', status: 'mastered' },
      { area: 'Motor', skill: 'Rolls over', status: 'developing' },
      { area: 'Motor', skill: 'Sits with support', status: 'emerging' },
      { area: 'Motor', skill: 'Reaches for objects', status: 'mastered' },
      { area: 'Motor', skill: 'Holds head steady', status: 'mastered' },
      { area: 'Motor', skill: 'Transfers objects between hands', status: 'developing' },
      { area: 'Motor', skill: 'Begins crawling', status: 'emerging' },
      { area: 'Cognitive', skill: 'Tracks objects visually', status: 'mastered' },
      { area: 'Cognitive', skill: 'Explores with hands and mouth', status: 'mastered' },
      { area: 'Cognitive', skill: 'Responds to peek-a-boo', status: 'mastered' },
      { area: 'Cognitive', skill: 'Looks for hidden objects', status: 'developing' },
      { area: 'Cognitive', skill: 'Shows curiosity about new objects', status: 'developing' },
      { area: 'Social', skill: 'Smiles responsively', status: 'mastered' },
      { area: 'Social', skill: 'Recognizes familiar faces', status: 'developing' },
      { area: 'Social', skill: 'Shows attachment to caregivers', status: 'mastered' },
      { area: 'Social', skill: 'Responds to own name', status: 'developing' },
      { area: 'Language', skill: 'Babbles with consonants', status: 'developing' },
      { area: 'Language', skill: 'Coos and vocalizes', status: 'mastered' },
      { area: 'Language', skill: 'Imitates sounds', status: 'emerging' },
    ],
    activities: [
      { title: 'Tummy Time', day: 'Monday', time: '9:00 AM', domain: 'physical', duration: 15 },
      { title: 'Sensory Bottles', day: 'Monday', time: '10:30 AM', domain: 'cognitive', duration: 15 },
      { title: 'Peek-a-Boo Games', day: 'Monday', time: '2:00 PM', domain: 'social_emotional', duration: 10 },
      { title: 'Lullaby Circle', day: 'Tuesday', time: '9:00 AM', domain: 'language', duration: 10 },
      { title: 'Texture Exploration', day: 'Tuesday', time: '10:30 AM', domain: 'cognitive', duration: 15 },
      { title: 'Soft Block Stacking', day: 'Tuesday', time: '2:00 PM', domain: 'physical', duration: 10 },
      { title: 'Mirror Play', day: 'Wednesday', time: '9:00 AM', domain: 'social_emotional', duration: 10 },
      { title: 'Musical Shakers', day: 'Wednesday', time: '10:30 AM', domain: 'creative', duration: 15 },
      { title: 'Board Book Reading', day: 'Wednesday', time: '2:00 PM', domain: 'language', duration: 10 },
      { title: 'Outdoor Stroll', day: 'Thursday', time: '9:30 AM', domain: 'physical', duration: 20 },
      { title: 'Water Play Mat', day: 'Thursday', time: '10:30 AM', domain: 'cognitive', duration: 15 },
      { title: 'Ribbon Dancing', day: 'Thursday', time: '2:00 PM', domain: 'creative', duration: 10 },
      { title: 'Finger Paint Bags', day: 'Friday', time: '10:00 AM', domain: 'creative', duration: 15 },
      { title: 'Bubble Watching', day: 'Friday', time: '9:00 AM', domain: 'cognitive', duration: 10 },
      { title: 'Gentle Yoga Stretches', day: 'Friday', time: '2:00 PM', domain: 'physical', duration: 10 },
    ],
    lessons: [
      { title: 'Exploring Our Senses', objectives: ['Develop sensory awareness', 'Strengthen motor skills'], materials: ['Textured fabrics', 'Sensory bottles', 'Safe mirrors'], duration: 15 },
      { title: 'Sound & Movement', objectives: ['Respond to music', 'Build caregiver bonds'], materials: ['Musical instruments', 'Colored scarves'], duration: 10 },
      { title: 'Tummy Time Adventures', objectives: ['Strengthen neck and core muscles', 'Encourage reaching and grasping'], materials: ['Play mat', 'Rattles', 'High-contrast cards'], duration: 15 },
      { title: 'Baby Sign Language', objectives: ['Introduce basic signs', 'Encourage pre-verbal communication'], materials: ['Sign language cards', 'Board books'], duration: 10 },
      { title: 'Cause & Effect Discovery', objectives: ['Understand simple cause-effect', 'Develop hand-eye coordination'], materials: ['Pop-up toys', 'Musical buttons', 'Stacking cups'], duration: 15 },
      { title: 'Nature Sensory Basket', objectives: ['Explore natural textures', 'Stimulate curiosity'], materials: ['Pine cones', 'Smooth stones', 'Leaves', 'Wicker basket'], duration: 10 },
    ],
    assessments: [
      { child: 'Baby Mia', area: 'Motor Development', score: 3, notes: 'Rolling over consistently, beginning to push up on arms' },
      { child: 'Baby Noah', area: 'Social-Emotional', score: 4, notes: 'Excellent social smiling, tracks faces across room' },
      { child: 'Baby Ava', area: 'Cognitive', score: 3, notes: 'Shows interest in cause-effect toys, reaches for objects' },
      { child: 'Baby Mia', area: 'Language Development', score: 3, notes: 'Babbling with varied consonants, responds to name consistently' },
      { child: 'Baby Noah', area: 'Motor Development', score: 4, notes: 'Sitting independently for short periods, strong head control' },
      { child: 'Baby Ava', area: 'Social-Emotional', score: 4, notes: 'Laughs during peek-a-boo, reaches for familiar caregivers' },
      { child: 'Baby Leo', area: 'Cognitive', score: 2, notes: 'Beginning to explore objects with mouth, watches mobiles intently' },
      { child: 'Baby Leo', area: 'Motor Development', score: 2, notes: 'Developing head control during tummy time, grasps fingers' },
    ],
    observations: [
      { child: 'Baby Mia', date: 'Jan 24', note: 'Mia rolled from tummy to back twice during tummy time today! Very excited and cooed afterward.', teacher: 'Maria S.' },
      { child: 'Baby Noah', date: 'Jan 23', note: 'Noah babbled "ma-ma" sounds during lullaby circle. Making great progress with consonant sounds.', teacher: 'Maria S.' },
      { child: 'Baby Ava', date: 'Jan 22', note: 'Ava discovered her feet today and spent ten minutes exploring them. Excellent body awareness developing.', teacher: 'Maria S.' },
      { child: 'Baby Leo', date: 'Jan 25', note: 'Leo tracked a rattle across his full field of vision and reached for it with both hands. First time reaching so intentionally.', teacher: 'Maria S.' },
      { child: 'Baby Mia', date: 'Jan 20', note: 'Mia showed stranger anxiety for the first time when a new parent entered the room. Normal developmental milestone.', teacher: 'Linda T.' },
    ],
  },
  Toddler: {
    milestones: [
      { area: 'Motor', skill: 'Walks independently', status: 'mastered' },
      { area: 'Motor', skill: 'Stacks 4+ blocks', status: 'developing' },
      { area: 'Motor', skill: 'Uses spoon', status: 'mastered' },
      { area: 'Motor', skill: 'Kicks a ball', status: 'developing' },
      { area: 'Motor', skill: 'Runs with coordination', status: 'emerging' },
      { area: 'Motor', skill: 'Turns pages in a book', status: 'mastered' },
      { area: 'Motor', skill: 'Scribbles with crayon', status: 'mastered' },
      { area: 'Cognitive', skill: 'Identifies 3 colors', status: 'developing' },
      { area: 'Cognitive', skill: 'Completes simple puzzles', status: 'emerging' },
      { area: 'Cognitive', skill: 'Matches identical objects', status: 'developing' },
      { area: 'Cognitive', skill: 'Understands "in" and "out"', status: 'mastered' },
      { area: 'Language', skill: 'Uses 50+ words', status: 'developing' },
      { area: 'Language', skill: 'Follows 2-step directions', status: 'emerging' },
      { area: 'Language', skill: 'Names familiar objects', status: 'mastered' },
      { area: 'Language', skill: 'Uses two-word phrases', status: 'developing' },
      { area: 'Social', skill: 'Plays alongside peers', status: 'mastered' },
      { area: 'Social', skill: 'Shows empathy when peer is upset', status: 'emerging' },
      { area: 'Social', skill: 'Expresses wants verbally', status: 'developing' },
    ],
    activities: [
      { title: 'Color Sorting', day: 'Monday', time: '9:30 AM', domain: 'cognitive', duration: 20 },
      { title: 'Finger Painting', day: 'Monday', time: '10:30 AM', domain: 'creative', duration: 25 },
      { title: 'Action Songs', day: 'Monday', time: '2:00 PM', domain: 'physical', duration: 15 },
      { title: 'Story Time', day: 'Tuesday', time: '9:30 AM', domain: 'language', duration: 15 },
      { title: 'Obstacle Course', day: 'Tuesday', time: '10:30 AM', domain: 'physical', duration: 20 },
      { title: 'Puppet Play', day: 'Tuesday', time: '2:00 PM', domain: 'social_emotional', duration: 15 },
      { title: 'Playdough Station', day: 'Wednesday', time: '9:30 AM', domain: 'creative', duration: 25 },
      { title: 'Shape Hunt', day: 'Wednesday', time: '10:30 AM', domain: 'cognitive', duration: 20 },
      { title: 'Nursery Rhymes', day: 'Wednesday', time: '2:00 PM', domain: 'language', duration: 15 },
      { title: 'Nature Walk', day: 'Thursday', time: '9:30 AM', domain: 'physical', duration: 20 },
      { title: 'Water Table Play', day: 'Thursday', time: '10:30 AM', domain: 'cognitive', duration: 20 },
      { title: 'Collaborative Mural', day: 'Thursday', time: '2:00 PM', domain: 'creative', duration: 20 },
      { title: 'Building Blocks', day: 'Friday', time: '9:30 AM', domain: 'cognitive', duration: 20 },
      { title: 'Dance Party', day: 'Friday', time: '10:30 AM', domain: 'physical', duration: 15 },
      { title: 'Feelings Circle', day: 'Friday', time: '2:00 PM', domain: 'social_emotional', duration: 15 },
    ],
    lessons: [
      { title: 'Colors All Around', objectives: ['Identify primary colors', 'Develop fine motor skills', 'Expand vocabulary'], materials: ['Finger paints', 'Colored blocks', 'Crayons'], duration: 25 },
      { title: 'Animals & Sounds', objectives: ['Match animals to sounds', 'Build vocabulary'], materials: ['Animal figurines', 'Picture books', 'Sound cards'], duration: 20 },
      { title: 'My Body Parts', objectives: ['Name major body parts', 'Follow movement instructions', 'Build self-awareness'], materials: ['Body part poster', 'Mirror', 'Action song cards'], duration: 20 },
      { title: 'Big & Small', objectives: ['Compare sizes', 'Develop sorting skills', 'Use size vocabulary'], materials: ['Nesting cups', 'Size sorting cards', 'Measuring tape'], duration: 15 },
      { title: 'Feelings & Faces', objectives: ['Identify basic emotions', 'Express feelings appropriately'], materials: ['Emotion cards', 'Mirror', 'Feelings book'], duration: 20 },
      { title: 'Things That Go', objectives: ['Name types of vehicles', 'Practice vehicle sounds', 'Develop imaginative play'], materials: ['Toy vehicles', 'Ramp', 'Transportation books'], duration: 20 },
    ],
    assessments: [
      { child: 'Emma W.', area: 'Language Development', score: 4, notes: 'Using 60+ words, starting two-word combinations. Excellent progress.' },
      { child: 'Liam S.', area: 'Motor Skills', score: 3, notes: 'Stacking 3 blocks consistently, working on 4+. Good spoon use.' },
      { child: 'Olivia R.', area: 'Cognitive', score: 3, notes: 'Identifying red and blue, working on yellow. Enjoys sorting activities.' },
      { child: 'Emma W.', area: 'Social-Emotional', score: 4, notes: 'Shows concern when peers are upset, shares toys spontaneously' },
      { child: 'Liam S.', area: 'Language Development', score: 3, notes: 'Using 40+ words, beginning to combine two words together' },
      { child: 'Olivia R.', area: 'Motor Skills', score: 4, notes: 'Running confidently, kicks ball forward, excellent balance' },
      { child: 'Henry D.', area: 'Cognitive', score: 3, notes: 'Completing 3-piece puzzles, matches shapes well, curious explorer' },
      { child: 'Henry D.', area: 'Social-Emotional', score: 2, notes: 'Working on parallel play, sometimes struggles with sharing. Improving with gentle guidance.' },
    ],
    observations: [
      { child: 'Emma W.', date: 'Jan 25', note: 'Emma said "more juice please" - first 3-word sentence! Shared toys with Liam during free play.', teacher: 'James R.' },
      { child: 'Liam S.', date: 'Jan 24', note: 'Liam completed the shape sorter independently for the first time. Very proud of himself!', teacher: 'James R.' },
      { child: 'Olivia R.', date: 'Jan 23', note: 'Olivia sorted all the red and blue bears without prompting during free play. Spontaneous color recognition.', teacher: 'James R.' },
      { child: 'Henry D.', date: 'Jan 22', note: 'Henry spent 15 minutes at the water table pouring and filling. Great concentration and fine motor practice.', teacher: 'James R.' },
      { child: 'Emma W.', date: 'Jan 20', note: 'Emma comforted Olivia when she fell down, patting her back and saying "okay, okay." Beautiful empathy.', teacher: 'Lisa P.' },
    ],
  },
  Preschool: {
    milestones: [
      { area: 'Literacy', skill: 'Recognizes own name', status: 'mastered' },
      { area: 'Literacy', skill: 'Identifies 10 letters', status: 'developing' },
      { area: 'Literacy', skill: 'Rhymes simple words', status: 'developing' },
      { area: 'Literacy', skill: 'Retells a familiar story', status: 'emerging' },
      { area: 'Literacy', skill: 'Writes first name', status: 'developing' },
      { area: 'Math', skill: 'Counts to 20', status: 'developing' },
      { area: 'Math', skill: 'Recognizes shapes', status: 'mastered' },
      { area: 'Math', skill: 'Understands more/less', status: 'mastered' },
      { area: 'Math', skill: 'Creates simple patterns', status: 'emerging' },
      { area: 'Motor', skill: 'Holds pencil correctly', status: 'developing' },
      { area: 'Motor', skill: 'Cuts with scissors', status: 'emerging' },
      { area: 'Motor', skill: 'Buttons and zips clothing', status: 'developing' },
      { area: 'Motor', skill: 'Hops on one foot', status: 'emerging' },
      { area: 'Social', skill: 'Takes turns', status: 'mastered' },
      { area: 'Social', skill: 'Resolves conflicts with words', status: 'developing' },
      { area: 'Social', skill: 'Follows classroom rules', status: 'mastered' },
      { area: 'Social', skill: 'Cooperates in group activities', status: 'developing' },
    ],
    activities: [
      { title: 'Letter of the Week', day: 'Monday', time: '9:00 AM', domain: 'language', duration: 30 },
      { title: 'Math Manipulatives', day: 'Monday', time: '10:00 AM', domain: 'cognitive', duration: 25 },
      { title: 'Movement & Music', day: 'Monday', time: '2:00 PM', domain: 'physical', duration: 20 },
      { title: 'Art Studio', day: 'Tuesday', time: '9:00 AM', domain: 'creative', duration: 30 },
      { title: 'Rhyming Games', day: 'Tuesday', time: '10:00 AM', domain: 'language', duration: 20 },
      { title: 'Cooperative Games', day: 'Tuesday', time: '2:00 PM', domain: 'social_emotional', duration: 25 },
      { title: 'Science Experiment', day: 'Wednesday', time: '9:00 AM', domain: 'cognitive', duration: 30 },
      { title: 'Drama & Role Play', day: 'Wednesday', time: '10:30 AM', domain: 'social_emotional', duration: 25 },
      { title: 'Collage Making', day: 'Wednesday', time: '2:00 PM', domain: 'creative', duration: 25 },
      { title: 'Pattern Blocks', day: 'Thursday', time: '9:00 AM', domain: 'cognitive', duration: 25 },
      { title: 'Outdoor Games', day: 'Thursday', time: '10:00 AM', domain: 'physical', duration: 30 },
      { title: 'Journal Writing', day: 'Thursday', time: '2:00 PM', domain: 'language', duration: 20 },
      { title: 'Show & Tell', day: 'Friday', time: '9:30 AM', domain: 'language', duration: 20 },
      { title: 'Yoga for Kids', day: 'Friday', time: '10:30 AM', domain: 'physical', duration: 20 },
      { title: 'Free Art Choice', day: 'Friday', time: '2:00 PM', domain: 'creative', duration: 30 },
    ],
    lessons: [
      { title: 'Community Helpers', objectives: ['Understand community roles', 'Practice role-playing', 'Build communication skills'], materials: ['Dress-up costumes', 'Picture books', 'Art supplies'], duration: 30 },
      { title: 'Weather & Seasons', objectives: ['Identify weather patterns', 'Understand seasonal changes', 'Record observations'], materials: ['Weather chart', 'Thermometer', 'Nature journal'], duration: 25 },
      { title: 'Life Cycles', objectives: ['Understand plant growth stages', 'Practice sequencing', 'Develop observation skills'], materials: ['Seeds', 'Planting pots', 'Life cycle cards', 'Magnifying glasses'], duration: 30 },
      { title: 'Shapes in Our World', objectives: ['Identify 2D and 3D shapes', 'Find shapes in the environment', 'Create shape art'], materials: ['Shape blocks', 'Shape hunt checklist', 'Construction paper'], duration: 25 },
      { title: 'Friendship & Kindness', objectives: ['Identify kind behaviors', 'Practice conflict resolution', 'Build empathy skills'], materials: ['Feelings cards', 'Puppets', 'Kindness jar', 'Story books'], duration: 25 },
      { title: 'Five Senses Exploration', objectives: ['Name the five senses', 'Use senses to observe', 'Describe sensory experiences'], materials: ['Sensory bins', 'Blindfolds', 'Scented markers', 'Texture cards'], duration: 30 },
    ],
    assessments: [
      { child: 'Sophie T.', area: 'Literacy Readiness', score: 4, notes: 'Recognizes 15 letters, beginning to sound out CVC words' },
      { child: 'Jackson M.', area: 'Math Skills', score: 3, notes: 'Counts to 15 reliably, recognizes all basic shapes, working on patterns' },
      { child: 'Aria L.', area: 'Social-Emotional', score: 5, notes: 'Excellent at sharing, often helps resolve peer conflicts, natural leader' },
      { child: 'Sophie T.', area: 'Motor Skills', score: 3, notes: 'Tripod pencil grip developing, cuts straight lines with scissors' },
      { child: 'Jackson M.', area: 'Social-Emotional', score: 4, notes: 'Takes turns well, beginning to use words during conflicts instead of physical actions' },
      { child: 'Aria L.', area: 'Literacy Readiness', score: 4, notes: 'Writes first name, identifies 18 letters, loves being read to' },
      { child: 'Nolan P.', area: 'Math Skills', score: 4, notes: 'Counts to 25, creates AB patterns, understands more/less/equal' },
      { child: 'Nolan P.', area: 'Motor Skills', score: 3, notes: 'Good pencil control, learning to cut curves. Excellent ball-throwing skills.' },
    ],
    observations: [
      { child: 'Sophie T.', date: 'Jan 25', note: 'Sophie wrote her full name independently today! She was so proud she showed everyone at circle time.', teacher: 'Sarah K.' },
      { child: 'Jackson M.', date: 'Jan 24', note: 'Jackson led the science experiment group, explaining the steps to peers. Great leadership emerging.', teacher: 'Sarah K.' },
      { child: 'Aria L.', date: 'Jan 23', note: 'Aria mediated a conflict between two peers at the block center. She suggested they take turns and both children agreed.', teacher: 'Sarah K.' },
      { child: 'Nolan P.', date: 'Jan 22', note: 'Nolan created an ABAB pattern with colored bears independently, then tried an ABC pattern. Great mathematical thinking.', teacher: 'Sarah K.' },
      { child: 'Sophie T.', date: 'Jan 20', note: 'Sophie retold "The Very Hungry Caterpillar" to a small group using the felt board pieces. Excellent sequencing and vocabulary.', teacher: 'Amy W.' },
    ],
  },
  'School Age': {
    milestones: [
      { area: 'Academic', skill: 'Independent reading', status: 'mastered' },
      { area: 'Academic', skill: 'Multi-step math problems', status: 'developing' },
      { area: 'Academic', skill: 'Written paragraphs', status: 'developing' },
      { area: 'Academic', skill: 'Reading comprehension strategies', status: 'developing' },
      { area: 'Academic', skill: 'Multiplication facts', status: 'emerging' },
      { area: 'Academic', skill: 'Research skills', status: 'emerging' },
      { area: 'STEM', skill: 'Scientific method basics', status: 'developing' },
      { area: 'STEM', skill: 'Basic coding concepts', status: 'emerging' },
      { area: 'STEM', skill: 'Data collection and graphing', status: 'developing' },
      { area: 'STEM', skill: 'Engineering design process', status: 'emerging' },
      { area: 'Social', skill: 'Team collaboration', status: 'mastered' },
      { area: 'Social', skill: 'Self-directed learning', status: 'developing' },
      { area: 'Social', skill: 'Mentoring younger children', status: 'mastered' },
      { area: 'Social', skill: 'Perspective-taking', status: 'developing' },
      { area: 'Life Skills', skill: 'Time management', status: 'developing' },
      { area: 'Life Skills', skill: 'Organizational skills', status: 'developing' },
      { area: 'Life Skills', skill: 'Goal setting', status: 'emerging' },
    ],
    activities: [
      { title: 'Homework Help', day: 'Monday', time: '3:30 PM', domain: 'cognitive', duration: 45 },
      { title: 'STEM Challenge', day: 'Monday', time: '4:30 PM', domain: 'cognitive', duration: 40 },
      { title: 'Improv Games', day: 'Monday', time: '5:15 PM', domain: 'social_emotional', duration: 25 },
      { title: 'Art Workshop', day: 'Tuesday', time: '4:00 PM', domain: 'creative', duration: 45 },
      { title: 'Reader\'s Theater', day: 'Tuesday', time: '3:30 PM', domain: 'language', duration: 30 },
      { title: 'Kickball Tournament', day: 'Tuesday', time: '5:00 PM', domain: 'physical', duration: 30 },
      { title: 'Book Club', day: 'Wednesday', time: '3:30 PM', domain: 'language', duration: 30 },
      { title: 'Coding Basics', day: 'Wednesday', time: '4:15 PM', domain: 'cognitive', duration: 40 },
      { title: 'Friendship Skills Workshop', day: 'Wednesday', time: '5:00 PM', domain: 'social_emotional', duration: 25 },
      { title: 'Team Sports', day: 'Thursday', time: '4:00 PM', domain: 'physical', duration: 45 },
      { title: 'Science Fair Prep', day: 'Thursday', time: '3:30 PM', domain: 'cognitive', duration: 35 },
      { title: 'Music & Songwriting', day: 'Thursday', time: '5:00 PM', domain: 'creative', duration: 30 },
      { title: 'Nature Journal', day: 'Friday', time: '3:30 PM', domain: 'language', duration: 30 },
      { title: 'Capture the Flag', day: 'Friday', time: '4:15 PM', domain: 'physical', duration: 40 },
      { title: 'Open Art Studio', day: 'Friday', time: '5:00 PM', domain: 'creative', duration: 30 },
    ],
    lessons: [
      { title: 'STEM Explorers', objectives: ['Apply scientific method', 'Develop problem-solving', 'Work collaboratively'], materials: ['Building blocks', 'Magnifying glasses', 'Measuring tools'], duration: 45 },
      { title: 'Creative Writing', objectives: ['Express ideas in writing', 'Develop narrative structure', 'Peer editing skills'], materials: ['Journals', 'Writing prompts', 'Colored pens'], duration: 30 },
      { title: 'Introduction to Coding', objectives: ['Understand sequence and loops', 'Debug simple programs', 'Create a basic project'], materials: ['Tablets', 'Block coding app', 'Unplugged coding cards'], duration: 40 },
      { title: 'Financial Literacy Basics', objectives: ['Understand needs vs wants', 'Practice budgeting', 'Learn about saving'], materials: ['Play money', 'Budget worksheets', 'Store role-play items'], duration: 35 },
      { title: 'World Cultures', objectives: ['Explore different cultures', 'Develop respect for diversity', 'Compare traditions'], materials: ['Globe', 'Culture fact cards', 'Art supplies', 'Music samples'], duration: 40 },
      { title: 'Engineering Design Challenge', objectives: ['Define a problem', 'Prototype a solution', 'Test and iterate designs'], materials: ['Cardboard', 'Tape', 'Straws', 'Rubber bands', 'Rulers'], duration: 45 },
    ],
    assessments: [
      { child: 'Ethan B.', area: 'STEM Skills', score: 4, notes: 'Excellent problem-solving, completed bridge challenge with innovative design' },
      { child: 'Maya J.', area: 'Creative Writing', score: 5, notes: 'Writing detailed stories with clear beginning, middle, end. Advanced vocabulary' },
      { child: 'Lucas K.', area: 'Social Skills', score: 4, notes: 'Great team leader, helps younger children, positive role model' },
      { child: 'Ethan B.', area: 'Academic Progress', score: 4, notes: 'Reading above grade level, strong comprehension. Working on multi-step word problems.' },
      { child: 'Maya J.', area: 'Social Skills', score: 4, notes: 'Collaborative in group projects, encourages quieter peers to contribute' },
      { child: 'Lucas K.', area: 'STEM Skills', score: 3, notes: 'Understands scientific method steps, needs practice with data recording' },
      { child: 'Zoe F.', area: 'Creative Writing', score: 4, notes: 'Developing voice in writing, uses dialogue effectively. Enjoys poetry.' },
      { child: 'Zoe F.', area: 'Academic Progress', score: 3, notes: 'Solid reading skills, working on summarizing main ideas. Math on grade level.' },
    ],
    observations: [
      { child: 'Ethan B.', date: 'Jan 25', note: 'Ethan taught two younger students how to use the block coding app. Showed great patience and teaching ability.', teacher: 'David C.' },
      { child: 'Maya J.', date: 'Jan 23', note: 'Maya finished her chapter book and gave a book report to the class. Her peers were very engaged.', teacher: 'David C.' },
      { child: 'Lucas K.', date: 'Jan 24', note: 'Lucas organized a fair team selection for kickball, making sure everyone felt included. Strong leadership and empathy.', teacher: 'David C.' },
      { child: 'Zoe F.', date: 'Jan 22', note: 'Zoe wrote a poem during free time and shared it at closing circle. Several children asked her to help them write poems too.', teacher: 'David C.' },
      { child: 'Ethan B.', date: 'Jan 20', note: 'Ethan designed a marble run that incorporated three loops. He tested and revised it four times before it worked. Great persistence.', teacher: 'Karen M.' },
    ],
  },
};

const statusBadge = (s: string) => s === 'mastered' ? 'bg-christina-green text-white' : s === 'developing' ? 'bg-christina-blue text-white' : 'bg-christina-yellow text-foreground';

export default function CurriculumPage() {
  const [activeRoom, setActiveRoom] = useState('Infant');
  const [feedbackText, setFeedbackText] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Curriculum System</h1>
        <p className="text-muted-foreground">Room-based curriculum management with standards, activities, lessons, and assessments.</p>
      </div>

      {/* Room Tabs */}
      <Tabs value={activeRoom} onValueChange={setActiveRoom}>
        <TabsList>
          <TabsTrigger value="Infant">Infant Room</TabsTrigger>
          <TabsTrigger value="Toddler">Toddler Room</TabsTrigger>
          <TabsTrigger value="Preschool">Preschool Room</TabsTrigger>
          <TabsTrigger value="School Age">School Age Room</TabsTrigger>
        </TabsList>

        {Object.keys(rooms).map(roomKey => (
          <TabsContent key={roomKey} value={roomKey} className="space-y-6">
            {/* Inner tabs for room sections */}
            <Tabs defaultValue="standards">
              <TabsList className="flex-wrap">
                <TabsTrigger value="standards" className="gap-1"><Star className="h-3 w-3" /> Standards</TabsTrigger>
                <TabsTrigger value="activities" className="gap-1"><Clock className="h-3 w-3" /> Activities</TabsTrigger>
                <TabsTrigger value="lessons" className="gap-1"><BookOpen className="h-3 w-3" /> Lessons</TabsTrigger>
                <TabsTrigger value="assessments" className="gap-1"><Check className="h-3 w-3" /> Assessments</TabsTrigger>
                <TabsTrigger value="feedback" className="gap-1"><MessageSquare className="h-3 w-3" /> Feedback</TabsTrigger>
                <TabsTrigger value="reports" className="gap-1"><FileText className="h-3 w-3" /> Family Reports</TabsTrigger>
              </TabsList>

              {/* Standards/Milestones */}
              <TabsContent value="standards">
                <Card>
                  <CardHeader><CardTitle className="text-base">Developmental Milestones - {roomKey}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rooms[roomKey].milestones.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">{m.area}</Badge>
                            <p className="text-sm font-medium">{m.skill}</p>
                          </div>
                          <Badge className={statusBadge(m.status)}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-christina-green" /> Mastered</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-christina-blue" /> Developing</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-christina-yellow" /> Emerging</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Weekly Activities */}
              <TabsContent value="activities">
                <Card>
                  <CardHeader><CardTitle className="text-base">Weekly Activity Planner - {roomKey}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                        const dayActivities = rooms[roomKey].activities.filter(a => a.day === day);
                        if (dayActivities.length === 0) return null;
                        return (
                          <div key={day}>
                            <p className="text-sm font-semibold mb-2">{day}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {dayActivities.map((a, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                  <div className={`w-8 h-8 rounded-lg ${domainColors[a.domain]} flex items-center justify-center flex-shrink-0`}>
                                    <Brain className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{a.title}</p>
                                    <p className="text-xs text-muted-foreground">{a.time} - {a.duration} min</p>
                                    <Badge variant="outline" className="text-xs mt-1 capitalize">{a.domain.replace('_', ' ')}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lessons */}
              <TabsContent value="lessons">
                <div className="space-y-4">
                  {rooms[roomKey].lessons.map((lesson, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-christina-red" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{lesson.title}</h3>
                              <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" /> {lesson.duration} min</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Objectives</p>
                                <ul className="space-y-1">
                                  {lesson.objectives.map(o => (
                                    <li key={o} className="flex items-start gap-1.5 text-sm">
                                      <Check className="h-3.5 w-3.5 text-christina-red mt-0.5 flex-shrink-0" />
                                      {o}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Materials</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {lesson.materials.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Assessments */}
              <TabsContent value="assessments">
                <Card>
                  <CardHeader><CardTitle className="text-base">Rubric-Based Assessments - {roomKey}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rooms[roomKey].assessments.map((a, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-christina-red" />
                              <span className="font-medium text-sm">{a.child}</span>
                            </div>
                            <Badge variant="outline">{a.area}</Badge>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <div key={s} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${s <= a.score ? 'bg-christina-red text-white' : 'bg-muted text-muted-foreground'}`}>
                                {s}
                              </div>
                            ))}
                            <span className="text-xs text-muted-foreground ml-2">{a.score}/5</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{a.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teacher Feedback/Observations */}
              <TabsContent value="feedback">
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Teacher Observations - {roomKey}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rooms[roomKey].observations.map((o, i) => (
                          <div key={i} className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{o.child}</span>
                              <span className="text-xs text-muted-foreground">{o.date} - {o.teacher}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{o.note}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Add Observation</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Write an observation note about a child..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                      />
                      <Button className="mt-3 bg-christina-red hover:bg-christina-red/90" size="sm">Save Observation</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Family Reports */}
              <TabsContent value="reports">
                <Card>
                  <CardHeader><CardTitle className="text-base">Generated Family Progress Reports - {roomKey}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rooms[roomKey].assessments.map((a, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold">{a.child} - Progress Summary</h3>
                            <Button variant="outline" size="sm" className="gap-1"><FileText className="h-3 w-3" /> Download PDF</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Assessment Area</p>
                              <p>{a.area}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Score</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`h-4 w-4 ${s <= a.score ? 'text-christina-yellow fill-christina-yellow' : 'text-muted'}`} />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Teacher Notes</p>
                              <p className="text-muted-foreground">{a.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
