
export type BridgeFieldType = 'string' | 'number' | 'boolean' | 'list' | 'enum' | 'keyvalue';

export interface BridgeFieldMetadata<T = any> {
  name: string;
  type: BridgeFieldType;
  description?: string;
  defaultValue?: T;
  optional: boolean;
  prompt?: string;
  examples?: string[];
  format?: string;
  tone?: string;
  importance?: 'high' | 'low';
  /** For enum type */
  options?: string[];
  /** For list type */
  itemType?: BridgeField<any>;
}

export abstract class BridgeField<T = any> {
  metadata: BridgeFieldMetadata<T>;

  constructor(name: string, type: BridgeFieldType) {
    this.metadata = { name, type, optional: false };
  }

  describe(text: string) {
    this.metadata.description = text;
    return this;
  }

  default(val: T) {
    this.metadata.defaultValue = val;
    return this;
  }

  optional() {
    this.metadata.optional = true;
    return this;
  }

  prompt(text: string) {
    this.metadata.prompt = text;
    return this;
  }

  examples(list: string[]) {
    this.metadata.examples = list;
    return this;
  }

  format(template: string) {
    this.metadata.format = template;
    return this;
  }

  tone(type: string) {
    this.metadata.tone = type;
    return this;
  }

  importance(lvl: 'high' | 'low') {
    this.metadata.importance = lvl;
    return this;
  }
}

class StringField extends BridgeField<string> {
  constructor(name: string) { super(name, 'string'); }
}

class NumberField extends BridgeField<number> {
  constructor(name: string) { super(name, 'number'); }
}

class BooleanField extends BridgeField<boolean> {
  constructor(name: string) { super(name, 'boolean'); }
}

class EnumField<T extends string> extends BridgeField<T> {
  constructor(name: string, options: T[]) {
    super(name, 'enum');
    this.metadata.options = options;
  }
}

class ListField<T> extends BridgeField<T[]> {
  constructor(name: string, itemType: BridgeField<T>) {
    super(name, 'list');
    this.metadata.itemType = itemType;
  }
}

class KeyValueField extends BridgeField<Record<string, string>> {
  constructor(name: string) { super(name, 'keyvalue'); }
}

export const B = {
  string: (name: string) => new StringField(name),
  number: (name: string) => new NumberField(name),
  boolean: (name: string) => new BooleanField(name),
  enum: <T extends string>(name: string, options: T[]) => new EnumField<T>(name, options),
  list: <T>(name: string, itemType: BridgeField<T>) => new ListField<T>(name, itemType),
  keyvalue: (name: string) => new KeyValueField(name),
};

/** Utility to infer the data type from an array of BridgeFields */
export type InferSchemaType<F extends BridgeField<any>[]> = {
  [K in F[number]['metadata']['name']]: Extract<F[number], { metadata: { name: K } }> extends BridgeField<infer T>
    ? T
    : any;
};
