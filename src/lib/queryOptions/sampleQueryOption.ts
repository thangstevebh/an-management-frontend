import { queryOptions } from "@tanstack/react-query";

export const pokemonOptions = queryOptions({
  queryKey: ["pokemon"],
  queryFn: async () => {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 1000) + 1}`,
      {
        next: {
          revalidate: 60, // Revalidate every 60 seconds
        },
      },
    );

    return response.json();
  },
});
