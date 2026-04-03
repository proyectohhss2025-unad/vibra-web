import { fileUpload } from '@/api/file';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { UploadIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';

interface FileUploadProps {
  setMessage: (value: string) => void;
  activityId?: string;
  crossingWithActivityLoadId?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  setMessage,
  activityId = '',
  crossingWithActivityLoadId = '',
  className = 'bg-white rounded-lg border border-dashed border-gray-900/25'
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {

    if (!file) {
      setMessage('Por favor seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('activityId', activityId);
    formData.append('crossingWithActivityLoadId', crossingWithActivityLoadId);

    const inFolder: boolean = false;
    try {
      const response = await fileUpload(formData, inFolder);
      if (response) {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage('Error cargando el archivo');
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      <div className="space-y-1 w-full">
        <div className={`${className} mt-1 px-2 py-2`}>
          <div className=" flex justify-center text-center">
            <div className="mt-1 flex text-sm text-gray-600">
              <label
                htmlFor="sourceFile"
                className="bg-white p-2 relative cursor-pointer rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 hover:text-blue-700"
              >
                <span>
                  <UploadIcon style={{ 'float': 'left' }} name="uploadIcon" className="h-6 w-8 text-white-500" color="green" />
                  {getSafeKeyFromStorage('Select a file')}</span>
                <input
                  id="sourceFile"
                  name="sourceFile"
                  type="file"
                  className="sr-only"
                  accept=".csv, .xlsx, .xls, .pdf, .jpg, .png, .jpeg"
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 ml-3 rounded-lg hover:bg-blue-700"
              >
                {getSafeKeyFromStorage('Upload')}!
              </button>
            </div>
          </div>
          {file?.name && <div className='p-1 mt-2 font-semibold justify-center'>
            <div className={`${file?.name ? 'bg-green-500 hover:bg-green-500 font-semibold shadow-sm ' : ''} items-center rounded-md px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white`}>
              {file?.name}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
