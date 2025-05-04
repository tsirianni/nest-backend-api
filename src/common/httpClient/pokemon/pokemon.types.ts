export type ListShapesReturn = {
  count: number;
  next: null;
  previous: null;
  results: {
    name: string;
    url: string;
  }[];
};

export type GetShapeDetailsReturn = {
  awesome_names: {
    awesome_name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  id: number;
  name: string;
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  pokemon_species: {
    name: string;
    url: string;
  }[];
};
