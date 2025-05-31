import { createVlayerClient } from "@vlayer/sdk";

export const vlayerClient = createVlayerClient({
  url: process.env.NEXT_PUBLIC_TELEPORTER_PROVER_URL!,
  token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN!,
});