import { readRuntimeConfig } from "./core/env.js";
import { writeAddressProjections } from "./core/projections.js";
import { loadStoredEvents } from "./core/store.js";

async function main() {
  const config = readRuntimeConfig();
  const events = await loadStoredEvents();

  if (events.length === 0) {
    console.log("Nenhum evento encontrado em events.json");
    return;
  }

  await writeAddressProjections(events, config.tokenDecimals);

  console.log("Projeções por endereço regeneradas com sucesso.");
  console.log("Total de eventos usados:", events.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});