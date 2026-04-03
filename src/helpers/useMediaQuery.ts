import { useEffect, useState } from "react";

const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = () => setMatches(mediaQuery.matches);

        // Establecer el estado inicial
        setMatches(mediaQuery.matches);

        // Escuchar cambios en el tamaño
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [query]);

    return matches;
};

export default useMediaQuery;