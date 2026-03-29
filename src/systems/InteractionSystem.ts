/**
 * InteractionSystem (stub)
 * Phase 2: This will replace the hardcoded OBJECTS array in BedroomScene
 * by reading interaction zones from the Tiled object layer.
 */
export interface InteractionZone {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onInteract: () => void;
}

export function isNear(
  px: number,
  py: number,
  zone: Pick<InteractionZone, 'x' | 'y'>,
  range = 32,
): boolean {
  const dx = px - zone.x;
  const dy = py - zone.y;
  return Math.sqrt(dx * dx + dy * dy) < range;
}
