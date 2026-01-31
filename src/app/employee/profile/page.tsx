'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  getCurrentEmployee,
  updateEmployee,
  setCurrentEmployee,
} from '@/lib/employee-storage';
import { Employee, formatCurrency } from '@/types/employee';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  KeyRound,
  Save,
  AlertCircle,
} from 'lucide-react';

export default function EmployeeProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    const emp = getCurrentEmployee();
    setEmployee(emp);
    if (emp) {
      setPhone(emp.phone || '');
      setAddress(emp.address || '');
      setEmergencyName(emp.emergency_contact_name || '');
      setEmergencyPhone(emp.emergency_contact_phone || '');
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!employee) return;
    setSaving(true);
    setMessage(null);

    const updated = await updateEmployee(employee.id, {
      phone,
      address,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
    });

    if (updated) {
      setEmployee(updated);
      setCurrentEmployee(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }

    setSaving(false);
  };

  const handleChangePin = async () => {
    if (!employee) return;
    setMessage(null);

    if (currentPin !== employee.pin) {
      setMessage({ type: 'error', text: 'Current PIN is incorrect' });
      return;
    }

    if (newPin.length < 4) {
      setMessage({ type: 'error', text: 'New PIN must be at least 4 digits' });
      return;
    }

    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'New PINs do not match' });
      return;
    }

    setSaving(true);
    const updated = await updateEmployee(employee.id, { pin: newPin });

    if (updated) {
      setEmployee(updated);
      setCurrentEmployee(updated);
      setMessage({ type: 'success', text: 'PIN changed successfully!' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setMessage({ type: 'error', text: 'Failed to change PIN' });
    }

    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          My Profile
        </h1>
        <p className="text-muted-foreground">
          View and update your personal information
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {employee.first_name[0]}{employee.last_name[0]}
              </div>
              <div>
                <p className="text-xl font-bold">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-muted-foreground">{employee.job_title}</p>
                <Badge variant="outline" className="mt-1">
                  {employee.role}
                </Badge>
              </div>
            </div>

            <Separator />

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <Separator />
                <p className="text-sm font-medium">Emergency Contact</p>
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(555) 987-6543"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.address || 'Not provided'}</span>
                </div>
                <Separator />
                <p className="text-sm font-medium">Emergency Contact</p>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.emergency_contact_name || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.emergency_contact_phone || 'Not provided'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(employee.hire_date)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium text-lg">{formatCurrency(employee.hourly_rate)}/hr</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge
                  className={
                    employee.employment_status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : employee.employment_status === 'on_leave'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {employee.employment_status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employee.certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certifications on file</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {employee.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change PIN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Change PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN (4-6 digits)"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm new PIN"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleChangePin}
                disabled={saving || !currentPin || !newPin || !confirmPin}
                className="w-full"
              >
                {saving ? 'Changing...' : 'Change PIN'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
