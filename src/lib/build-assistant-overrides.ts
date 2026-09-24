// src/lib/build-assistant-overrides.ts
type PropertyForPrompt = {
  title: string;
  price: number;
  location: string;
};

export type CurrentProperty = {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string | null;
  amenities: string[];
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

function buildCurrentPropertyContext(property: CurrentProperty | null): string {
  if (!property) {
    return "El visitante no está viendo ninguna propiedad en particular.";
  }

  const lines = [
    `El visitante está viendo ahora mismo esta propiedad: ${property.title}.`,
    `Ubicación: ${property.location}.`,
    `Precio: $${property.price.toLocaleString()}.`,
  ];

  if (property.description) {
    lines.push(`Descripción: ${property.description.slice(0, 800)}`);
  }

  if (property.amenities.length > 0) {
    lines.push(`Amenidades: ${property.amenities.join(", ")}.`);
  }

  return lines.join("\n");
}

export function buildAssistantOverrides({
  agencyName,
  assistantTone,
  properties,
  agencyId,
  currentProperty = null,
}: {
  agencyName: string;
  assistantTone: string | null;
  properties: PropertyForPrompt[];
  agencyId: string;
  currentProperty?: CurrentProperty | null;
}) {
  return {
    ...(currentProperty && {
      firstMessage: `Hola, bienvenido a ${agencyName}. Veo que estás mirando ${currentProperty.title}. ¿Quieres que te cuente más sobre esta propiedad o tienes alguna pregunta?`,
    }),
    variableValues: {
      agencyName,
      agencyId,
      assistantTone: assistantTone ?? "cálido y profesional",
      propertiesList: buildPropertiesList(properties),
      currentPropertyId: currentProperty?.id ?? "",
      currentPropertyContext: buildCurrentPropertyContext(currentProperty),
    },
  };
}