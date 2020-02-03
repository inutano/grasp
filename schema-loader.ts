import { ObjectTypeDefinitionNode, TypeNode, DocumentNode } from 'graphql';
import { parse } from 'graphql/language/parser';

import { unwrapCompositeType } from './utils';

export default class SchemaLoader {
  originalTypeDefs: DocumentNode;
  queryDef: ObjectTypeDefinitionNode;
  resourceTypeDefs: Array<ObjectTypeDefinitionNode>;

  constructor(graphql: string) {
    this.originalTypeDefs = parse(graphql);

    const typeDefinitionNodes = this.originalTypeDefs.definitions.filter((def): def is ObjectTypeDefinitionNode => {
      return def.kind === 'ObjectTypeDefinition';
    });

    const queryDef = typeDefinitionNodes.find(def => def.name.value === 'Query');
    if (!queryDef) {
      throw new Error('Query is not defined');
    }
    this.queryDef = queryDef;

    this.resourceTypeDefs = typeDefinitionNodes.filter(def => def.name.value !== 'Query');
  }

  isUserDefined(type: TypeNode): boolean {
    const unwrapped = unwrapCompositeType(type);

    return this.resourceTypeDefs.some(def => def.name.value === unwrapped.name.value);
  }
}
