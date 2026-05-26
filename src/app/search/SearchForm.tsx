'use client';

import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchFormProps {
  defaultValue?: string;
}

export default function SearchForm({ defaultValue = '' }: SearchFormProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="relative flex items-center"
    >
      <SearchIcon className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search procedures, conditions, surgeons…"
        aria-label="Search the site"
        autoComplete="off"
        minLength={2}
        className="w-full pl-11 pr-28 py-3 text-base rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-1.5 px-5 py-2 rounded-full bg-[#8B5C9E] text-white text-sm font-medium hover:bg-[#7a4f8a] transition-colors"
      >
        Search
      </button>
    </form>
  );
}
