import type * as coda from "@codahq/packs-sdk";


/* To be implemented. Still to understand how to get effective view URL from a page URL*/
function parseDatasetUrl(url) {
    return url
}

export async function getTableName(context: coda.SyncExecutionContext) {
    let url = parseDatasetUrl(context.sync.dynamicUrl);
    const response = await context.fetcher.fetch({
        method: 'GET',
        url: url
    });
    console.log(`Table Name: ${response.body.name}`)
    return response.body.name;
}

export async function getColumnsMetadata(context: coda.SyncExecutionContext) {
    let url = parseDatasetUrl(context.sync.dynamicUrl) + "/columns"
    const response = await context.fetcher.fetch({
        method: 'GET',
        url: url
    });

    let columnsMetadata = response.body.items
    let names = columnsMetadata.map(r => r.name.replace(/\W+/g, "_"))

    console.log(`names: ${names}`)
    console.log(`columnMetadata: ${JSON.stringify(columnsMetadata)}`)
    return columnsMetadata
}

export async function getDynamicTableData(token, context: coda.SyncExecutionContext) {
    let parsed = parseDatasetUrl(context.sync.dynamicUrl);
    let columnsMetadata = await getColumnsMetadata(context);

    let tokenColumnId = columnsMetadata.find(r => r.name === "Token").id
    console.log(`tokenColumnId: ${tokenColumnId}`)

    let url = `${parsed}/rows?query=${tokenColumnId}:"${token}"`
    const response = await context.fetcher.fetch({
        method: 'GET',
        url: url
    });

    return response.body.items;
}