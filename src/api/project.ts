import ProjectsService, { ProjectBeneficiariesService } from '@services/projects';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  IProjectApiFilters,
  IProjectBeneficiariesHookReturn,
  IProjectBeneficiariesItem,
  IProjectDetailsHookReturn,
  ProjectsListHookReturn,
} from 'src/types/project';

export function useProjects(params?: IProjectApiFilters): ProjectsListHookReturn {
  const { data, isLoading, error } = useQuery(['projects', params], async () => {
    const res = await ProjectsService.list(params);
    return res;
  });

  const projects = useMemo(() => data?.data?.rows || [], [data?.data?.rows]);
  const meta = useMemo(() => data?.data?.meta || {}, [data?.data?.meta]);

  return {
    // TEMP for stage
    // projects: ProjectList,
    projects,
    loading: isLoading,
    error,
    meta,
  };
}

export function useProject(address: string): IProjectDetailsHookReturn {
  const { data, isLoading, error } = useQuery(['project', address], async () => {
    const res = await ProjectsService.details(address);
    return res;
  });

  const project = useMemo(() => data?.data || {}, [data?.data]);

  return {
    project,
    loading: isLoading,
    error,
  };
}

export function useProjectBeneficiaries(address: string): IProjectBeneficiariesHookReturn {
  const { data, isLoading, error } = useQuery(['projectbenificiaries', address], async () => {
    const res = await ProjectBeneficiariesService.list(address);
    return res;
  });

  const beneficiaries = useMemo(() => data?.data?.rows.map((b:IProjectBeneficiariesItem)=>({...b,isApproved:b.isApproved? 'Approved' : 'Not Approved'})) || [], [data?.data?.rows]);
  const meta = useMemo(() => data?.data?.meta || {}, [data?.data?.meta]);

  return {
    beneficiaries,
    loading: isLoading,
    error,
    meta
  };
}
