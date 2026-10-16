import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children straight into <body>. Overlays mounted inside sticky/blurred headers or
 * animated (transformed) page wrappers otherwise get trapped: CSS makes those ancestors the
 * containing block for `position: fixed`, so a drawer collapses into the header or the
 * backdrop misses parts of the screen. Portalling to <body> escapes every such ancestor.
 */
export function BodyPortal({ children }: {children: React.ReactNode;}) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}