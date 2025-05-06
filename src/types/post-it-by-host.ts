import { PostItData } from './post-it';

export interface PostItByHost {
  [hostname: string]: {
    [path: string]: PostItData[];
  };
}
