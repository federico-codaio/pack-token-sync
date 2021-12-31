import * as coda from "@codahq/packs-sdk";
import {ScaleIconSet, ValueHintType, ValueType} from "@codahq/packs-sdk";
import {StringHintValueTypes} from "@codahq/packs-sdk/schema";
import {NumberHintValueTypes} from "@codahq/packs-sdk/dist/schema";

export function resolveColumnType(column: any) {

    let type = column.format.type
    let schemaDef

    for (const hint of NumberHintValueTypes) {
        if (type.toLowerCase() == hint.toLowerCase()) {
            schemaDef = coda.makeObjectSchema({
                properties: {
                    prop: {
                        type: coda.ValueType.Number,
                        codaType: hint,
                    },
                }
            })
            break;
        }
    }

    if (schemaDef === undefined) {
        for (const hint of StringHintValueTypes) {
            if (type.toLowerCase() == hint.toLowerCase()) {
                schemaDef = coda.makeObjectSchema({
                    properties: {
                        prop: {
                            type: coda.ValueType.String,
                            codaType: hint,
                        },
                    }
                })
                break;
            }
        }
    }

    if (type == "scale") {
        let icon = ScaleIconSet.Star
        for (const iconType in ScaleIconSet) {
            if (column.format.icon == iconType.toLowerCase()) {
                icon = ScaleIconSet[iconType]
                break
            }
        }
        schemaDef!.properties.prop.icon = icon
        schemaDef!.properties.prop.maximum = column.format.maximum
    } else if (type == "checkbox") {
        schemaDef = coda.makeObjectSchema({
            properties: {
                prop: {
                    type: coda.ValueType.Boolean,
                },
            }
        })
    } else if (type == "number") {
        schemaDef = coda.makeObjectSchema({
            properties: {
                prop: {
                    type: coda.ValueType.Number,
                },
            }
        })
    } else if (type == "person") {
        schemaDef = coda.makeObjectSchema({
            properties: {
                prop: {
                    type: coda.ValueType.Object,
                    codaType: ValueHintType.Person,
                    id: "name",
                    properties: {name: {type: ValueType.String, required: true},}
                },
            }
        })
    } else if (schemaDef === undefined) {
        schemaDef = coda.makeObjectSchema({
            properties: {
                prop: {
                    type: coda.ValueType.String,
                },
            }
        })
    }
    return schemaDef!.properties.prop
}

