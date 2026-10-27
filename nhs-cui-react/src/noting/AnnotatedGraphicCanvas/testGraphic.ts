import type { GraphicDefinition } from './AnnotatedGraphicCanvas';

/** Fictional test graphic: two simple outlines (front and back). */
export const TEST_GRAPHIC: GraphicDefinition = {
  id: 'body-adult',
  title: 'Adult body',
  width: 300,
  height: 300,
  ageGroup: 'adult',
  keywords: ['whole body', 'skin'],
  images: [
    { label: 'Front view', x: 0, y: 0, width: 140, height: 280, paths: ['M70 10a20 20 0 1 0 0.1 0M50 50h40v120H50z'] },
    { label: 'Back view', x: 160, y: 0, width: 140, height: 280, paths: ['M230 10a20 20 0 1 0 0.1 0M210 50h40v120h-40z'] },
  ],
};
