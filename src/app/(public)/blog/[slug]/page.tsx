'use client';

import { useParams } from 'next/navigation';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    slug: 'preparing-your-child-for-their-first-day-at-daycare',
    title: 'Preparing Your Child for Their First Day at Daycare',
    excerpt:
      'Starting daycare is a big milestone for both kids and parents. Here are practical ways to make the transition smoother, from building familiarity with the routine to managing your own feelings about the change.',
    date: 'January 15, 2026',
    readTime: '5 min read',
    category: 'Transitions',
    content: [
      'The first day of daycare is one of those moments that sticks with you. Your child might cry. You might cry. And both of those things are completely normal. What helps most is a bit of preparation in the days and weeks leading up to that morning.',
      'Start by talking about daycare in positive, simple terms. Read books about going to school or meeting new friends. If possible, visit the center together before the official start date so your child can see the space, meet a teacher, and explore a few toys. Familiarity turns the unknown into something manageable.',
      'On the first morning, keep your goodbye short and warm. A long, drawn-out departure often makes things harder for everyone. Say something like, "I love you, I will be back after snack time," and then follow through. Consistency builds trust, and your child will learn that you always come back.',
      'Pack a comfort item if your center allows it. A small stuffed animal or a family photo tucked into their cubby can be a powerful anchor when feelings get big. Ask your child\'s teacher how drop-off went once you are apart. Most of the time, kids settle in within minutes.',
      'Give yourself grace during this transition too. Feeling sad or anxious about leaving your child with someone new does not mean you are making the wrong choice. It means you care deeply. That care is exactly what makes you a good parent, and it is exactly what your child will feel when you pick them up at the end of the day.',
    ],
  },
  {
    slug: 'the-power-of-play-based-learning',
    title: 'The Power of Play-Based Learning',
    excerpt:
      'Play is not a break from learning. It is how young children make sense of the world around them. Research consistently shows that hands-on, child-led play builds stronger foundations than worksheets ever could.',
    date: 'January 8, 2026',
    readTime: '6 min read',
    category: 'Child Development',
    content: [
      'When you watch a group of preschoolers build a block tower together, you are watching math, physics, negotiation, and language development all happening at once. Play is the natural language of childhood, and it is how the brain does its deepest work during the early years.',
      'Research from the American Academy of Pediatrics confirms what early childhood educators have known for decades: children who learn through play develop stronger problem-solving skills, better emotional regulation, and more flexible thinking than children who spend their early years on structured academics alone. Play does not compete with learning. Play is learning.',
      'At our center, play-based learning looks like building with loose parts, painting at the easel, digging in the sensory table, and acting out stories in the dramatic play corner. Teachers observe carefully and step in with questions that stretch thinking: "What happens if you add one more block?" or "How could you and Maya both use the red paint?"',
      'This does not mean we avoid structure. Our daily schedule includes intentional circle times, small group activities, and teacher-guided lessons. The difference is that even these structured moments feel playful. We read stories with puppets. We count with real objects. We practice letters by writing our names with markers, not by filling in worksheets.',
      'If you want to support play-based learning at home, the simplest thing you can do is give your child time and space to play without a screen or a structured activity. Open-ended toys like blocks, crayons, play dough, and dress-up clothes are worth more than any app. Sit nearby, watch what your child does, and follow their lead. You will be amazed at what they teach you.',
    ],
  },
  {
    slug: 'what-to-look-for-when-choosing-child-care',
    title: 'What to Look for When Choosing Child Care',
    excerpt:
      'Finding the right child care can feel overwhelming. This guide walks you through the quality indicators that matter most, from staff ratios and licensing to the warmth you feel when you walk through the door.',
    date: 'December 20, 2025',
    readTime: '7 min read',
    category: 'Choosing Care',
    content: [
      'Searching for child care is one of the most important decisions you will make as a parent, and it can feel like there are a hundred factors to weigh at once. The good news is that quality care has clear, recognizable signs. Knowing what to look for will help you trust your instincts during tours and interviews.',
      'Start with the basics: licensing and ratios. In Minnesota, child care centers must be licensed by the Department of Children, Youth, and Families (DCYF). Ask to see the license and check that it is current. Then ask about staff-to-child ratios. For infants, you want no more than four babies per caregiver. For toddlers, look for one adult to every five or six children. These numbers matter because they determine how much individual attention your child will receive.',
      'Next, pay attention to the environment. Is the space clean, organized, and set up at child height? Are there a variety of age-appropriate materials available for children to explore? Look for open-ended toys like blocks, art supplies, books, and dramatic play items rather than rows of desks or an overreliance on screens. The physical space tells you a lot about the program\'s philosophy.',
      'Watch how the teachers interact with the children. Do they get down on the children\'s level? Do they speak warmly and respectfully, even when redirecting behavior? A teacher who says, "I can see you are frustrated; let me help you find a solution," is doing very different work than one who says, "Stop that." The tone of adult-child interactions is the single strongest predictor of program quality.',
      'Finally, trust the feeling you get when you walk through the door. You should feel welcomed, not rushed. Staff should be happy to answer your questions and transparent about their policies. Your child should be able to visit before enrolling. The right child care will feel like a partnership, not a transaction, and that feeling starts from the very first conversation.',
    ],
  },
  {
    slug: 'our-daily-routine-a-peek-inside-christinas',
    title: "Our Daily Routine: A Peek Inside Christina's",
    excerpt:
      'Ever wonder what your child does all day? We break down a typical day at our center, from morning circle time to afternoon outdoor play, so you can see exactly how we balance learning, movement, and rest.',
    date: 'December 10, 2025',
    readTime: '4 min read',
    category: 'Inside Our Center',
    content: [
      'One of the questions we hear most from parents is, "What does my child actually do all day?" It is a fair question. You are trusting us with the most important person in your life, and you deserve to know how we spend those hours together. Here is a walk through a typical day in our preschool classroom.',
      'The morning starts with free play and breakfast between 6:30 and 8:00 AM. As children arrive, they settle in at their own pace. Some head straight for the block area; others want to sit with a book or chat with friends over cereal. By 8:30, we gather for morning circle: songs, a welcome greeting, the weather chart, and a preview of the day. Circle time lasts about 15 minutes because that is what preschool attention spans can handle.',
      'From 9:00 to 10:30, children rotate through small group activities and learning centers. This is where the intentional teaching happens. One group might work on letter sounds with a teacher while another explores color mixing at the art table. A third group builds ramps in the block area, testing which toy car rolls the farthest. Teachers document what they observe and use those notes to plan future activities that meet each child where they are.',
      'Late morning is outdoor time, rain or shine (unless conditions are truly unsafe). Children run, climb, dig, and play imaginative games. After lunch at 11:30, the classroom transitions to rest time. Not every child sleeps, and that is okay. Quiet activities like books and puzzles are available for children who stay awake. Rest time lasts until about 2:00 PM.',
      'The afternoon brings snack, more outdoor play, and a mix of teacher-led and child-led activities. Parents begin picking up around 4:00 PM, and the day winds down with calmer play, stories, and conversation. By the time you arrive, your child has spent the day learning, moving, connecting with friends, and being cared for by people who genuinely enjoy their company.',
    ],
  },
  {
    slug: 'building-social-skills-in-early-childhood',
    title: 'Building Social Skills in Early Childhood',
    excerpt:
      'Sharing, taking turns, and navigating disagreements are skills that children build over time with practice and support. Learn how we help kids develop the social tools they will carry into kindergarten and beyond.',
    date: 'November 28, 2025',
    readTime: '5 min read',
    category: 'Child Development',
    content: [
      'If you have ever watched two toddlers fight over the same toy truck, you know that social skills do not come built in. Sharing, waiting, reading facial expressions, and resolving conflicts are all learned behaviors, and they take years of practice. The good news is that a high-quality child care setting is one of the best places for that practice to happen.',
      'Young children learn social skills the same way they learn everything else: through experience, repetition, and guidance from trusted adults. When a teacher helps two children negotiate who gets the red crayon, she is teaching conflict resolution. When she narrates emotions ("You look sad that your friend left the game"), she is building emotional vocabulary. These small moments add up to real capability over time.',
      'At our center, we use several strategies to support social development. We read books about feelings and friendships. We role-play common social situations during circle time. We give children specific language to use: "Can I have a turn when you are done?" works better than grabbing, and children can learn to say it by age three with enough modeling and practice.',
      'We also pay close attention to the children who struggle most with social interactions. Some kids are naturally more reserved; others have a harder time reading social cues. Rather than labeling these children, we look for ways to set them up for success. That might mean pairing a shy child with a patient, nurturing peer, or giving an impulsive child a specific job during group activities so they feel included and important.',
      'You can reinforce social skills at home in simple ways. Narrate your own social interactions: "I am going to wait my turn in line." Play board games that require turn-taking. When conflicts come up between siblings or friends, resist the urge to solve the problem for them. Instead, coach them through it: "Tell your sister how you feel. Now let her tell you. What could you both try?" These conversations are some of the most valuable teaching you will ever do.',
    ],
  },
];

