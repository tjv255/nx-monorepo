export interface IMultiSelectMetadata {
  primaryEntityName: string;
  primaryEntityCollectionName: string;
  targetEntityName: string;
  targetEntityCollectionName: string;
  targetEntityPrimaryIdLogicalName: string;
  targetEntityPrimaryNameLogicalName: string;
  intermediaryEntityName: string;
  intermediaryEntityCollectionName: string;
  intermediaryEntityPrimaryIdLogicalName: string;
  intermediaryEntityPrimaryLookupLogicalName: string;
  intermediaryEntityPrimaryLookupSchemaName: string;
  intermediaryEntityTargetLookupLogicalName: string;
  intermediaryEntityTargetLookupSchemaName: string;
}

export interface ISelectableOption {
  id: string;
  targetEntityId: string;
  text: string;
}
