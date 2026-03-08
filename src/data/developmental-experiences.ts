import type { DevelopmentalExperience, AgeGroup } from '@/types/curriculum';

// ============================================================================
// Infant Experiences (6 weeks - 16 months)
// ============================================================================

export const infantExperiences: DevelopmentalExperience[] = [
  {
    id: 'exp-infant-001',
    title: 'Nature Sensory Garden Walk',
    type: 'seasonal_nature',
    ageGroup: 'infant',
    yearRange: 'Young Infant (6 weeks - 8 months)',
    ubuntuConnection:
      'Even our youngest community members belong to the natural world. When an infant reaches for a leaf or feels grass under their fingers, they are saying "I am here, I am part of this." The garden is our first shared classroom, open to everyone.',
    coreValues: ['belonging', 'connection to nature', 'sensory exploration'],
    domains: ['cognitive', 'physical', 'science'],
    developmentalOutcomes: [
      'Responds to new textures with purposeful reaching and grasping',
      'Demonstrates sensory awareness through facial expressions and vocalizations',
      'Builds tolerance for varied outdoor stimuli (light, wind, temperature)',
    ],
    description:
      'Gentle outdoor walk through the center\'s garden area. Infants experience textures (grass, leaves, petals), sounds (birds, wind), and light patterns. Caregivers narrate what the child is touching and hearing, building early language alongside sensory input.',
    preparation: [
      'Check garden area for hazards: sharp sticks, ant hills, standing water',
      'Gather blankets and place in shaded spots for resting during the walk',
      'Prepare a small basket of safe natural items (large leaves, smooth stones, flower petals) for infants who cannot yet crawl',
      'Confirm sun protection: hats, shade canopies, sunscreen if approved by families',
    ],
    duringExperience: [
      'Carry or place infants on blankets near plants and let them reach toward leaves and flowers',
      'Narrate what the child is experiencing: "You are touching the soft petal. Feel how smooth it is."',
      'Pause at different spots for 2-3 minutes, letting infants absorb sounds and sights',
      'Watch for signs of overstimulation (turning away, fussing) and move to a calmer area',
      'Allow older infants to crawl on grass with close supervision',
    ],
    reflection: [
      'Note which textures each infant reached for or pulled away from',
      'Record vocalizations or facial expressions that indicate preference or discomfort',
      'Share observations with families at pickup, including photos if possible',
    ],
    familyConnection:
      'Send home a small pressed leaf or flower petal with a note describing what the child explored that day. Invite families to do a similar sensory walk in their own yard or a nearby park.',
    estimatedDuration: '30 minutes',
    bestSeason: 'any',
    frequency: 'Weekly',
    adaptations: {
      simplify: 'For very young infants, limit to one or two textures at a time. Hold items near the baby rather than placing the baby on the ground.',
      extend: 'For older infants who are mobile, create a short "trail" with different ground surfaces: grass, smooth pavers, mulch. Let them crawl between stations.',
    },
  },
  {
    id: 'exp-infant-002',
    title: 'Music and Movement Visitor',
    type: 'in_center',
    ageGroup: 'infant',
    yearRange: 'Older Infant (8 - 16 months)',
    ubuntuConnection:
      'When a musician shares their gift with our babies, children experience someone giving to the community freely. Music is a universal language of connection. The rhythm a child feels in their body connects them to every person who has ever clapped, sung, or swayed.',
    coreValues: ['community sharing', 'cultural expression', 'joy'],
    domains: ['creative', 'language', 'social-emotional'],
    developmentalOutcomes: [
      'Responds to rhythm through body movement (bouncing, swaying, clapping)',
      'Shows social referencing by looking at caregiver during new auditory experiences',
      'Begins to vocalize or babble in response to music and singing',
    ],
    description:
      'A local musician visits with acoustic instruments. Infants experience rhythm, vibration, and song in a small group setting. The musician plays softly, lets children touch instruments, and leads simple songs with caregiver participation.',
    preparation: [
      'Confirm musician visit and discuss volume expectations (soft, acoustic only)',
      'Set up a comfortable circle area with cushions and blankets for infants and caregivers',
      'Prepare a few infant-safe rhythm instruments: soft shakers, small drums, ribbon wands',
      'Brief the musician on the age group, including the need for slow pacing and gentle volume',
    ],
    duringExperience: [
      'Seat infants on caregiver laps in a semicircle facing the musician',
      'Let the musician play short pieces (1-2 minutes) with pauses for babies to respond',
      'Offer shakers and drums for infants to explore during musical pauses',
      'Encourage caregivers to sway, clap, and sing along so infants see familiar adults engaging',
      'Allow infants to crawl toward the musician if they show interest, with supervision',
    ],
    reflection: [
      'Observe which instruments drew the most attention from each child',
      'Note any rhythmic responses: bouncing, clapping, vocalizing',
      'Discuss with the musician what they noticed about infant engagement',
      'Document the experience with photos for the classroom display',
    ],
    familyConnection:
      'Share the names of songs played during the visit and suggest families sing these at home. Provide a list of free music programs at local libraries in Crystal and Brooklyn Park.',
    estimatedDuration: '45 minutes',
    bestSeason: 'any',
    frequency: 'Monthly',
    adaptations: {
      simplify: 'For younger or more sensitive infants, position them further from the musician. Use only one instrument at a time to reduce sensory load.',
      extend: 'For older infants showing strong interest, let them sit closer and explore instruments with the musician\'s guidance. Introduce call-and-response clapping games.',
    },
  },
  {
    id: 'exp-infant-003',
    title: 'Family Heritage Blanket',
    type: 'family_engagement',
    ageGroup: 'infant',
    yearRange: 'Young Infant (6 weeks - 8 months)',
    ubuntuConnection:
      'Each blanket carries a family\'s story into our classroom. When babies rest on blankets from home, the boundary between family and center softens. The child is surrounded by their people\'s warmth even when those people are at work.',
    coreValues: ['family identity', 'cultural pride', 'comfort and belonging'],
    domains: ['social-emotional', 'cognitive'],
    developmentalOutcomes: [
      'Shows comfort and self-regulation when in contact with familiar textures and scents',
      'Begins to distinguish between familiar and unfamiliar objects through touch',
      'Develops secure attachment by experiencing continuity between home and center',
    ],
    description:
      'Each family brings a blanket or fabric with meaning: a cultural pattern, handmade quilt, meaningful clothing item, or fabric from their home country. Infants explore these textures during tummy time, rest, and free play throughout their enrollment.',
    preparation: [
      'Send a letter home (in family\'s home language when possible) explaining the blanket project and its purpose',
      'Prepare a storage system so each child\'s blanket is clean, labeled, and accessible',
      'Create a small display board near the infant room entrance showing each blanket\'s story',
      'Have backup blankets available for families who need time to choose one',
    ],
    duringExperience: [
      'Place the blanket in the infant\'s crib, tummy time area, or play space daily',
      'During tummy time, narrate: "This is your blanket from home. Your mama chose it for you."',
      'Let infants grasp, mouth, and explore the texture of their blanket',
      'Occasionally place two blankets side by side during parallel play so babies experience different textures together',
    ],
    reflection: [
      'Observe whether the blanket provides comfort during transitions (arrival, nap time)',
      'Note the infant\'s developing relationship with the blanket over weeks and months',
      'Share stories with families about how their child interacts with the blanket',
      'Photograph the child with their blanket for the family at the end of enrollment',
    ],
    familyConnection:
      'Invite each family to write or dictate a short story about why they chose their blanket. Display these stories alongside photos in the classroom so every family who walks in sees their story valued.',
    estimatedDuration: 'Ongoing',
    bestSeason: 'any',
    frequency: 'Ongoing throughout enrollment',
    adaptations: {
      simplify: 'For families who are unsure what to bring, offer examples: a pillowcase, a t-shirt, any fabric with personal meaning. There is no wrong answer.',
      extend: 'As infants grow, use blankets as a conversation starter during group time. "This is Amara\'s blanket. Her grandmother made it." Build early social awareness through these stories.',
    },
  },
  {
    id: 'exp-infant-004',
    title: 'Community Library Story Time',
    type: 'community_outing',
    ageGroup: 'infant',
    yearRange: 'Older Infant (8 - 16 months)',
    ubuntuConnection:
      'The library belongs to everyone. Bringing our infants into this shared space teaches them from the start that community resources exist for all of us. The librarian reading to them is one more adult in their village.',
    coreValues: ['shared resources', 'literacy from birth', 'community participation'],
    domains: ['literacy', 'language', 'social-emotional'],
    developmentalOutcomes: [
      'Demonstrates emerging book awareness by reaching for or gazing at board books',
      'Practices being in a group setting outside the center with caregiver support',
      'Responds to the rhythm and intonation of read-aloud storytelling',
    ],
    description:
      'Small group visit to the local Crystal or Brooklyn Park library. Infants experience board books, puppet shows, and the rhythm of group story time. Caregivers sit with infants on their laps, modeling attention and engagement with books.',
    preparation: [
      'Confirm library baby story time schedule and register the group if required',
      'Arrange transportation: strollers, car seats, permission forms signed',
      'Pack diaper bags, bottles, snacks, and comfort items for each child',
      'Brief caregivers on ratio expectations during the outing (1:2 for infants)',
      'Prepare library card applications for any families who want one',
    ],
    duringExperience: [
      'Arrive 10 minutes early to settle infants and explore the baby book area',
      'During story time, hold infants facing the reader and point to pictures',
      'Let older infants crawl to the book bins and choose board books to explore',
      'Allow infants to leave the group and return as their attention allows',
      'Take photos of infants with books to share with families',
    ],
    reflection: [
      'Note which books or puppets held each child\'s attention',
      'Record any new vocalizations or gestures that emerged during the visit',
      'Debrief with caregivers about what went smoothly and what to adjust next time',
    ],
    familyConnection:
      'Send home a library card application with a note about the visit. Include a list of the books read during story time so families can check them out on their own.',
    estimatedDuration: '1.5 hours',
    bestSeason: 'any',
    frequency: 'Quarterly',
    adaptations: {
      simplify: 'For infants who are overwhelmed by the group setting, one caregiver can take them to a quieter corner of the library with a few board books for one-on-one reading.',
      extend: 'For older infants who are engaged, stay after story time to explore the play area or attend a second reading. Let them practice pulling books from low shelves.',
    },
  },
  {
    id: 'exp-infant-005',
    title: 'Seasonal Sensory Bins',
    type: 'seasonal_nature',
    ageGroup: 'infant',
    yearRange: 'Young Infant (6 weeks - 8 months)',
    ubuntuConnection:
      'The seasons change for all of us together. When children explore materials that come from the world around them, they connect to the same rhythms their families and neighbors live. The acorn a child holds fell from a tree the whole neighborhood walks past.',
    coreValues: ['seasonal awareness', 'shared environment', 'curiosity'],
    domains: ['science', 'cognitive', 'physical'],
    developmentalOutcomes: [
      'Explores objects using multiple senses (touch, sight, smell)',
      'Develops fine motor skills through grasping, releasing, and transferring objects',
      'Begins to notice differences between materials (smooth vs. rough, wet vs. dry)',
    ],
    description:
      'Rotating sensory bins filled with season-specific natural materials. Fall: leaves and acorns. Winter: pinecones and brief snow exploration. Spring: flower petals and soil. Summer: water and shells. All materials are large enough to prevent choking and are closely supervised.',
    preparation: [
      'Collect seasonal materials from the center grounds or nearby parks',
      'Wash and inspect all items for safety: no small pieces, sharp edges, or toxic plants',
      'Set up shallow bins on a low table or on the floor with a mat underneath',
      'Have wet wipes and a change of clothes ready for messy exploration',
    ],
    duringExperience: [
      'Place 2-3 items in the bin at a time to avoid overwhelming infants',
      'Sit with the infant and model touching, picking up, and examining items',
      'Narrate the sensory experience: "This pinecone is bumpy. This leaf is smooth and flat."',
      'Allow mouthing of safe items (large, clean leaves; smooth stones too big to swallow) while supervising closely',
      'Rotate items every few minutes to maintain interest',
    ],
    reflection: [
      'Document which materials each infant preferred and which they avoided',
      'Note emerging fine motor milestones (pincer grasp, transferring between hands)',
      'Share seasonal sensory photos with families through the daily communication app',
      'Plan next season\'s bin based on what engaged the children most',
    ],
    familyConnection:
      'Invite families to bring in one natural item from their yard or a walk in their neighborhood to add to the seasonal bin. This blends home and center environments.',
    estimatedDuration: '20 minutes',
    bestSeason: 'any',
    frequency: 'Weekly',
    adaptations: {
      simplify: 'For the youngest infants, hold items near them and gently touch the material to their hands or feet. Let them observe rather than requiring active reaching.',
      extend: 'For older infants, add containers for dumping and filling. Introduce simple cause-and-effect: dropping an acorn into a metal bowl to hear the sound.',
    },
  },
];

