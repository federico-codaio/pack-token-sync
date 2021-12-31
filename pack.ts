import * as coda from "@codahq/packs-sdk";
import {getColumnsMetadata, getDynamicTableData, getTableName} from "./helpers";
import {resolveColumnType} from "./schemas";

// This line creates your new Pack.
export const pack = coda.newPack();

pack.setUserAuthentication({
    type: coda.AuthenticationType.CodaApiHeaderBearerToken,
});

pack.addNetworkDomain("coda.io");

pack.addDynamicSyncTable({

    name: "DynamicTable",
    getName: coda.makeMetadataFormula(async (context: coda.SyncExecutionContext) => {
        return await getTableName(context);
    }),

    getSchema: async function (context: coda.SyncExecutionContext) {
        let datasourceUrl = context.sync!.dynamicUrl!;
        let columnsMetadata = await getColumnsMetadata(context);
        let properties: coda.ObjectSchemaProperties = {}
        let headers = []

        let primaryColumn = headers[0] // default: fallback on primary column

        columnsMetadata.map((column, index) => {
            let header = column.name.replace(/\W+/g, "_");
            headers[index] = header
            properties[header] = resolveColumnType(column)
            if (header.toLowerCase() == "row_id") { // requirement?
                primaryColumn = header
            }
        })

        const dynamicSchema = coda.makeSchema({
            type: coda.ValueType.Array,

            items: coda.makeObjectSchema({
                type: coda.ValueType.Object,
                id: primaryColumn,
                primary: primaryColumn,
                properties,
                identity: {
                    name: primaryColumn,
                    dynamicUrl: datasourceUrl,
                },
                featured: headers,
            })
        });
        console.log(`dynamicSchema: ${JSON.stringify(dynamicSchema)}`);
        return dynamicSchema;
    },

    getDisplayUrl: coda.makeMetadataFormula(async context => context.sync!.dynamicUrl!),

    formula: {
        name: "GetData",
        description: "Fetches remote table's data",
        parameters: [
            coda.makeParameter({
                type: coda.ParameterType.String,
                name: "Token",
                description: "Please, provide the token value",
            }),
        ],
        execute: async function (param, context: coda.SyncExecutionContext) {

            let columnsMetadata = await getColumnsMetadata(context);
            let headers = columnsMetadata.map(r => r.name.replace(/\W+/g, "_"))

            let data = await getDynamicTableData(param, context)
            let result = [];

            console.log(`data: ${JSON.stringify(data)}`);

            for (const currentRow of data) {
                let row = {}
                for (let i = 0; i < headers.length; i++) {
                    row[headers[i]] = currentRow.values[columnsMetadata[i].id]
                }
                //console.log(row)
                result.push(row)
            }

            return {
                result,
                continuation: undefined
            }
        },
    },
});

