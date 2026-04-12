'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  Search,
  Phone,
  FileText,
  Award,
  XCircle,
  CheckCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ModuleSection {
  heading: string;
  body: string;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  icon: React.ComponentType<{ className?: string }>;
  sections: ModuleSection[];
  quiz: QuizQuestion[];
}

interface ModuleCompletion {
  moduleId: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
}

// ─── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'christinas_training_completions';

function loadCompletions(): ModuleCompletion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCompletions(completions: ModuleCompletion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
}

// ─── Training Module Data ───────────────────────────────────────────

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'incident-recognition',
    title: 'Incident Recognition',
    description: 'What constitutes a reportable incident, severity classification, and the difference between an incident and a routine event.',
    estimatedMinutes: 15,
    icon: Search,
    sections: [
      {
        heading: 'What Is a Reportable Incident?',
        body: 'A reportable incident is any event that results in injury, illness, property damage, or a situation that poses risk to children, staff, or visitors. This includes falls resulting in visible marks, bites that break skin, allergic reactions, medication errors, unauthorized person attempts, and any situation requiring first aid beyond a bandage or ice pack.\n\nNot every bump or scrape qualifies. A child who trips on the playground, cries for 30 seconds, and returns to play with no visible mark is a routine event. A child who trips, hits their head, and develops a goose egg is a reportable incident. The key distinction: did the event result in something observable that a parent would want to know about, or that licensing would need documented?',
      },
      {
        heading: 'Severity Classification',
        body: 'We use three severity levels:\n\nMinor: Events requiring basic first aid (bandage, ice pack, comfort). No ongoing medical attention needed. Examples: small scrapes, minor bumps, a single bite that does not break skin.\n\nModerate: Events requiring more than basic first aid, or that involve potential for complications. Examples: bites breaking skin, falls from equipment, allergic reactions managed with antihistamines, head bumps with swelling, any incident involving a child under 12 months.\n\nSevere: Events requiring emergency medical attention, resulting in broken bones, loss of consciousness, hospitalization, or any incident involving a missing child, unauthorized removal, or abuse allegation. These require immediate supervisor notification and licensing report within 24 hours.',
      },
      {
        heading: 'Common Situations Staff Underreport',
        body: 'Staff often hesitate to report biting incidents, especially when they feel they should have prevented them. They also underreport near-misses, like a child climbing a shelf that almost tipped. Near-misses are critical to document because they reveal hazards before someone gets hurt.\n\nOther commonly underreported situations: children with pre-existing conditions who have flare-ups at the center (asthma episodes, seizures), behavioral incidents where a child hurts another child intentionally, and situations where a child discloses something concerning about their home life. When in doubt, document it. You can always decide not to escalate, but you cannot document something you did not record.',
      },
      {
        heading: 'Your Role in Recognition',
        body: 'Every staff member is a first responder. You do not need to determine the exact severity level before acting. Your job is to (1) respond to the immediate situation, (2) notify your lead teacher or director, and (3) write down what you observed while it is fresh. Severity classification happens during the investigation, not in the moment. What matters in the moment is that you recognize something happened and you act on it.',
      },
    ],
    quiz: [
      {
        question: 'A toddler trips on the playground, cries briefly, and has a small red mark on their knee that fades within 5 minutes. How should this be classified?',
        options: [
          'Severe incident requiring licensing report',
          'Moderate incident requiring parent notification',
          'Minor incident requiring documentation',
          'Routine event, no documentation needed',
        ],
        correctIndex: 3,
        explanation: 'A brief cry with a mark that fades quickly and requires no first aid is a routine event. If the mark persisted or required first aid, it would become a minor incident.',
      },
      {
        question: 'Which of the following is a commonly underreported incident type?',
        options: [
          'A child breaking their arm on the playground',
          'A near-miss where a bookshelf almost tipped over',
          'A parent arriving to pick up while intoxicated',
          'A fire alarm activation',
        ],
        correctIndex: 1,
        explanation: 'Near-misses are the most commonly underreported events. Staff often think "nothing happened" and move on. But near-misses reveal hazards that could cause real injuries next time.',
      },
      {
        question: 'A 10-month-old infant rolls off a changing table but lands on a padded mat with no visible injury. What severity level applies?',
        options: [
          'Routine event since there is no visible injury',
          'Minor, since the child landed on padding',
          'Moderate, because any fall involving an infant under 12 months is automatically moderate',
          'Severe, because it involves a fall from furniture',
        ],
        correctIndex: 2,
        explanation: 'Any incident involving a child under 12 months is automatically classified as moderate regardless of apparent outcome. Infants cannot reliably communicate pain, and injuries may not be immediately visible.',
      },
      {
        question: 'When should you determine the severity classification of an incident?',
        options: [
          'Immediately, before providing any first aid',
          'During the investigation phase, not in the moment',
          'Only after the parent has been notified',
          'At the end of the day when writing reports',
        ],
        correctIndex: 1,
        explanation: 'Severity classification happens during investigation, not in the moment. Your immediate job is to respond, notify your supervisor, and write down what you observed.',
      },
      {
        question: 'A child tells you that "Daddy hits me when I am bad." What should you do?',
        options: [
          'Tell the child everything will be okay and move on',
          'Call the parent immediately to discuss what the child said',
          'Document exactly what the child said, notify your director immediately, and do not investigate further yourself',
          'Wait until the end of the day to mention it in the daily report',
        ],
        correctIndex: 2,
        explanation: 'Child disclosures about potential abuse must be documented verbatim and reported to your director immediately. Do not interview the child further, do not contact the parent, and do not wait. Your director will contact the appropriate authorities.',
      },
    ],
  },
  {
    id: 'immediate-response',
    title: 'Immediate Response Protocol',
    description: 'The first 5 minutes after an incident: securing the scene, assessing the child, getting appropriate help, and initial communication.',
    estimatedMinutes: 10,
    icon: AlertTriangle,
    sections: [
      {
        heading: 'The First 60 Seconds',
        body: 'When an incident occurs, your first priority is the safety of the affected child and any other children nearby. Move other children away from the scene if there is an ongoing hazard (broken glass, standing water, unstable furniture). Do not move the injured child unless they are in immediate danger from their current location.\n\nStay calm and speak in a steady voice. Children take emotional cues from adults. If you panic, every child in the room will escalate. You can feel scared internally while still projecting calm. Say things like "I am right here" and "I am going to help you" rather than gasping or saying "Oh no!"',
      },
      {
        heading: 'Assessment: What to Check',
        body: 'Use the HEAD-TO-TOE approach for any fall or collision:\n\n1. Is the child conscious and responsive? If not, call 911 immediately.\n2. Is there visible bleeding? Apply gentle pressure with a clean cloth.\n3. Can the child move all limbs? Do not force movement if the child resists.\n4. Is there swelling forming? Apply ice wrapped in a cloth.\n5. Is the child breathing normally? Watch for labored breathing or wheezing.\n\nFor bites: Check if skin is broken. Wash the area with soap and water. Apply ice. If the skin is broken, this is automatically moderate severity.\n\nFor allergic reactions: Check for hives, swelling (especially around face/throat), difficulty breathing. If the child has an EpiPen on file and shows signs of anaphylaxis, administer it and call 911.',
      },
      {
        heading: 'Getting Help',
        body: 'Send another staff member to get the lead teacher or director. Do not leave the injured child alone to go find help yourself. If you are alone in the room, use the classroom phone or walkie-talkie. If neither is available, open your classroom door and call for the nearest adult.\n\nCall 911 for: loss of consciousness, suspected broken bones, severe bleeding that does not stop with pressure, seizures, anaphylaxis, choking that does not resolve with back blows/abdominal thrusts, or any situation where you are unsure whether the child needs emergency medical attention. When in doubt, call. It is always better to have paramedics arrive and determine the child is fine than to delay when the child needs help.',
      },
      {
        heading: 'Preserving the Scene',
        body: 'After the child is being cared for, preserve the physical scene if possible. Do not clean up broken equipment, rearrange furniture, or fix the hazard until someone has documented it. Take a photo of the scene with a center tablet or phone if available. Note the exact time, location, and what equipment or materials were involved.\n\nIf the hazard is ongoing (broken glass, standing water), secure the area so no other child can access it, but try to document before cleaning. This information is critical for the investigation and for preventing recurrence.',
      },
    ],
    quiz: [
      {
        question: 'A child falls from a climber and is crying but not moving their left arm. What is your first action?',
        options: [
          'Pick the child up and carry them inside',
          'Ask the child to try moving their arm',
          'Keep the child still, stay calm, and send someone to get the director',
          'Call the parent immediately',
        ],
        correctIndex: 2,
        explanation: 'Do not move a child who may have a fracture. Keep them still, stay calm, and get help. Moving an injured limb could worsen the injury.',
      },
      {
        question: 'You are alone in the classroom when an incident occurs. How do you get help?',
        options: [
          'Leave the children briefly to find someone in the hallway',
          'Use the classroom phone or walkie-talkie, or open the door and call for the nearest adult',
          'Wait until another staff member happens to come by',
          'Handle it entirely on your own',
        ],
        correctIndex: 1,
        explanation: 'Never leave children unattended. Use available communication tools or open the door to call for help while staying in the room.',
      },
      {
        question: 'After a child bumps their head on a table, what should you tell the other children who are watching and getting upset?',
        options: [
          '"Everyone needs to stop crying right now!"',
          '"Something really bad just happened."',
          '"I am helping your friend. They are going to be okay. Let\'s give them some space."',
          'Nothing. Focus only on the injured child.',
        ],
        correctIndex: 2,
        explanation: 'Children take emotional cues from adults. A calm, reassuring statement helps the other children while you attend to the injured child. Ignoring the other children may cause them to escalate.',
      },
      {
        question: 'When should you call 911?',
        options: [
          'Only when the director tells you to',
          'For any incident involving blood',
          'When there is loss of consciousness, suspected fracture, severe bleeding, or when you are unsure if emergency care is needed',
          'Only for incidents classified as severe',
        ],
        correctIndex: 2,
        explanation: 'Any staff member can and should call 911 when they observe emergency warning signs. You do not need permission from a supervisor. When in doubt, call.',
      },
      {
        question: 'After the child is being cared for, what should you do with the physical scene?',
        options: [
          'Clean it up immediately so no other child gets hurt',
          'Preserve it and document it (photos, notes) before cleaning, unless there is an ongoing hazard to other children',
          'Leave it exactly as is until licensing arrives',
          'It does not matter since the child is already being treated',
        ],
        correctIndex: 1,
        explanation: 'Scene preservation is important for investigation and prevention. Document first, then clean. If the hazard is ongoing, secure the area from children but try to document before remediation.',
      },
    ],
  },
  {
    id: 'investigation-documentation',
    title: 'Investigation & Documentation',
    description: 'Interviewing witnesses, recording details accurately, photo documentation guidelines, and completing incident report forms.',
    estimatedMinutes: 20,
    icon: FileText,
    sections: [
      {
        heading: 'The Investigation Timeline',
        body: 'Begin your investigation as soon as the immediate situation is stable and the affected child is being cared for. Memory degrades rapidly, so interviews with witnesses should happen within the first hour whenever possible.\n\nThe investigation has three phases:\n1. Immediate (first hour): Interview witnesses, photograph the scene, record the sequence of events.\n2. Same day: Complete the incident report form, review staffing and ratio data for the time of incident, check whether the activity was age-appropriate.\n3. Within 48 hours: Root cause analysis, corrective action plan, follow-up with family.',
      },
      {
        heading: 'Interviewing Witnesses',
        body: 'Interview each witness separately. This includes staff members, and, when appropriate, children old enough to describe what happened (generally age 4+). Use open-ended questions:\n\n"Tell me what you saw."\n"What happened right before [the incident]?"\n"Where were you standing when it happened?"\n"What did you do after it happened?"\n\nDo NOT ask leading questions like "Did you see him push her?" Instead ask "What did you see the children doing?" Write down their words, not your interpretation. If a child says "He was being mean," write that exact phrase, then ask "What did you see him do?" to get the observable behavior.\n\nRecord who you interviewed, the time, and their exact statements. Note anything they seemed uncertain about.',
      },
      {
        heading: 'Writing the Incident Report',
        body: 'An incident report must answer: Who, What, When, Where, How, and What was done.\n\nWho: Full names of all involved children and staff. Include witnesses.\nWhat: Describe the observable event. "Child A was running near the water table, slipped on water on the floor, and fell forward, striking their chin on the edge of the table." Not: "Child A was being careless near the water table."\nWhen: Exact time, or best estimate. "Approximately 10:15 AM" is acceptable.\nWhere: Specific location. "Preschool room, near the north wall water table" not just "in the classroom."\nHow: The sequence of events leading up to the incident.\nWhat was done: First aid provided, who was notified, timeline of all responses.\n\nAvoid opinion, blame, or editorializing. The report should read like a news article: factual, chronological, specific.',
      },
      {
        heading: 'Photo Documentation',
        body: 'Photos are required for any moderate or severe incident. Use the center tablet, not personal phones.\n\nPhotograph:\n- The scene where the incident occurred (before cleanup)\n- The equipment or material involved\n- Any visible injury (with parent consent, or document that you requested consent)\n- The surrounding area for context\n\nDo not photograph children who are distressed or in a state of undress. If the injury is in an area normally covered by clothing, describe it in writing instead.\n\nLabel each photo with the date, time, incident number, and brief description. Store photos in the incident file, never on personal devices or social media.',
      },
    ],
    quiz: [
      {
        question: 'When should witness interviews ideally occur?',
        options: [
          'At the end of the work day',
          'Within the first hour after the incident',
          'The following business day',
          'Only if licensing requests them',
        ],
        correctIndex: 1,
        explanation: 'Memory degrades rapidly. Interviewing witnesses within the first hour produces the most accurate accounts.',
      },
      {
        question: 'A 4-year-old witness says "He was being mean." What should you do?',
        options: [
          'Write "The child was being aggressive" in your report',
          'Disregard the statement since the child is too young to be reliable',
          'Write down "He was being mean" exactly, then ask "What did you see him do?" to get the observable behavior',
          'Ask "Did he push her?" to clarify what happened',
        ],
        correctIndex: 2,
        explanation: 'Record exact words, then use open-ended follow-up questions to get observable behavior. Never lead the witness, and never substitute your interpretation for their words.',
      },
      {
        question: 'Which of the following is an appropriately written incident report statement?',
        options: [
          '"Child was not paying attention and ran into the door."',
          '"Child was running southbound in the hallway and collided with the closed bathroom door at approximately 2:15 PM."',
          '"This would not have happened if staff had been watching more carefully."',
          '"Child got hurt because another child was misbehaving."',
        ],
        correctIndex: 1,
        explanation: 'The correct statement is factual, specific about location and time, and describes observable events without blame or opinion.',
      },
      {
        question: 'When is photo documentation required?',
        options: [
          'For every incident regardless of severity',
          'Only for severe incidents',
          'For any moderate or severe incident',
          'Only when parents request it',
        ],
        correctIndex: 2,
        explanation: 'Photos are required for moderate and severe incidents. Minor incidents should be documented in writing but photos are optional.',
      },
      {
        question: 'Where should incident photos be stored?',
        options: [
          'On the staff member\'s personal phone for quick access',
          'In the incident file, taken on the center tablet, never on personal devices',
          'Posted to the parent communication app so families can see them',
          'Emailed to the director\'s personal email for safekeeping',
        ],
        correctIndex: 1,
        explanation: 'Incident photos must be taken on center devices and stored in the incident file. Personal devices and external sharing create privacy and liability risks.',
      },
    ],
  },
  {
    id: 'parent-notification',
    title: 'Parent Notification',
    description: 'When and how to notify parents, what to document about the conversation, and handling difficult reactions with professionalism.',
    estimatedMinutes: 10,
    icon: Phone,
    sections: [
      {
        heading: 'Notification Timelines',
        body: 'Notification timing depends on severity:\n\nMinor incidents: Notify at pickup. Provide a brief verbal summary and have the written incident report ready for the parent to review and sign.\n\nModerate incidents: Call the parent within 1 hour of the incident. If you cannot reach them, try the emergency contacts. Document each attempt (time, number called, result). Do not leave detailed incident information in a voicemail, just ask them to call back regarding their child.\n\nSevere incidents: Call immediately. If the child is being transported to the hospital, call while the child is in transit. One staff member should go with the child; another should handle parent notification.',
      },
      {
        heading: 'What to Say',
        body: 'Lead with the child\'s current condition, not the dramatic details of what happened. Parents want to know their child is okay before they can process what occurred.\n\nStart with: "Hi [Parent Name], this is [Your Name] from Christina\'s. [Child] is [current condition: resting comfortably / being seen by our first aider / on the way to [Hospital] with [Staff Member]]."\n\nThen describe what happened factually: "At about [time], [brief factual description of what happened]. We [describe the response: applied ice, cleaned the wound, called 911]."\n\nDo not speculate about cause, do not assign blame to any child by name, and do not make promises about what will change. You can say "We are investigating to understand what happened and prevent it from happening again."',
      },
      {
        heading: 'Handling Difficult Reactions',
        body: 'Parents may respond with anger, fear, or accusations. This is normal. Their child was hurt while in your care, and they were not there to protect them.\n\nDo:\n- Let them express their feelings without interrupting\n- Validate their concern: "I understand you are upset. I would be too."\n- Stick to facts. Do not get defensive or make excuses.\n- Offer to meet in person to go over the incident report together\n- Document the conversation, including the parent\'s concerns\n\nDo not:\n- Say "It happens" or "Kids will be kids"\n- Blame the child ("He was running when he should not have been")\n- Name other children involved\n- Make promises you cannot keep ("This will never happen again")\n- Argue with the parent about what happened',
      },
    ],
    quiz: [
      {
        question: 'A child gets a moderate bite that breaks the skin at 10:00 AM. When should the parent be called?',
        options: [
          'At pickup time',
          'Within 1 hour of the incident',
          'Within 24 hours',
          'Only if the parent asks about it',
        ],
        correctIndex: 1,
        explanation: 'Moderate incidents require parent notification within 1 hour. A bite breaking skin is classified as moderate.',
      },
      {
        question: 'What should be the FIRST thing you tell a parent when calling about an incident?',
        options: [
          'A detailed account of exactly what happened',
          'The name of the other child involved',
          'The child\'s current condition',
          'An apology for what happened',
        ],
        correctIndex: 2,
        explanation: 'Lead with the child\'s current condition. Parents need to know their child is okay before they can process the details of what happened.',
      },
      {
        question: 'A parent angrily says "This is the third time my child has been bitten! What is wrong with your staff?" What is the best response?',
        options: [
          '"The other child has behavioral issues we are working on."',
          '"I understand your frustration. Let me schedule a time for us to sit down and go over what happened and what we are doing to address the pattern."',
          '"It happens at this age. All toddlers bite."',
          '"Your child was also biting other children last week."',
        ],
        correctIndex: 1,
        explanation: 'Validate the concern, acknowledge the pattern, and offer a concrete next step. Do not blame other children, minimize the concern, or deflect.',
      },
      {
        question: 'You call a parent about a moderate incident but get voicemail. What should you do?',
        options: [
          'Leave a detailed message describing the incident',
          'Leave a message asking them to call back regarding their child, then try emergency contacts',
          'Wait until pickup to discuss it in person',
          'Send a text message with the incident details',
        ],
        correctIndex: 1,
        explanation: 'Do not leave detailed incident information in voicemail. Ask them to call back, then try emergency contacts. Document each attempt with time and result.',
      },
      {
        question: 'Which of the following statements is appropriate to include in a parent notification?',
        options: [
          '"Your child was not being careful on the playground."',
          '"Another child named Marcus pushed your child off the slide."',
          '"We are investigating to understand what happened and prevent it from happening again."',
          '"This will never happen again, I promise."',
        ],
        correctIndex: 2,
        explanation: 'Do not blame the child, name other children involved, or make promises you cannot keep. Committing to investigation and prevention is honest and professional.',
      },
    ],
  },
  {
    id: 'licensing-reporting',
    title: 'Licensing Reporting',
    description: 'Which incidents are reportable to licensing, required timelines, forms, and what happens after you file a report.',
    estimatedMinutes: 15,
    icon: Shield,
    sections: [
      {
        heading: 'Which Incidents Require Licensing Reports',
        body: 'Minnesota DHS requires licensed childcare providers to report the following within 24 hours:\n\n- Any injury requiring medical treatment beyond basic first aid\n- Any incident requiring emergency medical services (911 call)\n- Any death of a child while in care\n- Any allegation of maltreatment (abuse or neglect) by staff\n- A missing or unaccounted-for child\n- An unauthorized person picking up or attempting to pick up a child\n- Any incident requiring law enforcement involvement\n- Fire, flood, or other emergency requiring evacuation\n- Any medication error\n\nNote: "Medical treatment beyond basic first aid" means a visit to a doctor, urgent care, or emergency room, not just ice or a bandage at the center. If a parent takes the child to the doctor as a precaution and the doctor finds no injury, it is still reportable because medical treatment was sought.',
      },
      {
        heading: 'Reporting Timelines',
        body: 'The 24-hour clock starts from when the incident occurs, not from when you complete your investigation. If a child is injured at 10:00 AM on Tuesday, the licensing report must be filed by 10:00 AM on Wednesday.\n\nFor maltreatment allegations, you must also contact your county\'s child protection intake line immediately. This is a separate requirement from the licensing report. Both must happen.\n\nIf the incident occurs on a Friday afternoon, you still have 24 hours. Do not wait until Monday. File online or call the licensing division\'s after-hours line.\n\nDocument the exact time you filed the report and the confirmation number. Keep a copy of the filed report in the incident file.',
      },
      {
        heading: 'What to Include in the Report',
        body: 'The licensing report form asks for:\n\n- Provider name, license number, and contact information\n- Date, time, and location of the incident\n- Names and ages of all children involved\n- Names of all staff present\n- Staff-to-child ratio at the time of the incident\n- Detailed description of what happened (use the same factual, chronological format as your internal incident report)\n- First aid or medical treatment provided\n- Parent notification: who was contacted, when, and how\n- Corrective actions taken or planned\n\nThe report is factual, not defensive. Do not include excuses, justifications, or language that minimizes what happened. Licensing reviewers respond better to providers who demonstrate understanding of what went wrong and what they are changing.',
      },
      {
        heading: 'What Happens After Filing',
        body: 'After you file a report, the licensing division may:\n\n1. Acknowledge receipt and take no further action (for incidents clearly documented with appropriate response)\n2. Request additional information or documentation\n3. Schedule a follow-up visit to observe corrective actions\n4. Open an investigation if the incident suggests a licensing violation\n\nDuring any follow-up visit, be cooperative and transparent. Have the incident file organized: the internal report, witness statements, photos, parent notification records, corrective action plan, and evidence that corrective actions were implemented.\n\nA licensing report is not a punishment. It is a record that something happened and you responded appropriately. Centers that file thorough, honest reports demonstrate professionalism. Centers that fail to report, or file incomplete reports, create much bigger problems for themselves.',
      },
    ],
    quiz: [
      {
        question: 'A child bumps their head at 2:00 PM. The parent takes the child to the doctor "just to be safe." The doctor says the child is fine. Do you need to file a licensing report?',
        options: [
          'No, because the doctor found nothing wrong',
          'No, because it was just a bump on the head',
          'Yes, because medical treatment was sought, regardless of the outcome',
          'Only if the parent requests that you file one',
        ],
        correctIndex: 2,
        explanation: 'Any incident where medical treatment is sought (a doctor visit) is reportable, even if the doctor finds no injury. The threshold is whether medical treatment was sought, not whether an injury was confirmed.',
      },
      {
        question: 'An incident occurs at 3:00 PM on Friday. By when must the licensing report be filed?',
        options: [
          'Monday morning when the licensing office opens',
          'By 3:00 PM on Saturday',
          'Within 48 hours, so by Sunday at 3:00 PM',
          'By the end of business on Friday',
        ],
        correctIndex: 1,
        explanation: 'The 24-hour clock runs from the time of the incident, including weekends. File online or use the after-hours line. Do not wait until Monday.',
      },
      {
        question: 'In addition to filing a licensing report, what else must you do when there is a maltreatment allegation against a staff member?',
        options: [
          'Fire the staff member immediately',
          'Contact your county\'s child protection intake line immediately',
          'Investigate internally before contacting anyone external',
          'Wait for licensing to tell you what to do',
        ],
        correctIndex: 1,
        explanation: 'Maltreatment allegations require two separate reports: the licensing report AND an immediate call to county child protection. These are parallel requirements, not sequential.',
      },
      {
        question: 'What tone should a licensing report use?',
        options: [
          'Defensive, explaining why the incident was not the center\'s fault',
          'Minimal, providing as few details as possible',
          'Factual and chronological, without excuses or justifications',
          'Apologetic, emphasizing how sorry you are',
        ],
        correctIndex: 2,
        explanation: 'Licensing reports should be factual and demonstrate that you understand what happened and how you responded. Defensiveness, minimizing, and excessive apologizing all undermine credibility.',
      },
      {
        question: 'A licensing investigator visits after your report. What should you have ready?',
        options: [
          'Just the filed licensing report',
          'A letter from your attorney',
          'The complete incident file: internal report, witness statements, photos, parent notification records, corrective action plan, and evidence of implementation',
          'Nothing specific; just answer their questions verbally',
        ],
        correctIndex: 2,
        explanation: 'Having an organized, complete incident file demonstrates professionalism and transparency. It shows you take incidents seriously and have systems in place.',
      },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────

export default function IncidentTrainingPage() {
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCompletions(loadCompletions());
    setMounted(true);
  }, []);

  const activeModule = TRAINING_MODULES.find((m) => m.id === activeModuleId);

  const completedCount = TRAINING_MODULES.filter((m) =>
    completions.some((c) => c.moduleId === m.id)
  ).length;

  const overallProgress = Math.round((completedCount / TRAINING_MODULES.length) * 100);

  function getCompletion(moduleId: string): ModuleCompletion | undefined {
    return completions.find((c) => c.moduleId === moduleId);
  }

  function openModule(moduleId: string) {
    setActiveModuleId(moduleId);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function closeModule() {
    setActiveModuleId(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function handleQuizAnswer(questionIndex: number, optionIndex: number) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function submitQuiz() {
    if (!activeModule) return;
    const total = activeModule.quiz.length;
    const answered = Object.keys(quizAnswers).length;
    if (answered < total) return;

    setQuizSubmitted(true);

    const correct = activeModule.quiz.filter(
      (q, i) => quizAnswers[i] === q.correctIndex
    ).length;

    const score = Math.round((correct / total) * 100);

    const newCompletion: ModuleCompletion = {
      moduleId: activeModule.id,
      completedAt: new Date().toISOString(),
      score,
      totalQuestions: total,
    };

    const updated = [
      ...completions.filter((c) => c.moduleId !== activeModule.id),
      newCompletion,
    ];
    setCompletions(updated);
    saveCompletions(updated);
  }

  if (!mounted) {
    return (
      <>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-8" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  // ─── Active Module View ─────────────────────────────────────────
  if (activeModule) {
    const allAnswered = Object.keys(quizAnswers).length === activeModule.quiz.length;
    const completion = getCompletion(activeModule.id);

    return (
      <>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={closeModule}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training Modules
            </Button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-christina-red/10 rounded-lg">
                <activeModule.icon className="h-6 w-6 text-christina-red" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{activeModule.title}</h1>
                <p className="text-muted-foreground mt-1">{activeModule.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {activeModule.estimatedMinutes} min
                  </span>
                  {completion && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Completed: {completion.score}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 mb-10">
            {activeModule.sections.map((section, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{section.heading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {section.body.split('\n\n').map((paragraph, pi) => (
                      <p key={pi} className="text-sm text-muted-foreground leading-relaxed mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quiz */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-christina-red" />
              <h2 className="text-xl font-bold">Knowledge Check</h2>
              <span className="text-sm text-muted-foreground">
                {activeModule.quiz.length} questions
              </span>
            </div>

            <div className="space-y-6">
              {activeModule.quiz.map((q, qi) => {
                const selected = quizAnswers[qi];
                const isCorrect = selected === q.correctIndex;

                return (
                  <Card
                    key={qi}
                    className={
                      quizSubmitted
                        ? isCorrect
                          ? 'border-green-300 bg-green-50/50'
                          : 'border-red-300 bg-red-50/50'
                        : ''
                    }
                  >
                    <CardContent className="pt-6">
                      <p className="font-medium mb-4">
                        {qi + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oi) => {
                          const isSelected = selected === oi;
                          const isCorrectOption = oi === q.correctIndex;

                          let optionClasses =
                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm';

                          if (quizSubmitted) {
                            if (isCorrectOption) {
                              optionClasses +=
                                ' border-green-400 bg-green-50 text-green-900';
                            } else if (isSelected && !isCorrectOption) {
                              optionClasses +=
                                ' border-red-400 bg-red-50 text-red-900';
                            } else {
                              optionClasses += ' border-muted opacity-50';
                            }
                          } else {
                            optionClasses += isSelected
                              ? ' border-christina-red bg-christina-red/5 text-foreground'
                              : ' border-muted hover:border-christina-red/50 hover:bg-muted/50';
                          }

                          return (
                            <button
                              key={oi}
                              onClick={() => handleQuizAnswer(qi, oi)}
                              className={optionClasses}
                              disabled={quizSubmitted}
                            >
                              <span className="flex-shrink-0 mt-0.5">
                                {quizSubmitted && isCorrectOption ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : quizSubmitted && isSelected && !isCorrectOption ? (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <span
                                    className={`block w-4 h-4 rounded-full border-2 ${
                                      isSelected
                                        ? 'border-christina-red bg-christina-red'
                                        : 'border-muted-foreground/30'
                                    }`}
                                  >
                                    {isSelected && (
                                      <span className="block w-2 h-2 rounded-full bg-white mx-auto mt-0.5" />
                                    )}
                                  </span>
                                )}
                              </span>
                              <span className="text-left">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`mt-3 p-3 rounded-lg text-sm ${
                            isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className="font-medium">
                            {isCorrect ? 'Correct!' : 'Incorrect.'}
                          </span>{' '}
                          {q.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quiz Submit / Results */}
            <div className="mt-6">
              {!quizSubmitted ? (
                <Button
                  onClick={submitQuiz}
                  disabled={!allAnswered}
                  className="w-full bg-christina-red hover:bg-christina-red/90 text-white"
                  size="lg"
                >
                  {allAnswered
                    ? 'Submit Answers'
                    : `Answer all ${activeModule.quiz.length} questions to continue`}
                </Button>
              ) : (
                <Card className="border-christina-red/30 bg-christina-red/5">
                  <CardContent className="pt-6 text-center">
                    {(() => {
                      const correct = activeModule.quiz.filter(
                        (q, i) => quizAnswers[i] === q.correctIndex
                      ).length;
                      const score = Math.round(
                        (correct / activeModule.quiz.length) * 100
                      );
                      return (
                        <>
                          <Award className="h-10 w-10 text-christina-red mx-auto mb-3" />
                          <h3 className="text-xl font-bold mb-1">
                            Module Complete
                          </h3>
                          <p className="text-3xl font-bold text-christina-red mb-1">
                            {score}%
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {correct} of {activeModule.quiz.length} correct
                          </p>
                          <Button
                            onClick={closeModule}
                            variant="outline"
                            className="border-christina-red text-christina-red hover:bg-christina-red/10"
                          >
                            Return to Training Hub
                          </Button>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Module List View ───────────────────────────────────────────
  return (
    <>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <a href="/admin/incidents" className="hover:text-christina-red transition-colors">
              Incidents
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Training</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Incident Response Training</h1>
          <p className="text-muted-foreground">
            Complete all five modules to ensure your team can recognize, respond to, document, and report incidents properly.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {TRAINING_MODULES.length} modules complete
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-christina-red rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {overallProgress === 100 && (
              <div className="flex items-center gap-2 mt-3 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">All modules completed. Great work!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {TRAINING_MODULES.map((mod, index) => {
            const completion = getCompletion(mod.id);
            const isComplete = !!completion;

            return (
              <Card
                key={mod.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-christina-red/30 ${
                  isComplete ? 'border-green-200 bg-green-50/30' : ''
                }`}
                onClick={() => openModule(mod.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-lg flex-shrink-0 ${
                        isComplete
                          ? 'bg-green-100'
                          : 'bg-christina-red/10'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <mod.icon className="h-5 w-5 text-christina-red" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Module {index + 1}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {mod.estimatedMinutes} min
                        </span>
                      </div>
                      <h3 className="font-semibold text-base mb-1">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mod.description}
                      </p>

                      <div className="mt-3">
                        {isComplete ? (
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Score: {completion.score}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(completion.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not started
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Estimated Total Time */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Total estimated time:{' '}
            <span className="font-medium">
              {TRAINING_MODULES.reduce((sum, m) => sum + m.estimatedMinutes, 0)} minutes
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
