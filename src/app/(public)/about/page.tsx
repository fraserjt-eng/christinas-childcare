'use client';

import { ScrollFadeIn, ScrollFadeInStagger } from '@/components/features/ScrollFadeIn';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Heart,
  Lightbulb,
  Handshake,
  Award,
  Users,
  GraduationCap,
  Sparkles,
  Calendar,
  Building2,
  BookOpen,
  Baby,
  Globe,
  Eye,
  Target,
} from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Safety & Well-being',
    description:
      'Every decision starts with the safety and health of our children and staff. This is non-negotiable.',
  },
  {
    icon: Heart,
    title: 'Respect & Inclusion',
    description:
      'We celebrate diversity and make sure every family feels welcome, seen, and valued from day one.',
  },
  {
    icon: Lightbulb,
    title: 'Play-Based Learning',
    description:
      'Children learn best through purposeful play, exploration, and discovery. We protect their right to be kids.',
  },
  {
    icon: Handshake,
    title: 'Family Partnership',
    description:
      'Parents are a child\'s first and most important teachers. We work alongside you, never instead of you.',
  },
  {
    icon: Award,
    title: 'Continuous Improvement',
    description:
      'We invest in professional development and evidence-based practices because your children deserve our best.',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description:
      'We build bridges between families, schools, and community resources. No one raises children alone.',
  },
];

const timeline = [
  {
    year: '2020',
    title: 'Founded',
    description: 'Christina\'s Child Care Center opened its doors in Crystal, MN, welcoming its first families during one of the most challenging years in recent memory.',
    icon: Sparkles,
  },
  {
    year: '2021',
    title: 'First Expansion',
    description: 'Growing demand led us to expand our space and hire additional certified staff, allowing us to serve more families across multiple classrooms.',
    icon: Building2,
  },
  {
    year: '2022',
    title: 'School-Age Program Added',
    description: 'We launched our school-age program with before and after school care, plus free transportation to and from local schools.',
    icon: BookOpen,
  },
  {
    year: '2023',
    title: 'Reached 50+ Families',
    description: 'A milestone that reflects the trust Crystal families have placed in us. Word of mouth has been our strongest recruitment tool.',
    icon: Users,
  },
  {
    year: '2024',
    title: 'Curriculum Redesign',
    description: 'We overhauled our curriculum to incorporate the latest research in early childhood development, doubling down on play-based and culturally responsive learning.',
    icon: GraduationCap,
  },
];

