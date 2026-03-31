import { redirect } from 'next/navigation'

// The dashboard is served at /dashboard inside the (dashboard) route group,
// which applies the Sidebar + Header layout via (dashboard)/layout.tsx
export default function RootPage() {
  redirect('/dashboard')
}
