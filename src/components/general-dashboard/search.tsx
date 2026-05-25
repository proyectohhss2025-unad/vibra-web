import '@/components/search/search.css';
import { XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import DynamicHeroIcon from '../layouts/icon/icon-dinamic';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  setData: (data: any[]) => void;
  disabled: boolean;
  val: string;
  children: React.ReactNode;
}

const componentsTransactionsModule: { id: string, title: string; label: string; href: string; description: string; component: any; icon: string; }[] = [
  {
    id: "Emociones",
    title: "Emociones",
    label: "Panel de emociones",
    href: "#",
    description: "Clic para ir al panel general de emociones",
    component: <></>,
    icon: "",
  },
  {
    id: "Actividades",
    title: "Actividades",
    label: "Nueva actividad",
    href: "#",
    description: "Clic para ingresar una nueva actividad",
    component: <></>,
    icon: "",
  },
  {
    id: "Cursos",
    title: "Cursos",
    label: "Gestión de cursos",
    href: "#",
    description: "Clic para gestionar los cursos",
    component: <></>,
    icon: "",
  },
]

const SearchInAllPage: React.FC<SearchProps> = ({ isOpen, onClose, setData, disabled, val, children }) => {
  const [show, setShow] = useState(isOpen);
  const [query, setQuery] = useState('');
  const [disabled_, setDisabled_] = useState(disabled);

  useEffect(() => {
    if (val) {
      setQuery(val);
    }
  }, [val]);

  useEffect(() => {
    setShow(isOpen);
    if (disabled) {
      setQuery(val);
    }
  }, [isOpen, disabled, val]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const query = e.target.value.trim();

    if (query.length > 1) {

      const response = componentsTransactionsModule?.filter((item: any) => {
        const labelUpper = (item.label + "").toUpperCase();
        return labelUpper.includes(query.toUpperCase());
      });

      console.log('query: ', query);
      console.log('response: ', response);

      //const response = await searchByQuery(query);

      if (response && response.length > 0) {
        setData(response);
        //setQuery(response[0].id);
        //setDisabled_(true);
      } else {
        // setParticipant([]);
      }
    } else {
      //setParticipant([]);
    }
  };

  const handleSearchClean = async () => {
    onClose();
    setQuery('');
    setData([]);
  };

  return (
    <div className="w-full">
      <div className="mt-0 w-full">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md w-full bg-transparent">
          <span className="flex justify-start select-none items-center pl-3 pr-2 text-gray-500 sm:text-sm">Buscar: </span>
          <input
            type="text"
            name="query"
            id="query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e);
            }}
            disabled={disabled_}
            style={{ float: 'right', border: 'none' }}
            className="w-full py-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 my-1 mr-0 bg-transparent"
            placeholder="Funcionalidad."
            size={12}
          />
          {!disabled_ && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '60px' }}>
            {false && <DynamicHeroIcon icon="SearchIcon" handler={() => handleSearch} className="h-7 w-8 text-blue-500 mt-1 ml-2 mr-2" />}
            {query && <XCircleIcon onClick={handleSearchClean} name="clean" className="h-6 w-6 text-blue-500" color="#EAEAEA" />}
          </span>}
          {disabled_ && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '40px' }}>
          </span>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default SearchInAllPage;