const categoryColors: Record<string, string> = {
  Transitions: 'bg-amber-100 text-amber-800',
  'Child Development': 'bg-emerald-100 text-emerald-800',
  'Choosing Care': 'bg-blue-100 text-blue-800',
  'Inside Our Center': 'bg-purple-100 text-purple-800',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts.filter((p) => p.slug !== slug);

  if (!post) {
    return (
      <div className="py-24 text-center">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We could not find the article you are looking for.
          </p>
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parent Resources
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-christina-red transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Parent Resources
          </Link>
        </ScrollFadeIn>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Article */}
          <article className="flex-1 min-w-0">
            <ScrollFadeIn direction="up" duration={600}>
              <div className="mb-8">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold mb-4 ${
                    categoryColors[post.category] ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {post.category}
                </span>
                <h1 className="font-playful text-3xl md:text-4xl lg:text-5xl mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn direction="up" duration={700} delay={100}>
              <div className="prose prose-lg max-w-none">
                {post.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground leading-relaxed mb-6"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollFadeIn>

            {/* CTA */}
            <ScrollFadeIn direction="up" duration={600} delay={200}>
              <Card className="mt-12 border-t-4 border-t-christina-red">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-3">
                    Want to learn more about our approach?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Come see our classrooms, meet our teachers, and find out if
                    Christina&apos;s is the right fit for your family.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-christina-red hover:bg-christina-red/90"
                  >
                    <Link href="/enroll">
                      Schedule a Tour
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <ScrollFadeIn direction="right" duration={600} delay={200}>
              <div className="lg:sticky lg:top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-christina-red" />
                  More Resources
                </h3>
                <div className="space-y-3">
                  {otherPosts.map((otherPost) => (
                    <Link
                      key={otherPost.slug}
                      href={`/blog/${otherPost.slug}`}
                      className="block group"
                    >
                      <Card className="transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-2 ${
                              categoryColors[otherPost.category] ||
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {otherPost.category}
                          </span>
                          <h4 className="text-sm font-semibold group-hover:text-christina-red transition-colors leading-snug">
                            {otherPost.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {otherPost.readTime}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollFadeIn>
          </aside>
        </div>
      </div>
    </div>
  );
}
