"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { PatientTimeline } from "./timeline"

interface PatientSearchResult {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export function HistoryPageContent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PatientSearchResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedPatient(null)

    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(trimmed)}`)
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResults(data.patients ?? [])
    } catch {
      setError("Unable to search patients. Please try again.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (selectedPatient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPatient(null)}
          >
            ← Back to search
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedPatient.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Visit timeline
            </p>
          </div>
        </div>
        <PatientTimeline patientId={selectedPatient.id} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">History</h1>
        <p className="text-muted-foreground">
          Search for a patient to view their visit timeline.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {searched && !loading && !error && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No patients found.</p>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-foreground">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.email ?? "No email"}
                      {patient.phone ? ` · ${patient.phone}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
