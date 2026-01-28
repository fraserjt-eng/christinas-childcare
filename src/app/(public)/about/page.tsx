import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Lightbulb, Shield, Handshake } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Safety & Well-being', description: 'Every decision starts with the safety and health of our children and staff.' },
  { icon: Heart, title: 'Respect & Inclusion', description: 'We celebrate diversity and ensure every family feels welcome and valued.' },
  { icon: Lightbulb, title: 'Play-Based Learning', description: 'Children learn best through purposeful play, exploration, and discovery.' },
  { icon: Handshake, title: 'Family Partnership', description: 'We believe parents are a child\'s first and most important teachers.' },
  { icon: Award, title: 'Continuous Improvement', description: 'We invest in professional development and evidence-based practices.' },
  { icon: Users, title: 'Community Connection', description: 'We build bridges between families, schools, and community resources.' },
];

const team = [
  { name: 'Ophelia Zeogar', role: 'Owner & Director', bio: 'With over 15 years in early childhood education, Ophelia founded the center with a vision of providing exceptional care rooted in love and learning.' },
  { name: 'Stephen Zeogar', role: 'Owner', bio: 'Stephen brings strong leadership and operational expertise, ensuring the center runs smoothly and continues to grow as a trusted community resource.' },
  { name: 'Christina Fraser', role: 'Assistant Director', bio: 'Christina brings years of administrative experience and a passion for early childhood development, ensuring smooth daily operations for families and staff alike.' },
];

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Story */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-xl text-christina-red font-medium italic mb-6">
            &ldquo;Where Learning And Growth Become One&rdquo;
          </p>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Christina&apos;s Child Care Center was born from a simple belief: every child deserves a safe, loving place to learn and grow. Founded by Ophelia Zeogar, our center has grown from a small home-based program into Crystal, MN&apos;s trusted child care partner.
            </p>
            <p>
              Today, we serve families across multiple classrooms, providing high-quality care from infancy through school age. Our play-based approach, experienced staff, and commitment to family engagement set us apart. We are proudly licensed by Minnesota DHS.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="border-t-4 border-t-christina-red">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To provide a safe, nurturing, and enriching environment where every child can learn, grow, and thrive through play-based education and compassionate care.
              </p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-christina-blue">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the premier child care center in Crystal, MN, known for excellence in early childhood education, family engagement, and innovative programming that prepares children for lifelong success.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-5 w-5 text-christina-red" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-christina-blue/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-bold text-christina-blue text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-christina-red font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
