import * as React from 'react';
import { useState, useEffect } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { NodeItem } from '../../../Interfaces/NodeItem';
import { SPOItem } from '../../../Interfaces/SPOItem';
import { Panel } from 'office-ui-fabric-react/lib/components/Panel/Panel';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField/TextField';
import { IDropdown, Dropdown } from 'office-ui-fabric-react/lib/components/Dropdown';
import { Checkbox } from 'office-ui-fabric-react/lib/components/Checkbox/Checkbox';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button/PrimaryButton/PrimaryButton';
import { Button, Check, ICheckbox } from 'office-ui-fabric-react';
import { IMasterProgramChartProps } from '../charts/IChartProps';

const ItemsTable: React.FC<IMasterProgramChartProps> = (props: IMasterProgramChartProps) => {
    const [data, setData] = useState<NodeItem[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [dataItem, setDataItem] = useState<SPOItem>(null);

    const saveItems = () => {
        console.log('data', data);
        console.log('dataItem', dataItem);
        let chartItem = {
            Title: props.itemTitle,
            Data: JSON.stringify(data)
        } as SPOItem;

        sp.web.lists.getByTitle(props.listTitle).items.getById(dataItem.Id).update(chartItem);
    };

    const toggleEdit = () => {
        if (document.location.href.indexOf('Debug=1') !== -1) {
            setEditMode(!editMode);
        } else if (document.location.href.indexOf('Mode=Edit') !== -1) {
            setEditMode(true);
        } else {
            setEditMode(!editMode);
        }
    };

    const addItem = React.useCallback((newItem: NodeItem) => {
        setData(prevData => [...prevData, newItem]);
    }, []);

    const removeItem = React.useCallback((itemId: string) => {
        setData(prevData => {
            const itemsToRemove = new Set();

            const findChildren = (parentId: string) => {
                for (const item of prevData) {
                    if (item.parentId === parentId) {
                        itemsToRemove.add(item.id);
                        findChildren(item.id);
                    }
                }
            };

            itemsToRemove.add(itemId);
            findChildren(itemId);

            return prevData.filter(item => !itemsToRemove.has(item.id));
        });
    }, []);

    const updateItem = React.useCallback((updatedItem: NodeItem) => {
        console.log('updatedItem', updatedItem);
        setData(prevData => prevData.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    useEffect(() => {
        if (!props.listTitle || !props.itemTitle) { return; }

        async function fetchItems() {
            let chartItems: SPOItem[] = await sp.web.lists.getByTitle(props.listTitle).items.filter(`Title eq '${props.itemTitle}'`).get();
            console.log("FETCHING ITEMS!", chartItems);
            let freshItems = [] as NodeItem[];

            console.log("chartItems.length", chartItems.length);
            if (chartItems.length > 0) {
                let chartItem = chartItems[0];
                setDataItem(chartItem);
                // parse chartItem to array of Items
                freshItems = JSON.parse(chartItem.Data);
                setData(freshItems);
            }

            console.log("mapped!", freshItems.map(item => item.Title));
        }

        fetchItems();

    }, [
        props.listTitle,
        props.itemTitle,
        props.lastUpdated
    ]);

    return (
        <div>
            <table className="items-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subtitle</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item: NodeItem) => (
                        <tr key={item.id}>
                            <td>{
                                <a href={item.Hyperlink}>{item.Title}</a>
                            }</td>
                            <td>{item.SubTitle}</td>
                            <td>{item.Description}</td>
                            {/* <td>
                                {editMode && (
                                    <>
                                        <Button onClick={() => updateItem(item)}>Edit</Button>
                                        <Button onClick={() => removeItem(item.id)}>Remove</Button>
                                    </>
                                )}
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            {editMode && (
                <div className="table-actions">
                    {/* <Button onClick={() => addItem({ id: Date.now().toString(), Title: "New Item", SubTitle: "", Description: "", parentId: null, IconName: "", HexColorCodeText: "#000000", HexColorCode: "#FFFFFF", Hyperlink: "" })}>
                        Add New Item
                    </Button> */}
                    {/* <PrimaryButton onClick={saveItems}>Save Changes</PrimaryButton> */}
                </div>
            )}
            {/* <Button onClick={toggleEdit}>{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}</Button> */}
        </div>
    );
};

export default ItemsTable;