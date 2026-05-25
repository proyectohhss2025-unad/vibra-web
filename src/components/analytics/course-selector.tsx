'use client'

import { useEffect, useState, useRef } from 'react'
import { getSimpleCourseList } from '@/api/course'

type CourseOption = {
  _id: string
  name: string
}

type Props = {
  value: string
  onChange: (courseId: string) => void
}

export default function CourseSelector({ value, onChange }: Props) {
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getSimpleCourseList().then(setCourses).catch(() => setCourses([]))
  }, [])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedName = value
    ? courses.find((c) => c._id === value)?.name ?? 'Curso seleccionado'
    : 'Todos los cursos'

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div ref={ref} className="relative w-64">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-1">
            <input
              type="text"
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-auto">
            <li
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                !value ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => {
                onChange('')
                setOpen(false)
                setSearch('')
              }}
            >
              Todos los cursos
            </li>
            {filtered.map((course) => (
              <li
                key={course._id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  value === course._id ? 'bg-gray-50 font-medium' : ''
                }`}
                onClick={() => {
                  onChange(course._id)
                  setOpen(false)
                  setSearch('')
                }}
              >
                {course.name}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
