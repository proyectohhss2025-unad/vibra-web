import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import '../test/test.css';

interface FormPageLayoutProps {
  title: string;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  isEditing,
  isSubmitting,
  onSubmit,
  onCancel,
  children,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
}) => {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/layout');
  }, [token, router]);

  return (
    <div className="test-container container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <form onSubmit={onSubmit}>
        {children}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPageLayout;
