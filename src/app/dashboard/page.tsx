'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users, Calendar, FileText, Camera, Bell,
  Pencil, Plus, Upload, Trash2, Heart, MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { FamilyAccount, FamilyChild } from '@/types/family';
import {
  getCurrentFamily,
  updateFamilyProfile,
  addChild,
  updateChild,
  removeChild,
  compressPhoto,
} from '@/lib/family-storage';

const updates = [
  { title: 'Progress Report Available', description: 'January report for Noah is ready to view', time: '2 hours ago', type: 'report' },
  { title: 'New Photos Added', description: '5 new photos from art time in Bright Butterflies', time: '4 hours ago', type: 'photo' },
  { title: 'Upcoming Event', description: "Valentine's Day Party - February 14th", time: '1 day ago', type: 'event' },
  { title: 'Document Reminder', description: "Ava's immunization records due for update", time: '3 days ago', type: 'document' },
];

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const adjustedMonths = months < 0 ? months + 12 : months;
  const adjustedYears = months < 0 ? years - 1 : years;

  if (adjustedYears === 0) return `${adjustedMonths} months`;
  if (adjustedYears === 1 && adjustedMonths === 0) return '1 year';
  if (adjustedMonths === 0) return `${adjustedYears} years`;
  return `${adjustedYears}y ${adjustedMonths}m`;
}

export default function ParentDashboard() {
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<FamilyChild | null>(null);
  const familyPhotoRef = useRef<HTMLInputElement>(null);
  const childPhotoRef = useRef<HTMLInputElement>(null);

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Child form state
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childClassroom, setChildClassroom] = useState('');
  const [childAllergies, setChildAllergies] = useState('');
  const [childMedical, setChildMedical] = useState('');
  const [childPhotoUrl, setChildPhotoUrl] = useState('');

  useEffect(() => {
    const f = getCurrentFamily();
    setFamily(f);
  }, []);

  function refreshFamily() {
    const f = getCurrentFamily();
    setFamily(f);
  }

  function openEditProfile() {
    if (!family) return;
    const primary = family.parents.find((p) => p.is_primary) || family.parents[0];
    setEditName(primary?.name || '');
    setEditPhone(primary?.phone || '');
    setEditBio(family.family_bio || '');
    setEditAddress(family.address || '');
    setEditOpen(true);
  }

  async function handleSaveProfile() {
    if (!family) return;
    const parents = [...family.parents];
    const primaryIdx = parents.findIndex((p) => p.is_primary);
    if (primaryIdx >= 0) {
      parents[primaryIdx] = { ...parents[primaryIdx], name: editName, phone: editPhone };
    }
    await updateFamilyProfile(family.id, {
      parents,
      family_bio: editBio,
      address: editAddress,
    });
    refreshFamily();
    setEditOpen(false);
  }

  async function handleFamilyPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!family || !e.target.files?.[0]) return;
    const compressed = await compressPhoto(e.target.files[0]);
    await updateFamilyProfile(family.id, { family_photo_url: compressed });
    refreshFamily();
  }

  function openAddChild() {
    setEditingChild(null);
    setChildName('');
    setChildDob('');
    setChildClassroom('');
    setChildAllergies('');
    setChildMedical('');
    setChildPhotoUrl('');
    setChildDialogOpen(true);
  }

  function openEditChild(child: FamilyChild) {
    setEditingChild(child);
    setChildName(child.name);
    setChildDob(child.date_of_birth);
    setChildClassroom(child.classroom || '');
    setChildAllergies(child.allergies.join(', '));
    setChildMedical(child.medical_notes || '');
    setChildPhotoUrl(child.photo_url || '');
    setChildDialogOpen(true);
  }

  async function handleSaveChild() {
    if (!family) return;
    const allergies = childAllergies.split(',').map((a) => a.trim()).filter(Boolean);

    if (editingChild) {
      await updateChild(family.id, editingChild.id, {
        name: childName,
        date_of_birth: childDob,
        classroom: childClassroom || undefined,
        allergies,
        medical_notes: childMedical || undefined,
        photo_url: childPhotoUrl || undefined,
      });
    } else {
      await addChild(family.id, {
        name: childName,
        date_of_birth: childDob,
        classroom: childClassroom || undefined,
        allergies,
        medical_notes: childMedical || undefined,
        emergency_contacts: [],
        photo_url: childPhotoUrl || undefined,
      });
    }
    refreshFamily();
    setChildDialogOpen(false);
  }

  async function handleRemoveChild(childId: string) {
    if (!family) return;
    await removeChild(family.id, childId);
    refreshFamily();
  }

  async function handleChildPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const compressed = await compressPhoto(e.target.files[0]);
    setChildPhotoUrl(compressed);
  }

  if (!family) return null;

  const primaryParent = family.parents.find((p) => p.is_primary) || family.parents[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {primaryParent?.name.split(' ')[0] || 'Parent'}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your family.</p>
      </div>

      {/* Family Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Family Photo */}
            <div
              className="relative w-20 h-20 rounded-full bg-christina-blue/10 flex items-center justify-center cursor-pointer group flex-shrink-0"
              onClick={() => familyPhotoRef.current?.click()}
            >
              {family.family_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={family.family_photo_url}
                  alt="Family"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <Heart className="h-8 w-8 text-christina-blue" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <input
                ref={familyPhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFamilyPhoto}
              />
            </div>

            {/* Family Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">
                    {family.parents.map((p) => p.name).join(' & ')}
                  </h2>
                  {family.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {family.address}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={openEditProfile}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              {family.family_bio && (
                <p className="text-sm text-muted-foreground mt-2">{family.family_bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="h-5 w-5" /> My Children
          </h2>
          <Button size="sm" variant="outline" onClick={openAddChild}>
            <Plus className="h-4 w-4 mr-1" /> Add Child
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {family.children.map((child) => (
            <Card key={child.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-christina-blue/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {child.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={child.photo_url} alt={child.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <span className="font-heading font-bold text-christina-blue text-lg">
                        {child.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {child.classroom || 'Not assigned'} · {calculateAge(child.date_of_birth)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditChild(child)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    {child.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {child.allergies.map((a) => (
                          <Badge key={a} variant="destructive" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {child.medical_notes && (
                      <p className="text-xs text-muted-foreground mt-1">{child.medical_notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {family.children.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No children added yet.</p>
                <Button variant="link" onClick={openAddChild}>Add your first child</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/children', label: 'My Children', icon: Users, color: 'bg-christina-red' },
          { href: '/dashboard/progress', label: 'Progress', icon: FileText, color: 'bg-christina-blue' },
          { href: '/dashboard/photos', label: 'Photos', icon: Camera, color: 'bg-christina-coral' },
          { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, color: 'bg-christina-yellow' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mx-auto mb-2`}>
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium">{link.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${update.type === 'report' ? 'bg-christina-red' : update.type === 'photo' ? 'bg-christina-blue' : update.type === 'event' ? 'bg-christina-coral' : 'bg-christina-yellow'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{update.title}</p>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{update.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Family Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Your Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Family Bio</Label>
              <Textarea id="edit-bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="bg-christina-blue hover:bg-christina-blue/90" onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Child Dialog */}
      <Dialog open={childDialogOpen} onOpenChange={setChildDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChild ? 'Edit Child' : 'Add Child'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Child Photo */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-christina-blue/10 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => childPhotoRef.current?.click()}
              >
                {childPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={childPhotoUrl} alt="Child" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Photo</p>
                <p className="text-xs text-muted-foreground">Click to upload</p>
              </div>
              <input
                ref={childPhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChildPhoto}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-name">Name</Label>
              <Input id="child-name" value={childName} onChange={(e) => setChildName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-dob">Date of Birth</Label>
              <Input id="child-dob" type="date" value={childDob} onChange={(e) => setChildDob(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-classroom">Classroom</Label>
              <Input id="child-classroom" value={childClassroom} onChange={(e) => setChildClassroom(e.target.value)} placeholder="e.g., Bright Butterflies" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-allergies">Allergies (comma-separated)</Label>
              <Input id="child-allergies" value={childAllergies} onChange={(e) => setChildAllergies(e.target.value)} placeholder="e.g., Peanuts, Dairy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-medical">Medical Notes</Label>
              <Textarea id="child-medical" value={childMedical} onChange={(e) => setChildMedical(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-between">
              <div>
                {editingChild && (
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleRemoveChild(editingChild.id);
                      setChildDialogOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setChildDialogOpen(false)}>Cancel</Button>
                <Button
                  className="bg-christina-blue hover:bg-christina-blue/90"
                  onClick={handleSaveChild}
                  disabled={!childName || !childDob}
                >
                  {editingChild ? 'Save Changes' : 'Add Child'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
