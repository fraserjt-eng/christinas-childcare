'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, ArrowLeft, Mail } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit">
            <ShieldX className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This area is restricted to authorized users only. If you believe this is
            an error, please contact your administrator.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full bg-christina-red hover:bg-christina-red/90"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@christinaschildcare.com"
                className="text-christina-red hover:underline inline-flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                support@christinaschildcare.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
