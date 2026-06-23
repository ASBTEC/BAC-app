import React from 'react';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { EventCategory } from '@/types';
import { FilterDropdown } from './FilterDropdown';

type FilterCategory = EventCategory | 'all';

interface CategoryDropdownProps {
  value: FilterCategory;
  options: { key: FilterCategory; label: string }[];
  onChange: (key: FilterCategory) => void;
}

export function CategoryDropdown({ value, options, onChange }: CategoryDropdownProps) {
  return (
    <FilterDropdown
      value={value}
      options={options}
      onChange={onChange as (key: string) => void}
      allLabel="Todas las categorías"
      renderIcon={(key, color, size) => {
        const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
        return Icon ? <Icon width={size} height={size} color={color} /> : null;
      }}
    />
  );
}
