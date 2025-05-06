export interface PostItData {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: number;
  path: string;
  hostname: string;
}
