'use client';

import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
  type Table as TableInstance,
  type Header,
  type Row,
  type Cell,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, MoreVertical, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  columns: {
    header: string;
    accessorKey: string;
    sortable?: boolean;
    hideOnMobile?: boolean;
    cell?: (row: TData) => React.ReactNode;
  }[];
  data: TData[];
  actions?: (row: TData) => { label: string; onClick: () => void }[];
  searchable?: boolean;
  sortable?: boolean;
  expandedContent?: (row: TData) => React.ReactNode;
  onToggleExpand?: (row: TData) => void;
  expandedRows?: Record<string, boolean>;
}

export function DataTable<TData extends object>({
  columns,
  data,
  actions,
  searchable = false,
  sortable = false,
  expandedContent,
  onToggleExpand,
  expandedRows = {},
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns: columns.map((col) => ({
      accessorKey: col.accessorKey,
      header: col.header,
      cell: col.cell
        ? (info: any) => col.cell!(info.row.original)
        : (info: any) => info.getValue(),
    })) as ColumnDef<TData>[],
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-white text-gray-900 border-gray-200"
            />
          </div>
        </div>
      )}

      <div className="w-full bg-white">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<TData, unknown>) => {
                  const column = columns[header.index];
                  const canSort = sortable && column.sortable;

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3.5 text-left text-sm font-semibold text-gray-900 sm:whitespace-nowrap',
                        'max-sm:px-2 max-sm:py-2 max-sm:text-xs',
                        canSort && 'cursor-pointer select-none',
                        column.hideOnMobile && 'hidden md:table-cell'
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {canSort && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                'h-3 w-3 max-sm:h-2 max-sm:w-2 transition-colors',
                                header.column.getIsSorted() === 'asc'
                                  ? 'text-[#8B5C9E]'
                                  : 'text-gray-400'
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                'h-3 w-3 max-sm:h-2 max-sm:w-2 transition-colors',
                                header.column.getIsSorted() === 'desc'
                                  ? 'text-[#8B5C9E]'
                                  : 'text-gray-400'
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                {actions && <th className="w-10 p-4" />}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No results found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row: Row<TData>) => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell: Cell<TData, unknown>, idx: number) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'whitespace-nowrap px-4 py-4 text-sm text-gray-900 max-sm:px-2 max-sm:py-3 max-sm:text-xs',
                          columns[idx]?.hideOnMobile && 'hidden md:table-cell'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    {actions && (
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm max-sm:px-1 max-sm:py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 max-sm:h-6 max-sm:w-6"
                            >
                              <MoreVertical className="h-4 w-4 max-sm:h-3 max-sm:w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {actions(row.original).map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={action.onClick}
                                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                  {expandedContent && expandedRows[row.id] && (
                    <tr>
                      <td
                        colSpan={columns.length + (actions ? 1 : 0)}
                        className="px-4 py-4 text-sm"
                      >
                        {expandedContent(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 