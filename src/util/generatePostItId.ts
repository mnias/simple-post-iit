export const generatePostItId = () =>
  `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
