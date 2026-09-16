// src/lib/build-assistant-overrides.ts
type PropertyForPrompt = {
  title: string;
  price: number;
  location: string;
};

export function buildPropertiesList(properties: PropertyForPrompt[]): string {
  if (properties.length === 0) {
    return "Actualmente no hay propiedades cargadas.";
  }

  return properties
    .map(
      (p) => `- ${p.title}, ubicada en ${p.location}, precio $${p.price.toLocaleString()}`
    )
    .join("\n");
}

export function buildAssistantOverrides({
  agencyName,
  assistantTone,
  properties,
  agencyId,
}: {
  agencyName: string;
  assistantTone: string | null;
  properties: PropertyForPrompt[];
  agencyId: string;
}) {
  return {
    variableValues: {
      agencyName,
      agencyId,
      assistantTone: assistantTone ?? "cálido y profesional",
      propertiesList: buildPropertiesList(properties),
    },
  };
}