// ============================================================================
// Toddler Experiences (16 months - 33 months)
// ============================================================================

export const toddlerExperiences: DevelopmentalExperience[] = [
  {
    id: 'exp-toddler-001',
    title: 'Farm Visit and Animal Friends',
    type: 'community_outing',
    ageGroup: 'toddler',
    yearRange: 'Older Toddler (24 - 33 months)',
    ubuntuConnection:
      'Animals depend on us to be gentle and responsible. When we care for another living thing, we practice the same care we show each other in our community. The goat who eats from a child\'s hand is trusting that child, and trust is the foundation of every relationship.',
    coreValues: ['gentleness', 'responsibility', 'empathy for living things'],
    domains: ['science', 'social-emotional', 'language'],
    developmentalOutcomes: [
      'Practices gentle touch with animals, building self-regulation and body awareness',
      'Expands vocabulary by learning animal names, sounds, and descriptive words',
      'Begins to understand that other living things have needs (food, water, shelter)',
    ],
    description:
      'Visit to a local farm or petting zoo. Children observe, touch, and feed animals. The focus is on gentle handling, animal care, and naming what they see. Caregivers model how to approach animals calmly and speak softly.',
    preparation: [
      'Research and confirm a toddler-friendly farm or petting zoo within 30 minutes of the center',
      'Send permission forms and allergy/sensitivity surveys to families two weeks in advance',
      'Pack hand sanitizer, wipes, water bottles, snacks, first aid kit, and extra clothes',
      'Review gentle touch expectations with children using stuffed animals before the trip',
      'Confirm transportation and adult-to-child ratios (1:3 for toddlers on outings)',
    ],
    duringExperience: [
      'Model gentle petting and narrate: "We use flat hands to pet the goat. See how soft her fur is."',
      'Name animals and their features: "This is a hen. She has feathers and a red comb on her head."',
      'Let children feed animals with supervision, supporting their hands if needed',
      'Take breaks in shaded areas when children show fatigue or overstimulation',
      'Encourage children to notice animal behaviors: eating, sleeping, walking, sounds',
    ],
    reflection: [
      'Ask children simple questions: "Which animal did you like? What sound did the cow make?"',
      'Create a group experience chart back at the center with photos and children\'s words',
      'Note each child\'s comfort level with animals for future planning',
    ],
    familyConnection:
      'Send home photos from the trip and a short list of picture books about farm animals available at the library. Suggest families visit a pet store together to continue the conversation about animal care.',
    estimatedDuration: '2 hours',
    bestSeason: 'spring',
    frequency: 'Annually',
    adaptations: {
      simplify: 'For children who are fearful of animals, let them observe from a distance first. Offer a stuffed animal to hold while watching. Never force proximity.',
      extend: 'For confident children, ask them to describe the animal to a friend: "Tell Jayden what the bunny feels like." Build language and peer connection simultaneously.',
    },
  },
  {
    id: 'exp-toddler-002',
    title: 'Planting Our Garden',
    type: 'seasonal_nature',
    ageGroup: 'toddler',
    yearRange: 'Young Toddler (16 - 24 months)',
    ubuntuConnection:
      'When we plant together, we learn that good things grow when a whole community tends them. No one plant grows alone, and neither do we. The herbs we grow will flavor meals we share, closing the loop between effort and nourishment.',
    coreValues: ['patience', 'shared effort', 'growth'],
    domains: ['science', 'physical', 'cognitive'],
    developmentalOutcomes: [
      'Develops cause-and-effect understanding through planting, watering, and observing growth',
      'Strengthens fine motor skills through digging, pouring, and placing seeds',
      'Builds vocabulary related to nature: seed, soil, water, sun, grow, leaf',
    ],
    description:
      'Children plant seeds in the center\'s garden beds or indoor pots. They water and observe over days and weeks, eventually harvesting herbs or vegetables. The process emphasizes patience and daily care rather than just the end result.',
    preparation: [
      'Select fast-growing, child-safe plants: sunflowers, cherry tomatoes, basil, lettuce',
      'Gather child-sized gardening tools: trowels, watering cans, gloves',
      'Prepare garden beds or large pots with soil, placed at toddler-accessible height',
      'Create a simple photo chart showing the planting steps in order',
    ],
    duringExperience: [
      'Let each child scoop soil, place seeds, and pat the soil down',
      'Demonstrate watering with a small can: "We give the seed a drink, just a little."',
      'Name each step out loud as children do it: "You are digging. Now you are dropping the seed in."',
      'Assign daily watering turns so children return to the garden regularly',
      'Mark a growth chart on the wall and update it weekly with the children',
    ],
    reflection: [
      'Take weekly photos of the plants and display them in sequence so children see change over time',
      'During circle time, ask: "What do our plants need today? Water? Sun?"',
      'When harvest comes, let children pick the vegetables and taste what they grew',
    ],
    familyConnection:
      'Send home a small pot with soil and seeds so families can plant alongside the center\'s garden. Include a simple instruction card with pictures for non-readers.',
    estimatedDuration: '30 minutes',
    bestSeason: 'spring',
    frequency: 'Seasonal (spring planting, ongoing care)',
    adaptations: {
      simplify: 'For younger toddlers, pre-fill pots with soil and let them focus on one step: dropping the seed in. Simplify to one action per session.',
      extend: 'For older toddlers, add measuring (how tall is our plant?) and comparison (which plant is bigger?). Introduce simple graphing with stickers on a wall chart.',
    },
  },
  {
    id: 'exp-toddler-003',
    title: 'Neighborhood Walk and Helpers',
    type: 'community_outing',
    ageGroup: 'toddler',
    yearRange: 'Older Toddler (24 - 33 months)',
    ubuntuConnection:
      'Our neighborhood is full of people who take care of us, even when we don\'t notice. Recognizing them is the first step to understanding that we all carry each other. The postal carrier, the crossing guard, the store clerk: each one holds up a piece of the world we live in.',
    coreValues: ['gratitude', 'awareness of others', 'community interdependence'],
    domains: ['social-emotional', 'language', 'cognitive'],
    developmentalOutcomes: [
      'Identifies community helpers and describes what they do using simple language',
      'Practices social skills by greeting familiar adults in the neighborhood',
      'Builds spatial awareness and safety skills during supervised walking',
    ],
    description:
      'Walking tour of the neighborhood around the center. The group stops to greet the postal carrier, wave at the crossing guard, and visit the corner store. Caregivers name the helpers who make the neighborhood work and explain their roles in simple terms.',
    preparation: [
      'Plan a route that passes at least three community helper locations within a safe walking distance',
      'Alert neighbors and business owners along the route that the group will be stopping by',
      'Prepare a walking rope for toddlers and ensure proper adult-to-child ratios (1:3)',
      'Bring a small "thank you" card or drawing made by the children to leave with a helper',
      'Check weather and dress children appropriately',
    ],
    duringExperience: [
      'Walk at a toddler pace, pausing to look at things that catch children\'s attention',
      'At each stop, introduce the helper: "This is Mr. Davis. He brings the mail to everyone on this street."',
      'Encourage children to wave, say hello, or hand over the thank-you card',
      'Point out signs, vehicles, and tools each helper uses: "See the mail truck? That\'s how the letters get to us."',
      'Let children ask questions and respond simply and honestly',
    ],
    reflection: [
      'Back at the center, recall the walk together: "Who did we see? What did they do?"',
      'Create a simple "Our Neighborhood Helpers" poster with photos from the walk',
      'Read a book about community helpers during the next circle time to reinforce vocabulary',
    ],
    familyConnection:
      'Ask families to point out one community helper on their drive or walk home and name what that person does. Send home the list of helpers the group visited so families can revisit those spots together.',
    estimatedDuration: '1 hour',
    bestSeason: 'any',
    frequency: 'Monthly',
    adaptations: {
      simplify: 'For younger or less mobile toddlers, shorten the route to one or two stops. Use a stroller for children who tire easily and let them observe from a seated position.',
      extend: 'For older toddlers, ask them to predict who they\'ll see before the walk. After the walk, play "community helper" in dramatic play with props (mail bag, apron, hat).',
    },
  },
  {
    id: 'exp-toddler-004',
    title: 'Grandparent Story Circle',
    type: 'family_engagement',
    ageGroup: 'toddler',
    yearRange: 'Young Toddler (16 - 24 months)',
    ubuntuConnection:
      'When elders share their stories with our children, two things happen at once: the elder feels valued, and the child learns that wisdom lives in people, not just in books. This exchange across generations is Ubuntu at its most natural.',
    coreValues: ['intergenerational wisdom', 'respect for elders', 'oral tradition'],
    domains: ['language', 'social-emotional', 'literacy'],
    developmentalOutcomes: [
      'Practices sustained listening in a group setting with adult support',
      'Experiences diverse storytelling styles, voices, and cultural traditions',
      'Builds comfort with non-parental adults through positive, warm interactions',
    ],
    description:
      'Grandparents, elders, or senior community members are invited to share stories, songs, or traditions from their childhoods. Toddlers sit in a circle time format with caregivers, listening and responding. The format is flexible: singing, showing objects, telling short stories, or demonstrating a skill.',
    preparation: [
      'Invite grandparents and elders through a personal letter sent home with each child, at least three weeks in advance',
      'Offer options: read a book, sing a song, show a family object, tell a short story',
      'Set up a comfortable circle area with cushions, a rocking chair for the guest, and soft lighting',
      'Prepare a simple snack to share after the story circle, creating a social gathering feel',
      'Have a backup plan (a staff member reads a culturally relevant book) in case no guests are available',
    ],
    duringExperience: [
      'Welcome the guest warmly and introduce them: "This is Jayden\'s grandmother, Mrs. Williams. She has a song to share."',
      'Keep the session short (10-15 minutes of storytelling) to match toddler attention spans',
      'Encourage toddlers to clap, repeat words, or point at objects the guest shares',
      'Take photos of the guest with the children (with permission) for the classroom wall',
      'Allow children to sit on caregiver laps if they feel shy at first',
    ],
    reflection: [
      'Thank the guest with a card made by the children (handprints, scribbles, stickers)',
      'Retell the story or song during the next day\'s circle time to reinforce the memory',
      'Add the guest\'s photo and a short summary to the "Our Community" bulletin board',
    ],
    familyConnection:
      'After each story circle, send a note home describing what was shared. Encourage families to ask their child\'s grandparents to tell one story from their childhood at the next family gathering.',
    estimatedDuration: '45 minutes',
    bestSeason: 'any',
    frequency: 'Quarterly',
    adaptations: {
      simplify: 'For sessions with very young toddlers, ask the guest to focus on singing or showing an object rather than telling a long story. Singing holds toddler attention more reliably.',
      extend: 'For groups with older toddlers, invite the guest to teach a simple skill: folding fabric, clapping a rhythm pattern, or counting in another language.',
    },
  },
  {
    id: 'exp-toddler-005',
    title: 'Rain and Puddle Exploration',
    type: 'seasonal_nature',
    ageGroup: 'toddler',
    yearRange: 'Young Toddler (16 - 24 months)',
    ubuntuConnection:
      'Rain does not choose where it falls. It nourishes everything equally. When children play in the rain together, they experience the world treating everyone the same. The puddle belongs to all of them.',
    coreValues: ['equality', 'wonder', 'shared joy'],
    domains: ['science', 'physical', 'cognitive'],
    developmentalOutcomes: [
      'Explores cause and effect through splashing, pouring, and stomping',
      'Develops gross motor skills through walking, jumping, and balancing on wet surfaces',
      'Observes natural phenomena: rain sounds, puddle reflections, worm movement',
    ],
    description:
      'After rain, children go outside in boots and rain gear to splash in puddles, observe worms, and feel wet grass and mud. Caregivers guide exploration with questions and narration, turning a rainy day into a science lesson.',
    preparation: [
      'Maintain a supply of rain boots and rain jackets in various sizes at the center',
      'Send a note to families at the start of the season asking them to bring rain gear',
      'Identify safe puddle areas on the playground: flat surfaces, no deep standing water',
      'Prepare towels, dry clothes, and a warm-up area for after the exploration',
    ],
    duringExperience: [
      'Help children dress in rain gear, naming each item: "Boots keep your feet dry. The jacket keeps the rain off."',
      'Walk to puddles and model stomping, then invite children to try',
      'Crouch down to look at reflections in puddles: "Can you see your face in the water?"',
      'Point out worms on the sidewalk: "The worm came out because the ground is wet."',
      'Let children pour water between containers, push leaves through puddles, and dig in mud',
    ],
    reflection: [
      'Back inside, talk about what happened: "The puddle splashed when you jumped. The mud was squishy."',
      'Read a rain-themed book during the next story time',
      'Display photos of the puddle play on the classroom bulletin board',
      'Note which children were hesitant about mud or water and plan gradual exposure next time',
    ],
    familyConnection:
      'Encourage families to let their child splash in puddles at home instead of walking around them. Send a short note: "Getting muddy is learning. Here is what your child discovered today."',
    estimatedDuration: '30 minutes',
    bestSeason: 'spring',
    frequency: 'As weather allows',
    adaptations: {
      simplify: 'For children who dislike getting wet, offer a shallow tray of water indoors with small toys. Let them explore water on their own terms without the sensory intensity of full outdoor play.',
      extend: 'For children who love the sensory experience, add containers, funnels, and scoops to the puddle area. Introduce pouring and measuring concepts in the natural setting.',
    },
  },
];

