import { IMultiSelectMetadata, ISelectableOption } from './interfaces';

const headers = {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
    Prefer: 'odata.include-annotations=*',
  },
  webApiVersion = 'v9.2';

async function fetchOperation(
  queryString: string,
  method: string,
  overrideHeaders?: HeadersInit,
  body?: { [id: string]: unknown }
) {
  const response = await fetch(queryString, {
    method: method,
    headers: overrideHeaders || headers,
    body: JSON.stringify(body),
  });

  if (response.status === 204) return;

  const responseBody = await response.json();

  if (!response.ok) throw new Error(responseBody.error);

  return responseBody;
}

export async function getMetadata(
  orgUrl: string,
  primaryRelationship: string,
  targetRelationship: string
): Promise<IMultiSelectMetadata> {
  const primaryRelationshipDefQuery = `${orgUrl}/api/data/${webApiVersion}/RelationshipDefinitions?$filter=SchemaName eq '${primaryRelationship}'`,
    primaryRelationshipDef = await fetchOperation(
      primaryRelationshipDefQuery,
      'GET'
    );

  if (!primaryRelationshipDef.value.length) {
    throw new Error(
      `MultiSelect: A relationship with name ${primaryRelationship} could not be found.`
    );
  }

  const primaryEntityName =
      primaryRelationshipDef.value?.at(0)?.ReferencedEntity,
    intermediaryEntityName =
      primaryRelationshipDef.value?.at(0)?.ReferencingEntity,
    intermediaryEntityPrimaryLookupLogicalName =
      primaryRelationshipDef.value?.at(0)?.ReferencingAttribute,
    targetRelationshipDefQuery = `${orgUrl}/api/data/${webApiVersion}/RelationshipDefinitions?$filter=SchemaName eq '${targetRelationship}'`,
    targetRelationshipDef = await fetchOperation(
      targetRelationshipDefQuery,
      'GET'
    );

  if (!targetRelationshipDef.value.length) {
    throw new Error(
      `MultiSelect: A relationship with name ${targetRelationship} could not be found.`
    );
  }

  const targetEntityName = targetRelationshipDef.value?.at(0)?.ReferencedEntity,
    intermediaryEntityTargetLookupLogicalName =
      targetRelationshipDef.value?.at(0)?.ReferencingAttribute,
    primaryEntityDefQuery = `${orgUrl}/api/data/${webApiVersion}/EntityDefinitions(LogicalName='${primaryEntityName}')?$select=LogicalName,LogicalCollectionName`,
    primaryEntityDef = await fetchOperation(primaryEntityDefQuery, 'GET'),
    primaryEntityCollectionName = primaryEntityDef.LogicalCollectionName,
    targetEntityDefQuery = `${orgUrl}/api/data/${webApiVersion}/EntityDefinitions(LogicalName='${targetEntityName}')?$select=LogicalName,PrimaryIdAttribute,PrimaryNameAttribute,LogicalCollectionName`,
    targetEntityDef = await fetchOperation(targetEntityDefQuery, 'GET'),
    targetEntityCollectionName = targetEntityDef.LogicalCollectionName,
    targetEntityPrimaryIdLogicalName = targetEntityDef.PrimaryIdAttribute,
    targetEntityPrimaryNameLogicalName = targetEntityDef.PrimaryNameAttribute,
    intermediaryEntityDefQuery = `${orgUrl}/api/data/${webApiVersion}/EntityDefinitions(LogicalName='${intermediaryEntityName}')?$select=LogicalName,SchemaName,PrimaryIdAttribute,LogicalCollectionName&$expand=Attributes($select=LogicalName,SchemaName;$filter=LogicalName eq '${intermediaryEntityPrimaryLookupLogicalName}' or LogicalName eq '${intermediaryEntityTargetLookupLogicalName}')`,
    intermediaryEntityDef = await fetchOperation(
      intermediaryEntityDefQuery,
      'GET'
    ),
    intermediaryEntityCollectionName =
      intermediaryEntityDef.LogicalCollectionName,
    intermediaryEntityPrimaryIdLogicalName =
      intermediaryEntityDef.PrimaryIdAttribute,
    intermediaryEntityPrimaryLookupSchemaName =
      intermediaryEntityDef.Attributes.find(
        (a: { [id: string]: unknown }) =>
          a.LogicalName === intermediaryEntityPrimaryLookupLogicalName
      ).SchemaName,
    intermediaryEntityTargetLookupSchemaName =
      intermediaryEntityDef.Attributes.find(
        (a: { [id: string]: unknown }) =>
          a.LogicalName === intermediaryEntityTargetLookupLogicalName
      ).SchemaName;

  return {
    primaryEntityName,
    primaryEntityCollectionName,
    targetEntityName,
    targetEntityCollectionName,
    targetEntityPrimaryIdLogicalName,
    targetEntityPrimaryNameLogicalName,
    intermediaryEntityName,
    intermediaryEntityCollectionName,
    intermediaryEntityPrimaryIdLogicalName,
    intermediaryEntityPrimaryLookupLogicalName,
    intermediaryEntityPrimaryLookupSchemaName,
    intermediaryEntityTargetLookupLogicalName,
    intermediaryEntityTargetLookupSchemaName,
  };
}

