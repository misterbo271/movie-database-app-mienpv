import moviesStore from './MoviesStore';

// Export all stores from a central point
export {
  moviesStore
};

// Root store that can be expanded in the future
const stores = {
  moviesStore
};

export default stores; 