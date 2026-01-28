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
              Today, we serve families across multiple classrooms, providing high-quality care from infancy through school age. Our play-based approach, experienced staff, and commitment to family engagement set us apart. We are proudly licensed by Minnesota DCYF.
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

      </div>
    </div>
  );
}
