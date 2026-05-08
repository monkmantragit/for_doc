'use server';

import { 
  getProcedureSurgeries, 
  getProcedureCategories, 
  searchProcedures, 
  getFeaturedProcedures,
  debugMedicalProcedures
} from '@/lib/directus';
import { ProcedureSurgery } from '@/types/procedure-surgery';

export interface ProcedureFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProcedureActionResponse {
  procedures: ProcedureSurgery[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}

export async function getProceduresWithFilters(
  filters: ProcedureFilters = {}
): Promise<ProcedureActionResponse> {
  const { category, search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  try {
    // Fetch procedures and categories in parallel
    const [proceduresResponse, categories] = await Promise.all([
      getProcedureSurgeries(limit, offset, category, search),
      getProcedureCategories()
    ]);

    return {
      procedures: proceduresResponse.data,
      total: proceduresResponse.total,
      page: proceduresResponse.page,
      totalPages: proceduresResponse.totalPages,
      categories
    };
  } catch (error) {
    console.error('Error in getProceduresWithFilters:', error);
    return {
      procedures: [],
      total: 0,
      page: 1,
      totalPages: 0,
      categories: ['All']
    };
  }
}

export async function searchProceduresAction(
  searchTerm: string,
  limit = 10
): Promise<ProcedureSurgery[]> {
  try {
    return await searchProcedures(searchTerm, limit);
  } catch (error) {
    console.error('Error in searchProceduresAction:', error);
    return [];
  }
}

export async function getFeaturedProceduresAction(
  limit = 6
): Promise<ProcedureSurgery[]> {
  try {
    return await getFeaturedProcedures(limit);
  } catch (error) {
    console.error('Error in getFeaturedProceduresAction:', error);
    return [];
  }
}

export async function getCategoriesAction(): Promise<string[]> {
  try {
    return await getProcedureCategories();
  } catch (error) {
    console.error('Error in getCategoriesAction:', error);
    return ['All'];
  }
}

export async function getNavbarProceduresAction(): Promise<{
  categories: string[];
  procedures: ProcedureSurgery[];
}> {
  try {
    const [categories, response] = await Promise.all([
      getProcedureCategories(),
      getProcedureSurgeries(100, 0),
    ]);
    return { categories, procedures: response.data };
  } catch (error) {
    console.error('Error in getNavbarProceduresAction:', error);
    return { categories: ['All'], procedures: [] };
  }
} 