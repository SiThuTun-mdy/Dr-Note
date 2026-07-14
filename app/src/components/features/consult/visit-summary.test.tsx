import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisitSummary } from "./visit-summary";
import type { VisitSummaryData } from "@/types/visit-summary";

// Mock window.print
Object.defineProperty(window, "print", {
  value: vi.fn(),
  writable: true,
});

const createMockData = (overrides?: Partial<VisitSummaryData>): VisitSummaryData => ({
  id: "visit-123",
  patient_id: "patient-1",
  doctor_id: "doctor-1",
  status: "completed",
  chief_complaint: "Headache for 3 days",
  diagnosis_note: "Tension-type headache suspected",
  visit_date: "2026-07-14",
  visit_type: "follow_up",
  created_at: "2026-07-14T10:00:00Z",
  patient: { name: "John Doe", email: "john@example.com" },
  doctor: { name: "Dr. Smith", email: "smith@example.com" },
  screening: {
    height_cm: 175,
    weight_kg: 70,
    bmi: 22.9,
    bp_systolic: 120,
    bp_diastolic: 80,
    heart_rate: 72,
    temperature_c: 36.5,
    oxygen_saturation: 98,
  },
  diagnoses: [
    {
      id: "vd-1",
      diagnosis_type: "primary",
      notes: null,
      diagnosis: { id: "d-1", code: "G43", title: "Migraine" },
    },
    {
      id: "vd-2",
      diagnosis_type: "secondary",
      notes: null,
      diagnosis: { id: "d-2", code: "R51", title: "Headache" },
    },
    {
      id: "vd-3",
      diagnosis_type: "suspected",
      notes: "Needs further investigation",
      diagnosis: { id: "d-3", code: "G44", title: "Other headache syndromes" },
    },
  ],
  prescriptions: [
    {
      id: "rx-1",
      instruction: "Take after meals with water",
      created_at: "2026-07-14T10:30:00Z",
      diagnosis: { code: "G43", title: "Migraine" },
      items: [
        {
          id: "item-1",
          medicine_name: "Ibuprofen",
          dosage: "400mg",
          frequency: "Twice daily",
          duration: "5 days",
          route: "Oral",
          quantity: 10,
        },
        {
          id: "item-2",
          medicine_name: "Paracetamol",
          dosage: "500mg",
          frequency: "As needed",
          duration: "7 days",
          route: "Oral",
          quantity: 14,
        },
      ],
    },
  ],
  ...overrides,
});

