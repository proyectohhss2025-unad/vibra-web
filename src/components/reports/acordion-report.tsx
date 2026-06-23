import { MinusIcon } from '@heroicons/react/outline';
import { ArrowRightIcon, CheckIcon, DocumentReportIcon } from '@heroicons/react/solid';
import React, { useState } from 'react';
import SearchReports from '../search/search-reports';

interface ReportItem {
    _id: string;
    name: string;
    href: string;
    label: string;
    color: string;
    description: string;
    icon: string;
    detailsIncluded: string;
    type: string;
    isActive: boolean;
}

interface ReportItemProps {
    reportItems: ReportItem[],
    handleClickItem: (item: any) => void,
    isCollapsed: boolean
}

const AccordionReport: React.FC<ReportItemProps> = ({ reportItems, handleClickItem, isCollapsed }) => {
    const [activeType, setActiveType] = useState('');
    const [report, setReport] = useState<any[]>([]);
    const [valReport, setValReport] = useState('');
    const [showModal, setShowModal] = useState(false);

    const toggleType = (type: string) => {
        setActiveType(activeType === type ? '' : type);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="w-full max-w-md">
            <div className="mt-0 gap-x-0 px-0 mx-2 items-center" >
                <SearchReports isOpen={showModal} onClose={handleCloseModal} setReport={setReport} disabled={false} val={valReport} >
                    <div className="relative left-6 mt-1">
                    </div>
                </SearchReports>
            </div>
            {<ul className="bg-transparent rounded-b-lg p-1 px-4 overflow-hidden transition-all duration-300 ease-in-out text-sm">
                {report.map((item, index) => (
                    <li
                        onClick={() => {
                            handleClickItem(item);
                        }}
                        key={index+1}
                        className={`${item.isActive ? ' hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-200'} px-3 cursor-pointer flex items-center justify-between p-1 mx-3 rounded-md`}
                    >
                        <div className="flex items-center">
                            {!item.isActive && !isCollapsed && <ArrowRightIcon className="h-4 w-4 text-gray-500 mr-3" />}
                            {item.isActive && !isCollapsed && <CheckIcon className="h-4 w-4 text-gray-500 mr-3" />}
                            <span>{item.name}</span>
                        </div>
                        <a href={item.href} className="text-gray-600">
                            {!item.isActive && !isCollapsed && <MinusIcon className="h-6 w-6 text-gray-500" />}
                            {item.isActive && !isCollapsed && <DocumentReportIcon className="h-6 w-6 text-green-700" />}
                        </a>
                    </li>
                ))}
            </ul>}
            {Object.keys(
                reportItems?.reduce((acc, item) => {
                    acc[item.type] = true;
                    return acc;
                }, {})
            ).map((type, index) => (
                <div key={index+1} className="mt-1 py-1 border-b-2 text-sm">
                    <div
                        className="flex items-center justify-between p-1 mr-3 ml-3 bg-transparent rounded-lg cursor-pointer"
                        onClick={() => toggleType(type)}
                    >
                        <h3 className="text-md font-medium text-gray-900">
                            {'Reportes'}
                        </h3>
                        <svg
                            className={`transform ${activeType === type ? 'rotate-180' : ''
                                } transition duration-200 ease-in-out h-5 w-5`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    {activeType === type && (
                        <ul className="bg-transparent rounded-b-lg p-1 px-4 overflow-hidden transition-all duration-300 ease-in-out text-sm">
                            {reportItems
                                .filter((item) => item.type === type)
                                .map((item, index) => (
                                    item?.isActive && <li
                                        onClick={() => {
                                            handleClickItem(item);
                                        }}
                                        key={index+1}
                                        data-tooltip-id="my-tooltip-l"
                                        data-tooltip-content={item.description}
                                        className={`${item.isActive ? ' hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-200'} px-3 cursor-pointer flex items-center justify-between p-1 mx-3 rounded-md ${isCollapsed ? 'ml-0' : ''}`}
                                    >
                                        <div className="flex items-center ml-1">
                                            {!item.isActive && !isCollapsed && <ArrowRightIcon className="h-4 w-4 text-gray-500 mr-3" />}
                                            {item.isActive && !isCollapsed && <CheckIcon className="h-4 w-4 text-gray-500 mr-3" />}
                                            <span>{item.name}</span>
                                        </div>
                                        <a href={item.href} className="text-gray-600">
                                            {!item.isActive && !isCollapsed && <MinusIcon className="h-6 w-6 text-gray-500" />}
                                            {item.isActive && !isCollapsed && <DocumentReportIcon className="h-6 w-6 text-green-700" />}
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AccordionReport;