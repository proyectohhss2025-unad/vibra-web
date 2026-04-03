import { ClipboardCheckIcon, DocumentDownloadIcon, PhotographIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';

import { config } from '@/config/config';
const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

interface FileListProps {
    message: string;
    activityId?: string;
    participantId?: string;
}

const FileList: React.FC<FileListProps> = ({ message, activityId, participantId }) => {
    const [files, setFiles] = useState<any[]>([]);

    return (
        <div className="mt-2">
            <ul className="space-y-1">
                {files?.map((file) => (
                    <li className='flex items-center' key={file._id}>
                        {file.fileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && <ClipboardCheckIcon name="Download File" className="h-6 w-8 text-green-500" />}
                        {file.fileType == 'text/csv' && <ClipboardCheckIcon name="Download File" className="h-6 w-8 text-green-500" />}
                        {file.fileType == 'application/pdf' && <DocumentDownloadIcon name="Download File" className="h-6 w-8 text-red-500" />}
                        {(file.fileType == 'image/jpeg' || file.fileType == 'image/png' || file.fileType == 'image/jpg') && <PhotographIcon name="Download File" className="h-6 w-8 text-blue-500" />}
                        <a
                            href={`${configAPI.baseURL}/api/gridfs/fileDownload/${file.filePath}/${file.fileName.split('.')[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            {file.fileName}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
