export interface ComponentSetJson {
  id: string;
  name: string;
  componentKey: string;
  componentProperties: Record<string, ComponentProperty>;
}

export interface ComponentProperty {
  type: "BOOLEAN" | "TEXT" | "VARIANT" | "INSTANCE_SWAP";
  defaultValue?: unknown;
  variantOptions?: string[];
  preferredValues?: string[];
}

export interface ChangeRecord {
  propertyName: string;
  changeType: "name_changed" | "property_type_changed" | "variant_option_added" | "variant_option_removed";
  from: string;
  to: string;
}

export function compareComponentSets(
  oldSet: ComponentSetJson,
  newSet: ComponentSetJson
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];

  if (oldSet.name !== newSet.name) {
    changes.push({
      propertyName: oldSet.name,
      changeType: "name_changed",
      from: oldSet.name,
      to: newSet.name,
    });
  }

  const allPropertyKeys = new Set([
    ...Object.keys(oldSet.componentProperties),
    ...Object.keys(newSet.componentProperties),
  ]);

  for (const key of allPropertyKeys) {
    const oldProp = oldSet.componentProperties[key];
    const newProp = newSet.componentProperties[key];

    if (!oldProp && newProp) {
      changes.push({
        propertyName: key,
        changeType: "property_type_changed",
        from: "(not exist)",
        to: newProp.type,
      });
      continue;
    }

    if (oldProp && !newProp) {
      changes.push({
        propertyName: key,
        changeType: "property_type_changed",
        from: oldProp.type,
        to: "(removed)",
      });
      continue;
    }

    if (oldProp.type !== newProp.type) {
      changes.push({
        propertyName: key,
        changeType: "property_type_changed",
        from: oldProp.type,
        to: newProp.type,
      });
    }

    if (oldProp.type === "VARIANT" && newProp.type === "VARIANT") {
      const oldOptions = oldProp.variantOptions ?? [];
      const newOptions = newProp.variantOptions ?? [];
      const added = newOptions.filter((o) => !oldOptions.includes(o));
      const removed = oldOptions.filter((o) => !newOptions.includes(o));

      for (const option of added) {
        changes.push({
          propertyName: key,
          changeType: "variant_option_added",
          from: "(not exist)",
          to: option,
        });
      }

      for (const option of removed) {
        changes.push({
          propertyName: key,
          changeType: "variant_option_removed",
          from: option,
          to: "(removed)",
        });
      }
    }
  }

  return changes;
}

export function formatChangesForUI(changes: ChangeRecord[]): Array<{
  componentName: string;
  changeDescription: string;
  from: string;
  to: string;
}> {
  return changes.map((change) => ({
    componentName: change.propertyName,
    changeDescription: getChangeLabel(change.changeType),
    from: change.from,
    to: change.to,
  }));
}

function getChangeLabel(type: ChangeRecord["changeType"]): string {
  switch (type) {
    case "name_changed":
      return "Component Name";
    case "property_type_changed":
      return "Property Type";
    case "variant_option_added":
      return "Variant Option Added";
    case "variant_option_removed":
      return "Variant Option Removed";
  }
}
