export interface IDataSerializer<EntityDto, Entity> {
  serialize: (dataItem: EntityDto) => Record<string, string> | string;
  deserialize: (id: string, dataItem: Record<string, string>) => Entity;
}
