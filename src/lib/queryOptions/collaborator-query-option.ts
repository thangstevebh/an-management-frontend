export function getCollaboratorQueryOptions() {
  return {
    queryKey: ["collaborators"],
    queryFn: async () => {
      const response = await fetch("/api/collaborators");
      if (!response.ok) {
        throw new Error("Failed to fetch collaborators");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 1000,
  };
}