const staff = [
  {
    name: 'Ophelia Zeogar',
    role: 'Lead Teacher',
    credentials: 'CDA Certified',
    years: 8,
    bio: 'Ophelia brings creativity and patience to every classroom interaction. She designs engaging activities that spark curiosity across all age groups, from infants discovering textures to preschoolers building their first stories. Her approach is simple: meet each child where they are and give them what they need to take the next step.',
    funFact: 'Collects children\'s books from around the world',
    initials: 'OZ',
  },
  {
    name: 'Stephen Zeogar',
    role: 'Owner & Operations Manager',
    credentials: 'Business Administration',
    years: 6,
    bio: 'Stephen keeps the center running smoothly so the teaching staff can focus on what matters: the kids. From facility maintenance to licensing compliance to parent communication, he handles the operational backbone that makes quality care possible. Families know him as the person who picks up the phone.',
    funFact: 'Coaches youth soccer on weekends',
    initials: 'SZ',
  },
  {
    name: 'Christina Fraser',
    role: 'Assistant Director',
    credentials: 'Early Childhood Education',
    years: 20,
    bio: 'With over 20 years in early childhood education, Christina is the heartbeat of the center\'s teaching philosophy. She mentors younger staff, develops curriculum frameworks, and ensures every child has a safe and joyful place to learn. Her experience spans infant care through school-age programming, and she brings that full-spectrum perspective to everything she does.',
    funFact: 'Known for her legendary read-aloud voices',
    initials: 'CF',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-gradient-to-br from-[#C62828] via-[#c44536] to-[#C62828] py-24 md:py-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6">
              Our Story
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <h1 className="font-playful text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              About Christina&apos;s
            </h1>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <p className="text-xl md:text-2xl text-white/90 font-light italic max-w-2xl mx-auto">
              &ldquo;Where Learning And Growth Become One&rdquo;
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Ubuntu Philosophy Section */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center rounded-full bg-[#C62828]/10">
                <Globe className="w-8 h-8 text-[#C62828]" strokeWidth={1.5} />
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                Our Guiding Philosophy
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                Ubuntu: &ldquo;I Am Because We Are&rdquo;
              </h2>
              <div className="w-16 h-0.5 bg-[#C62828] mx-auto mb-8" />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={150}>
            <div className="max-w-3xl mx-auto space-y-5 text-lg text-[#4a4a4a] leading-relaxed">
              <p>
                Christina&apos;s Child Care Center is built on the African philosophy of Ubuntu, the
                deep understanding that we belong to one another. A child does not grow in
                isolation. They grow through connection, through the village that surrounds them,
                through the hands that hold theirs when they stumble and the voices that cheer when
                they stand.
              </p>
              <p>
                At our center, Ubuntu is not a slogan. It is how we operate every day. Parents,
                teachers, and staff form a genuine community around each child. We share knowledge.
                We share responsibility. We show up for each other. When one family is struggling,
                others step in. When a child hits a milestone, the whole room celebrates.
              </p>
              <p>
                This is what it means to raise children together. Not as a service delivered to
                customers, but as a community committed to the well-being of its youngest members.
                Your child is our child. That is the promise.
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Center Story Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="max-w-3xl mx-auto text-center mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                How We Got Here
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a] mb-4">
                Our Story
              </h2>
              <div className="w-16 h-0.5 bg-[#C62828] mx-auto mb-8" />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <div className="max-w-3xl mx-auto space-y-5 text-lg text-[#4a4a4a] leading-relaxed mb-16">
              <p>
                Christina&apos;s Child Care Center was born from a simple belief: every child
                deserves a safe, loving place to learn and grow. Founded by Ophelia Zeogar, the
                center started as a small home-based program and has grown into Crystal, MN&apos;s
                trusted child care partner.
              </p>
              <p>
                Today, we serve families across multiple classrooms, providing high-quality care
                from infancy through school age. Our play-based approach, experienced staff, and
                commitment to family engagement set us apart. We are proudly licensed by Minnesota
                DCYF and deeply rooted in the community we serve.
              </p>
            </div>
          </ScrollFadeIn>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <ScrollFadeIn
                key={item.year}
                direction="up"
                duration={600}
                delay={index * 80}
              >
                <div className="relative flex gap-6 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-px bg-[#C62828]/15" />
                  )}
                  {/* Timeline dot */}
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center flex-shrink-0 relative z-10">
                    <item.icon className="w-5 h-5 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  {/* Content */}
                  <div className="pt-1">
                    <span className="text-sm font-bold text-[#C62828] tracking-wide">
                      {item.year}
                    </span>
                    <h3 className="text-lg font-bold text-[#1a1a1a] mt-1 mb-2">{item.title}</h3>
                    <p className="text-[#6b6b6b] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                What Drives Us
              </p>
              <h2 className="font-playful text-3xl md:text-4xl text-[#1a1a1a]">
                Mission & Vision
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ScrollFadeIn direction="left" duration={700} delay={100}>
              <Card className="border-0 shadow-md h-full bg-white">
                <CardContent className="p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-6">
                    <Target className="w-6 h-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Our Mission</h3>
                  <div className="w-12 h-0.5 bg-[#C62828] mb-6" />
                  <p className="text-[#4a4a4a] leading-relaxed text-lg">
                    To provide a safe, nurturing, and enriching environment where every child can
                    learn, grow, and thrive through play-based education and compassionate care. We
                    partner with families to build strong foundations that last a lifetime.
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeIn>
            <ScrollFadeIn direction="right" duration={700} delay={200}>
              <Card className="border-0 shadow-md h-full bg-white">
                <CardContent className="p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-[#1565C0]/10 flex items-center justify-center mb-6">
                    <Eye className="w-6 h-6 text-[#1565C0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Our Vision</h3>
                  <div className="w-12 h-0.5 bg-[#1565C0] mb-6" />
                  <p className="text-[#4a4a4a] leading-relaxed text-lg">
                    To be the child care center in Crystal, MN that families trust most, known for
                    excellence in early childhood education, authentic family engagement, and
                    innovative programming that prepares children for lifelong learning and
                    connection.
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                What We Stand For
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                These are not aspirations on a wall. They are the commitments we hold ourselves to
                every single day.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeInStagger
            staggerDelay={100}
            baseDelay={150}
            duration={600}
            direction="up"
            distance={30}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {values.map((value) => (
              <Card
                key={value.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-5">
                    <value.icon className="h-6 w-6 text-[#C62828]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{value.title}</h3>
                  <p className="text-[#6b6b6b] leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Staff Section */}
      <section className="bg-[#f5f0e8] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <ScrollFadeIn direction="up" duration={700}>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6b6b6b] mb-4">
                The People Behind the Care
              </p>
              <h2 className="font-playful text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-[#6b6b6b] max-w-2xl mx-auto font-light">
                Dedicated professionals who bring heart, skill, and genuine love to the work of
                caring for your children.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeInStagger
            staggerDelay={150}
            baseDelay={100}
            duration={700}
            direction="up"
            distance={35}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {staff.map((member) => (
              <Card
                key={member.name}
                className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  {/* Avatar header */}
                  <div className="bg-gradient-to-br from-[#C62828] to-[#c44536] p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-playful text-[#C62828]">
                        {member.initials}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white/80 font-medium">{member.role}</p>
                  </div>

                  {/* Credentials bar */}
                  <div className="bg-[#f5f0e8] px-6 py-3 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b] font-medium">
                        {member.credentials}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-[#6b6b6b]/30" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#6b6b6b]" />
                      <span className="text-xs text-[#6b6b6b] font-medium">
                        {member.years}{member.years === 20 ? '+' : ''} years
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-6">
                    <p className="text-[#4a4a4a] text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex items-start gap-2 pt-3 border-t border-[#e5e0d8]">
                      <Baby className="h-4 w-4 text-[#C62828]/60 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#C62828]/80 italic">
                        Fun fact: {member.funFact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollFadeInStagger>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="container mx-auto px-6 text-center">
          <ScrollFadeIn direction="up" duration={700}>
            <h2 className="font-playful text-3xl md:text-4xl text-white mb-4">
              Come See Us for Yourself
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn direction="up" duration={700} delay={100}>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light mb-2">
              The best way to understand what makes Christina&apos;s different is to walk through
              our doors. Schedule a tour and meet the people who will care for your child.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn direction="none" duration={800} delay={300}>
            <p className="text-white/40 text-sm mt-8">
              Crystal, MN &middot; Licensed by Minnesota DCYF &middot; Family-owned since 2020
            </p>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}
