---
name: ui-ux-pro-max
description: Professional UI/UX design patterns for medical/clinic applications. Covers layout, typography, color, spacing, accessibility, and responsive design using Tailwind + shadcn/ui.
metadata:
  author: dr-note-team
  version: "1.0.0"
---

# UI/UX Pro Max — Medical Application Design System

Professional design guidelines for building polished, accessible medical/clinic interfaces using Tailwind CSS + shadcn/ui.

## When to Apply

Reference this skill when:
- Building new UI components or pages
- Designing forms (patient registration, prescriptions, diagnosis)
- Creating data tables (patient lists, visit history)
- Implementing navigation (sidebar, topbar, breadcrumbs)
- Working on responsive layouts
- Improving accessibility

---

## 1. Design Principles

### Visual Hierarchy
- **Primary actions** (Save, Submit): Use `Button` with `default` variant
- **Secondary actions** (Cancel, Close): Use `Button` with `outline` or `ghost` variant
- **Destructive actions** (Delete): Use `Button` with `destructive` variant + confirmation dialog

### Spacing System
```
4px  — xs (tight padding, icon gaps)
8px  — sm (inline elements, small gaps)
12px — md (card padding, form gaps)
16px — lg (section padding, table cells)
24px — xl (section separators)
32px — 2xl (page sections)
```

### Typography Scale
```
text-xs    — 12px — Labels, captions, timestamps
text-sm    — 14px — Body text, table data
text-base  — 16px — Default body, form inputs
text-lg    — 18px — Section titles
text-xl    — 20px — Card titles
text-2xl   — 24px — Page headings
text-3xl   — 30px — Hero/landing headings
```

---

## 2. Component Patterns

### Data Tables (List Pages)
```tsx
// Pattern for paginated list pages
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Page Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="emr-table-header">
            <th className="text-left px-4 py-3" scope="col">Column</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm">{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Pagination ... />
  </CardContent>
</Card>
```

### Forms (Input Patterns)
```tsx
// Standard form layout
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input placeholder="Placeholder" {...field} />
          </FormControl>
          <FormDescription>Optional help text</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Status Badges
```tsx
// Use StatusBadge component for consistent status display
<StatusBadge status="waiting" />     // Yellow
<StatusBadge status="screening" />   // Blue
<StatusBadge status="with_doctor" /> // Green
<StatusBadge status="completed" />   // Gray
```

### Empty States
```tsx
// When no data is available
<div className="text-center py-12">
  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
  <p className="text-sm text-muted-foreground mb-4">
    Get started by creating your first item.
  </p>
  <Button asChild>
    <Link href="/new">Create Item</Link>
  </Button>
</div>
```

---

## 3. Medical Application Patterns

### Patient Cards
```tsx
// Consistent patient info display
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm font-medium text-foreground">{patient.name}</p>
    <p className="text-xs text-muted-foreground">{patient.email}</p>
  </div>
</div>
```

### Visit Timeline
```tsx
// Chronological event display
<div className="space-y-4">
  {events.map((event) => (
    <div key={event.id} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-primary" />
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 pb-4">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">{event.time}</p>
      </div>
    </div>
  ))}
</div>
```

### Medical Forms (Multi-Section)
```tsx
// Sectioned form for complex medical data
<div className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Patient Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form fields */}
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Clinical Notes</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form fields */}
    </CardContent>
  </Card>
</div>
```

---

## 4. Layout Patterns

### Page Layout
```tsx
// Standard page structure
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
    <Button>Action</Button>
  </div>
  
  {/* Content */}
  <Card>...</Card>
</div>
```

### Sidebar Navigation
```tsx
// Role-aware navigation items
const navigation = {
  doctor: [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'My Queue', href: '/my-queue', icon: Users },
    { name: 'Consultations', href: '/consultations', icon: ClipboardList },
  ],
  nurse: [
    { name: 'Dashboard', href: '/nurse', icon: LayoutDashboard },
    { name: 'Screening', href: '/screening', icon: Activity },
  ],
  // ...
}
```

---

## 5. Accessibility Requirements

### Mandatory
- All interactive elements must have `aria-label` or visible text
- Form inputs must have associated `<label>` elements
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators visible on all interactive elements
- Tables must use `<th scope="col">` or `<th scope="row">`

### Focus Management
```tsx
// Trap focus in modals/dialogs
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Focus automatically trapped */}
    <Button>First</Button>
    <Button>Second</Button>
  </DialogContent>
</Dialog>
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| `sm` | ≥640px | Mobile landscape |
| `md` | ≥768px | Tablet |
| `lg` | ≥1024px | Desktop |
| `xl` | ≥1280px | Large desktop |

### Responsive Table Pattern
```tsx
// Hide table on mobile, show cards instead
<div className="hidden md:block overflow-x-auto">
  <table>...</table>
</div>
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## 7. Color Usage

### Status Colors
| Status | Color | Tailwind |
|--------|-------|----------|
| Waiting | Yellow | `bg-yellow-100 text-yellow-800` |
| Screening | Blue | `bg-blue-100 text-blue-800` |
| With Doctor | Green | `bg-green-100 text-green-800` |
| Completed | Gray | `bg-gray-100 text-gray-800` |
| Error/Danger | Red | `bg-red-100 text-red-800` |

### Semantic Colors
- **Destructive actions**: `text-destructive`, `bg-destructive`
- **Success states**: `text-green-600`, `bg-green-50`
- **Warning states**: `text-yellow-600`, `bg-yellow-50`
- **Info**: `text-blue-600`, `bg-blue-50`

---

## 8. Animation & Transitions

### Recommended Transitions
```tsx
// Smooth hover effects
className="hover:bg-muted/50 transition-colors"

// Fade in content
className="animate-in fade-in-0"

// Slide in from bottom
className="animate-in slide-in-from-bottom-4"
```

### Loading States
```tsx
// Skeleton placeholders
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

---

## Quick Reference

| Task | Pattern |
|------|---------|
| List page | Card > Table > Pagination |
| Form page | Card > Form > FormField |
| Detail page | Card > Grid layout |
| Empty state | Icon + Message + CTA |
| Status display | StatusBadge component |
| Patient info | Avatar + Name + Email |
| Navigation | Sidebar with role filtering |
