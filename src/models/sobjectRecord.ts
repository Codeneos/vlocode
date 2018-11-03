export default interface SObjectRecord {
    attributes: { 
        type: string;
        url: string;
    };
    Id: string;
    Name?: string;
    [field: string]: any;
}
