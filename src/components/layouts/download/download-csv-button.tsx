import { FileDownIcon } from "lucide-react";
import React from "react";

interface DownloadCSVButtonProps {
    fileName: string;
    label: string;
    labelTooltip?: string;
}

const DownloadCSVButton: React.FC<DownloadCSVButtonProps> = ({ fileName, label, labelTooltip = '' }) => {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = `/plantillas/${fileName}`;
        link.download = fileName;
        link.click();
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            data-tooltip-id="my-tooltip-t"
            data-tooltip-content={labelTooltip}
        >
            <FileDownIcon className="w-6 h-6 mr-2" />
            {label}
        </button>
    );
};

export default DownloadCSVButton;
