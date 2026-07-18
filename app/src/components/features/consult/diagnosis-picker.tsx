"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { searchDiagnoses } from "@/app/(dashboard)/doctor/visits/[id]/actions";
import { toast } from "sonner";

interface Diagnosis {
  id: string;
  code: string;
  title: string;
}

interface DiagnosisPickerProps {
  onAdd: (diagnosis: Diagnosis, type: string) => void;
  disabled?: boolean;
}

export function DiagnosisPicker({ onAdd, disabled }: DiagnosisPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("primary");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchDiagnoses(value);
        setResults(data);
        setShowResults(true);
      } catch {
        toast.error("Failed to search diagnoses");
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (diagnosis: Diagnosis) => {
    onAdd(diagnosis, selectedType);
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search by code or title..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
        <Select value={selectedType} onValueChange={(value) => value && setSelectedType(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="suspected">Suspected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-auto shadow-lg">
          <CardContent className="p-0">
            {results.map((diagnosis) => (
              <button
                key={diagnosis.id}
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-muted transition-colors"
                onClick={() => handleSelect(diagnosis)}
              >
                <div>
                  <span className="font-mono text-sm font-medium">
                    {diagnosis.code}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {diagnosis.title}
                  </span>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <Card className="absolute z-50 mt-1 w-full shadow-lg">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            No diagnoses found for &quot;{query}&quot;
          </CardContent>
        </Card>
      )}
    </div>
  );
}
