'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardCheck } from 'lucide-react'

interface Row {
  familyId: string
  name: string
  email: string
  agreed: boolean
  version: string | null
  agreedAt: string | null
}

export default function AttestationsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/attestations')
      .then((r) => (r.ok ? r.json() : { rows: [], version: '' }))
      .then((d) => {
        setRows(d.rows || [])
        setVersion(d.version || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const agreed = rows.filter((r) => r.agreed).length
  const total = rows.length

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-8 w-8 text-christina-red" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kiosk Privacy-Notice Attestations</h1>
          <p className="text-muted-foreground">
            Which families have agreed to the current notice{version ? ` (${version})` : ''}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Loading...' : `${agreed} of ${total} families have agreed`}
          </CardTitle>
          <CardDescription>
            Families agree at the kiosk before they can check in. They are re-asked once a year and whenever the notice changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : total === 0 ? (
            <p className="text-muted-foreground">No families in this center yet.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4 font-semibold">Family</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 pr-4 font-semibold">Agreed on</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.familyId} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-muted-foreground text-xs">{r.email}</div>
                      </td>
                      <td className="py-2 pr-4">
                        {r.agreed ? (
                          <Badge className="bg-green-100 text-green-800">Agreed</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Not yet</Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {r.agreedAt ? new Date(r.agreedAt).toLocaleDateString() : 'Not yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
