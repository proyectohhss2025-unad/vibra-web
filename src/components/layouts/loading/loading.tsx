import React from 'react';
import './loading.css'

const Loading: React.FC = () => {
    return (
        <div style={{ 'width': '400px', 'margin': '0px auto' }} className='grid grid-cols-1 items-center'>
            {/*<svg className='w-8 h-8 inline-block border-4 border-gray-200 rounded-full animate-spin mr-10' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" stroke="green" strokeLinecap="round" />
            </svg>*/}
            <div className="loading-container">
                <p className='text-white px-2'> Cargando, espere por favor ...
                </p>
                <div className="loader"></div>
            </div>
        </div>
    );
};

export default Loading;