// ============================================================================
// Preschool Experiences (33 months - 5 years)
// ============================================================================

export const preschoolExperiences: DevelopmentalExperience[] = [
  {
    id: 'exp-preschool-001',
    title: 'Fire Station Community Visit',
    type: 'community_outing',
    ageGroup: 'preschool',
    yearRange: 'Older Preschool (4 - 5 years)',
    ubuntuConnection:
      'Firefighters run toward danger so the rest of us can be safe. They show us what it means to use your strength for the whole community, not just yourself. When children meet these helpers face to face, bravery stops being a word and becomes a person they shook hands with.',
    coreValues: ['courage', 'service', 'community safety'],
    domains: ['social-emotional', 'language', 'cognitive'],
    developmentalOutcomes: [
      'Understands the role of community helpers and can describe what firefighters do',
      'Practices asking questions and listening to answers in a real-world setting',
      'Develops safety awareness: stop-drop-roll, what to do if there is a fire',
    ],
    description:
      'Visit the local fire station. Children meet firefighters, see the trucks and equipment, learn about fire safety, and understand what community helpers do. The experience emphasizes that safety depends on people working together.',
    preparation: [
      'Contact the fire station and schedule a group visit, confirming child-friendly content',
      'Prepare children with a short discussion about what firefighters do and what they might see',
      'Practice asking questions: each child prepares one question to ask a firefighter',
      'Arrange transportation, signed permission forms, and emergency contact information',
      'Pack water, snacks, and sun protection',
    ],
    duringExperience: [
      'Walk through the station as a group, pausing at each area for explanation',
      'Let children sit in the fire truck (with supervision) and try on a helmet',
      'Practice stop-drop-roll together on the station floor',
      'Encourage children to ask their prepared questions and listen to the answers',
      'Take a group photo with the firefighters for the classroom wall',
    ],
    reflection: [
      'Back at the center, create a group mural of the fire station visit',
      'Each child dictates or draws their favorite part of the visit',
      'Set up a fire station dramatic play area with hats, hoses (pool noodles), and a pretend truck',
      'Review fire safety rules and practice them weekly for the next month',
    ],
    familyConnection:
      'Send home a fire safety checklist for families. Include items like: test your smoke detectors, identify two exits from your home, practice a family fire drill. Attach a photo of their child at the station.',
    estimatedDuration: '2 hours',
    bestSeason: 'any',
    frequency: 'Annually',
    adaptations: {
      simplify: 'For younger preschoolers or children who are frightened by loud sounds, warn them before any sirens or alarms. Allow them to observe from a distance and approach equipment at their own pace.',
      extend: 'For older preschoolers, ask the firefighters to explain the science of fire (what it needs to burn) and introduce concepts of teamwork and training.',
    },
  },
  {
    id: 'exp-preschool-002',
    title: 'Cultural Heritage Celebration',
    type: 'family_engagement',
    ageGroup: 'preschool',
    yearRange: 'Young Preschool (33 months - 4 years)',
    ubuntuConnection:
      '"I am because we are" means that each family\'s culture makes our classroom richer. When one family shares, every child\'s world grows larger. The heritage wall is proof that no single tradition is more important than another.',
    coreValues: ['cultural pride', 'diversity', 'mutual respect'],
    domains: ['social-emotional', 'language', 'creative'],
    developmentalOutcomes: [
      'Recognizes and names cultural differences with curiosity rather than judgment',
      'Builds pride in their own family traditions by sharing them publicly',
      'Develops expressive language through describing traditions, foods, and objects',
    ],
    description:
      'Families are invited to share one tradition, food, song, or artifact from their cultural background. Children explore stations set up by families, taste foods, hear songs, and see meaningful objects. Together, they create a "heritage wall" display that stays up all year.',
    preparation: [
      'Send invitations to families six weeks in advance, offering multiple ways to participate: bring food, share a song, display a photo, or tell a story',
      'Set up the classroom with table stations, one per participating family',
      'Prepare name cards, table cloths, and a sound system for music',
      'Create heritage wall materials: large poster board, photo frames, labels in multiple languages',
      'Plan a simple icebreaker activity so families can meet each other',
    ],
    duringExperience: [
      'Welcome each family as they arrive and help them set up their station',
      'Guide children through the stations in small groups, spending 5-10 minutes at each',
      'Encourage children to try foods, listen to songs, and ask questions: "What is this called? When do you eat this?"',
      'Take photos of children at each station for the heritage wall',
      'Close with a group song or a reading of a multicultural picture book',
    ],
    reflection: [
      'Over the following week, revisit the heritage wall daily and name what each family shared',
      'Ask children to draw their favorite part of the celebration',
      'Send thank-you notes to every participating family, written partly by the children',
      'Incorporate cultural elements into ongoing classroom life: play the music, cook the recipes, display the art',
    ],
    familyConnection:
      'After the celebration, send each family a printed photo collage of the event. Invite families who could not attend to add to the heritage wall at any time during the year.',
    estimatedDuration: '3 hours (half day)',
    bestSeason: 'any',
    frequency: 'Biannually',
    adaptations: {
      simplify: 'For families who feel uncertain about participating, offer to help them prepare. A staff member can interview the family and set up the station on their behalf.',
      extend: 'For classrooms with strong family participation, expand into a multi-day cultural week with daily themes: music Monday, food Tuesday, story Wednesday, art Thursday, dance Friday.',
    },
  },
  {
    id: 'exp-preschool-003',
    title: 'Harvest Festival and Giving',
    type: 'seasonal_nature',
    ageGroup: 'preschool',
    yearRange: 'Older Preschool (4 - 5 years)',
    ubuntuConnection:
      'We do not eat alone. When we grow food and share it with people we may never meet, we live the truth that our abundance is meant to flow outward. The bags children fill for the food shelf are small, but the lesson is enormous.',
    coreValues: ['generosity', 'shared abundance', 'responsibility to community'],
    domains: ['social-emotional', 'math', 'science'],
    developmentalOutcomes: [
      'Practices sorting, counting, and categorizing during produce preparation',
      'Understands the concept of giving to people outside their immediate circle',
      'Connects the planting process (spring) to the harvest result (fall), building long-term thinking',
    ],
    description:
      'Fall harvest event. Children help harvest from the center garden, sort produce, and prepare donation bags for a local food shelf. Families contribute canned goods. The event ties together months of garden care with the act of sharing what was grown.',
    preparation: [
      'Coordinate with a local food shelf (CROSS Services, CEAP, or another Brooklyn Park/Crystal partner) for donation drop-off',
      'Send home requests for canned goods and non-perishable items two weeks before the event',
      'Prepare harvesting tools, bags, labels, and sorting bins',
      'Plan a simple harvest snack using produce from the garden: cherry tomatoes, herbs on crackers, lettuce wraps',
      'Set up a counting and sorting station where children can bag items',
    ],
    duringExperience: [
      'Walk to the garden as a group and let each child pick vegetables or herbs',
      'At the sorting station, children count items and place them in bags: "Let\'s put five cans in each bag."',
      'Explain where the bags are going: "These bags will go to families who need food. We are sharing what we have."',
      'Prepare and eat the harvest snack together, family-style',
      'Let children decorate the donation bags with drawings and stickers',
    ],
    reflection: [
      'Discuss the full cycle: "We planted seeds in spring. We watered all summer. Now we are sharing the food we grew."',
      'Read a book about food, farming, or generosity during the next circle time',
      'Write a class thank-you letter to the food shelf and display their response',
    ],
    familyConnection:
      'Invite families to join the harvest day. After the event, share a recipe using one of the harvested ingredients so families can cook together at home using what their child helped grow.',
    estimatedDuration: '3 hours (half day)',
    bestSeason: 'fall',
    frequency: 'Annually',
    adaptations: {
      simplify: 'For younger preschoolers, focus on the sensory parts: picking vegetables, touching soil, tasting the snack. Reduce the counting and sorting to match their skill level.',
      extend: 'For older preschoolers, involve them in planning the donation: how many bags do we need, how many cans go in each, what should we write on the label? Let them do the math.',
    },
  },
  {
    id: 'exp-preschool-004',
    title: 'Local Artist Workshop',
    type: 'in_center',
    ageGroup: 'preschool',
    yearRange: 'Young Preschool (33 months - 4 years)',
    ubuntuConnection:
      'Art made together carries more meaning than art made alone. When every child adds their mark to a shared piece, they see themselves as part of something larger. The mural on the wall is proof that what we make as a group outlasts what any one of us could make.',
    coreValues: ['collaboration', 'creative expression', 'community voice'],
    domains: ['creative', 'physical', 'social-emotional'],
    developmentalOutcomes: [
      'Participates in collaborative art, learning to share space, materials, and ideas',
      'Develops fine motor control through painting, stamping, gluing, and sculpting',
      'Builds confidence by seeing their contribution valued in a larger work',
    ],
    description:
      'A local artist visits with supplies and leads a collaborative art project. Children contribute to a shared mural, sculpture, or installation. The artist guides the process while honoring each child\'s choices and creative instincts.',
    preparation: [
      'Connect with a local Crystal or Brooklyn Park artist, community art center, or high school art teacher willing to volunteer',
      'Discuss the project concept in advance: mural, collage, clay installation, or textile piece',
      'Cover tables and floor with drop cloths. Set out smocks, brushes, paints, and materials',
      'Prepare the base for the collaborative piece (large canvas, plywood panel, or paper roll)',
      'Brief children on who is visiting and what they will be doing together',
    ],
    duringExperience: [
      'Introduce the artist and let them show examples of their work at child level',
      'The artist demonstrates a technique, then children try it on their section of the piece',
      'Circulate to each child, narrating their choices: "You picked blue. Look how it blends with the yellow next to it."',
      'Allow children to move between sections, adding to what others have started',
      'Step back as a group to look at the full piece periodically: "Look what we are making together."',
    ],
    reflection: [
      'Hang or display the finished piece in a prominent location: entryway, hallway, or family gathering space',
      'Let each child point to their part and describe what they did',
      'Write a short artist statement as a class and post it next to the work',
      'Thank the artist with a group card and invite them back',
    ],
    familyConnection:
      'At pickup, guide families to the finished artwork and point out their child\'s contribution. Send home a small art supply kit (crayons, paper, glue stick) with a prompt: "Make something together as a family this weekend."',
    estimatedDuration: '1.5 hours',
    bestSeason: 'any',
    frequency: 'Quarterly',
    adaptations: {
      simplify: 'For younger preschoolers, limit the technique to one step (stamping, finger painting). Reduce the workspace to a manageable area so they are not overwhelmed by the large format.',
      extend: 'For older preschoolers, introduce a planning step: sketch ideas before painting. Ask them to explain their artistic choices using descriptive language.',
    },
  },
  {
    id: 'exp-preschool-005',
    title: 'Winter Bird Feeding Station',
    type: 'seasonal_nature',
    ageGroup: 'preschool',
    yearRange: 'Young Preschool (33 months - 4 years)',
    ubuntuConnection:
      'In winter, the birds depend on us. When children choose to feed creatures who cannot ask for help, they practice the kind of generosity that holds a community together. Caring for the vulnerable is not optional; it is what makes a community real.',
    coreValues: ['stewardship', 'generosity', 'observation'],
    domains: ['science', 'cognitive', 'physical'],
    developmentalOutcomes: [
      'Identifies common winter birds by appearance and behavior using a simple field guide',
      'Practices sustained observation and recording (drawing, tallying) over weeks',
      'Understands that animals have seasonal needs and that humans can help meet them',
    ],
    description:
      'Children build simple bird feeders from pinecones, peanut butter, and seed. They hang feeders outside classroom windows and observe visiting birds over weeks. The project combines science, patience, and care for the natural world.',
    preparation: [
      'Gather materials: pinecones, peanut butter (or sunflower butter for allergy safety), birdseed, string, trays',
      'Print a simple Minnesota winter bird identification chart with pictures',
      'Set up an observation station near the window: binoculars, magnifying glasses, drawing paper, bird chart',
      'Identify a visible spot outside the classroom window to hang feeders',
    ],
    duringExperience: [
      'Show children the materials and demonstrate spreading peanut butter on a pinecone, then rolling it in seed',
      'Let each child make their own feeder with hands-on help as needed',
      'Hang feeders together outside the window, naming each child\'s feeder',
      'Establish a daily observation routine: 5-10 minutes at the window, recording what birds visit',
      'Refresh feeders monthly, letting children notice when seed is low and needs refilling',
    ],
    reflection: [
      'Create a class bird journal with drawings and tally marks for each species spotted',
      'Compare bird activity across weeks: "We saw more birds this week. Why do you think that happened?"',
      'Read books about Minnesota birds during circle time',
      'At the end of winter, celebrate: "We fed the birds all winter. They counted on us, and we showed up."',
    ],
    familyConnection:
      'Send home instructions for making a simple feeder from a milk carton. Include the bird identification chart so families can observe birds together at home.',
    estimatedDuration: 'Ongoing',
    bestSeason: 'winter',
    frequency: 'Daily observation, monthly feeder refresh',
    adaptations: {
      simplify: 'For younger preschoolers, pre-tie the strings and let children focus on the peanut butter and seed step. At the window, point to one bird at a time rather than asking them to identify species.',
      extend: 'For older preschoolers, add data collection: how many birds per day, which species comes most often. Create simple bar graphs on the classroom wall and discuss patterns.',
    },
  },
];

