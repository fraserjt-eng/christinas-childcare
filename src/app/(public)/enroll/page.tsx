'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollFadeIn } from '@/components/features/ScrollFadeIn';
import { CheckCircle, Phone, Mail, MapPin, Calendar, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

interface InquiryData {
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  program: string;
  startDate: string;
  message: string;
  submittedAt: string;
  status: 'new';
}

export default function EnrollPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    program: '',
    startDate: '',
    message: '',
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Persist to localStorage
    const inquiry: InquiryData = {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const existing = JSON.parse(localStorage.getItem('christinas_inquiries') || '[]');
    existing.push(inquiry);
    localStorage.setItem('christinas_inquiries', JSON.stringify(existing));

    // Brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-24">
        <div className="max-w-lg mx-auto text-center px-4">
          <ScrollFadeIn direction="up" duration={600}>
            <div className="w-16 h-16 rounded-full bg-christina-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-christina-green" />
            </div>
            <h1 className="font-playful text-3xl mb-4">Thank You!</h1>
            <p className="text-muted-foreground text-lg mb-6">
              We&apos;ve received your enrollment inquiry and will contact you within 24 hours. We can&apos;t wait to meet your family!
            </p>
            <div className="bg-muted/50 rounded-lg p-6 text-left mb-6">
              <h3 className="font-heading font-bold mb-3">What Happens Next</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="font-bold text-christina-red">1.</span> Our team reviews your inquiry</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">2.</span> We&apos;ll call or email within 24 hours</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">3.</span> Schedule a personal tour of our center</li>
                <li className="flex gap-2"><span className="font-bold text-christina-red">4.</span> Complete enrollment paperwork</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-christina-red hover:bg-christina-red/90">
                <Link href="/schedule-tour">Schedule a Tour Now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollFadeIn direction="up" duration={600}>
          <div className="text-center mb-12">
            <h1 className="font-playful text-4xl md:text-5xl mb-4">Start Your Journey</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fill out the form below and we&apos;ll reach out to schedule a tour of our center. We&apos;d love to show you what makes Christina&apos;s special.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent / Guardian Name *</Label>
                      <Input
                        id="parentName"
                        required
                        placeholder="Full name"
                        value={formData.parentName}
                        onChange={(e) => updateField('parentName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="(763) 555-0000"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child&apos;s Name *</Label>
                      <Input
                        id="childName"
                        required
                        placeholder="Child's first name"
                        value={formData.childName}
                        onChange={(e) => updateField('childName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Child&apos;s Age *</Label>
                      <Input
                        id="childAge"
                        required
                        placeholder="e.g., 18 months, 3 years"
                        value={formData.childAge}
                        onChange={(e) => updateField('childAge', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program Interest *</Label>
                      <Select
                        required
                        value={formData.program}
                        onValueChange={(v) => updateField('program', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infant">Infant Care (6 wks - 12 mo)</SelectItem>
                          <SelectItem value="toddler">Toddler (1 - 3 years)</SelectItem>
                          <SelectItem value="preschool">Preschool (3 - 5 years)</SelectItem>
                          <SelectItem value="school_age">School Age (5 - 12 years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Preferred Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your child, any questions, or special needs..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-christina-red hover:bg-christina-red/90"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Inquiry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-christina-red mt-0.5" />
                    <div className="text-sm">
                      <p>5510 W Broadway Ave</p>
                      <p>Crystal, MN 55428</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-christina-red" />
                    <a href="tel:+17633905870" className="text-sm hover:text-christina-red transition-colors">(763) 390-5870</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-christina-red" />
                    <a href="mailto:info@christinaschildcare.com" className="text-sm hover:text-christina-red transition-colors">info@christinaschildcare.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-christina-red" />
                    <span className="text-sm">Mon-Fri, 6:30 AM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">What to Expect</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>We&apos;ll contact you within 24 hours</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Schedule a personal tour of our center</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Complete enrollment paperwork</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-christina-red text-white flex items-center justify-center text-xs flex-shrink-0">4</span>
                    <span>Welcome to the Christina&apos;s family!</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-christina-red text-white">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 mb-3 text-white/80" />
                <h3 className="font-bold mb-2">Prefer to tour first?</h3>
                <p className="text-sm text-white/80 mb-4">
                  See our classrooms, meet the teachers, and get all your questions answered in person.
                </p>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 w-full">
                  <Link href="/schedule-tour">Schedule a Tour</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Shield className="h-6 w-6 text-christina-green mb-3" />
                <h3 className="font-bold mb-2 text-sm">We Accept</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>County child care assistance</li>
                  <li>Flexible spending accounts</li>
                  <li>Multiple payment options</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
