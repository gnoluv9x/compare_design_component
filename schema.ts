export interface ComponentProperty {
  type?: string;
  defaultValue?: any;
  variantOptions?: string[];
  preferredValues?: any[];
  [key: string]: any;
}

export interface ComponentData {
  name?: string;
  componentProperties?: Record<string, ComponentProperty>;
  [key: string]: any;
}

export interface PropertyDiff {
  propertyName: string;
  status: 'added' | 'removed' | 'modified';
  details?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface ComponentDiffResult {
  componentName: string;
  isNameChanged: boolean;
  oldComponentName?: string;
  propertyChanges: PropertyDiff[];
}

export function compareComponentData(oldData: ComponentData, newData: ComponentData): ComponentDiffResult {
  const currentName = newData.name || oldData.name || 'Unknown Component';
  const result: ComponentDiffResult = {
    componentName: currentName,
    isNameChanged: oldData.name !== newData.name,
    propertyChanges: []
  };

  if (result.isNameChanged) {
    result.oldComponentName = oldData.name;
  }

  const oldProps = oldData.componentProperties || {};
  const newProps = newData.componentProperties || {};

  const allPropNames = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const propName of allPropNames) {
    const oldProp = oldProps[propName];
    const newProp = newProps[propName];

    if (!oldProp && newProp) {
      result.propertyChanges.push({
        propertyName: propName,
        status: 'added'
      });
    } else if (oldProp && !newProp) {
      result.propertyChanges.push({
        propertyName: propName,
        status: 'removed'
      });
    } else if (oldProp && newProp) {
      const details: PropertyDiff['details'] = [];
      const allKeys = new Set([...Object.keys(oldProp), ...Object.keys(newProp)]);
      
      for (const key of allKeys) {
        const oldValStr = JSON.stringify(oldProp[key]);
        const newValStr = JSON.stringify(newProp[key]);
        
        if (oldValStr !== newValStr) {
          details.push({
            field: key,
            oldValue: oldProp[key],
            newValue: newProp[key]
          });
        }
      }

      if (details.length > 0) {
        result.propertyChanges.push({
          propertyName: propName,
          status: 'modified',
          details
        });
      }
    }
  }

  return result;
}
