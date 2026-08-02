import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchPeople } from '../api/identity.api';

export function usePeople() {
  return useQuery({ queryKey: queryKeys.people.list(), queryFn: fetchPeople });
}
