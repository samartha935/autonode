import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

type UseEntitySearchProps<
  T extends {
    search: string;
    page: number;
  },
> = {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
};


//This hook might be buggy because it tries to make both the search params and local search as the source of truth and in the case of when manual search param changes or external search param changes using setParams are made, it doesn't update properly. 
export function UseEntitySearch<T extends { search: string; page: number }>({
  params,
  setParams,
  debounceMs = 500,
}: UseEntitySearchProps<T>) {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({
        ...params,
        search: "",
        page: PAGINATION.DEFAULT_PAGE,
      });
      return;
    }

    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params, setParams, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
}
