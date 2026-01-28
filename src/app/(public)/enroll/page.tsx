'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function EnrollPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-24">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-full bg-christina-red/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-christina-red" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;ve received your inquiry and will contact you within 24 hours to schedule a tour. We can&apos;t wait to meet your family!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Your Journey</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill out the form below and we&apos;ll reach out to schedule a tour of our center. We&apos;d love to show you what makes Christina&apos;s special.
          </p>
        </div>

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
                      <Input id="parentName" required placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" required placeholder="(763) 555-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child&apos;s Name *</Label>
                      <Input id="childName" required placeholder="Child's first name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Child&apos;s Age *</Label>
                      <Input id="childAge" required placeholder="e.g., 18 months, 3 years" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program Interest *</Label>
                      <Select required>
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
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea id="message" placeholder="Tell us about your child, any questions, or special needs..." rows={4} />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-christina-red hover:bg-christina-red/90" disabled={loading}>
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
                    <span className="text-sm">(763) 390-5870</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-christina-red" />
                    <span className="text-sm">info@christinaschildcare.com</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
