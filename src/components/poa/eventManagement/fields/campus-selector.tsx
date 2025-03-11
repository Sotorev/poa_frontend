// src/components/poa/components/columns/campus-selector.tsx

import React, { useState, useContext, useRef, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventContext } from '../event.context';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CampusSelectorProps {
  onSelectCampus: (campusId: number) => void;
  selectedCampusId: number;
}

export function CampusSelector({ onSelectCampus, selectedCampusId }: CampusSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { campuses } = useContext(EventContext)

  const filteredCampuses = useMemo(() => {
    return campuses.filter(campus =>
      campus.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campuses, searchTerm]);

  return (
    <Select onValueChange={(value) => onSelectCampus(Number.parseInt(value))} value={selectedCampusId?.toString()}>
      <SelectTrigger className=" border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
        <SelectValue placeholder="Selecciona un campus" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar campus..."
            className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[200px]">
          {filteredCampuses.map((campus) => (
            <SelectItem
              key={campus.campusId}
            value={campus.campusId.toString()}
            className="text-primary hover:bg-primary/10 focus:bg-primary/10"
          >
            {campus.name}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
