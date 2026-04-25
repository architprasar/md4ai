import { createContext, useContext } from 'react';
import type { ComponentOverrides, RenderContentOptions } from '../../types.js';
import type { BridgeDefinition, BridgeRenderCtx } from '../../bridge.js';

export interface RenderCtx {
  className?: string;
  theme?: RenderContentOptions['theme'];
  components: ComponentOverrides;
  highlight?: RenderContentOptions['highlight'];
  bridges: BridgeDefinition[];
  bridgeCtx: BridgeRenderCtx;
}

export const RenderContext = createContext<RenderCtx>({
  components: {},
  bridges: [],
  bridgeCtx: { query: () => undefined, emit: () => {} },
});

export const useRenderCtx = () => useContext(RenderContext);
