
import React, { useState, useEffect, useRef } from 'react';
import { DeliveryData } from '../types';
import { SearchIcon, XIcon } from './Icons';

interface SearchBarProps {
  data: DeliveryData[];
  onSelect: (address: DeliveryData) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ data, onSelect, onClear }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<DeliveryData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = data.filter(item =>
        item['地址'].toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Show top 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: DeliveryData) => {
    setQuery(item['地址']);
    setShowSuggestions(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <label htmlFor="address-search" className="block text-sm font-medium text-text-secondary mb-2">
        Search for an address to pre-fill form
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="address-search"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g., Starhill, Quayside..."
          className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-600 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition"
        />
        {query && (
            <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
            <XIcon className="h-5 w-5" />
            </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 text-text-secondary hover:bg-brand-primary hover:text-white cursor-pointer"
            >
              {item['地址']}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
