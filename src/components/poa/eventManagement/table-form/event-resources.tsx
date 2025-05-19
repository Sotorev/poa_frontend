// src/components/ResourceSelector.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Resource } from '@/types/Resource';
import { EventContext } from '@/components/poa/eventManagement/context.event';

interface ResourceWithFrontend extends Resource {
  id: number;
  number: number;
  color: string;
  isCustom?: boolean;
}

interface ResourceSelectorProps {
  selectedResources: { resourceId: number }[];
  onAppendResource: (resource: { resourceId: number }) => void;
  onRemoveResource: (resourceId: number) => void;
}

const predefinedColors: string[] = [
  "#1E3A8A", // Deep navy blue
  "#3C1053", // Dark purple
  "#065F46", // Forest green
  "#831843", // Burgundy
  "#713F12", // Chocolate brown
  "#1F2937", // Slate gray
  "#7C2D12", // Dark terracotta
  "#134E4A", // Dark teal
  "#4C1D95", // Deep indigo
  "#701A75", // Dark magenta
  "#064E3B", // Dark emerald green
  "#6B21A8", // Dark violet
  "#7E22CE", // Royal purple
  "#92400E", // Dark amber
  "#0F766E"  // Dark turquoise
];

export function ResourceSelector({ selectedResources, onAppendResource, onRemoveResource }: ResourceSelectorProps) {
  const [resourceList, setResourceList] = useState<ResourceWithFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { resources } = useContext(EventContext);

  const selectedResourceIds = useMemo(() => {
    return selectedResources.map((item) => item.resourceId);
  }, [selectedResources]);

  const getColor = (index: number): string => {
    return predefinedColors[index % predefinedColors.length];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mappedResources: ResourceWithFrontend[] = resources.map((res, index) => ({
          ...res,
          id: res.resourceId,
          number: index + 1,
          color: getColor(index),
        }));

        setResourceList(mappedResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchData();
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resourceList.filter((res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resourceList, searchTerm]);

  const handleSelectResource = (selectedIdString: string) => {
    const resourceId = Number(selectedIdString);
    if (selectedResourceIds.includes(resourceId)) {
      onRemoveResource(resourceId);
    } else {
      onAppendResource({ resourceId });
    }
  };

  const handleRemoveBadgeResource = (resourceIdString: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const resourceIdToRemove = Number(resourceIdString);
    onRemoveResource(resourceIdToRemove);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedResourceIds.map(id => {
          const resourceItem = resourceList.find(res => res.id === id);
          if (!resourceItem) return null;
          return (
            <TooltipProvider key={resourceItem.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: resourceItem.color, color: 'white' }}
                  >
                    <span className="flex items-center">
                      <span className="w-5 h-5 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: resourceItem.color }}>
                        {resourceItem.isCustom ? 'C' : resourceItem.number}
                      </span>
                      {resourceItem.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveBadgeResource(resourceItem.id.toString(), e)}
                      aria-label={`Remove ${resourceItem.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{resourceItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      <Select
        onValueChange={handleSelectResource}
        open={isOpen}
        onOpenChange={(openState) => {
          setIsOpen(openState);
          if (!openState) {
            setSearchTerm("");
          }
        }}
        value=""
      >
        <SelectTrigger className="w-[300px] border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
          <SelectValue placeholder="Selecciona un recurso" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar recurso..."
              className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredResources.map((resource) => {
                const isSelected = selectedResourceIds.includes(resource.id);

                return (
                  <SelectItem
                    key={resource.id}
                    value={resource.id.toString()}
                    className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                    style={{ borderBottom: 'none' }}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          handleSelectResource(resource.id.toString());
                        }}
                        className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                        style={{
                          borderColor: resource.color,
                          backgroundColor: isSelected ? resource.color : 'transparent',
                        }}
                      />
                      <div
                        className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: resource.color }}
                      >
                        {resource.isCustom ? 'C' : resource.number}
                      </div>
                      {resource.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
