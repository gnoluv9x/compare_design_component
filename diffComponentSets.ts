type PropertyType = "BOOLEAN" | "TEXT" | "VARIANT" | "INSTANCE_SWAP";

interface ComponentProperty {
  type: PropertyType;
  defaultValue: string | boolean;
  variantOptions?: string[];
  preferredValues?: unknown[];
}

interface ComponentSet {
  id: string;
  name: string;
  componentKey: string;
  componentProperties: Record<string, ComponentProperty>;
  [key: string]: unknown;
}

interface PageComponentSet {
  pageId: string;
  pageName: string;
  components: ComponentSet[];
}

type ChangeKind = "added" | "removed" | "modified";

export interface PropertyChange {
  propertyName: string;
  changeKind: ChangeKind;
  from?: ComponentProperty;
  to?: ComponentProperty;
}

export interface ComponentChange {
  componentId: string;
  componentName: string;
  changeKind: ChangeKind;
  nameChanged?: { from: string; to: string };
  propertyChanges: PropertyChange[];
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => JSON.stringify(item) === JSON.stringify(b[i]));
}

function isPropertyEqual(a: ComponentProperty, b: ComponentProperty): boolean {
  if (a.type !== b.type) return false;

  const aVariants = a.variantOptions ?? [];
  const bVariants = b.variantOptions ?? [];
  if (!arraysEqual(aVariants, bVariants)) return false;

  return true;
}

function diffProperties(
  oldProps: Record<string, ComponentProperty>,
  newProps: Record<string, ComponentProperty>,
): PropertyChange[] {
  const changes: PropertyChange[] = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    const oldProp = oldProps[key];
    const newProp = newProps[key];

    if (!oldProp) {
      changes.push({ propertyName: key, changeKind: "added", to: newProp });
    } else if (!newProp) {
      changes.push({ propertyName: key, changeKind: "removed", from: oldProp });
    } else if (!isPropertyEqual(oldProp, newProp)) {
      changes.push({ propertyName: key, changeKind: "modified", from: oldProp, to: newProp });
    }
  }

  return changes;
}

export function diffComponentSets(
  oldJson: PageComponentSet,
  newJson: PageComponentSet,
): ComponentChange[] {
  const oldMap = new Map(oldJson.components.map(c => [c.id, c]));
  const newMap = new Map(newJson.components.map(c => [c.id, c]));
  const results: ComponentChange[] = [];

  for (const [id, newComp] of newMap) {
    const oldComp = oldMap.get(id);

    if (!oldComp) {
      results.push({
        componentId: id,
        componentName: newComp.name,
        changeKind: "added",
        propertyChanges: Object.keys(newComp.componentProperties).map(key => ({
          propertyName: key,
          changeKind: "added",
          to: newComp.componentProperties[key],
        })),
      });
      continue;
    }

    const nameChanged =
      oldComp.name !== newComp.name ? { from: oldComp.name, to: newComp.name } : undefined;

    const propertyChanges = diffProperties(
      oldComp.componentProperties,
      newComp.componentProperties,
    );

    if (nameChanged || propertyChanges.length > 0) {
      results.push({
        componentId: id,
        componentName: newComp.name,
        changeKind: "modified",
        nameChanged,
        propertyChanges,
      });
    }
  }

  for (const [id, oldComp] of oldMap) {
    if (!newMap.has(id)) {
      results.push({
        componentId: id,
        componentName: oldComp.name,
        changeKind: "removed",
        propertyChanges: Object.keys(oldComp.componentProperties).map(key => ({
          propertyName: key,
          changeKind: "removed",
          from: oldComp.componentProperties[key],
        })),
      });
    }
  }

  return results;
}
