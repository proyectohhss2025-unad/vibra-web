/**
 * TestDetailModal — modal para ver el detalle de las respuestas
 * de un test completado por el estudiante.
 */
'use client'

import { getTestByTestId } from "@/api/test"
import { X, FileText, CheckCircle, Clock, Award } from "lucide-react"
import { useEffect, useState } from "react"

interface TestDetailModalProps {
  pretest: any
  testName: string
  onClose: () => void
}

const TestDetailModal: React.FC<TestDetailModalProps> = ({ pretest, testName, onClose }) => {
  const [testDef, setTestDef] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pretest?.testId) {
      setLoading(false)
      return
    }
    getTestByTestId(pretest.testId)
      .then((data) => setTestDef(data))
      .catch(() => setTestDef(null))
      .finally(() => setLoading(false))
  }, [pretest?.testId])

  const fecha = pretest?.createdAt
    ? new Date(pretest.createdAt).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  // Mapa de respuestas por questionId
  const responseMap: Record<string, any> = {}
  pretest?.responses?.forEach((r: any) => {
    responseMap[r.questionId] = r
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {testName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Realizado el {fecha}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Score banner */}
        <div className="bg-blue-50 px-6 py-3 flex items-center gap-3 border-b">
          <Award className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">
            Puntaje total:{' '}
            <span className="text-blue-700 font-bold">{pretest?.totalScore ?? 0} pts</span>
          </span>
          <span className="text-xs text-muted-foreground">
            · {pretest?.responses?.length || 0} respuesta(s)
          </span>
        </div>

        {/* Body: questions */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Cargando preguntas...</p>
            </div>
          ) : !testDef?.questions || testDef.questions.length === 0 ? (
            // Sin definición de preguntas — mostrar respuestas raw
            pretest?.responses?.map((r: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                  Pregunta {r.questionId}
                </p>
                <p className="text-sm font-medium mb-2">{r.answer || '—'}</p>
                {r.points !== undefined && (
                  <div className="flex items-center gap-1 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-700 font-medium">{r.points} pts</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Preguntas con definición completa
            testDef.questions.map((q: any) => {
              const resp = responseMap[q.questionId]
              return (
                <div key={q._id || q.questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium flex-1">{q.text}</p>
                    <span className="text-[10px] uppercase text-gray-400 whitespace-nowrap px-1.5 py-0.5 rounded bg-gray-100">
                      {q.type === 'open' ? 'Abierta' : q.type === 'single' ? 'Única' : q.type === 'multiple' ? 'Múltiple' : q.type}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-1.5">
                    <p className="text-xs text-gray-400 mb-0.5">Tu respuesta:</p>
                    <p className="text-sm font-medium">
                      {Array.isArray(resp?.answer) ? resp.answer.join(', ') : (resp?.answer || '—')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {resp?.points !== undefined && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="font-medium text-green-700">{resp.points} / {q.points} pts</span>
                      </span>
                    )}
                    {q.required && (
                      <span className="text-gray-400">· Requerida</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestDetailModal
