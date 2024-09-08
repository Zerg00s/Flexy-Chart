import * as React from 'react';
import { useState, useEffect } from 'react';
import { MasterChartNodesComponent } from './MasterChartNodesComponent';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { NodeItem } from '../../../Interfaces/NodeItem';
import { IMasterProgramChartProps } from './IChartProps';
import { SPOItem } from '../../../Interfaces/SPOItem';
import { Panel } from 'office-ui-fabric-react/lib/components/Panel/Panel';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField/TextField';
import { IDropdown, Dropdown } from 'office-ui-fabric-react/lib/components/Dropdown';
import { Checkbox } from 'office-ui-fabric-react/lib/components/Checkbox/Checkbox';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button/PrimaryButton/PrimaryButton';
import { Button, Check, ICheckbox } from 'office-ui-fabric-react';


const MasterChartDataComponent: React.FC<IMasterProgramChartProps> = (props: IMasterProgramChartProps) => {
    const [nodeIdToPaste, setNodeIdToPaste] = useState(null);
    const [nodeIdConnectionStart, setNodeIdConnectionStart] = useState(null);
    const [data, setData] = useState(null);
    // const [connections, setConnections] = useState<NodeConnection[]>(null);
    // toggle edit mode
    const [editMode, setEditMode] = useState(false);
    const [dataItem, setDataItem] = useState<SPOItem>(null);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);


    const titleFieldRef = React.useRef<ITextField>(null);
    const subTitleFieldRef = React.useRef<ITextField>(null);
    const descriptionFieldRef = React.useRef<ITextField>(null);
    const IconNameFieldRef = React.useRef<ITextField>(null);
    const HyperlinkFieldRef = React.useRef<ITextField>(null);
    const DropdownRef = React.useRef<IDropdown>(null);
    const CheckboxRef = React.useRef<ICheckbox>(null);
    const HexColorCodeFieldRef = React.useRef<any>(null);
    const HexColorCodeTextRef = React.useRef<any>(null);

    function onNodeClick(nodeId) {
        console.log('d3', nodeId);
        setSelectedItemId(prevId => prevId === nodeId ? null : nodeId);
        // set item.Selected to true
        setData(prevData => prevData.map(item => item.id === nodeId ? { ...item, Selected: true } : { ...item, Selected: false }));

    }
    const moveItemEarlier = React.useCallback((itemId: string) => {
        console.log(`Moving item earlier: ${itemId}`);
        setData(prevData => {
            const itemIndex = prevData.findIndex(item => item.id === itemId);
            console.log(`Item index in prevData: ${itemIndex}`);

            if (itemIndex <= 0) {
                console.log('Item is already first in prevData, returning');
                return prevData; // Can't move if it's already first
            }

            // Create a new array with the item swapped with the previous item
            const newData = [...prevData];
            [newData[itemIndex - 1], newData[itemIndex]] = [newData[itemIndex], newData[itemIndex - 1]];

            console.log(`New data:`, newData);
            return newData;
        });
    }, []);

    const moveItemLater = React.useCallback((itemId: string) => {
        console.log(`Moving item later: ${itemId}`);
        setData(prevData => {
            const itemIndex = prevData.findIndex(item => item.id === itemId);
            console.log(`Item index in prevData: ${itemIndex}`);

            if (itemIndex === -1 || itemIndex >= prevData.length - 1) {
                console.log('Item is already last in prevData or not found, returning');
                return prevData; // Can't move if it's already last or not found
            }

            // Create a new array with the item swapped with the next item
            const newData = [...prevData];
            [newData[itemIndex], newData[itemIndex + 1]] = [newData[itemIndex + 1], newData[itemIndex]];

            console.log(`New data:`, newData);
            return newData;
        });
    }, []);

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
        if (editMode) {
            unselectItem();
        }

        if (document.location.href.indexOf('Debug=1') !== -1) {
            setEditMode(!editMode);
        } else if (document.location.href.indexOf('Mode=Edit') !== -1) {
            setEditMode(true);
        } else {
            setEditMode(!editMode);
        }
    };

    const unselectItem = React.useCallback(() => {
        setSelectedItemId(null);
    }, []);


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
        unselectItem();
    }, [unselectItem]);

    const updateItem = React.useCallback((updatedItem: NodeItem) => {
        console.log('updatedItem', updatedItem);
        setData(prevData => prevData.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);


    useEffect(() => {
        if (!props.listTitle || !props.itemTitle) { return; }

        console.log('fetchItems 🔃', props.listTitle, props.itemTitle);

        async function fetchItems() {
            let chartItems: SPOItem[] = await sp.web.lists.getByTitle(props.listTitle).items.filter(`Title eq '${props.itemTitle}'`).get();

            let freshItems = [] as NodeItem[];
            let freshConnections = [] as NodeConnection[];

            if (chartItems.length > 0) {
                let chartItem = chartItems[0];
                setDataItem(chartItem);

                freshItems = JSON.parse(chartItem.Data);
                setData(freshItems);

                if (chartItem.Connections) {
                    freshConnections = JSON.parse(chartItem.Connections);
                } else {
                    freshConnections = [];
                }
                // setConnections(freshConnections);
            }



        }

        fetchItems();

    }, [
        props.listTitle,
        props.itemTitle,
        props.lastUpdated
    ]);

    const selectedItem = React.useMemo(() => {
        return data?.find(item => item.id === selectedItemId);
    }, [data, selectedItemId]);

    return (
        <div>
            <MasterChartNodesComponent
                {...props}
                onNodeClick={onNodeClick}
                data={data}
                // connections={connections}

                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                saveItems={saveItems}
                toggleEdit={toggleEdit}
                editMode={editMode}
            />

            {selectedItem &&
                <Panel
                    isLightDismiss={true}
                    headerText="Node Properties"
                    isOpen={editMode && selectedItemId !== null}
                    onDismiss={unselectItem}
                    closeButtonAriaLabel="Close"
                >
                    <TextField
                        label="Title"
                        required
                        id='TitleField'
                        defaultValue={selectedItem?.Title || ''}
                        componentRef={titleFieldRef}
                    />

                    <TextField
                        label="Subtitle"
                        required
                        id='SubTitle'
                        defaultValue={selectedItem?.SubTitle || ''}
                        componentRef={subTitleFieldRef}
                    />

                    <TextField
                        label="Description (3rd line)"
                        required
                        id='Description'
                        defaultValue={selectedItem?.Description || ''}
                        componentRef={descriptionFieldRef}
                    />

                    <TextField
                        label="Icon Name"
                        required
                        id='IconName'
                        defaultValue={selectedItem?.IconName || ''}
                        componentRef={IconNameFieldRef}
                    />
                    <a href="https://www.flicon.io" target="_blank">Icon names</a>
                    <br /> <br />

                    <TextField
                        label="Hyperlink"
                        required
                        id='Hyperlink'
                        defaultValue={selectedItem?.Hyperlink || ''}
                        componentRef={HyperlinkFieldRef}

                    />
                    {/* Open in new tab checkbox */}
                    <br />
                    <Checkbox
                        label="Open in new tab"
                        defaultChecked={selectedItem?.OpenInNewTab || false}
                        componentRef={CheckboxRef}
                    />  <br />


                    <Dropdown
                        placeholder="How would you like to open the link?"
                        options={[
                            { key: 'Browser', text: 'Open in browser', selected: selectedItem?.DocumentClickBehavior || false },
                            { key: 'Download', text: 'Download', selected: !selectedItem?.DocumentClickBehavior || false }
                        ]}
                        label="How would you like to open the link?"
                        defaultSelectedKey={selectedItem.DocumentClickBehavior}
                        componentRef={DropdownRef}
                    />  <br />

                    <label htmlFor="HexColorCodeText">Text color</label> <br />
                    <input type="color" id="HexColorCodeText" name="HexColorCodeText" defaultValue={selectedItem?.HexColorCodeText} ref={HexColorCodeTextRef} />
                    <br /><br />

                    <label htmlFor="HexColorCode">Background color</label><br />
                    <input type="color" id="HexColorCode" name="HexColorCode" defaultValue={selectedItem?.HexColorCode} ref={HexColorCodeFieldRef} />

                    <br /><br />
                    <hr /><br />

                    <PrimaryButton text="Update Node" iconProps={
                        {
                            iconName: 'Save'
                        }
                    } onClick={() => {
                        console.log('selectedItem', selectedItem);
                        if (selectedItem && titleFieldRef.current) {
                            const updatedItem = {
                                ...selectedItem,
                                Title: titleFieldRef.current.value,
                                SubTitle: subTitleFieldRef.current.value,
                                Description: descriptionFieldRef.current.value,
                                IconName: IconNameFieldRef.current.value,
                                Hyperlink: HyperlinkFieldRef.current.value,
                                OpenInNewTab: CheckboxRef.current.checked,
                                DocumentClickBehavior: DropdownRef.current.selectedOptions[0].key,
                                HexColorCode: HexColorCodeFieldRef.current.value,
                                HexColorCodeText: HexColorCodeTextRef.current.value,
                                Selected: false
                            };
                            updateItem(updatedItem);
                            unselectItem();
                        }
                    }} />
                    <br /><br />

                    <Button text="Add child"
                        iconProps={
                            {
                                iconName: 'Childof'
                            }
                        }
                        onClick={() => {
                            const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            let newItem = {
                                id: uniqueId,
                                Title: selectedItem.Title + ' child',
                                SubTitle: selectedItem.SubTitle,
                                Description: selectedItem.Description,
                                parentId: selectedItem.id,
                                IconName: selectedItem.IconName,
                                HexColorCodeText: selectedItem.HexColorCodeText,
                                HexColorCode: selectedItem.HexColorCode,
                                Hyperlink: ''
                            } as NodeItem;
                            addItem(newItem);
                        }} />

                    <br /><br />


                    {selectedItem && selectedItem.parentId !== null && (
                        <>
                            <Button text="Duplicate"
                                iconProps={
                                    {
                                        iconName: 'Copy'
                                    }
                                }
                                onClick={() => {
                                    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    let newItem = {
                                        id: uniqueId,
                                        Title: selectedItem.Title + ' copy',
                                        SubTitle: selectedItem.SubTitle,
                                        Description: selectedItem.Description,
                                        parentId: selectedItem.parentId,
                                        IconName: selectedItem.IconName,
                                        HexColorCodeText: selectedItem.HexColorCodeText,
                                        HexColorCode: selectedItem.HexColorCode,
                                        Hyperlink: ''
                                    } as NodeItem;
                                    addItem(newItem);
                                }} />

                            <br /><br />

                            <PrimaryButton text="Remove"
                                iconProps={
                                    {
                                        iconName: 'Delete'
                                    }
                                }
                                onClick={() => { removeItem(selectedItem.id); unselectItem(); }} />

                            < br /><br />

                            <Button
                                iconProps={
                                    {
                                        iconName: 'Merge'
                                    }
                                }
                                text="Promote"

                                onClick={() => {
                                    let parentNode = data.find(item => item.id === selectedItem.parentId);
                                    selectedItem.parentId = parentNode.parentId;
                                    updateItem(selectedItem);

                                }} />

                            <br /><br />

                            <Button
                                iconProps={
                                    {
                                        iconName: 'ChromeBack'
                                    }
                                }
                                text="Move earlier"

                                onClick={() => {
                                    moveItemEarlier(selectedItem.id);
                                }} />

                            <br /><br />

                            <Button
                                iconProps={
                                    {
                                        iconName: 'ChromeBackMirrored'
                                    }
                                }
                                text="Move later"

                                onClick={() => {
                                    moveItemLater(selectedItem.id);
                                }} />

                            <br /><br />

                            <Button text="Cut this node"
                                iconProps={
                                    {
                                        iconName: 'Cut'
                                    }
                                }
                                onClick={() => {
                                    setNodeIdToPaste(selectedItem.id);
                                }} />

                            <br /><br />
{/* 
                            <Button text="Connect this node"
                                iconProps={
                                    {
                                        iconName: 'PlugConnected'
                                    }
                                }
                                onClick={() => {
                                    setNodeIdConnectionStart(selectedItem.id);
                                }} />

                            <br /><br /> */}

                            {/* {nodeIdConnectionStart &&
                                <Button text="Finish connection"
                                    iconProps={
                                        {
                                            iconName: 'PlugConnected'
                                        }
                                    }
                                    onClick={() => {
                                        console.log('nodeIdConnectionStart:', nodeIdConnectionStart);
                                        console.log('selectedItem:', selectedItem);

                                        setConnections([{ from: nodeIdConnectionStart, to: selectedItem.id, label: "Connection" }]);
                                        console.log('connections:', connections);
                                    }}

                                />
                            } */}


                            <br /><br />

                        </>
                    )




                    }



                    {selectedItem && nodeIdToPaste && nodeIdToPaste !== selectedItem.id && (
                        <Button text="Paste copied node as child"
                            iconProps={
                                {
                                    iconName: 'Paste'
                                }
                            }
                            onClick={() => {
                                // Find the item with the id set in nodeIdToPaste
                                let nodeToPaste = data.find(item => item.id === nodeIdToPaste);
                                nodeToPaste.parentId = selectedItem.id;
                                // save the updated node
                                updateItem(nodeToPaste);

                            }} />
                    )}



                </Panel>
            }
        </div>
    );
};

export default MasterChartDataComponent;