// ============================================================================
// School Age Experiences (5 - 12 years)
// ============================================================================

export const schoolAgeExperiences: DevelopmentalExperience[] = [
  {
    id: 'exp-school-001',
    title: 'Community Service Project',
    type: 'community_outing',
    ageGroup: 'school-age',
    yearRange: 'Older School Age (8 - 12 years)',
    ubuntuConnection:
      'Service is not charity; it is reciprocity. The community has given to each of us. When children organize a project that gives back, they complete a circle that has been holding them all along. The child who picks up trash in the park is caring for the same ground that held them when they learned to walk.',
    coreValues: ['reciprocity', 'leadership', 'civic responsibility'],
    domains: ['social-emotional', 'language', 'cognitive'],
    developmentalOutcomes: [
      'Plans and executes a multi-step project with peers, developing organizational skills',
      'Articulates why community service matters using their own words and reasoning',
      'Builds empathy by engaging directly with community needs rather than learning about them abstractly',
    ],
    description:
      'Children plan and execute a community service project: neighborhood cleanup, care packages for seniors at a local care facility, or a supply drive for an animal shelter. The emphasis is on children making real decisions about what to do, how to do it, and who it helps.',
    preparation: [
      'Brainstorm project ideas as a group, listing community needs the children have noticed',
      'Vote on a project and create a simple plan: what do we need, who does what, when is it happening',
      'Contact the partner organization (park district, senior center, animal shelter) to coordinate',
      'Gather supplies: gloves, bags, donation items, transportation',
      'Assign roles to children: supply manager, communications lead, team captains',
    ],
    duringExperience: [
      'Review the plan as a group before starting: "Here is what we said we would do. Let\'s check our list."',
      'Let children lead as much as possible, with adults facilitating rather than directing',
      'Document the project with photos and short interviews: "Why did you want to do this?"',
      'Take breaks to notice the impact: "Look at how much cleaner this area is. You did that."',
      'Thank the partner organization and any community members who helped',
    ],
    reflection: [
      'Hold a debrief circle: what went well, what was hard, what would you do differently',
      'Each child writes or draws a reflection: "What I learned about our community today"',
      'Create a display or presentation for families showing the project from start to finish',
      'Discuss next steps: "Is this a project we want to do again? What other needs have we noticed?"',
    ],
    familyConnection:
      'Invite families to join the service day if possible. After the project, send home a short summary of what the group accomplished and suggest one family-sized service action: picking up litter on their block, writing a card to a neighbor, donating unused items.',
    estimatedDuration: '3 hours',
    bestSeason: 'any',
    frequency: 'Quarterly',
    adaptations: {
      simplify: 'For younger school-agers, narrow the project to one clear task (e.g., filling care packages) and handle the logistics yourself. Let children focus on doing the work rather than planning it.',
      extend: 'For older children, add a research component: interview community members about what they need, present findings to the group, and let the data drive the project choice.',
    },
  },
  {
    id: 'exp-school-002',
    title: 'STEM Field Lab',
    type: 'community_outing',
    ageGroup: 'school-age',
    yearRange: 'Younger School Age (5 - 8 years)',
    ubuntuConnection:
      'Science belongs to everyone. When children from our center walk into a museum, they claim space in a world of knowledge that their curiosity makes them worthy of entering. No one needs permission to be amazed by how the world works.',
    coreValues: ['curiosity', 'access to knowledge', 'wonder'],
    domains: ['science', 'math', 'cognitive'],
    developmentalOutcomes: [
      'Practices observation and recording skills using a guided journal',
      'Asks scientific questions prompted by hands-on exhibits and demonstrations',
      'Connects museum content to classroom learning through reflection and discussion',
    ],
    description:
      'Visit to the Science Museum of Minnesota, Bell Museum, or a local nature center. Children complete a guided observation journal during the visit, recording what they see, questions they have, and one thing that surprised them.',
    preparation: [
      'Book the field trip and confirm group rates, parking, and lunch logistics',
      'Create an observation journal for each child: 6-8 pages with prompts like "Draw something that surprised you" and "Write one question you want to answer"',
      'Preview the museum exhibits online and identify 3-4 must-see stops for the group',
      'Arrange transportation, permission forms, emergency contacts, and adult chaperones',
      'Pack lunches, water, and first aid supplies',
    ],
    duringExperience: [
      'At each exhibit, give children 5-10 minutes of free exploration before guiding their attention',
      'Ask open-ended questions: "What do you notice? What do you think is happening here? Why?"',
      'Prompt children to use their journals: sketch, write, or tally what they observe',
      'Allow older children to explore in small supervised groups, choosing their own path',
      'Gather at a meeting spot midway for a snack break and to share one discovery each',
    ],
    reflection: [
      'On the ride home or back at the center, each child shares their favorite journal entry',
      'Post journals on the classroom science wall and revisit them over the following week',
      'Connect museum content to upcoming classroom experiments or lessons',
      'Write thank-you letters to the museum, including one observation from each child',
    ],
    familyConnection:
      'Send home the completed observation journal with a note about what the child was most interested in. Include information about free or reduced museum days so families can visit on their own.',
    estimatedDuration: '4 hours (half day)',
    bestSeason: 'any',
    frequency: 'Biannually',
    adaptations: {
      simplify: 'For younger school-agers, reduce the journal to 3-4 pages with more drawing prompts and fewer writing prompts. Stay together as one group rather than splitting up.',
      extend: 'For older children, add a research project: pick one exhibit topic and spend a week investigating it further at the center. Present findings to the group.',
    },
  },
  {
    id: 'exp-school-003',
    title: 'Multicultural Cooking Day',
    type: 'in_center',
    ageGroup: 'school-age',
    yearRange: 'Younger School Age (5 - 8 years)',
    ubuntuConnection:
      'Food is the oldest form of community. When a child learns to make their grandmother\'s recipe and serves it to their friends, culture stops being abstract and becomes something you can taste. The table is where Ubuntu lives every day.',
    coreValues: ['cultural exchange', 'generosity', 'hands-on learning'],
    domains: ['math', 'science', 'social-emotional', 'language'],
    developmentalOutcomes: [
      'Follows multi-step recipe instructions, practicing sequencing and comprehension',
      'Applies math skills through measuring, counting, and timing',
      'Experiences cultural traditions through food, expanding their understanding of the community\'s diversity',
    ],
    description:
      'Families share recipes from their traditions. Children follow recipes, measure ingredients, and cook together. The meal is shared family-style, with each child serving others before themselves.',
    preparation: [
      'Send recipe requests to families a month in advance, asking for dishes that are meaningful to them',
      'Review all recipes for allergens and create a safe menu that accommodates dietary needs',
      'Purchase ingredients and organize them into recipe-specific stations',
      'Print kid-friendly recipe cards with pictures for each step',
      'Set up cooking stations with child-safe tools: measuring cups, mixing bowls, wooden spoons, and supervised use of stovetop or oven',
    ],
    duringExperience: [
      'Introduce each recipe and the family who shared it: "This is injera. Nebiat\'s family makes this for celebrations."',
      'Assign children to cooking teams, each following one recipe with adult guidance',
      'Teach measurement as you go: "We need one cup. Is this one cup or half a cup?"',
      'While food cooks, share the story behind each dish: where it comes from, when it is eaten, who taught the recipe',
      'Set the table together and serve family-style, each child offering food to the person next to them before serving themselves',
    ],
    reflection: [
      'During the meal, ask: "Which dish was new to you? What did you like about it?"',
      'Create a class cookbook with the recipes and children\'s illustrations',
      'Send copies of all recipes home so families can try each other\'s dishes',
      'Display photos of the cooking process and the shared meal on the family board',
    ],
    familyConnection:
      'Give each family a printed copy of the class cookbook. Encourage them to cook one new recipe from the book with their child at home and share how it went.',
    estimatedDuration: '2 hours',
    bestSeason: 'any',
    frequency: 'Quarterly',
    adaptations: {
      simplify: 'For younger school-agers, choose no-cook recipes (fruit salad, wraps, trail mix) and focus on measuring and mixing. Reduce the number of recipes to two or three.',
      extend: 'For older children, add a math challenge: double or halve the recipe. Let them calculate ingredient amounts and explain their reasoning to the group.',
    },
  },
  {
    id: 'exp-school-004',
    title: 'Environmental Stewardship Journal',
    type: 'seasonal_nature',
    ageGroup: 'school-age',
    yearRange: 'Younger School Age (5 - 8 years)',
    ubuntuConnection:
      'To care for a place over time is to enter a relationship with it. When children notice the first bud, the browning leaf, and the bare branch, they learn what it means to pay attention to something beyond themselves. Stewardship is Ubuntu extended to the land.',
    coreValues: ['responsibility', 'long-term commitment', 'observation'],
    domains: ['science', 'literacy', 'cognitive'],
    developmentalOutcomes: [
      'Sustains a long-term observation project, developing persistence and follow-through',
      'Records scientific observations using writing, drawing, and measurement',
      'Identifies seasonal changes in plants, weather, and animal behavior through direct experience',
    ],
    description:
      'Season-long nature observation project. Children adopt a tree, garden plot, or outdoor area near the center. They photograph, sketch, measure, and journal changes across the school year, building a record of how the natural world shifts over time.',
    preparation: [
      'Identify observation sites on or near center grounds: specific trees, garden beds, a section of the playground',
      'Create observation journals with weekly prompt pages: "Draw your tree today," "Measure the tallest plant," "What animals did you see?"',
      'Gather tools: rulers, magnifying glasses, thermometers, a camera or tablet for photos',
      'Introduce the project at the start of the school year with a kickoff observation session',
    ],
    duringExperience: [
      'Each week, children visit their adopted site for 15-20 minutes of guided observation',
      'Prompt them to use all senses: "What do you see that is different from last week? Does it smell different?"',
      'Measure and record temperature, plant height, or the number of leaves on a branch',
      'Photograph the same spot from the same angle each week to create a visual timeline',
      'Periodically compare entries from different months: "Look at September. Look at January. What changed?"',
    ],
    reflection: [
      'At the end of each season, review journal entries as a group and discuss patterns',
      'Create a wall display with photos arranged chronologically so the whole school year is visible',
      'At year end, each child presents their journal to the group and identifies the biggest change they observed',
      'Discuss: "What did you learn about patience from this project? About paying attention?"',
    ],
    familyConnection:
      'Encourage families to adopt a spot at home (a tree in the yard, a potted plant, a view from a window) and observe it together once a month. Provide a simple home observation sheet they can use.',
    estimatedDuration: 'Ongoing',
    bestSeason: 'any',
    frequency: 'Weekly journaling',
    adaptations: {
      simplify: 'For younger school-agers, focus on drawing rather than writing. Provide sentence starters: "Today my tree looks..." and let them complete the thought with one word or phrase.',
      extend: 'For older children, add weather data tracking, graphing of plant growth over time, and comparison with published phenology data for Minnesota. Introduce the concept of climate patterns.',
    },
  },
  {
    id: 'exp-school-005',
    title: 'Mentorship and Interview Project',
    type: 'community_outing',
    ageGroup: 'school-age',
    yearRange: 'Older School Age (8 - 12 years)',
    ubuntuConnection:
      'Every person carries a story that matters. When a child sits across from an elder and says "Tell me about your life," both people become more visible to each other. That is Ubuntu in action: the recognition that my humanity is bound up in yours.',
    coreValues: ['deep listening', 'respect', 'intergenerational connection'],
    domains: ['language', 'literacy', 'social-emotional'],
    developmentalOutcomes: [
      'Develops interviewing skills: formulating questions, active listening, follow-up questions',
      'Practices expository writing by turning interview notes into a narrative or profile',
      'Builds empathy and perspective-taking by engaging with life experiences different from their own',
    ],
    description:
      'Children interview community members: elders, business owners, veterans, activists, and neighbors. They learn to ask meaningful questions, listen carefully, and record what they hear. Interviews are compiled into a class book or presentation that honors each person\'s story.',
    preparation: [
      'Identify and invite community members willing to be interviewed: reach out through families, local organizations, senior centers, and neighborhood connections',
      'Teach interviewing skills over several sessions: how to ask open-ended questions, how to listen without interrupting, how to take notes',
      'Have each child prepare 5-7 questions in advance, reviewed and refined with adult help',
      'Arrange interview logistics: location (center, interviewee\'s home, a community space), recording device, notebook',
      'Practice with mock interviews among the children before the real thing',
    ],
    duringExperience: [
      'Introduce the child and the interviewee, then step back and let the child lead',
      'Sit nearby for support but do not take over the conversation',
      'Prompt the child if they get stuck: "What else do you want to know about that?"',
      'Record the interview (with permission) so the child can review it later',
      'After the interview, thank the community member and take a photo together',
    ],
    reflection: [
      'Each child writes a profile or narrative based on their interview, with adult editing support',
      'Compile profiles into a class book, printed and bound, with one copy for the center and one for the interviewee',
      'Hold a presentation evening where children read their profiles aloud with families and interviewees present',
      'Discuss: "What surprised you? What did you learn that you did not know before? How did it feel to be listened to?"',
    ],
    familyConnection:
      'Encourage children to interview a family member at home using the same skills they practiced. Provide a take-home question sheet and a simple recording guide. Add the family interview to the class book if the family consents.',
    estimatedDuration: '2 hours per interview',
    bestSeason: 'any',
    frequency: 'Biannually',
    adaptations: {
      simplify: 'For younger school-agers, pair two children per interview so they can support each other. Reduce to 3-4 questions and let them draw a portrait instead of writing a full profile.',
      extend: 'For older children, add a research component: learn about the interviewee\'s profession, era, or cultural background before the interview. Write a longer narrative piece with direct quotes and context.',
    },
  },
];

// ============================================================================
// Combined and Indexed Exports
// ============================================================================

export const allExperiences: DevelopmentalExperience[] = [
  ...infantExperiences,
  ...toddlerExperiences,
  ...preschoolExperiences,
  ...schoolAgeExperiences,
];

export const experiencesByRoom: Record<
  'Infant' | 'Toddler' | 'Preschool' | 'School Age',
  DevelopmentalExperience[]
> = {
  Infant: infantExperiences,
  Toddler: toddlerExperiences,
  Preschool: preschoolExperiences,
  'School Age': schoolAgeExperiences,
};

export const experiencesByAgeGroup: Record<AgeGroup, DevelopmentalExperience[]> = {
  infant: infantExperiences,
  toddler: toddlerExperiences,
  preschool: preschoolExperiences,
  'school-age': schoolAgeExperiences,
};