export async function getOptions(
  orgUrl: string,
  metadata: IMultiSelectMetadata,
  filter?: string
): Promise<ISelectableOption[]> {
  const filterQuery = filter ? `&$filter=(${filter})` : '',
    queryString = `${orgUrl}/api/data/${webApiVersion}/${metadata.targetEntityCollectionName}?$select=${metadata.targetEntityPrimaryNameLogicalName},${metadata.targetEntityPrimaryIdLogicalName}${filterQuery}&$orderby=${metadata.targetEntityPrimaryNameLogicalName} asc`,
    responseBody = await fetchOperation(queryString, 'GET');

  return responseBody.value.map(
    (v: { [id: string]: unknown }): ISelectableOption => ({
      id: '',
      targetEntityId: v[metadata.targetEntityPrimaryIdLogicalName] as string,
      text: v[metadata.targetEntityPrimaryNameLogicalName] as string,
    })
  );
}

export async function getSelectedValues(
  orgUrl: string,
  metadata: IMultiSelectMetadata,
  primaryEntityId: string
): Promise<ISelectableOption[]> {
  const queryString = `${orgUrl}/api/data/${webApiVersion}/${metadata.intermediaryEntityCollectionName}?$select=${metadata.intermediaryEntityPrimaryIdLogicalName},_${metadata.intermediaryEntityTargetLookupLogicalName}_value&$filter=(_${metadata.intermediaryEntityPrimaryLookupLogicalName}_value eq '${primaryEntityId}')`,
    responseBody = await fetchOperation(queryString, 'GET');

  return responseBody.value.map(
    (v: { [id: string]: unknown }): ISelectableOption => ({
      id: v[metadata.intermediaryEntityPrimaryIdLogicalName] as string,
      targetEntityId: v[
        `_${metadata.intermediaryEntityTargetLookupLogicalName}_value`
      ] as string,
      text: v[
        `_${metadata.targetEntityPrimaryNameLogicalName}_value@OData.Community.Display.V1.FormattedValue`
      ] as string,
    })
  );
}

export async function createSelections(
  orgUrl: string,
  metadata: IMultiSelectMetadata,
  primaryEntityId: string,
  selections: ISelectableOption[]
): Promise<ISelectableOption[]> {
  return await Promise.all(
    selections.map(async (s) => {
      const body = {
          [`${metadata.intermediaryEntityTargetLookupSchemaName}@odata.bind`]: `/${metadata.targetEntityCollectionName}(${s.targetEntityId})`,
          [`${metadata.intermediaryEntityPrimaryLookupSchemaName}@odata.bind`]: `/${metadata.primaryEntityCollectionName}(${primaryEntityId})`,
        },
        createHeaders = {
          ...headers,
          Prefer: 'odata.include-annotations=*,return=representation',
        },
        queryString = `${orgUrl}/api/data/${webApiVersion}/${metadata.intermediaryEntityCollectionName}`,
        responseBody = await fetchOperation(
          queryString,
          'POST',
          createHeaders,
          body
        );

      return {
        ...s,
        id: responseBody[metadata.intermediaryEntityPrimaryIdLogicalName],
      };
    })
  );
}

export async function removeSelections(
  orgUrl: string,
  metadata: IMultiSelectMetadata,
  selections: ISelectableOption[]
): Promise<ISelectableOption[]> {
  return await Promise.all(
    selections.map(async (s) => {
      const queryString = `${orgUrl}/api/data/${webApiVersion}/${metadata.intermediaryEntityCollectionName}(${s.id})`,
        responseBody = await fetchOperation(queryString, 'DELETE');

      // Success
      if (!responseBody) {
        return {
          ...s,
          id: '',
        };
      }

      return s;
    })
  );
}
