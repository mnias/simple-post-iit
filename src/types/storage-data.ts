import { PostItData } from './post-it';

export interface StorageData {
  [url: string]: PostItData[];
}
