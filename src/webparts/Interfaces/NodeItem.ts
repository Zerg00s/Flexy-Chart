
export interface NodeItem {
    FileSystemObjectType?: number;
    id: string; // d3
    parentId; // d3
    Id?: number;
    Selected:boolean;
    IconName: string;
    Hyperlink?: string;
    OpenInNewTab?: boolean;
    HexColorCode: string;
    HexColorCodeText: string;
    ServerRedirectedEmbedUri?: any;
    ServerRedirectedEmbedUrl?: string;
    ContentTypeId?: string;
    Title: string;
    SubTitle: string;
    Description: string;
    LastModifiedDate?: Date;
    Placeholder?: boolean;
    ParentId?: any;
    ID?: number;
    Modified?: Date;
    Created?: Date;
    AuthorId?: number;
    EditorId?: number;
    Attachments?: boolean;
    Hidden?: boolean;
    DocumentClickBehavior?: string; // Default,  Browser, Download   
    GUID?: string;
    parent?: NodeItem;
}

