import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { SkeletonFilas } from '../components/Skeleton'
import { Navbar } from './Navbar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<SkeletonFilas />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