describe("VisitSummary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Patient Header", () => {
    it("should display patient name", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display visit date", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("July 14, 2026")).toBeInTheDocument();
    });

    it("should display visit type", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("follow_up")).toBeInTheDocument();
    });

    it("should display status with underscores replaced by spaces", () => {
      const data = createMockData({ status: "in_progress" });
      render(<VisitSummary data={data} />);

      expect(screen.getByText("in progress")).toBeInTheDocument();
    });

    it("should display chief complaint", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Headache for 3 days")).toBeInTheDocument();
    });

    it("should display Unknown patient when patient is null", () => {
      const data = createMockData({ patient: null });
      render(<VisitSummary data={data} />);

      expect(screen.getByText(/Unknown patient/)).toBeInTheDocument();
    });
  });

  describe("Screening Vitals", () => {
    it("should display all vital signs when screening data exists", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("175")).toBeInTheDocument();
      expect(screen.getByText("cm")).toBeInTheDocument();
      expect(screen.getByText("70")).toBeInTheDocument();
      expect(screen.getByText("kg")).toBeInTheDocument();
      expect(screen.getByText("22.9")).toBeInTheDocument();
      expect(screen.getByText("120/80")).toBeInTheDocument();
      expect(screen.getByText("mmHg")).toBeInTheDocument();
      expect(screen.getByText("72")).toBeInTheDocument();
      expect(screen.getByText("bpm")).toBeInTheDocument();
      expect(screen.getByText("36.5")).toBeInTheDocument();
      expect(screen.getByText("°C")).toBeInTheDocument();
      expect(screen.getByText("98")).toBeInTheDocument();
      expect(screen.getByText("%")).toBeInTheDocument();
    });

    it("should not display screening section when screening is null", () => {
      const data = createMockData({ screening: null });
      render(<VisitSummary data={data} />);

      expect(screen.queryByText("Screening vitals")).not.toBeInTheDocument();
    });

    it("should display Not recorded for null vital values", () => {
      const data = createMockData({
        screening: {
          height_cm: null,
          weight_kg: null,
          bmi: null,
          bp_systolic: null,
          bp_diastolic: null,
          heart_rate: null,
          temperature_c: null,
          oxygen_saturation: null,
        },
      });
      render(<VisitSummary data={data} />);

      const notRecordedElements = screen.getAllByText("Not recorded");
      expect(notRecordedElements.length).toBe(7);
    });

    it("should handle partial vital data (e.g., BP without diastolic)", () => {
      const data = createMockData({
        screening: {
          height_cm: 175,
          weight_kg: 70,
          bmi: 22.9,
          bp_systolic: 120,
          bp_diastolic: null,
          heart_rate: 72,
          temperature_c: 36.5,
          oxygen_saturation: 98,
        },
      });
      render(<VisitSummary data={data} />);

      // When diastolic is null, BP should show "Not recorded"
      expect(screen.getByText("Not recorded")).toBeInTheDocument();
    });
  });

  describe("Diagnostic Note", () => {
    it("should display diagnostic note when present", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Tension-type headache suspected")).toBeInTheDocument();
    });

    it("should not display diagnostic note section when null", () => {
      const data = createMockData({ diagnosis_note: null });
      render(<VisitSummary data={data} />);

      expect(screen.queryByText("Diagnostic note")).not.toBeInTheDocument();
    });
  });

  describe("Diagnoses", () => {
    it("should display diagnoses with correct type badges", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("primary")).toBeInTheDocument();
      expect(screen.getByText("secondary")).toBeInTheDocument();
      expect(screen.getByText("suspected")).toBeInTheDocument();
    });

    it("should display diagnosis codes and titles", () => {
      const data = createMockData();
      const { container } = render(<VisitSummary data={data} />);

      // Check that diagnosis codes and titles are rendered
      const diagnosesSection = container.querySelector("section:nth-of-type(4)");
      expect(diagnosesSection).toBeInTheDocument();
      expect(diagnosesSection?.textContent).toContain("G43");
      expect(diagnosesSection?.textContent).toContain("Migraine");
      expect(diagnosesSection?.textContent).toContain("R51");
      expect(diagnosesSection?.textContent).toContain("Headache");
    });

    it("should not display diagnoses section when empty", () => {
      const data = createMockData({ diagnoses: [] });
      render(<VisitSummary data={data} />);

      expect(screen.queryByText("Diagnoses")).not.toBeInTheDocument();
    });

    it("should apply correct badge colors for each diagnosis type", () => {
      const data = createMockData();
      const { container } = render(<VisitSummary data={data} />);

      const primaryBadge = container.querySelector(".bg-blue-100");
      expect(primaryBadge).toBeInTheDocument();

      const secondaryBadge = container.querySelector(".bg-gray-100");
      expect(secondaryBadge).toBeInTheDocument();

      const suspectedBadge = container.querySelector(".bg-amber-100");
      expect(suspectedBadge).toBeInTheDocument();
    });
  });

  describe("Prescription", () => {
    it("should display prescription instruction", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Take after meals with water")).toBeInTheDocument();
    });

    it("should display prescription items table", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Ibuprofen")).toBeInTheDocument();
      expect(screen.getByText("400mg")).toBeInTheDocument();
      expect(screen.getByText("Twice daily")).toBeInTheDocument();
      expect(screen.getByText("5 days")).toBeInTheDocument();
      expect(screen.getByText("Paracetamol")).toBeInTheDocument();
      expect(screen.getByText("500mg")).toBeInTheDocument();
      expect(screen.getByText("As needed")).toBeInTheDocument();
    });

    it("should display empty prescription message when no prescriptions", () => {
      const data = createMockData({ prescriptions: [] });
      render(<VisitSummary data={data} />);

      expect(screen.getByText("No prescription recorded for this visit.")).toBeInTheDocument();
    });

    it("should display dash for null optional fields", () => {
      const data = createMockData({
        prescriptions: [
          {
            id: "rx-2",
            instruction: null,
            created_at: "2026-07-14T10:30:00Z",
            diagnosis: null,
            items: [
              {
                id: "item-3",
                medicine_name: "Aspirin",
                dosage: null,
                frequency: null,
                duration: null,
                route: null,
                quantity: null,
              },
            ],
          },
        ],
      });
      render(<VisitSummary data={data} />);

      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Print Button", () => {
    it("should display print button", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Print summary")).toBeInTheDocument();
    });

    it("should call window.print when print button is clicked", () => {
      const data = createMockData();
      render(<VisitSummary data={data} />);

      const printButton = screen.getByText("Print summary");
      printButton.click();

      expect(window.print).toHaveBeenCalled();
    });
  });

  describe("Print Styles", () => {
    it("should include print CSS styles", () => {
      const data = createMockData();
      const { container } = render(<VisitSummary data={data} />);

      const styleElement = container.querySelector("style");
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain("@media print");
      expect(styleElement?.textContent).toContain(".print-only");
      expect(styleElement?.textContent).toContain(".no-print");
    });

    it("should have print-only class on clinic header", () => {
      const data = createMockData();
      const { container } = render(<VisitSummary data={data} />);

      const printOnlyHeader = container.querySelector(".print-only.text-center");
      expect(printOnlyHeader).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should render with minimal data (only required fields)", () => {
      const data = createMockData({
        patient: null,
        doctor: null,
        screening: null,
        diagnosis_note: null,
        diagnoses: [],
        prescriptions: [],
        visit_date: null,
      });
      render(<VisitSummary data={data} />);

      expect(screen.getByText(/Unknown patient/)).toBeInTheDocument();
      expect(screen.getByText("No prescription recorded for this visit.")).toBeInTheDocument();
    });

    it("should handle visit_date fallback to created_at", () => {
      const data = createMockData({ visit_date: null });
      render(<VisitSummary data={data} />);

      // Should use created_at formatted date
      expect(screen.getByText("July 14, 2026")).toBeInTheDocument();
    });

    it("should handle prescription with no items", () => {
      const data = createMockData({
        prescriptions: [
          {
            id: "rx-empty",
            instruction: "Follow up in 2 weeks",
            created_at: "2026-07-14T10:30:00Z",
            diagnosis: null,
            items: [],
          },
        ],
      });
      render(<VisitSummary data={data} />);

      expect(screen.getByText("Follow up in 2 weeks")).toBeInTheDocument();
      // No table should be rendered for empty items
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });
});
