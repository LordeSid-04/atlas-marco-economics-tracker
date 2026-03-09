import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 0,
			staleTime: 15 * 1000,
			gcTime: 30 * 60 * 1000,
			refetchOnMount: false,
		},
	},
});
